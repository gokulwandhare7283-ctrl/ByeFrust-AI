import streamlit as st
import re

def init_state():
    if 'answers' not in st.session_state:
        st.session_state.answers = {}
    if 'current_question_idx' not in st.session_state:
        st.session_state.current_question_idx = 0
    if 'interview_complete' not in st.session_state:
        st.session_state.interview_complete = False

def add_answer(key, value):
    st.session_state.answers[key] = value

def get_profile():
    return st.session_state.answers

def parse_budget(budget_str):
    if not budget_str:
        return float('inf')
    if "Under" in budget_str:
        return 30000
    elif "30‑50k" in budget_str or "30-50k" in budget_str:
        return 50000
    elif "50‑80k" in budget_str or "50-80k" in budget_str:
        return 80000
    elif "80‑120k" in budget_str or "80-120k" in budget_str:
        return 120000
    else:
        return float('inf')

def parse_expected_years(years_str):
    if not years_str:
        return 3
    if "1-2" in years_str or "1‑2" in years_str:
        return 2
    elif "3-4" in years_str or "3‑4" in years_str:
        return 4
    elif "5+" in years_str:
        return 5
    else:
        return 6

def parse_brand_exclusions(exclusions_str):
    if not exclusions_str or exclusions_str.lower() in ['none', 'no', 'na', 'n/a', '-']:
        return []
    brands = [b.strip().lower() for b in re.split(r'[,; ]+', exclusions_str) if b.strip()]
    return brands
