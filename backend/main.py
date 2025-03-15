from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import speech_recognition as sr
import google.generativeai as genai
from gtts import gTTS
import requests
import os
import wave
import time
import random

app = Flask(__name__)

# Initialize CORS
CORS(app)

# Set up Google Gemini API (replace with your API key)
GENAI_API_KEY = "AIzaSyDUn1z4zMMGxBjcjjsucOBr1YyARguzkSg"  # Get from Google AI Studio
genai.configure(api_key=GENAI_API_KEY)

# Google Translate API key (hardcoded)
GOOGLE_TRANSLATE_API_KEY = "AIzaSyD3G3ajbnEuy12rh_5Nd410oTMQEOArQXs"  # Replace with your API key
GOOGLE_TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2"

# Speech-to-Text Function
def speech_to_text(audio_file):
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file) as source:
        print("Processing audio file...")
        audio = recognizer.record(source)
        try:
            print("Recognizing speech...")
            text = recognizer.recognize_google(audio)
            print(f"Recognized text: {text}")
            return text
        except sr.UnknownValueError:
            print("Google Speech Recognition could not understand the audio.")
            return "Sorry, I could not understand the audio."
        except sr.RequestError as e:
            print(f"Could not request results from Google Speech Recognition service; {e}")
            return "Sorry, there was an error processing your request."

# Translate Text Function using Google Translate API
def translate_text(text, target_lang="en"):
    try:
        response = requests.post(
            GOOGLE_TRANSLATE_URL,
            params={
                "key": GOOGLE_TRANSLATE_API_KEY,
                "q": text,
                "target": target_lang,
                "format": "text"
            }
        )
        response.raise_for_status()  # Raise an error for bad status codes
        translated_text = response.json()["data"]["translations"][0]["translatedText"]
        return translated_text
    except Exception as e:
        print(f"Translation error: {e}")
        return text  # Return original text if translation fails

# LLM Response Function using Gemini
def generate_response(user_input):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Enhanced prompt to make responses more natural and human-like
        prompt = (
            "You are a compassionate human therapist having a warm conversation. "
            "Your name is Alex. Respond in a natural, caring way as if speaking to a friend. "
            "Use conversational language with occasional filler words, brief pauses (indicated by '...'), "
            "and varied sentence lengths to sound more human. Express genuine empathy. "
            "Limit responses to 3-4 sentences for a natural conversational pace. "
            "Avoid sounding too formal or robotic. Just be warm and human."
            "\n\nClient: " + user_input + "\nAlex:"
        )

        response = model.generate_content(prompt)

        # Extract the response text
        if response and response.text:
            return response.text.strip()

    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "I'm here to help. Can you tell me more about what's on your mind?"

    return "I'm here to help. Can you tell me more about what's on your mind?"

# Add speech markers to text to make TTS more natural
def add_speech_markers(text):
    # Replace periods with slightly longer pauses
    text = text.replace(". ", "... ")
    
    # Add some human-like hesitations and fillers
    fillers = ["um ", "uh ", "hmm ", "well ", "you know ", "I mean "]
    
    # Don't add too many fillers - just 1-2 for short texts
    if len(text) > 50 and random.random() > 0.6:
        sentences = text.split('. ')
        if len(sentences) > 1:
            # Add a filler word to one sentence
            random_index = random.randint(0, len(sentences)-1)
            if random_index > 0:  # Don't start with a filler
                sentences[random_index] = random.choice(fillers) + sentences[random_index]
            text = '. '.join(sentences)
    
    return text

