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
from brain_of_doctor import encode_image, analyze_image_with_query
from voice_of_patient import record_audio, transcribe_with_groq
from voice_of_the_doctor import text_to_speech_with_gtts_old
from brain_of_doctor import analyze_text_with_query
GROQ_API_KEY="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"
app = Flask(__name__)
from recommended_doctor import recommend_doctors

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
            "Avoid sounding too formal or robotic. Just be warm and human dont give too many solutions give more sympathy."
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
    # Check if text input is provided
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    user_input = data.get("text")  # Get the text input from the JSON payload

    if not user_input:
        return jsonify({"error": "No text input provided"}), 400

    # Get the user's language preference (default to English)
    user_lang = data.get("lang", "en")  # e.g., "es" for Spanish, "fr" for French

    # Auto-detect Hindi (or other languages) if needed
    if "mujhe" in user_input.lower() or "kyunki" in user_input.lower() or "nahin" in user_input.lower():
        user_lang = "hi"  # Set to Hindi if Hindi words detected
        print(f"Hindi detected in input. Setting language to Hindi.")

    # Step 1: Translate user input to English (if not already in English)
    if user_lang != "en":
        user_input_en = translate_text(user_input, target_lang="en")
    else:
        user_input_en = user_input

    # Step 2: Generate a response using Gemini
    therapist_response_en = generate_response(user_input_en)

    # Step 3: Translate the therapist's response to the user's language
    if user_lang != "en":
        therapist_response = translate_text(therapist_response_en, target_lang=user_lang)
    else:
        therapist_response = therapist_response_en

    # Return the response as JSON
    return jsonify({
        "user_input": user_input,
        "user_input_en": user_input_en,
        "therapist_response": therapist_response,
        "therapist_response_en": therapist_response_en
    })
def detect_language(text):
    """
    Simple language detection based on common words and patterns.
    Only supports English, Hindi, and Marathi.
    """
    # Define some common words/patterns for each language
    hindi_patterns = ["मैं", "है", "नहीं", "और", "का", "की", "में", "से", "को", "पर"]
    marathi_patterns = ["मी", "आहे", "नाही", "आणि", "चा", "ची", "मध्ये", "कडे", "ला", "वर"]

    text = text.lower()
    
    # Check for patterns in text
    hindi_matches = sum(1 for word in hindi_patterns if word in text)
    marathi_matches = sum(1 for word in marathi_patterns if word in text)
    
    if hindi_matches > marathi_matches:
        return "hi"
    elif marathi_matches > hindi_matches:
        return "mr"
    else:
        return "en"  # Default to English if no clear match

def text_to_speech_with_gtts_old(input_text, output_filepath, language):
    """Modified version of text-to-speech function with better language handling"""
    try:
        # Language code mapping
        language_map = {
            "hi": "hi",
            "mr": "mr",
            "en": "en"
        }
        
        # Get the correct language code
        lang_code = language_map.get(language, "en")
        
        # For Hindi, specifically set Indian English TLD
        tld = "co.in" if lang_code in ["hi", "mr"] else "com"
        
        # Create and save the audio file
        tts = gTTS(text=input_text, lang=lang_code, slow=False, tld=tld)
        tts.save(output_filepath)
        return output_filepath
    except Exception as e:
        print(f"Error in text-to-speech: {str(e)}")
        return None

import logging


system_prompt = """You have to act as a professional doctor. I know you are not, but this is for learning purposes. 
What's in this image? Do you find anything wrong with it medically? 
If you make a differential, suggest some remedies for them. Do not add any numbers or special characters in 
your response. Your response should be in one long paragraph. Always answer as if you are answering a real person. 
Do not say 'In the image I see' but say 'With what I see, I think you have ....'
Do not respond as an AI model, your answer should mimic that of an actual doctor, not an AI bot. 
Keep your answer concise (max 2 sentences). No preamble, start your answer right away please. and also suggest 1-2 home remedies.
Always end with im an ai please consult a real doctor for medical advice."""

