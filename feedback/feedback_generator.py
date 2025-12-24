import json
import os
import re
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

def detect_topic(transcription):
    """Détecte le sujet de la présentation basé sur la transcription"""
    text = transcription.lower()
    technical_keywords = ['algorithme', 'code', 'data', 'machine learning', 'intelligence artificielle', 'technique', 'programmation']
    emotional_keywords = ['sentiment', 'émotion', 'passion', 'cœur', 'amour', 'joie', 'tristesse', 'motivation']
    business_keywords = ['business', 'entreprise', 'marché', 'stratégie', 'vente', 'client']

    tech_count = sum(1 for word in technical_keywords if word in text)
    emo_count = sum(1 for word in emotional_keywords if word in text)
    bus_count = sum(1 for word in business_keywords if word in text)

    if tech_count > emo_count and tech_count > bus_count:
        return "technical"
    elif emo_count > tech_count and emo_count > bus_count:
        return "emotional"
    elif bus_count > tech_count and bus_count > emo_count:
        return "business"
    else:
        return "general"

def adjust_scores_for_topic(scores, topic):
    """Ajuste les poids des scores selon le sujet détecté"""
    adjusted = scores.copy()
    if topic == "technical":
        # Plus de poids sur les gestes pour expliquer des concepts complexes
        adjusted["gesture_score"] = min(10, scores["gesture_score"] * 1.2)
    elif topic == "emotional":
        # Plus de poids sur la voix pour transmettre les émotions
        adjusted["speech_rate_score"] = min(10, scores["speech_rate_score"] * 1.1)
        adjusted["voice_modulation_score"] = min(10, scores["voice_modulation_score"] * 1.1)
    elif topic == "business":
        # Plus de poids sur la posture et le regard pour la confiance
        adjusted["posture_score"] = min(10, scores["posture_score"] * 1.1)
        adjusted["eye_contact_score"] = min(10, scores["eye_contact_score"] * 1.1)
    return adjusted

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

def generate_feedback(scores, global_score, weaknesses, transcription="", language="fr"):
    """Generate feedback using Gemini in the specified language, adapté au sujet"""
    # Détecter le sujet et ajuster les scores
    topic = detect_topic(transcription) if transcription else "general"
    adjusted_scores = adjust_scores_for_topic(scores, topic)
    if not client:
        # Mock response for demo purposes - defaults to French
        if language == "en":
            result = {
                "summary": "Your presentation shows a solid foundation, particularly in posture and eye contact with the audience. However, the overall impact could be strengthened by working more on body expressiveness and voice dynamics.",
                "recommendations": [
                    "Use your hands more to accompany your key ideas and strengthen your message.",
                    "Vary the tone and intensity of your voice to maintain audience attention.",
                    "Continue to maintain eye contact with the audience while avoiding moments of stiffness."
                ]
            }
        else:  # French (default)
            result = {
                "summary": "Votre présentation montre une base solide, notamment au niveau de la posture et du regard vers le public. Toutefois, l'impact global pourrait être renforcé en travaillant davantage l'expressivité corporelle et la dynamique de la voix.",
                "recommendations": [
                    "Utilisez davantage vos mains pour accompagner vos idées clés et renforcer votre message.",
                    "Variez le ton et l'intensité de votre voix afin de maintenir l'attention de votre audience.",
                    "Continuez à maintenir un regard orienté vers le public tout en évitant les moments de rigidité."
                ]
            }
        return result

    # Language-specific prompts with explicit language instructions
    if language == "en":
        prompt = f"""
        You are a professional public speaking coach. You MUST respond in ENGLISH only.

        Here are a student's scores after an oral presentation on a {topic} topic:

        Posture: {adjusted_scores["posture_score"]} / 10
        Gestures: {adjusted_scores["gesture_score"]} / 10
        Eye contact: {adjusted_scores["eye_contact_score"]} / 10
        Voice: {(adjusted_scores["speech_rate_score"] + adjusted_scores["voice_modulation_score"]) / 2:.1f} / 10
        Global score: {global_score} / 10

        Detected weaknesses: {', '.join(weaknesses) if weaknesses else 'none major'}

        IMPORTANT: Write your entire response in ENGLISH. Do not use any French words.

        Your mission:
        - Give a global summary that is encouraging and motivating, considering the {topic} nature of the presentation
        - Provide exactly 3 concrete, short and actionable recommendations tailored to {topic} presentations
        - Do not mention technical terms or numerical scores in the text
        - Speak like a human coach, not an AI
        - Write everything in ENGLISH

        Respond in JSON with keys "summary" and "recommendations" (list of 3 strings), all in ENGLISH.
        """
    else:  # French (default)
        prompt = f"""
        Tu es un coach professionnel en prise de parole en public. Tu DOIS répondre en FRANÇAIS uniquement.

        Voici les scores d'un étudiant après une présentation orale sur un sujet {topic} :

        Posture : {adjusted_scores["posture_score"]} / 10
        Gestuelle : {adjusted_scores["gesture_score"]} / 10
        Orientation du regard : {adjusted_scores["eye_contact_score"]} / 10
        Voix : {(adjusted_scores["speech_rate_score"] + adjusted_scores["voice_modulation_score"]) / 2:.1f} / 10
        Score global : {global_score} / 10

        Faiblesses détectées : {', '.join(weaknesses) if weaknesses else 'aucune majeure'}

        IMPORTANT : Écris ta réponse complète en FRANÇAIS. N'utilise aucun mot anglais.

        Ta mission :
        - Donner un résumé global bienveillant et motivant, en tenant compte de la nature {topic} de la présentation
        - Fournir exactement 3 recommandations concrètes, courtes et actionnables adaptées aux présentations {topic}
        - Ne pas mentionner de termes techniques ou de scores numériques dans le texte
        - Parler comme un coach humain, pas comme une IA
        - Écrire tout en FRANÇAIS

        Réponds en JSON avec clés "summary" et "recommendations" (liste de 3 strings), tout en FRANÇAIS.
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

    # Load transcription if available
    transcription = ""
    try:
        with open("data/results/audio_metrics.json", "r", encoding='utf-8') as f:
            audio_data = json.load(f)
            transcription = audio_data.get("transcription", "")
    except FileNotFoundError:
        print("Transcription not found, using general feedback")

    weaknesses = detect_weaknesses(scores)

    feedback = generate_feedback(scores, global_score, weaknesses, transcription)

    with open("feedback/feedback_output.json", "w", encoding='utf-8') as f:
        json.dump(feedback, f, indent=4, ensure_ascii=False)

    print("Feedback generated:", feedback)