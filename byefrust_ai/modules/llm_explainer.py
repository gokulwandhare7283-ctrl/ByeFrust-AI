import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def generate_explanation(product, profile):
    if not api_key:
        return "API Key not configured.", ["Pros not available"], ["Cons not available"]
        
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction='''You are an unbiased, expert shopping assistant. Your only job is to generate a short confidence statement and a list of pros/cons for a given product based on the user's profile. Never rank products – that has already been done. Never use percentages. Always start the confidence statement with "I'm truly confident...". Keep language warm, honest, and helpful. Format output exactly as:
CONFIDENCE: [statement]
PROS:
- [pro 1]
- [pro 2]
- [pro 3]
CONS:
- [con 1]
- [con 2]'''
    )
    
    prompt = f'''User profile:
- Primary use: {', '.join(profile.get('primary_use', []))}
- Performance priority: {profile.get('performance_importance', 3)}/5
- Battery priority: {profile.get('battery_importance', 3)}/5
- Expected years: {profile.get('expected_years', '3-4')}
- Style preference: {profile.get('style_preference', 'Not important')}

Product:
Name: {product['product_name']}
Price: ₹{product['price']}
Specs: {product['specs_text']}

Generate:
1. One sentence starting "I'm truly confident this matches your needs because..."
2. Three pros (benefits for this specific user)
3. Two cons (trade-offs for this specific user)'''

    try:
        response = model.generate_content(prompt)
        text = response.text
        
        conf = ""
        pros = []
        cons = []
        
        lines = text.split('\n')
        mode = None
        for line in lines:
            line = line.strip()
            if line.startswith("CONFIDENCE:"):
                conf = line.replace("CONFIDENCE:", "").strip()
            elif line.startswith("PROS:"):
                mode = "pros"
            elif line.startswith("CONS:"):
                mode = "cons"
            elif line.startswith("-") and mode == "pros":
                pros.append(line[1:].strip())
            elif line.startswith("-") and mode == "cons":
                cons.append(line[1:].strip())
                
        if not conf: conf = "I'm truly confident this matches your needs based on your profile."
        if not pros: pros = ["Good match for your needs"]
        if not cons: cons = ["May have some trade-offs"]
        
        return conf, pros[:3], cons[:2]
    except Exception as e:
        return f"Error generating explanation: {str(e)}", ["Error"], ["Error"]
