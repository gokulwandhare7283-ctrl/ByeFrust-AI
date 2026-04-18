import { Product, products } from '../data/products';

export function parseBudget(budgetStr: string): number {
  if (!budgetStr) return Infinity;
  if (budgetStr.includes("Under")) return 30000;
  if (budgetStr.includes("30-50k")) return 50000;
  if (budgetStr.includes("50-80k")) return 80000;
  if (budgetStr.includes("80-120k")) return 120000;
  return Infinity;
}

export interface ScoredProduct extends Product {
  match_score: number;
}

export interface TradeoffSuggestion {
  type: "budget_stretch" | "slight_budget_stretch" | "requirement_relax" | "save_money";
  current_budget?: number;
  suggested_budget?: number;
  product_name: string;
  benefit: string;
  feature_to_relax?: string;
}

function getDurabilityWeight(physicalCare: string | undefined): number {
  if (!physicalCare) return 3;
  if (physicalCare.includes("very careful")) return 1;
  if (physicalCare.includes("reasonably careful")) return 3;
  if (physicalCare.includes("kids/pets") || physicalCare.includes("outdoors a lot")) return 5;
  return 3;
}

export function getTradeoffs(profile: Record<string, any>, primaryList: ScoredProduct[], topPool: ScoredProduct[]): TradeoffSuggestion[] {
  const tradeoffs: TradeoffSuggestion[] = [];
  const maxBudget = parseBudget(profile.budget);
  
  if (maxBudget >= Infinity || primaryList.length === 0) return tradeoffs;

  const topScore = primaryList[0].match_score;
  const primaryIds = new Set(primaryList.map(p => p.id));

  // Determine user priorities to drive dynamic tradeoffs
  const weights = {
    performance: profile.performance_importance || 3,
    battery: profile.battery_importance || 3,
    display: profile.display_importance || 3,
    portability: profile.portability_importance || 3,
    durability: getDurabilityWeight(profile.physical_care)
  };

  // 1. Slight Budget Stretch Candidate (strict: <= 10% over, highly noticeable boost)
  const slightStretchCandidate = topPool.find(p => 
    !primaryIds.has(p.id) && 
    p.price > maxBudget && 
    p.price <= maxBudget * 1.10 &&
    p.match_score >= topScore + 0.15
  );

  if (slightStretchCandidate) {
    tradeoffs.push({
      type: "slight_budget_stretch",
      current_budget: maxBudget,
      suggested_budget: slightStretchCandidate.price,
      product_name: slightStretchCandidate.product_name,
      benefit: "much higher match score for just a small price bump"
    });
  } else {
    // 2. Standard Budget Stretch Candidate (strict: gap must be large enough to justify 25% over)
    const stretchCandidate = topPool.find(p => 
      !primaryIds.has(p.id) && 
      p.price > maxBudget && 
      p.price <= maxBudget * 1.25 &&
      p.match_score >= topScore + 0.3
    );

    if (stretchCandidate) {
      tradeoffs.push({
        type: "budget_stretch",
        current_budget: maxBudget,
        suggested_budget: stretchCandidate.price,
        product_name: stretchCandidate.product_name,
        benefit: "significantly better overall match for your needs"
      });
    }
  }

  // Find dynamic weights
  let maxWeight = 0;
  let highestPriorityFeature = "";
  let minWeight = 5;
  let lowestPriorityFeature = "";

  for (const [key, weight] of Object.entries(weights)) {
    if (weight > maxWeight) {
      maxWeight = weight;
      highestPriorityFeature = key;
    }
    if (weight < minWeight) {
      minWeight = weight;
      lowestPriorityFeature = key;
    }
  }

  // 3. Smart Save Candidate (Dynamically target high priority!)
  const saveCandidate = topPool.find(p => {
    if (primaryIds.has(p.id)) return false;
    if (p.price > maxBudget * 0.8) return false; // At least 20% cheaper
    if (p.match_score < topScore - 0.5) return false; // Still within 0.5 points
    
    // Ensure it scores well on their primary need
    if (maxWeight >= 4 && highestPriorityFeature) {
      const scoreKey = `${highestPriorityFeature}_score` as keyof ScoredProduct;
      if (typeof p[scoreKey] === 'number' && (p[scoreKey] as number) < 4) {
         return false; // Skip if it drops the ball
      }
    }
    return true;
  });

  if (saveCandidate) {
    let benefitText = "covers all your core needs beautifully";
    if (maxWeight >= 4 && highestPriorityFeature) {
      const featureNames: Record<string, string> = {
        performance: "performance",
        battery: "battery life",
        display: "display",
        portability: "portability",
        durability: "durability"
      };
      benefitText = `gives you the excellent ${featureNames[highestPriorityFeature] || highestPriorityFeature} you wanted without overspending`;
    }

    tradeoffs.push({
      type: "save_money",
      current_budget: maxBudget,
      suggested_budget: saveCandidate.price,
      product_name: saveCandidate.product_name,
      benefit: benefitText
    });
  }

  // 4. Requirement Relax Candidate
  // Exploit the lowest priority by finding a product that scores low on it, but thrives everywhere else
  if (minWeight <= 3 && lowestPriorityFeature) {
    const relaxCandidate = topPool.find(p => {
      if (primaryIds.has(p.id)) return false;
      const scoreKey = `${lowestPriorityFeature}_score` as keyof ScoredProduct;
      const featureScore = (typeof p[scoreKey] === 'number' ? (p[scoreKey] as number) : 5);
      
      if (featureScore > 3) return false; // Must actually score low
      
      const isGreatMatch = p.price <= maxBudget && p.match_score >= topScore;
      const isSuperCheap = p.price <= maxBudget * 0.75 && p.match_score >= topScore - 0.4;
      
      return isGreatMatch || isSuperCheap;
    });

    if (relaxCandidate && (!saveCandidate || saveCandidate.id !== relaxCandidate.id)) {
      const featureNames: Record<string, string> = {
        performance: "top-tier performance",
        battery: "all-day battery",
        display: "premium display quality",
        portability: "ultra-light design",
        durability: "rugged build"
      };
      
      let benefit = "yields a higher overall match score within your budget";
      if (relaxCandidate.price < maxBudget * 0.8) {
        benefit = `saves you roughly ₹${(maxBudget - relaxCandidate.price).toLocaleString('en-IN')} while nailing your core needs`;
      }

      tradeoffs.push({
        type: "requirement_relax",
        current_budget: maxBudget,
        suggested_budget: relaxCandidate.price,
        feature_to_relax: featureNames[lowestPriorityFeature] || lowestPriorityFeature,
        product_name: relaxCandidate.product_name,
        benefit: benefit
      });
    }
  }

  return tradeoffs;
}

