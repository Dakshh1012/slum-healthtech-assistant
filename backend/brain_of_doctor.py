GROQ_API_KEY="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"
import base64
from groq import Groq 
def encode_image(image_path):   
    image_file=open(image_path, "rb")
    return base64.b64encode(image_file.read()).decode('utf-8')
query="Is there something wrong with my face?"
model="llama-3.2-90b-vision-preview"

def analyze_image_with_query(query, model, encoded_image):
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set")
        
    client = Groq(api_key=GROQ_API_KEY)
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text", 
                    "text": query
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{encoded_image}",
                    },
                },
            ],
        }]
    chat_completion = client.chat.completions.create(
        messages=messages,
        model=model
    )

    return chat_completion.choices[0].message.content
def analyze_text_with_query(query, model="mixtral-8x7b-32768"):
    """
    Analyze text using the specified model.
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set")
    
    client = Groq(api_key=GROQ_API_KEY)
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text", 
                    "text": query
                }
            ]
        }
    ]
    chat_completion = client.chat.completions.create(
        messages=messages,
        model=model
    )

    return chat_completion.choices[0].message.content