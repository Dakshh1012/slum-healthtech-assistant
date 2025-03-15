import os
from gtts import gTTS

def text_to_speech_with_gtts_old(input_text, output_filepath, language="en"):
    """
    Convert text to speech using gTTS.

    Args:
        input_text (str): The text to convert to speech.
        output_filepath (str): The path to save the output audio file.
        language (str): The language code (e.g., "en" for English, "hi" for Hindi).
    """
    try:
        # Create a gTTS object
        audioobj = gTTS(
            text=input_text,
            lang=language,
            slow=False
        )
        # Save the audio file
        audioobj.save(output_filepath)
        print(f"Audio saved to {output_filepath}")
    except Exception as e:
        print(f"Error in text_to_speech_with_gtts_old: {e}")