import json
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
# Configure Gemini API if key available
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    client = genai.Client()
else:
    client = None
    print("No GOOGLE_API_KEY found, using mock feedback")

def detect_weaknesses(scores):
    """Detect main weaknesses based on scores"""
    weaknesses = []
    if scores["posture_score"] < 5:
        weaknesses.append("posture")
    if scores["gesture_score"] < 5:
        weaknesses.append("gestuelle")
    if scores["eye_contact_score"] < 5:
        weaknesses.append("regard")
    if (scores["speech_rate_score"] + scores["voice_modulation_score"]) / 2 < 5:
        weaknesses.append("voix")
    return weaknesses

def generate_feedback(scores, global_score, weaknesses):
    """Generate feedback using Gemini"""
    if not client:
        # Mock response for demo purposes
        result = {
            "summary": "Votre présentation montre une base solide, notamment au niveau de la posture et du regard vers le public. Toutefois, l'impact global pourrait être renforcé en travaillant davantage l'expressivité corporelle et la dynamique de la voix.",
            "recommendations": [
                "Utilisez davantage vos mains pour accompagner vos idées clés et renforcer votre message.",
                "Variez le ton et l'intensité de votre voix afin de maintenir l'attention de votre audience.",
                "Continuez à maintenir un regard orienté vers le public tout en évitant les moments de rigidité."
            ]
        }
        return result

    prompt = f"""
    Tu es un coach professionnel en prise de parole en public.
    Voici les scores d’un étudiant après une présentation orale :

    Posture : {scores["posture_score"]} / 10
    Gestuelle : {scores["gesture_score"]} / 10
    Orientation du regard : {scores["eye_contact_score"]} / 10
    Voix : {(scores["speech_rate_score"] + scores["voice_modulation_score"]) / 2:.1f} / 10
    Score global : {global_score} / 10

    Faiblesses détectées : {', '.join(weaknesses) if weaknesses else 'aucune majeure'}

    Ta mission :
    - Donner un résumé global bienveillant et motivant
    - Fournir exactement 3 recommandations concrètes, courtes et actionnables
    - Ne pas mentionner de termes techniques ou de scores numériques dans le texte
    - Parler comme un coach humain, pas comme une IA

    Réponds en JSON avec clés "summary" et "recommendations" (liste de 3 strings).
    """

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )
    # Extract text from response
    if hasattr(response, 'text'):
        text = response.text
    else:
        text = response.candidates[0].content.parts[0].text
    # Remove markdown code block if present
    if text.startswith('```json'):
        text = text[7:]  # Remove ```json
    if text.endswith('```'):
        text = text[:-3]  # Remove ```
    text = text.strip()
    result = json.loads(text)
    return result

if __name__ == "__main__":
    # Load scores
    with open("scoring/scores_output.json", "r") as f:
        scores = json.load(f)
    with open("scoring/global_score.json", "r") as f:
        global_data = json.load(f)
    global_score = global_data["global_score"]

    weaknesses = detect_weaknesses(scores)

    feedback = generate_feedback(scores, global_score, weaknesses)

    with open("feedback/feedback_output.json", "w", encoding='utf-8') as f:
        json.dump(feedback, f, indent=4, ensure_ascii=False)

    print("Feedback generated:", feedback)