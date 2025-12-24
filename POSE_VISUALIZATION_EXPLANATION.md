# Explication Détaillée de Pose Visualization et Scoring

## La liste POSE_CONNECTIONS dans vision/pose_visualization.py

La liste `POSE_CONNECTIONS` dans `vision/pose_visualization.py` définit les paires de points clés (indices) qui doivent être reliés par des lignes lors de la visualisation d'un squelette de pose humaine. Cela est basé sur le modèle MediaPipe Pose, qui utilise 33 points clés pour représenter le corps entier (y compris le visage, le torse, les bras et les jambes). Ces connexions créent une structure en fil de fer qui décrit la posture du corps, facilitant l'analyse des mouvements en prise de parole publique (par exemple, les gestes, la posture ou le langage corporel).

Voici une explication détaillée de pourquoi ces connexions spécifiques sont utilisées, regroupées par parties du corps pour plus de clarté. Chaque tuple `(a, b)` signifie "tracer une ligne du point clé `a` au point clé `b`" :

### Visage et Tête
- `(0, 1), (1, 2), (2, 3), (3, 7)` : Relie la zone de l'œil gauche (œil intérieur → œil → œil extérieur → oreille).
- `(0, 4), (4, 5), (5, 6), (6, 8)` : Relie la zone de l'œil droit (œil intérieur → œil → œil extérieur → oreille).
- `(9, 10)` : Relie les coins gauche et droit de la bouche.

Ces connexions forment un contour facial de base, utile pour détecter l'orientation de la tête ou les expressions pendant la parole.

### Bras et Épaules
- `(11, 12)` : Relie les épaules gauche et droite (formant la ligne des épaules).
- `(11, 13), (13, 15)` : Bras gauche (épaule → coude → poignet).
- `(12, 14), (14, 16)` : Bras droit (épaule → coude → poignet).

Cela met en évidence les positions des bras et les gestes, qui sont essentiels pour analyser les mouvements des mains ou la posture lors des présentations.

### Mains (Doigts)
- `(15, 17), (17, 19), (15, 19), (15, 21)` : Main gauche (poignet vers les doigts auriculaire, index et pouce).
- `(16, 18), (18, 20), (16, 20), (16, 22)` : Main droite (poignet vers les doigts auriculaire, index et pouce).

Ces connexions montrent les positions des doigts, aidant à évaluer les gestes détaillés des mains (par exemple, pointer ou paumes ouvertes).

### Torse et Hanches
- `(11, 23), (12, 24)` : Épaules aux hanches (gauche et droite).
- `(23, 24)` : Relie les hanches gauche et droite.

Cela définit l'alignement du torse et des hanches, important pour évaluer la posture générale du corps et l'équilibre.

### Jambes
- `(23, 25), (25, 27), (27, 29), (29, 31)` : Jambe gauche (hanche → genou → cheville → index du pied).
- `(24, 26), (26, 28), (28, 30), (30, 32)` : Jambe droite (hanche → genou → cheville → index du pied).
- `(25, 26)` : Relie les genoux gauche et droit.

Ces connexions décrivent les positions des jambes, qui peuvent indiquer la stabilité de la posture ou les mouvements pendant la parole.

### Pourquoi Cette Structure ?
- **Modèle de Pose Standard** : Cela correspond aux repères de pose prédéfinis de MediaPipe et aux connexions, assurant une visualisation précise. Ce n'est pas arbitraire—chaque connexion suit une logique anatomique pour représenter une anatomie humaine réaliste.
- **Objectif dans Votre Projet** : Dans un coach de prise de parole publique IA, ces connexions aident à visualiser le langage corporel à partir de l'analyse vidéo. Par exemple, elles permettent de noter la posture, les gestes ou les indicateurs de confiance en dessinant le squelette sur la vidéo.
- **Aucun Changement Nécessaire** : Comme demandé, je ne modifie aucun code—c'est juste une explication basée sur la documentation standard de MediaPipe Pose et son utilisation courante en vision par ordinateur.

## 1. Vue d'ensemble du script
Ce script est conçu pour analyser une vidéo de prise de parole publique en utilisant l'intelligence artificielle pour détecter la pose corporelle (posture, gestes, orientation de la tête). Il utilise la bibliothèque MediaPipe (développée par Google) pour la vision par ordinateur. Le but est de :

- Visualiser les keypoints (points clés) du corps humain sur la vidéo.
- Extraire des métriques non-verbales (scores) pour évaluer la qualité de la présentation (posture, gestes, orientation).
- Sauvegarder ces métriques dans un fichier JSON pour une analyse ultérieure.

Le script traite les 900 premières frames de la vidéo (pour limiter le temps de test), mais il peut être adapté. Il se base sur un modèle de machine learning pré-entraîné (MediaPipe Pose Landmarker) qui détecte automatiquement les poses dans les images/vidéos.

## 2. Sur quoi se base la détection et l'analyse vidéo ?
- **Modèle MediaPipe Pose Landmarker** : C'est un modèle d'IA pré-entraîné qui détecte 33 points clés (landmarks) sur le corps humain dans une image ou une vidéo. Ces points représentent des parties anatomiques comme le nez, les yeux, épaules, coudes, poignets, hanches, genoux, etc. Le modèle est téléchargé automatiquement depuis un URL si absent (ligne 41-46).
  - **Pourquoi MediaPipe ?** C'est un outil open-source fiable pour la vision par ordinateur, optimisé pour la détection de poses en temps réel. Il utilise des réseaux de neurones convolutifs (CNN) pour analyser les pixels de l'image et prédire les positions des keypoints avec une précision élevée.
  - **Entrée vidéo** : Le script charge une vidéo MP4 (chemin défini dans `VIDEO_PATH`). Il traite frame par frame (image par image) en convertissant chaque frame de BGR (format OpenCV) à RGB (format MediaPipe).
  - **Mode de fonctionnement** : Utilise `RunningMode.VIDEO` pour traiter une séquence temporelle, avec des seuils de confiance (min_pose_detection_confidence=0.5, etc.) pour éviter les fausses détections.

