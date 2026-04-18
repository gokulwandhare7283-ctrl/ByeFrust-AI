import pandas as pd
from .state_manager import parse_budget, parse_brand_exclusions

def score_products(df, profile):
    # Hard Filters
    category = profile.get("category")
    if category:
        df = df[df['category'].str.lower() == category.lower()]
    
    max_budget = parse_budget(profile.get("budget", ""))
    df = df[df['price'] <= max_budget]
    
    exclusions = parse_brand_exclusions(profile.get("brand_exclusions", ""))
    if exclusions:
        pattern = '|'.join(exclusions)
        df = df[~df['product_name'].str.lower().str.contains(pattern)]
        
    if category == "Laptop" and profile.get("dedicated_gpu_required") == "Yes":
        df = df[df['dedicated_gpu'] == "Yes"]
        
    if df.empty:
        return df

    # Weights
    w_perf = profile.get("performance_importance", 3)
    w_batt = profile.get("battery_importance", 3)
    w_disp = profile.get("display_importance", 3)
    w_port = profile.get("portability_importance", 3)
    w_dur = profile.get("durability_importance", 3)
    
    total_weight = w_perf + w_batt + w_disp + w_port + w_dur
    if total_weight == 0:
        total_weight = 1
        
    def calc_score(row):
        score = (
            w_perf * row['performance_score'] +
            w_batt * row['battery_score'] +
            w_disp * row['display_score'] +
            w_port * row['portability_score'] +
            w_dur * row['durability_score']
        ) / total_weight
        
        # Bonus for matching use case
        use_cases = profile.get("primary_use", [])
        if isinstance(use_cases, list):
            for uc in use_cases:
                if uc.lower() in str(row['use_case_tags']).lower():
                    score += 0.2
                    
        # Bonus for style
        style = profile.get("style_preference", "")
        if style != "Not important" and style.lower() in str(row['style_tag']).lower():
            score += 0.2
            
        return min(score, 5.0)

    df = df.copy()
    df['match_score'] = df.apply(calc_score, axis=1)
    df = df.sort_values(by='match_score', ascending=False).head(5)
    return df
