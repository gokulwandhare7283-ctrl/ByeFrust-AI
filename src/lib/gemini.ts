import { GoogleGenAI } from '@google/genai';
import { Product } from '../data/products';

export async function generateInsights(profile: Record<string, any>, recommendations: any[], tradeoffs: any[] = []) {
  const insights = await Promise.all(
    recommendations.map(async (product) => {
      const explanation = await generateExplanation(product, profile);
      return {
        ...product,
        ...explanation
      };
    })
  );
  return { insights, tradeoffs };
}

export async function generateExplanation(product: Product, profile: Record<string, any>) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      confidence: "API Key not configured.",
      pros: ["Pros not available"],
      cons: ["Cons not available"]
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `User profile:
- Primary Use: ${profile.primary_use || 'General'}
- Budget: ${profile.budget || 'Any'}
- Performance Importance (1-5): ${profile.performance_importance || 3}
- Battery Importance (1-5): ${profile.battery_importance || 3}
- Display Importance (1-5): ${profile.display_importance || 3}
- Portability Importance (1-5): ${profile.portability_importance || 3}
- Expected years: ${profile.longevity || '3-4 years'}
- Physical Care: ${profile.physical_care || 'Average'}
- Battery Life Needs: ${profile.battery_life || 'Average'}
- Tech Comfort Level: ${profile.tech_comfort_level || 'Average'}
${profile.perf_baseline ? `- Performance Baseline: ${profile.perf_baseline}` : ''}
${profile.disp_baseline ? `- Display Baseline: ${profile.disp_baseline}` : ''}

Product:
Name: ${product.product_name}
Price: ₹${product.price}
Specs: ${product.specs_text}

Generate:
1. One sentence starting "Best for:" that highlights the 1-2 top-priority needs this product excels at.
2. Three pros (benefits directly addressing the user's stated needs and lifestyle).
3. Two cons (trade-offs, missing features, or lower-scoring areas explained in the user's context).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert, trusted product advisor. Your job is to find the best available path forward, even when no single product checks every box. You must explicitly state what the user gains and what they give up for each product.
Never use generic pros like "good battery life." Instead, tie it to their needs: "You said you're away from a charger for 8+ hours. This phone's 5000mAh battery will easily get you through a full day."
Do not hide cons. State them gently but honestly: "You mentioned loving wired headphones. This phone doesn't have a headphone jack, so you'd need an adapter."

Format output exactly as:
CONFIDENCE: Best for: [1-2 top-priority needs this product excels at]
PROS:
- [Pro 1 - directly addresses a stated user need]
- [Pro 2 - directly addresses another stated user need]
- [Pro 3 - bonus benefit that aligns with their lifestyle]
CONS:
- [Con 1 - the missing feature or lower-scoring area, explained in the user's context]
- [Con 2 - another trade-off, if applicable]`
      }
    });

    const text = response.text || "";
    let conf = "";
    const pros: string[] = [];
    const cons: string[] = [];

    const lines = text.split('\n');
    let mode: 'pros' | 'cons' | null = null;

    for (let line of lines) {
      line = line.trim();
      if (line.startsWith("CONFIDENCE:")) {
        conf = line.replace("CONFIDENCE:", "").trim();
      } else if (line.startsWith("PROS:")) {
        mode = "pros";
      } else if (line.startsWith("CONS:")) {
        mode = "cons";
      } else if (line.startsWith("-") && mode === "pros") {
        pros.push(line.substring(1).trim());
      } else if (line.startsWith("-") && mode === "cons") {
        cons.push(line.substring(1).trim());
      }
    }

    if (!conf) conf = "Best for: matching your overall profile.";
    if (pros.length === 0) pros.push("Good match for your needs");
    if (cons.length === 0) cons.push("May have some trade-offs");

    return { confidence: conf, pros: pros.slice(0, 3), cons: cons.slice(0, 2) };
  } catch (error: any) {
    return {
      confidence: `Error generating explanation: ${error.message}`,
      pros: ["Error"],
      cons: ["Error"]
    };
  }
}