@app.route("/doctor_image", methods=["POST"])
def doctor_image():
    try:
        logging.info("Received a request to /doctor_image")

        if not GROQ_API_KEY:
            logging.error("GROQ_API_KEY is not set")
            return jsonify({"error": "GROQ_API_KEY is not set"}), 500

        # Check if image file is present in request
        if "image" not in request.files:
            logging.error("Image file is required")
            return jsonify({"error": "Image file is required"}), 400
        
        image_file = request.files["image"]
        
        # Validate file name
        if image_file.filename == "":
            logging.error("Image file must have a valid filename")
            return jsonify({"error": "Image file must have a valid filename"}), 400

        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.getcwd(), "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save image file with a unique name to prevent overwrites
        timestamp = int(time.time())
        image_filepath = os.path.join(upload_dir, f"{timestamp}_{image_file.filename}")
        
        logging.info(f"Saving image file to: {image_filepath}")

        # Save image file
        image_file.save(image_filepath)
        
        # Verify image file was saved and has content
        if os.path.getsize(image_filepath) == 0:
            logging.error("Image file is empty")
            raise ValueError("Image file is empty")

        # Step 1: Analyze the image and generate a response
        logging.info("Analyzing image and generating response...")
        doctor_response_en = analyze_image_with_query(
            query=system_prompt,
            encoded_image=encode_image(image_filepath),
            model="llama-3.2-11b-vision-preview"
        )   
        logging.info(f"Doctor response (English): {doctor_response_en}")

        # Step 2: Convert the response to speech
        logging.info("Converting response to speech...")
        voice_filepath = text_to_speech_with_gtts_old(
            input_text=doctor_response_en,
            output_filepath=os.path.join(upload_dir, f"{timestamp}_response.mp3"),
            language="en"  # Default to English
        )
        
        if not voice_filepath:
            logging.error("Failed to generate voice output")
            raise Exception("Failed to generate voice output")

        # Step 3: Recommend doctors based on the response
        logging.info("Recommending doctors...")
        recommended_doctors = recommend_doctors(doctor_response_en)

        # Clean up uploaded file
        logging.info("Cleaning up uploaded file...")
        os.remove(image_filepath)

        # Return the response
        logging.info("Sending response to client...")
        return jsonify({
            "doctor_response": doctor_response_en,
            "voice_output": voice_filepath,
            "recommended_doctors": recommended_doctors
        })

    except Exception as e:
        logging.error(f"Error in doctor_image: {str(e)}")
        # Clean up file in case of error
        if os.path.exists(image_filepath):
            os.remove(image_filepath)
        return jsonify({"error": str(e)}), 500

