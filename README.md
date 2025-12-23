# AI Public Speaking Coach

AI Public Speaking Coach est un système intelligent conçu pour analyser les performances en prise de parole publique en utilisant des données multimodales.

Le système observe une présentation via des entrées vidéo et audio, extrait des métriques objectives non-verbales et vocales telles que la stabilité de la posture, les gestes, le débit de parole, les mots de remplissage et la modulation vocale, et transforme ces métriques en scores numériques clairs.

Sur la base de ces scores, le système génère un feedback structuré, humain-like, ainsi que des recommandations actionnables pour aider les orateurs à améliorer leur prestation. Les résultats sont visualisés via un tableau de bord web comportant un lecteur vidéo, des scores de performance, des résumés de feedback et une timeline des événements clés de prise de parole.

Ce projet suit une approche de développement incrémental et est destiné à une évaluation académique, en se concentrant sur la clarté, l'interprétabilité et l'utilité pratique plutôt que sur des modèles d'apprentissage profond complexes.


## Structure du Projet

- vision/     : Estimation de pose et analyse non-verbale (Groupe 1)
- audio/      : Analyse de la parole et de l'audio (Groupe 2)
- scoring/    : Conversion métriques vers scores
- feedback/   : Génération de feedback basé sur LLM
- backend/    : API et intégration
- ui/         : Tableau de bord web (React)

## Incrément 0 – Configuration & Visualisation de Pose

Objectif :
- Charger une vidéo de présentation
- Visualiser les keypoints corporels avec MediaPipe Pose

Statut :
- Structure du projet initialisée
- Pipeline vision prêt

## Incrément 1 – Extraction des Métriques Non-Verbales

**Objectif :**
- Extraire les métriques non-verbales des keypoints de pose
- Sauvegarder les métriques en JSON pour traitement ultérieur

**Statut :**
- Réalisé par Groupe 1 (Youssouf & Hajar)
- Métriques : posture_score_raw, gesture_activity, head_orientation
- Sorties : metrics_test.json (échantillon), prêt pour vidéos réelles

**Utilisation :**
- Exécuter `python vision/pose_visualization.py` pour traiter une vidéo et générer le JSON des métriques
- Pour vidéos réelles : Mettre à jour VIDEO_PATH dans le script

**Impact :**
- Sépare le traitement vision du scoring
- Permet l'intégration avec les métriques audio et la génération de feedback

## Incrément 2 – Extraction des Métriques Audio

**Objectif :**
- Extraire les métriques vocales de la piste audio
- Métriques : speech_rate, fillers_count, avg_volume, pitch_variation

**Statut :**
- À implémenter par Groupe 2 (Benoit & Salma)
- Placeholder : Utiliser données mock dans le scoring pour l'instant

**Sortie Attendue :**
- JSON des métriques audio compatible avec le moteur de scoring

## Incrément 3 – Système de Scoring (Vision + Audio)

**Objectif :**
- Convertir les métriques brutes en scores clairs 0-10
- Permettre une évaluation interprétable par l'humain

**Statut :**
- Réalisé par Groupe 1 (Youssouf & Hajar)
- Règles de scoring définies pour posture, gestes, contact visuel, débit de parole, modulation vocale

**Utilisation :**
- Exécuter `python scoring/scoring_engine.py` pour générer scores_output.json
- Utilise métriques vision de l'Inc 1 + données audio mock
- Pour audio réel : Intégrer avec la sortie de l'Inc 2

**Fichiers :**
- scoring/scoring_rules.py : Fonctions de scoring
- scoring/scoring_engine.py : Moteur principal
- scoring/scoring_test.py : Script de test
- scoring/scores_output.json : Sortie d'exemple

**Impact :**
- Base pour le feedback LLM et le tableau de bord UI
- Scores prêts pour évaluation globale et recommandations

## Incrément 4 – Score Global

**Objectif :**
- Combiner les scores partiels en une note finale unique
- Fournir une évaluation globale de la performance

**Statut :**
- Réalisé par Groupe 1 (Youssouf & Hajar)
- Formule : Posture 30%, Gestuelle 25%, Orientation tête 15%, Voix 30% (moyenne débit + modulation)

