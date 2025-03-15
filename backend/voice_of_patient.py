import logging
import speech_recognition as sr
from pydub import AudioSegment
from io import BytesIO
import pyaudio
import wave
import os
from groq import Groq

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Groq API key and model
GROQ_API_KEY = "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"
stt_model = "whisper-large-v3"

def record_audio(output_file, duration=5, rate=44100, channels=1):
    """
    Record audio from the microphone and save it to a file.

    Args:
        output_file (str): Path to save the recorded audio.
        duration (int): Duration of the recording in seconds.
        rate (int): Sampling rate.
        channels (int): Number of audio channels.
    """
    p = pyaudio.PyAudio()
    stream = p.open(format=pyaudio.paInt16, channels=channels, rate=rate, input=True, frames_per_buffer=1024)

    print("Recording...")
    frames = [stream.read(1024) for _ in range(0, int(rate / 1024 * duration))]
    print("Recording finished.")

    stream.stop_stream()
    stream.close()
    p.terminate()

    with wave.open(output_file, 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(p.get_sample_size(pyaudio.paInt16))
        wf.setframerate(rate)
        wf.writeframes(b''.join(frames))

def transcribe_with_groq(stt_model, audio_filepath, GROQ_API_KEY, language="auto"):
    """
    Transcribe audio using Groq's Whisper model.

    Args:
        stt_model (str): The speech-to-text model to use.
        audio_filepath (str): Path to the audio file.
        GROQ_API_KEY (str): Groq API key.
        language (str): Language code for transcription (e.g., "en" for English, "hi" for Hindi).

    Returns:
        str: Transcribed text.
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set")
        
    client = Groq(api_key=GROQ_API_KEY)
    
    with open(audio_filepath, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model=stt_model,
            file=audio_file,
            language=language  # Pass the language parameter
        )

    return transcription.text