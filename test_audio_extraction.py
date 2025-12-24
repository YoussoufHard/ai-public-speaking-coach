#!/usr/bin/env python3
"""
Test script pour vérifier que l'extraction audio fonctionne avec FFmpeg installé
"""

import os
import sys
from pathlib import Path

# Ajouter le répertoire racine au path pour les imports
sys.path.append(str(Path(__file__).parent))

from audio.audio_extraction import AudioExtractor

def test_audio_extraction():
    """Test l'extraction audio avec une vraie vidéo"""

    print("🔍 TEST D'EXTRACTION AUDIO")
    print("=" * 50)

    # Chercher une vidéo de test dans data/videos
    video_dir = Path("data/videos")
    video_files = list(video_dir.glob("*.mp4"))

    if not video_files:
        print("❌ Aucune vidéo MP4 trouvée dans data/videos/")
        print("💡 Place une vidéo MP4 dans data/videos/ pour tester")
        return

    # Prendre la première vidéo trouvée
    video_path = video_files[0]
    print(f"📹 Vidéo de test : {video_path}")

    try:
        # Créer l'extracteur
        print("🎯 Initialisation AudioExtractor...")
        extractor = AudioExtractor(model_size="tiny")  # Plus rapide pour test

        # Tester seulement l'extraction audio (pas toute la pipeline)
        print("🎵 Test extraction audio seule...")
        audio_path = extractor.extract_audio_from_video(str(video_path))

        if audio_path and os.path.exists(audio_path):
            # Vérifier la taille du fichier audio
            audio_size = os.path.getsize(audio_path)
            print(f"✅ Audio extrait avec succès : {audio_path}")
            print(f"📊 Taille du fichier : {audio_size} bytes")

            # Nettoyer le fichier de test
            os.remove(audio_path)
            print("🧹 Fichier de test nettoyé")

            print("\n🎉 EXTRACTION AUDIO RÉUSSIE !")
            print("🚀 Le système complet devrait maintenant fonctionner")
        else:
            print("❌ Échec de l'extraction audio")

    except Exception as e:
        print(f"❌ Erreur lors du test : {e}")
        print("💡 Vérifie que FFmpeg est bien installé et dans le PATH")

if __name__ == "__main__":
    test_audio_extraction()