**Utilisation :**
- Exécuter `python scoring/global_score.py` pour générer global_score.json
- Utilise scores_output.json de l'Inc 3

**Fichiers :**
- scoring/global_score.py : Calcul du score global
- scoring/global_score.json : Sortie d'exemple

**Impact :**
- Score unique pour feedback et UI
- Prêt pour intégration avec LLM et timeline

## Incrément 5 – Feedback Intelligent

**Objectif :**
- Transformer scores en feedback humain-like
- Générer résumé et recommandations actionnables

**Statut :**
- Réalisé par Groupe 1 (Youssouf & Hajar)
- Approche hybride : règles + LLM (Gemini)
- Prompt intelligent pour feedback coach-like

**Utilisation :**
- Exécuter `python feedback/feedback_generator.py` pour générer feedback_output.json
- Utilise scores_output.json et global_score.json
- Configure GEMINI_API_KEY dans .env pour LLM réel

**Fichiers :**
- feedback/feedback_generator.py : Générateur de feedback
- feedback/feedback_output.json : Exemple de sortie

**Impact :**
- Feedback compréhensible et motivant
- Base pour UI et évaluation finale

## Backend API

**Objectif :**
- Exposer les fonctionnalités d'analyse via une API REST
- Permettre l'intégration avec l'interface utilisateur React
- Gérer l'upload de vidéos et retourner les résultats d'analyse

**Statut :**
- Réalisé
- API FastAPI fonctionnelle avec endpoints pour analyse vidéo
- Support pour données mock et analyse réelle

**Utilisation :**
- Lancer le serveur : `cd backend && python main.py`
- API disponible sur `http://localhost:8000`
- Documentation Swagger : `http://localhost:8000/docs`

**Endpoints :**
- `POST /analyze` : Analyse d'une vidéo uploadée (MP4)
- `GET /analyze/mock` : Retourne des données d'exemple pour tests UI

**Structure :**
- backend/main.py : Application FastAPI principale
- backend/routers/analyze.py : Endpoints d'analyse
- backend/services/ : Services modulaires (vision, audio, scoring, feedback)
- backend/models/schemas.py : Modèles de données Pydantic
- backend/utils/file_handler.py : Gestion des fichiers uploadés

**Pipeline d'Analyse Complet :**

1. **Upload Frontend → Backend**
   - Frontend envoie vidéo MP4 via `POST /analyze` (multipart/form-data)
   - Backend valide le fichier et le sauvegarde temporairement

2. **Extraction Métriques Vision**
   - Utilise MediaPipe Pose Landmarker pour détecter keypoints corporels
   - Calcule posture (angle épaules-hanches), gestes (amplitude bras), orientation tête
   - Traite jusqu'à 900 frames maximum pour performance

3. **Extraction Métriques Audio**
   - Actuellement mock : génère speech_rate, pitch_variation, etc.
   - Prévu pour intégration réelle avec librosa/speech_recognition

4. **Calcul des Scores**
   - Applique règles de scoring (0-10) pour chaque métrique
   - Calcule score global pondéré (posture 30%, gestes 25%, regard 15%, voix 30%)

5. **Génération Feedback IA**
   - Détecte faiblesses automatiques
   - Utilise Gemini API pour feedback humain-like + 3 recommandations

6. **Timeline Événements**
   - Identifie timestamps des problèmes détectés
   - Actuellement basé sur scores, extensible pour timeline détaillée

7. **Réponse Structurée**
   - Retourne JSON avec scores, timeline, et feedback
   - Frontend nettoie automatiquement les fichiers temporaires

**Response Format :**
```json
{
  "scores": {
    "posture": 7,
    "gestures": 6,
    "eye_contact": 5,
    "speech_rate": 6,
    "voice_modulation": 7,
    "global_score": 6.2
  },
  "timeline": [
    { "time": 10, "event": "Low eye contact" },
    { "time": 23, "event": "Fast speech rate" }
  ],
  "feedback": {
    "summary": "Good posture but speech is too fast.",
    "recommendations": [
      "Slow down your speaking rate",
      "Maintain eye contact",
      "Use gestures more intentionally"
    ]
  }
}
```

**Impact :**
- API prête pour intégration frontend
- Architecture modulaire et maintenable
- Support pour analyse temps réel et traitement par lots
