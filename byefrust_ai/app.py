import streamlit as st
import pandas as pd
from modules.state_manager import init_state, add_answer, get_profile
from modules.question_engine import get_next_question, get_total_questions
from modules.scoring_engine import score_products
from modules.llm_explainer import generate_explanation
from modules.data_loader import load_products

st.set_page_config(page_title="ByeFrust AI", page_icon="🤖", layout="centered")

st.markdown("""
    <style>
    .main { background-color: #f8f9fa; }
    .stButton>button { width: 100%; border-radius: 8px; background-color: #0066cc; color: white; }
    .stButton>button:hover { background-color: #0052a3; }
    .product-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .pro-box { background-color: #e6ffed; padding: 10px; border-radius: 5px; border-left: 4px solid #28a745; margin-bottom: 10px; }
    .con-box { background-color: #ffeeba; padding: 10px; border-radius: 5px; border-left: 4px solid #dc3545; }
    </style>
""", unsafe_allow_html=True)

st.title("🤖 ByeFrust AI")
st.subheader("End the confusion. Make confident choices.")

init_state()
profile = get_profile()
df_products = load_products()

if st.sidebar.button("Restart Interview"):
    st.session_state.clear()
    st.rerun()

if not st.session_state.interview_complete:
    total_q = get_total_questions(profile)
    answered_q = len(profile)
    st.progress(answered_q / max(total_q, 1), text=f"Question {answered_q} of ~{total_q}")
    
    for k, v in profile.items():
        with st.chat_message("user"):
            st.write(f"**{k}**: {v}")
            
    next_q = get_next_question(profile)
    
    if next_q:
        with st.chat_message("assistant"):
            st.write(next_q["text"])
            
            with st.form(key=f"form_{next_q['key']}"):
                if next_q["type"] == "radio":
                    ans = st.radio("Select one:", next_q["options"])
                elif next_q["type"] == "selectbox":
                    ans = st.selectbox("Select one:", next_q["options"])
                elif next_q["type"] == "multiselect":
                    ans = st.multiselect("Select options:", next_q["options"])
                elif next_q["type"] == "slider":
                    ans = st.slider("Rate:", next_q["options"][0], next_q["options"][1], 3)
                elif next_q["type"] == "text":
                    ans = st.text_input("Your answer:")
                
                submit = st.form_submit_button("Next")
                if submit:
                    if next_q["type"] == "multiselect" and len(ans) > 3:
                        st.error("Please select up to 3 options.")
                    elif not ans and next_q["type"] not in ["text"]:
                        st.error("Please provide an answer.")
                    else:
                        add_answer(next_q["key"], ans)
                        st.rerun()
    else:
        st.session_state.interview_complete = True
        st.rerun()

else:
    st.success("Interview complete! Analyzing the best options for you... 🔍")
    
    top_products = score_products(df_products, profile)
    
    if top_products.empty:
        st.warning("No products match your strict criteria. Try adjusting your budget or brand exclusions.")
    else:
        st.write("### Top Recommendations ⭐")
        for idx, row in top_products.iterrows():
            with st.container():
                st.markdown(f"""
                <div class="product-card">
                    <h4>{row['product_name']}</h4>
                    <p>💰 <b>Price:</b> ₹{row['price']}</p>
                    <p>⭐ <b>Match Score:</b> {row['match_score']:.1f}/5.0</p>
                    <p>🔧 <b>Specs:</b> {row['specs_text']}</p>
                </div>
                """, unsafe_allow_html=True)
                
                if st.button(f"See Details for {row['product_name']}", key=f"btn_{idx}"):
                    with st.spinner("Generating personalized insights..."):
                        conf, pros, cons = generate_explanation(row, profile)
                        st.info(f"**{conf}**")
                        
                        st.markdown('<div class="pro-box"><b>👍 Pros for you:</b><ul>' + 
                                    ''.join([f'<li>{p}</li>' for p in pros]) + 
                                    '</ul></div>', unsafe_allow_html=True)
                        
                        st.markdown('<div class="con-box"><b>👎 Trade-offs:</b><ul>' + 
                                    ''.join([f'<li>{c}</li>' for c in cons]) + 
                                    '</ul></div>', unsafe_allow_html=True)