export function scoreProducts(profile: Record<string, any>): ScoredProduct[] {
  let filtered = [...products];

  // Hard Filters
  const category = profile.category;
  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // RAM Filter
  let requiredRam = 8;
  if (profile.perf_ram?.includes("heavy software") || profile.perf_ram?.includes("multitask a lot")) {
    requiredRam = 16;
  }
  let ramFiltered = filtered.filter(p => p.min_ram >= requiredRam);
  
  if (ramFiltered.length >= 3) {
    filtered = ramFiltered;
  }

  // Storage Filter
  let requiredStorage = 256;
  if (profile.perf_baseline?.includes("Professional video") || profile.perf_baseline?.includes("Heavy gaming")) {
    requiredStorage = 1024;
  } else if (profile.primary_use?.includes("Creative") || profile.primary_use?.includes("Gaming")) {
    requiredStorage = 512;
  }
  let storageFiltered = filtered.filter(p => p.min_storage >= requiredStorage);
  
  if (storageFiltered.length >= 3) {
    filtered = storageFiltered;
  }

  // GPU Filter
  if (category === "Laptop" && (profile.perf_baseline?.includes("Heavy gaming") || profile.perf_baseline?.includes("Professional video") || profile.primary_use === "Gaming")) {
    let gpuFiltered = filtered.filter(p => p.dedicated_gpu === 'Yes');
    if (gpuFiltered.length >= 3) {
      filtered = gpuFiltered;
    }
  }

  // Weights
  const w_perf = profile.performance_importance || 3;
  const w_batt = profile.battery_importance || 3;
  const w_disp = profile.display_importance || 3;
  const w_port = profile.portability_importance || 3;
  const w_dur = getDurabilityWeight(profile.physical_care);

  let total_weight = w_perf + w_batt + w_disp + w_port + w_dur;
  if (total_weight === 0) total_weight = 1;

  const scored: ScoredProduct[] = filtered.map(row => {
    let score = (
      w_perf * row.performance_score +
      w_batt * row.battery_score +
      w_disp * row.display_score +
      w_port * row.portability_score +
      w_dur * row.durability_score
    ) / total_weight;

    // Bonus for matching use case
    const primaryUse = profile.primary_use || "";
    const tags = row.use_case_tags.toLowerCase();
    if (primaryUse.includes("Gaming") && tags.includes("gaming")) score += 0.3;
    if (primaryUse.includes("Creative") && tags.includes("creative")) score += 0.3;
    if (primaryUse.includes("Work") && tags.includes("work")) score += 0.2;
    if (primaryUse.includes("Programming") && tags.includes("programming")) score += 0.3;
    if (primaryUse.includes("School") && tags.includes("study")) score += 0.2;

    return { ...row, match_score: Math.min(score, 5.0) };
  });

  scored.sort((a, b) => b.match_score - a.match_score);
  return scored; // Return ALL scored items, ignoring budget
}