- **Keypoints et connexions (POSE_CONNECTIONS)** :
  - Les 33 keypoints sont numérotés de 0 à 32 (par exemple, 0 = nez, 11 = épaule gauche, 23 = hanche gauche, etc.).
  - `POSE_CONNECTIONS` est une liste de tuples définissant les lignes à tracer entre ces keypoints pour former un "squelette" visuel. Par exemple, `(11, 13)` relie l'épaule gauche au coude gauche. Cela crée une structure anatomique réaliste, basée sur la documentation MediaPipe, pour visualiser la pose comme un fil de fer sur la vidéo.
  - **Pourquoi ces connexions ?** Elles suivent l'anatomie humaine standard : visage, bras, torse, jambes. Elles permettent de dessiner un squelette cohérent, facilitant l'analyse visuelle des mouvements.

- **Métriques calculées** : Le script ne fait pas de "scoring" final (comme une note globale), mais extrait des métriques brutes pour chaque frame. Ces métriques sont basées sur des calculs mathématiques simples utilisant les coordonnées des keypoints :
  - **Posture (posture_score_raw)** : Calcule l'angle entre les épaules et les hanches (ligne verticale du corps). Un angle proche de 180° indique une posture droite (score élevé, proche de 1). Utilise la fonction `calculate_angle` (lignes 48-59), qui applique la trigonométrie vectorielle (produit scalaire).
  - **Activité gestuelle (gesture_activity)** : Mesure l'amplitude des mouvements des bras en calculant la distance euclidienne entre poignets et épaules (lignes 104-105). Plus la distance est grande, plus les gestes sont amples (utile pour évaluer l'expressivité).
  - **Orientation de la tête (head_orientation)** : Compare la position du nez par rapport au centre des épaules (lignes 61-79). Si le nez est centré (±5% de tolérance), c'est "front" ; sinon "left" ou "right". Cela détecte si la personne regarde l'audience ou détourne le regard.

Ces métriques sont non-verbales et spécifiques à la prise de parole : une bonne posture et des gestes variés améliorent la confiance perçue.

## 3. Comment fonctionne la détection et le scoring étape par étape ?
Le script suit ce flux dans la fonction `main()` (lignes 116-195) :

- **Étape 1 : Téléchargement et initialisation du modèle** (lignes 117-129) :
  - Télécharge le modèle si nécessaire.
  - Crée un objet `PoseLandmarker` avec des options (confiance minimale pour détecter une pose).

- **Étape 2 : Lecture de la vidéo frame par frame** (lignes 130-143) :
  - Ouvre la vidéo avec OpenCV (`cv2.VideoCapture`).
  - Boucle sur les frames jusqu'à 900 frames.

- **Étape 3 : Prétraitement de chaque frame** (lignes 145-148) :
  - Convertit le frame en RGB.
  - Crée un objet `mp.Image` pour MediaPipe.

- **Étape 4 : Détection des poses** (lignes 150-153) :
  - Appelle `landmarker.detect_for_video()` avec un timestamp (pour le suivi temporel).
  - Si des landmarks sont détectés (avec confiance > 0.5), procède à l'analyse.

- **Étape 5 : Calcul des métriques** (lignes 155-159) :
  - Pour chaque pose détectée, appelle `analyze_frame()` qui extrait les 3 métriques (posture, gestes, tête).
  - Stocke les métriques dans une liste `metrics_list`.

- **Étape 6 : Visualisation** (lignes 161-176) :
  - Dessine des cercles verts sur chaque keypoint (`cv2.circle`).
  - Dessine des lignes vertes entre les keypoints selon `POSE_CONNECTIONS` (`cv2.line`).
  - Redimensionne la frame pour affichage dans une fenêtre OpenCV ("Pose Visualization + Metrics").
  - Affiche la vidéo en temps réel (avec `cv2.imshow`), permettant de voir le squelette superposé.

- **Étape 7 : Sauvegarde et fin** (lignes 187-193) :
  - Ferme la vidéo.
  - Sauvegarde `metrics_list` (liste de dictionnaires par frame) dans `metrics_test.json`.
  - Affiche le nombre total de frames traitées.

## 4. Utilisation dans le projet global
- **Intégration** : Ce script est un module de test pour extraire des métriques visuelles. Dans votre projet de coach IA pour prise de parole, ces métriques alimentent le système de scoring global (dans `scoring/scoring_engine.py` ou `backend/services/scoring_service.py`), combinées avec l'audio (volume, pauses) et le feedback (dans `feedback/feedback_generator.py`).
- **Limites et bases** :
  - Basé sur IA (pas de règles manuelles), donc dépend de la qualité de la vidéo (éclairage, angle de caméra).
  - Métriques sont "brutes" (pas normalisées globalement) ; elles sont utilisées pour calculer des scores finaux ailleurs (par exemple, moyenne sur la vidéo).
  - Pour adapter le feedback au sujet de la présentation (comme vous l'avez mentionné initialement), il faudrait intégrer du NLP (traitement du langage naturel) sur la transcription audio pour analyser le contenu (thèmes, émotions), puis ajuster les poids des métriques (ex. : plus de poids sur les gestes pour un sujet technique). Mais cela nécessiterait des modifications dans `feedback_generator.py` ou `audio/audio_scoring.py`.