import pandas as pd
import os

def load_products():
    file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'products.csv')
    try:
        df = pd.read_csv(file_path)
        return df
    except Exception as e:
        import streamlit as st
        st.error(f"Error loading products database: {e}")
        return pd.DataFrame()
