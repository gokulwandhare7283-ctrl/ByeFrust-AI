QUESTIONS = [
    {"key": "category", "text": "What are you shopping for?", "type": "radio", "options": ["Laptop", "Smartphone"], "condition": lambda ans: True},
    {"key": "budget", "text": "Budget range?", "type": "selectbox", "options": ["Under ₹30k", "₹30-50k", "₹50-80k", "₹80-120k", "Above ₹120k"], "condition": lambda ans: True},
    {"key": "motivation", "text": "Why do you need this device?", "type": "text", "condition": lambda ans: True},
    {"key": "primary_use", "text": "Primary use? (select up to 3)", "type": "multiselect", "options": ["Gaming", "Work", "Study", "Creative", "Casual", "Programming"], "condition": lambda ans: True},
    {"key": "hours_per_day", "text": "Hours per day?", "type": "selectbox", "options": ["<2h", "2-5h", "5-8h", ">8h"], "condition": lambda ans: True},
    {"key": "portability", "text": "Carry daily?", "type": "radio", "options": ["Yes daily", "Occasionally", "Mostly at home"], "condition": lambda ans: True},
    {"key": "tech_comfort", "text": "Tech comfort (1-5)", "type": "slider", "options": [1, 5], "condition": lambda ans: True},
    {"key": "performance_importance", "text": "Importance of performance? (1-5)", "type": "slider", "options": [1, 5], "condition": lambda ans: True},
    {"key": "battery_importance", "text": "Importance of battery? (1-5)", "type": "slider", "options": [1, 5], "condition": lambda ans: True},
    {"key": "display_importance", "text": "Importance of display? (1-5)", "type": "slider", "options": [1, 5], "condition": lambda ans: True},
    {"key": "portability_importance", "text": "Importance of portability? (1-5)", "type": "slider", "options": [1, 5], "condition": lambda ans: True},
    {"key": "durability_importance", "text": "Importance of durability? (1-5)", "type": "slider", "options": [1, 5], "condition": lambda ans: True},
    {"key": "expected_years", "text": "How many years?", "type": "selectbox", "options": ["1-2", "3-4", "5+", "Until it breaks"], "condition": lambda ans: True},
    {"key": "style_preference", "text": "Design style?", "type": "selectbox", "options": ["Fancy", "Professional", "Rugged", "Not important"], "condition": lambda ans: True},
    {"key": "brand_exclusions", "text": "Any brands to exclude? (Leave blank if none)", "type": "text", "condition": lambda ans: True},
    {"key": "dedicated_gpu_required", "text": "Need dedicated GPU?", "type": "radio", "options": ["Yes", "No", "Not sure"], "condition": lambda ans: lambda a: a.get("category") == "Laptop" and ("Gaming" in a.get("primary_use", []) or "Creative" in a.get("primary_use", []))},
    {"key": "dropping_frequency", "text": "How often drop phone?", "type": "selectbox", "options": ["Very often", "Sometimes", "Rarely", "Never"], "condition": lambda ans: lambda a: a.get("category") == "Smartphone"}
]

def get_next_question(answers):
    for q in QUESTIONS:
        key = q["key"]
        if key not in answers:
            condition = q["condition"]
            if callable(condition):
                try:
                    if condition(answers):
                        return q
                except TypeError:
                    if condition()(answers):
                        return q
            elif condition:
                return q
    return None

def get_total_questions(answers):
    count = 0
    for q in QUESTIONS:
        condition = q["condition"]
        if callable(condition):
            try:
                if condition(answers): count += 1
            except TypeError:
                if condition()(answers): count += 1
        elif condition:
            count += 1
    return count