# Route to handle audio-based requests
@app.route("/doctor_audio", methods=["POST"])
def doctor_audio():
    try:
        logging.info("Received a request to /doctor_audio")

        if not GROQ_API_KEY:
            logging.error("GROQ_API_KEY is not set")
            return jsonify({"error": "GROQ_API_KEY is not set"}), 500

        # Check if audio file is present in request
        if "audio" not in request.files:
            logging.error("Audio file is required")
            return jsonify({"error": "Audio file is required"}), 400
        
        audio_file = request.files["audio"]
        
        # Validate file name
        if audio_file.filename == "":
            logging.error("Audio file must have a valid filename")
            return jsonify({"error": "Audio file must have a valid filename"}), 400

        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.getcwd(), "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save audio file with a unique name to prevent overwrites
        timestamp = int(time.time())
        audio_filepath = os.path.join(upload_dir, f"{timestamp}_{audio_file.filename}")
        
        logging.info(f"Saving audio file to: {audio_filepath}")

        # Save audio file
        audio_file.save(audio_filepath)
        
        # Verify audio file was saved and has content
        if os.path.getsize(audio_filepath) == 0:
            logging.error("Audio file is empty")
            raise ValueError("Audio file is empty")

        # Step 1: Transcribe the audio to text
        logging.info("Transcribing audio to text...")
        speech_to_text_output = transcribe_with_groq(
            stt_model="whisper-large-v3",
            audio_filepath=audio_filepath,
            GROQ_API_KEY=GROQ_API_KEY,
            language="en"  # Default to English for transcription
        )
        logging.info(f"Transcription: {speech_to_text_output}")

        # Step 2: Detect if the text is Hindi or Marathi
        detected_lang = detect_language(speech_to_text_output)
        logging.info(f"Detected language: {detected_lang}")

        # Step 3: Analyze the text and generate a response
        logging.info("Analyzing text and generating response...")
        doctor_response_en = analyze_text_with_query(
            query=system_prompt + " " + speech_to_text_output,
            model="mixtral-8x7b-32768"  # Use a valid model name
        )   
        logging.info(f"Doctor response (English): {doctor_response_en}")

        # Step 4: Translate the doctor's response if needed
        if detected_lang in ["hi", "mr"]:
            logging.info(f"Translating to {detected_lang}...")
            doctor_response = translate_text(doctor_response_en, target_lang=detected_lang)
            logging.info(f"Translated text: {doctor_response}")
        else:
            doctor_response = doctor_response_en

        # Step 5: Convert the response to speech with explicitly set language
        logging.info("Converting response to speech...")
        voice_filepath = text_to_speech_with_gtts_old(
            input_text=doctor_response,
            output_filepath=os.path.join(upload_dir, f"{timestamp}_response.mp3"),
            language=detected_lang
        )
        
        if not voice_filepath:
            logging.error("Failed to generate voice output")
            raise Exception("Failed to generate voice output")

        # Step 6: Recommend doctors based on the response
        logging.info("Recommending doctors...")
        recommended_doctors = recommend_doctors(doctor_response)

        # Clean up uploaded file
        logging.info("Cleaning up uploaded file...")
        os.remove(audio_filepath)

        # Return the response
        logging.info("Sending response to client...")
        return jsonify({
            "transcription": speech_to_text_output,
            "doctor_response": doctor_response,
            "voice_output": voice_filepath,
            "recommended_doctors": recommended_doctors
        })

    except Exception as e:
        logging.error(f"Error in doctor_audio: {str(e)}")
        # Clean up file in case of error
        if os.path.exists(audio_filepath):
            os.remove(audio_filepath)
        return jsonify({"error": str(e)}), 500

# Route to handle text-based requests
@app.route("/doctor_text", methods=["POST"])
def doctor_text():
    try:
        logging.info("Received a request to /doctor_text")

        if not GROQ_API_KEY:
            logging.error("GROQ_API_KEY is not set")
            return jsonify({"error": "GROQ_API_KEY is not set"}), 500

        # Check if text is present in request
        if "text" not in request.json:
            logging.error("Text is required")
            return jsonify({"error": "Text is required"}), 400
        
        text = request.json["text"]
        
        # Step 1: Detect if the text is Hindi or Marathi
        detected_lang = detect_language(text)
        logging.info(f"Detected language: {detected_lang}")

        # Step 2: Analyze the text and generate a response
        logging.info("Analyzing text and generating response...")
        doctor_response_en = analyze_text_with_query(
            query=system_prompt + " " + text,
            model="mixtral-8x7b-32768"  # Use a valid model name
        )   
        logging.info(f"Doctor response (English): {doctor_response_en}")

        # Step 3: Translate the doctor's response if needed
        if detected_lang in ["hi", "mr"]:
            logging.info(f"Translating to {detected_lang}...")
            doctor_response = translate_text(doctor_response_en, target_lang=detected_lang)
            logging.info(f"Translated text: {doctor_response}")
        else:
            doctor_response = doctor_response_en

        # Step 4: Convert the response to speech with explicitly set language
        logging.info("Converting response to speech...")
        voice_filepath = text_to_speech_with_gtts_old(
            input_text=doctor_response,
            output_filepath=os.path.join("uploads", f"{int(time.time())}_response.mp3"),
            language=detected_lang
        )
        
        if not voice_filepath:
            logging.error("Failed to generate voice output")
            raise Exception("Failed to generate voice output")

        # Step 5: Recommend doctors based on the response
        logging.info("Recommending doctors...")
        recommended_doctors = recommend_doctors(doctor_response)

        # Return the response
        logging.info("Sending response to client...")
        return jsonify({
            "user_input": text,
            "doctor_response": doctor_response,
            "doctor_response_en": doctor_response_en,
            "voice_output": voice_filepath,
            "recommended_doctors": recommended_doctors
        })

    except Exception as e:
        logging.error(f"Error in doctor_text: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
