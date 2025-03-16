# Hardcoded list of doctors (all in Mumbai)
doctors = [
    {"name": "Dr. Rajesh Sharma", "specialization": "General Physician", "fees": 200, "location": "Mumbai"},
    {"name": "Dr. Priya Singh", "specialization": "Dermatologist", "fees": 300, "location": "Mumbai"},
    {"name": "Dr. Anil Kumar", "specialization": "Pediatrician", "fees": 250, "location": "Mumbai"},
    {"name": "Dr. Meera Patel", "specialization": "General Physician", "fees": 150, "location": "Mumbai"},
    {"name": "Dr. Vikram Gupta", "specialization": "Orthopedic Surgeon", "fees": 400, "location": "Mumbai"},
    {"name": "Dr. Sunita Desai", "specialization": "Gynecologist", "fees": 350, "location": "Mumbai"},
    {"name": "Dr. Ramesh Joshi", "specialization": "ENT Specialist", "fees": 300, "location": "Mumbai"},
    {"name": "Dr. Neha Kapoor", "specialization": "Psychiatrist", "fees": 500, "location": "Mumbai"},
    {"name": "Dr. Arjun Reddy", "specialization": "Cardiologist", "fees": 600, "location": "Mumbai"},
    {"name": "Dr. Kavita Rao", "specialization": "Dentist", "fees": 200, "location": "Mumbai"}
]
import random

def recommend_doctors(diagnosis):
    """Recommend doctors based on the diagnosis."""
    recommended_doctors = []
    
    # Map diagnosis to specializations
    if "skin" in diagnosis.lower() or "rash" in diagnosis.lower():
        recommended_doctors = [doc for doc in doctors if doc["specialization"] == "Dermatologist"]
    elif "child" in diagnosis.lower() or "pediatric" in diagnosis.lower():
        recommended_doctors = [doc for doc in doctors if doc["specialization"] == "Pediatrician"]
    elif "bone" in diagnosis.lower() or "joint" in diagnosis.lower():
        recommended_doctors = [doc for doc in doctors if doc["specialization"] == "Orthopedic Surgeon"]
    elif "pregnancy" in diagnosis.lower() or "gynec" in diagnosis.lower():
        recommended_doctors = [doc for doc in doctors if doc["specialization"] == "Gynecologist"]
    elif "ear" in diagnosis.lower() or "nose" in diagnosis.lower() or "throat" in diagnosis.lower():
        recommended_doctors = [doc for doc in doctors if doc["specialization"] == "ENT Specialist"]
    elif "mental" in diagnosis.lower() or "stress" in diagnosis.lower() or "depression" in diagnosis.lower():
        recommended_doctors = [doc for doc in doctors if doc["specialization"] == "Psychiatrist"]
    elif "heart" in diagnosis.lower() or "cardio" in diagnosis.lower():
        recommended_doctors = [doc for doc in doctors if doc["specialization"] == "Cardiologist"]
    elif "tooth" in diagnosis.lower() or "dental" in diagnosis.lower():
        recommended_doctors = [doc for doc in doctors if doc["specialization"] == "Dentist"]
    else:
        # Default to General Physician
        recommended_doctors = [doc for doc in doctors if doc["specialization"] == "General Physician"]
    
    # If no specific doctors are found, recommend random doctors
    if not recommended_doctors:
        recommended_doctors = random.sample(doctors, k=random.randint(2, 3))
    
    return recommended_doctors