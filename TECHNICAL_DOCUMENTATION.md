# AI Public Speaking Coach - Technical Documentation

## Architecture Overview

Le système AI Public Speaking Coach est conçu selon une architecture modulaire permettant l'analyse automatisée des performances en prise de parole publique. Le système traite des données multimodales (vidéo/audio) pour extraire des métriques objectives et générer du feedback personnalisé.

## Architecture Générale

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   Backend API   │    │   Data Models   │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (Pydantic)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Video Upload   │    │  Services       │    │  Validation     │
│  & Display      │    │  Layer          │    │  & Serialization│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Composants Techniques

### 1. Frontend (React)

#### Structure des Composants
- **App.jsx** : Composant principal orchestrant l'état global
- **VideoUpload.jsx** : Gestionnaire d'upload de fichiers vidéo
- **VideoPlayer.jsx** : Lecteur vidéo avec contrôles
- **ScoresPanel.jsx** : Affichage des scores sous forme de graphiques
- **Timeline.jsx** : Visualisation temporelle des événements
- **Feedback.jsx** : Affichage du feedback IA

#### État Global
```javascript
const [videoFile, setVideoFile] = useState(null);
const [analysisResult, setAnalysisResult] = useState(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [error, setError] = useState(null);
```

#### Service API
- **api.js** : Client HTTP pour communication avec le backend
- Gestion des erreurs et états de chargement
- Support pour upload multipart/form-data

### 2. Backend (FastAPI)

