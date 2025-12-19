
# 📘 INSTRUCTIONS PROJET

## AI Public Speaking Coach

Ce document décrit **qui fait quoi**, **comment travailler**, et **ce qui est attendu** pour chaque groupe.

---

## 🎯 OBJECTIF GLOBAL DU PROJET

Développer un système qui analyse une présentation orale à partir :

* d’une **vidéo** (posture, gestes, regard),
* d’un **audio** (débit, fillers, intonation),

et qui fournit :

* des **scores chiffrés**,
* un **feedback clair et actionnable**,
* une **interface web avec timeline**.

⚠️ Le projet est **académique** : priorité à la **clarté**, la **justification des métriques** et la **lisibilité**, pas à la complexité.

---

## 🧱 ARCHITECTURE GLOBALE

```
Vidéo + Audio
      ↓
Vision Module      Audio Module
      ↓                   ↓
Métriques Vision   Métriques Audio
            ↓
        Scoring Engine
            ↓
        Feedback (LLM)
            ↓
        UI + Timeline
```

---

## 👥 RÉPARTITION DES GROUPES

### 🔵 Groupe 1 — Vision, Scoring, Feedback, Backend

**Responsables : Youssouf & Hajar**

Dossiers concernés :

```
vision/
scoring/
feedback/
backend/
```

Responsabilités :

* Pose estimation (MediaPipe)
* Extraction métriques non-verbales
* Conversion métriques → scores
* Génération du feedback (LLM)
* Backend simple (API ou JSON)

---

### 🟢 Groupe 2 — Audio & UI

**Responsables : Salma & Benoît**

Dossiers concernés :

```
audio/
ui/
```

Responsabilités :

* Transcription (Whisper)
* Features audio (Librosa)
* Scoring audio
* Interface React (dashboard + timeline)

---

## 📦 RÈGLES DE TRAVAIL (IMPORTANT)

### ✅ À FAIRE

* Travailler **uniquement dans votre dossier**
* Respecter les incréments
* Produire des sorties **simples et justifiées**
* Sauvegarder les résultats en **JSON**
* Commits clairs et réguliers

### ❌ À NE PAS FAIRE

* Modifier le code des autres groupes
* Ajouter des features non demandées
* Faire du deep learning inutile
* Changer la structure du projet sans accord

---

## 🔹 INCRÉMENTATION (OBLIGATOIRE)

Le projet est découpé en **incréments**.
👉 **On ne saute jamais un incrément.**

### 🟦 Incrément 0 — Setup & compréhension

**Objectif :** vérifier que tout fonctionne (pas d’intelligence).

* Groupe 1 :

  * Installer MediaPipe
  * Charger une vidéo
  * Afficher les keypoints du corps

* Groupe 2 :

  * Installer Whisper + Librosa
  * Extraire l’audio
  * Générer une transcription texte

Livrable :

* Vidéo affichée
* Keypoints visibles
* Texte transcrit

---

### 🟦 Incrément 1 — Vision : posture & gestuelle

**Objectif :** extraire des métriques non-verbales mesurables.

* Stabilité posture
* Activité des bras
* Orientation de la tête

Livrable :

```json
{
  "posture_score_raw": 0.72,
  "gesture_activity": 1.34,
  "head_orientation": "front"
}
```

---

### 🟦 Incrément 2 — Audio : débit & voix

**Objectif :** analyser la manière de parler.

* Débit (mots/min)
* Fillers
* Volume
* Variation du pitch

Livrable :

```json
{
  "speech_rate": 172,
  "fillers_count": 14,
  "avg_volume": -18.4,
  "pitch_variation": 0.23
}
```

---

### 🟦 Incrément 3 — Scoring

**Objectif :** convertir les métriques en scores (0–10).

Livrable :

```json
{
  "posture_score": 8,
  "gesture_score": 6,
  "eye_contact_score": 7,
  "speech_rate_score": 5
}
```

---

### 🟦 Incrément 4 — Score global

**Objectif :** produire une note finale.

```json
{
  "global_score": 6.7
}
```

---

### 🟦 Incrément 5 — Feedback intelligent

**Objectif :** feedback humain, clair et actionnable.

Livrable :

* Résumé global
* 3 recommandations concrètes

---

### 🟦 Incrément 6 — UI Dashboard

**Objectif :** visualisation claire.

* Vidéo
* Scores
* Feedback
* Timeline

---

### 🟦 Incrément 7 — Intégration finale

**Objectif :** système complet fonctionnel.

---

### 🟦 Incrément 8 — Rapport & démo

**Objectif :** maximiser la note finale.

---

## 📝 CRITÈRES D’ÉVALUATION (À NE JAMAIS OUBLIER)

* Pertinence des métriques
* Justification claire des choix
* Feedback utile et bienveillant
* UI lisible
* Code propre et structuré

---

## ⚠️ RÈGLE FINALE

👉 **Ce projet doit être :**

* simple,
* compréhensible,
* démontrable,
* justifiable à l’oral.

Pas plus.

