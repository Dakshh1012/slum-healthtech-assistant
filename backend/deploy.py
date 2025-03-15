import os
import time
import requests
import streamlit as st

FLASK_BACKEND = "http://127.0.0.1:5000"  # Update if deployed elsewhere

def upload_audio_for_therapist(audio_file):
    files = {"audio": audio_file}
    response = requests.post(f"{FLASK_BACKEND}/therapist", files=files)
    return response.json()

def upload_audio_image_for_doctor(audio_file, image_file):
    files = {"audio": audio_file, "image": image_file}
    response = requests.post(f"{FLASK_BACKEND}/doctor", files=files)
    return response.json()

st.title("AI Therapist & Doctor Consultation")

option = st.selectbox("Choose a service:", ["Therapist", "Doctor Consultation"])

if option == "Therapist":
    st.header("AI Therapist")
    audio_file = st.file_uploader("Upload an audio file", type=["wav"])
    if audio_file and st.button("Submit"):
        with st.spinner("Processing..."):
            response = upload_audio_for_therapist(audio_file)
            st.json(response)
            if "audio_file" in response:
                st.audio(f"{FLASK_BACKEND}{response['audio_file']}", format="audio/mp3")

elif option == "Doctor Consultation":
    st.header("AI Doctor Consultation")
    audio_file = st.file_uploader("Upload an audio file", type=["wav"])
    image_file = st.file_uploader("Upload an image file", type=["jpg", "png"])
    if audio_file and image_file and st.button("Submit"):
        with st.spinner("Processing..."):
            response = upload_audio_image_for_doctor(audio_file, image_file)
            st.json(response)
            if "voice_output" in response:
                st.audio(f"{FLASK_BACKEND}/download/{response['voice_output']}", format="audio/mp3")