#### Architecture FastAPI
- **main.py** : Application principale avec configuration CORS
- **routers/analyze.py** : Endpoints REST pour l'analyse
- **models/schemas.py** : Schémas Pydantic pour validation
- **services/** : Couche métier modulaire
- **utils/file_handler.py** : Gestion des fichiers

#### Endpoints API

##### POST /analyze
**Description** : Analyse une vidéo uploadée
**Input** : Fichier MP4 (multipart/form-data)
**Output** : JSON structuré avec scores, timeline, feedback
**Traitement** : Pipeline complet vision → audio → scoring → feedback

##### GET /analyze/mock
**Description** : Retourne des données d'exemple
**Input** : Aucun
**Output** : JSON mock pour tests UI

#### Gestion des Erreurs
- Validation des types de fichiers (MP4 uniquement)
- Gestion des timeouts de traitement
- Nettoyage automatique des fichiers temporaires
- Messages d'erreur structurés

### 3. Pipeline d'Analyse

#### 3.1 Service Vision (vision_service.py)

**Technologies** : MediaPipe, OpenCV, NumPy

**Fonctionnement** :
1. Téléchargement automatique du modèle Pose Landmarker
2. Traitement frame par frame de la vidéo
3. Détection des 33 keypoints corporels par frame
4. Calcul des métriques :
   - **Posture** : Angle entre épaules et hanches
   - **Gestuelle** : Amplitude des mouvements des bras
   - **Orientation tête** : Position relative nez/épaules

**Optimisations** :
- Limitation à 900 frames maximum
- Agrégation des métriques sur toute la vidéo
- Gestion des erreurs de détection

**Métriques Extraites** :
```python
{
    "posture_score_raw": float,  # 0-1 (angle normalisé)
    "gesture_activity": float,   # amplitude gestuelle
    "head_orientation": str      # "front" | "left" | "right"
}
```

#### 3.2 Service Audio (audio_service.py)

**Statut** : Implémentation complète
**Technologies** : OpenAI Whisper, Librosa, SoundFile, FFmpeg

**Pipeline Audio** :
1. **Extraction** : FFmpeg extrait l'audio WAV (16kHz, mono)
2. **Transcription** : Whisper transcrit le discours en français
3. **Analyse Spectrale** : Librosa calcule pitch, volume, pauses
4. **Détection Fillers** : Regex recherche mots de remplissage français
5. **Scoring Détaillé** : Algorithmes spécialisés pour chaque métrique

**Métriques Réelles** :
```python
{
    "debit_mots_par_minute": float,    # calculé précisément
    "fillers": {
        "pourcentage": float,          # % de fillers
        "nombre_total": int,           # nombre absolu
        "detail": dict                 # par type de filler
    },
    "audio_features": {
        "volume_moyen": float,         # RMS energy
        "pitch_moyen": float,          # fréquence fondamentale
        "pauses": list,                # timestamps et durées
        "pitch_std": float             # variation intonation
    },
    "transcription": str,              # texte complet
    "segments": list                   # transcription avec timestamps
}
```

#### 3.3 Service Scoring (scoring_service.py)

**Règles de Scoring** (scoring_rules.py) :

| Métrique | Plage | Règles |
|----------|-------|--------|
| Posture | 4-9 | Basé sur angle (0.8 = 9pts, <0.4 = 4pts) |
| Gestes | 4-8 | Activité bras (0.8-1.5 = 8pts, >2.2 = 4pts) |
| Contact Visuel | 5-8 | Orientation tête (front = 8pts, autres = 5pts) |
| Débit Parole | 4-8 | WPM (120-160 = 8pts, <100 = 4pts) |
| Modulation Vocale | 4-8 | Variation pitch (≥40 = 8pts, <25 = 4pts) |

**Score Global** :
```
global_score = (posture × 0.3) + (gestes × 0.25) + (regard × 0.15) + (voix × 0.3)
```

#### 3.4 Service Feedback (feedback_service.py)

**IA Integration** : Google Gemini 1.5 Pro

**Processus** :
1. **Détection de langue** : Analyse automatique de la langue parlée dans la vidéo
2. Détection automatique des faiblesses (< 5 points)
3. Génération de prompt structuré pour l'IA (dans la langue appropriée)
4. Appel API Gemini avec contexte des scores
5. Parsing de la réponse JSON dans la langue détectée

**Prompt Structure** :
```
Tu es un coach professionnel en prise de parole...
Scores: Posture X/10, Gestuelle Y/10, etc.
Faiblesses détectées: [...]
Mission: Résumé + 3 recommandations concrètes
```

**Format de Réponse** :
```json
{
  "summary": "Résumé bienveillant et motivant",
  "recommendations": [
    "Recommandation 1",
    "Recommandation 2",
    "Recommandation 3"
  ]
}
```

### 4. Modèles de Données

#### Pydantic Schemas (models/schemas.py)
```python
class TimelineEvent(BaseModel):
    time: int
    event: str

class Feedback(BaseModel):
    summary: str
    recommendations: List[str]

class AnalysisResponse(BaseModel):
    scores: Dict[str, float]
    timeline: List[TimelineEvent]
    feedback: Feedback
```

#### Formats Internes
- **Métriques Vision** : Dict avec clés normalisées
- **Scores** : Dict avec scores 0-10 + score global
- **Timeline** : Liste d'événements temporels (extensible)

## Technologies Utilisées

### Backend
- **FastAPI** : Framework web asynchrone
- **Uvicorn** : Serveur ASGI
- **MediaPipe** : Computer vision et pose detection
- **OpenCV** : Traitement vidéo
- **Google GenAI** : Intelligence artificielle pour feedback
- **python-multipart** : Gestion upload fichiers

### Frontend
- **React** : Framework UI
- **Vite** : Build tool et dev server
- **Axios** : Client HTTP
- **CSS Modules** : Styling component-scoped

### Outils de Développement
- **Python 3.8+** : Runtime backend
- **Node.js 16+** : Runtime frontend
- **Git** : Version control
- **Virtualenv** : Isolation environnement Python
- **FFmpeg** : Traitement audio/vidéo (requis pour extraction audio)

## Configuration et Déploiement

### Variables d'Environnement
```bash
# .env
GOOGLE_API_KEY=votre_clé_gemini_api
```

### Installation
```bash
# Backend
cd backend
pip install -r ../requirements.txt
python main.py

# Frontend
cd ui
npm install
npm run dev
```

### Structure des Fichiers
```
ai-public-speaking-coach/
├── backend/                 # API FastAPI
│   ├── main.py             # Application principale
│   ├── routers/            # Endpoints REST
│   ├── services/           # Logique métier
│   ├── models/             # Schémas de données
│   └── utils/              # Utilitaires
├── ui/                     # Interface React
│   ├── src/
│   │   ├── components/     # Composants UI
│   │   ├── services/       # Client API
│   │   └── App.jsx         # Application principale
│   └── package.json
├── vision/                 # Analyse vidéo
├── audio/                  # Analyse audio (Whisper + Librosa)
│   ├── audio_extraction.py # Pipeline extraction + transcription
│   └── audio_scoring.py    # Calcul scores détaillés
├── scoring/                # Système de scoring
├── feedback/               # Génération IA
├── backend/                # API FastAPI
├── ui/                     # Interface React
├── data/videos/            # Stockage temporaire
└── requirements.txt        # Dépendances Python
```

## Performance et Optimisations

### Limitations Techniques
- **Traitement Vidéo** : Maximum 900 frames (~30 secondes à 30fps)
- **Mémoire** : Chargement complet de la vidéo en RAM
- **CPU/GPU** : Traitement séquentiel des frames
- **Timeout** : Pas de limite temporelle configurée

### Optimisations Implémentées
- **Téléchargement Modèle** : Cache automatique du modèle MediaPipe
- **Nettoyage Automatique** : Suppression des fichiers temporaires
- **Validation Input** : Contrôle des types et tailles de fichiers
- **Gestion d'Erreurs** : Messages informatifs et récupération gracieuse

### Améliorations Futures
- **Traitement Asynchrone** : Background tasks pour vidéos longues
- **Streaming** : Traitement frame par frame sans chargement complet
- **Cache** : Mise en cache des analyses répétées
- **Scalabilité** : Support pour traitement distribué

## Sécurité

### Mesures Implémentées
- **Validation des Inputs** : Types de fichiers, tailles maximales
- **CORS** : Configuration restrictive des origines autorisées
- **Nettoyage** : Suppression automatique des fichiers uploadés
- **Gestion d'Erreurs** : Pas de leakage d'informations sensibles

### Risques et Mitigations
- **Upload Malveillant** : Validation stricte des types MIME
- **Déni de Service** : Limitation du nombre de frames traités
- **Fuite de Données** : Nettoyage automatique des temporaires
- **API Keys** : Stockage sécurisé dans variables d'environnement

## Tests et Validation

### Tests Disponibles
- **Mock Endpoint** : Validation de l'intégration frontend
- **Scoring Tests** : Validation des règles de calcul
- **Feedback Tests** : Validation génération IA (avec fallback mock)

### Métriques de Qualité
- **Précision Vision** : Détection pose MediaPipe (~95% accuracy)
- **Cohérence Scoring** : Règles déterministes et testables
- **Qualité Feedback** : Évaluation subjective + guidelines IA

## Évolution et Maintenance

### Points d'Extension
- **Audio Réel** : Remplacement du mock par analyse librosa
- **Timeline Avancée** : Détection temporelle précise des événements
- **Multi-langues** : Support pour feedback dans différentes langues
- **Analytics** : Collecte de métriques d'utilisation

### Monitoring
- **Logs** : Traçabilité des erreurs et performances
- **Métriques** : Temps de traitement, taux de succès
- **Health Checks** : Endpoints de monitoring système

## Support Multilingue

### Détection de Langue
- **Whisper** détecte automatiquement la langue parlée dans la vidéo
- Support principal : Français (`fr`) et Anglais (`en`)
- Fallback par défaut : Français

### Adaptation du Feedback
- **Prompts IA** : Versions française et anglaise selon la langue détectée
- **Fillers** : Listes de mots de remplissage spécifiques à chaque langue
- **Réponse** : Feedback généré dans la même langue que la présentation

### Langues Supportées
```python
# Fillers français
['euh', 'heu', 'donc', 'voilà', 'en fait', 'bon', 'genre']

# Fillers anglais
['um', 'uh', 'like', 'you know', 'so', 'well', 'actually']
```

### Processus de Détection
1. **Transcription** : Whisper analyse l'audio sans langue prédéfinie
2. **Classification** : Retourne le code langue détecté (`fr`, `en`, etc.)
3. **Adaptation** : Sélection des fillers et prompts appropriés
4. **Génération** : Feedback IA dans la langue correspondante

Cette documentation technique couvre l'ensemble de l'architecture et des composants du système AI Public Speaking Coach.