# Simplified Text-to-Speech Function with more natural speech
def text_to_speech(text, lang="en", output_file="response.mp3"):
    try:
        if not text.strip():
            raise ValueError("No text to convert to speech.")
        
        # Add speech markers for more natural pauses and emphasis
        enhanced_text = add_speech_markers(text)
        
        # Use different voices for different languages
        voice_options = {
            "en": ["com.au", "co.uk", "us", "ca", "co.in"],  # Different English accents
            "hi": ["co.in"],  # Hindi with Indian accent
            "es": ["es", "com.mx"],  # Spanish options
            "fr": ["fr", "ca"],  # French options
            "de": ["de"],  # German
            "ja": ["jp"],  # Japanese
            "ko": ["kr"],  # Korean
            "zh-CN": ["cn"],  # Chinese
            "ru": ["ru"],  # Russian
            "pt": ["com.br", "pt"],  # Portuguese options
            "it": ["it"],  # Italian
            "nl": ["nl"],  # Dutch
            "pl": ["pl"],  # Polish
            "sv": ["se"],  # Swedish
            "tr": ["com.tr"],  # Turkish
        }
        
        # Select appropriate TLD for more natural voices
        if lang in voice_options and len(voice_options[lang]) > 0:
            tld = random.choice(voice_options[lang])
        else:
            tld = "com"  # Default TLD
        
        # Create a unique filename to avoid file access conflicts
        timestamp = int(time.time())
        unique_output = f"{timestamp}_{output_file}"
        
        # Create and save TTS with selected voice
        tts = gTTS(text=enhanced_text, lang=lang, slow=False, tld=tld)
        tts.save(unique_output)
        
        return unique_output
    except Exception as e:
        print(f"TTS error: {e}")
        return None

# Single Route for AI Therapist
@app.route("/therapist", methods=["POST"])
def therapist_route():
    # Check if an audio file is uploaded
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    if audio_file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Check file size (e.g., at least 1 KB)
    audio_file.seek(0, os.SEEK_END)
    file_size = audio_file.tell()
    audio_file.seek(0)
    if file_size < 1024:  # 1 KB
        return jsonify({"error": "File is too small or empty"}), 400

    # Save the file with a unique name to avoid conflicts
    timestamp = int(time.time())
    audio_path = f"user_audio_{timestamp}.wav"
    audio_file.save(audio_path)

    # Debug: Check if the file is a valid WAV file
    try:
        with wave.open(audio_path, "rb") as wav_file:
            print(f"Audio file details: {wav_file.getparams()}")
    except wave.Error:
        os.remove(audio_path)  # Delete the invalid file
        return jsonify({"error": "Invalid WAV file"}), 400

    # Step 1: Convert speech to text
    user_input = speech_to_text(audio_path)
    if "sorry" in user_input.lower():
        os.remove(audio_path)  # Delete the file if speech recognition fails
        return jsonify({"error": "Could not understand the audio"}), 400

    # Get the user's language preference (default to English)
    user_lang = request.form.get("lang", "en")  # e.g., "es" for Spanish, "fr" for French
    
    # Auto-detect Hindi (or other languages) if needed
    if "mujhe" in user_input.lower() or "kyunki" in user_input.lower() or "nahin" in user_input.lower():
        user_lang = "hi"  # Set to Hindi if Hindi words detected
        print(f"Hindi detected in input. Setting language to Hindi.")

    # Step 2: Translate user input to English (if not already in English)
    if user_lang != "en":
        user_input_en = translate_text(user_input, target_lang="en")
    else:
        user_input_en = user_input

    # Step 3: Generate a response using Gemini
    therapist_response_en = generate_response(user_input_en)

    # Step 4: Translate the therapist's response to the user's language
    if user_lang != "en":
        therapist_response = translate_text(therapist_response_en, target_lang=user_lang)
    else:
        therapist_response = therapist_response_en

    # Step 5: Convert the response to speech in the user's language
    speech_file = text_to_speech(therapist_response, lang=user_lang)
    if not speech_file:
        os.remove(audio_path)  # Delete the temporary file
        return jsonify({"error": "Failed to generate speech file"}), 500

    # Clean up temporary files
    os.remove(audio_path)

    # Return the response as JSON and the audio file
    return jsonify({
        "user_input": user_input,
        "user_input_en": user_input_en,
        "therapist_response": therapist_response,
        "therapist_response_en": therapist_response_en,
        "audio_file": f"/download/{speech_file}"
    })

# Route to download the generated audio file
@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    return send_file(filename, as_attachment=True)

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)