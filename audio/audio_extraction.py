import whisper
import librosa
import numpy as np
import soundfile as sf
import json
import re
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')


class AudioExtractor:
    def __init__(self, model_size="base"):
        """
        Initialise l'extracteur audio
        
        Args:
            model_size: Taille du modèle Whisper (tiny, base, small, medium, large)
        """
        print(f" Chargement du modèle Whisper '{model_size}'...")
        self.whisper_model = whisper.load_model(model_size)
        print(" Modèle chargé\n")
        
        # Liste des fillers selon la langue
        self.fillers_fr = [
            'euh', 'heu', 'heum', 'donc', 'voilà', 'en fait', 'bon', 'ben',
            'genre', 'du coup', 'quoi', 'hein', 'bah', 'enfin', 'alors'
        ]

        self.fillers_en = [
            'um', 'uh', 'er', 'ah', 'like', 'you know', 'so', 'well',
            'actually', 'basically', 'literally', 'honestly', 'anyway', 'okay'
        ]

        # Par défaut français
        self.fillers = self.fillers_fr
    
    def extract_audio_from_video(self, video_path, output_audio="temp_audio.wav"):
        """
        Extrait l'audio d'une vidéo en utilisant pydub (simple et fiable)

        Args:
            video_path: Chemin vers la vidéo
            output_audio: Nom du fichier audio de sortie

        Returns:
            Chemin du fichier audio extrait
        """
        from pydub import AudioSegment

        print(f" Extraction audio de {video_path}...")

        try:
            # Charge la vidéo avec pydub (supporte MP4)
            audio = AudioSegment.from_file(video_path, format="mp4")

            if len(audio) == 0:
                print("❌ Aucune piste audio trouvée dans la vidéo")
                return None

            # Convertit en mono et définit le sample rate
            audio = audio.set_channels(1)  # Mono
            audio = audio.set_frame_rate(16000)  # 16kHz pour Whisper

            # Exporte en WAV
            audio.export(output_audio, format="wav")

            print(f"✅ Audio extrait : {output_audio}\n")
            return output_audio

        except Exception as e:
            print(f"Erreur lors de l'extraction audio avec pydub: {e}")
            return None
    
    def transcribe(self, audio_path):
        """
        Transcrit l'audio avec Whisper

        Args:
            audio_path: Chemin du fichier audio

        Returns:
            dict avec transcription complète, segments temporels et langue détectée
        """
        print("Transcription en cours...")

        result = self.whisper_model.transcribe(
            audio_path,
            language=None,  # Détection automatique de la langue
            word_timestamps=True
        )

        print(f"Transcription terminée ({len(result['text'].split())} mots)")
        print(f"Langue détectée : {result.get('language', 'unknown')}\n")

        return {
            "texte_complet": result["text"],
            "segments": result["segments"],
            "language": result.get("language", "fr")  # Langue détectée par Whisper
        }
    
    def calculate_speech_rate(self, transcription, audio_duration):
        """
        Calcule le débit de parole (mots par minute)
        
        Args:
            transcription: Texte transcrit
            audio_duration: Durée totale en secondes
            
        Returns:
            Débit en mots/minute
        """
        words = transcription.split()
        duration_minutes = audio_duration / 60
        
        if duration_minutes == 0:
            return 0
        
        wpm = len(words) / duration_minutes
        return round(wpm, 2)
    
    def detect_fillers(self, transcription, language="fr"):
        """
        Détecte les mots de remplissage (fillers)

        Args:
            transcription: Texte transcrit
            language: Langue détectée ("fr" ou "en")

        Returns:
            dict avec nombre et pourcentage de fillers
        """
        text_lower = transcription.lower()
        total_words = len(transcription.split())

        # Choisir la liste de fillers selon la langue
        fillers_list = self.fillers_en if language == "en" else self.fillers_fr

        filler_counts = {}
        total_fillers = 0

        for filler in fillers_list:
            # Cherche le filler comme mot entier
            pattern = r'\b' + re.escape(filler) + r'\b'
            count = len(re.findall(pattern, text_lower))

            if count > 0:
                filler_counts[filler] = count
                total_fillers += count

        percentage = (total_fillers / total_words * 100) if total_words > 0 else 0

        return {
            "nombre_total": total_fillers,
            "pourcentage": round(percentage, 2),
            "detail": filler_counts
        }
    
    def analyze_audio_features(self, audio_path):
        """
        Analyse les caractéristiques audio (volume, pitch, pauses)
        
        Args:
            audio_path: Chemin du fichier audio
            
        Returns:
            dict avec métriques audio
        """
        print(" Analyse des caractéristiques audio...")
        
        # Charger l'audio
        y, sr = librosa.load(audio_path, sr=16000)
        
        # 1. Volume (RMS Energy)
        rms = librosa.feature.rms(y=y)[0]
        volume_mean = float(np.mean(rms))
        volume_std = float(np.std(rms))
        
        # 2. Pitch (F0)
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        
        # Extraire les pitches non nuls
        pitch_values = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:
                pitch_values.append(pitch)
        
        if pitch_values:
            pitch_mean = float(np.mean(pitch_values))
            pitch_std = float(np.std(pitch_values))
        else:
            pitch_mean = 0
            pitch_std = 0
        
        # 3. Détection des pauses (silences > 0.5 secondes)
        # On considère un silence quand RMS < seuil
        silence_threshold = np.mean(rms) * 0.2
        
        pauses = []
        in_pause = False
        pause_start = 0
        
        hop_length = 512
        frame_duration = hop_length / sr  # Durée d'une frame en secondes
        
        for i, energy in enumerate(rms):
            time = i * frame_duration
            
            if energy < silence_threshold and not in_pause:
                # Début d'une pause
                in_pause = True
                pause_start = time
            elif energy >= silence_threshold and in_pause:
                # Fin d'une pause
                pause_duration = time - pause_start
                if pause_duration >= 0.5:  # Seulement si > 0.5 sec
                    pauses.append({
                        "timestamp": round(pause_start, 2),
                        "duree": round(pause_duration, 2)
                    })
                in_pause = False
        
        print(f" Analyse terminée : {len(pauses)} pauses détectées\n")
        
        return {
            "volume_moyen": round(volume_mean, 4),
            "volume_std": round(volume_std, 4),
            "pitch_moyen": round(pitch_mean, 2),
            "pitch_std": round(pitch_std, 2),
            "pauses": pauses,
            "nombre_pauses": len(pauses)
        }
    
    def extract_all_metrics(self, video_path, output_json=None):
        """
        Pipeline complet : extraction de toutes les métriques
        
        Args:
            video_path: Chemin vers la vidéo
            output_json: Chemin du fichier JSON de sortie (optionnel)
            
        Returns:
            dict avec toutes les métriques
        """
        print(f"\n{'='*60}")
        print(f"EXTRACTION MÉTRIQUES AUDIO : {Path(video_path).name}")
        print(f"{'='*60}\n")
        
        # 1. Extraire audio
        audio_path = self.extract_audio_from_video(video_path)
        if not audio_path:
            return None
        
        # 2. Obtenir la durée
        y, sr = librosa.load(audio_path, sr=16000)
        duration = librosa.get_duration(y=y, sr=sr)
        
        # 3. Transcription
        transcription_data = self.transcribe(audio_path)
        detected_language = transcription_data.get("language", "fr")

        # 4. Débit de parole
        speech_rate = self.calculate_speech_rate(
            transcription_data["texte_complet"],
            duration
        )

        # 5. Fillers
        fillers_data = self.detect_fillers(transcription_data["texte_complet"], detected_language)
        
        # 6. Caractéristiques audio
        audio_features = self.analyze_audio_features(audio_path)
        
        # Compilation des résultats
        results = {
            "video_path": str(video_path),
            "duree_secondes": round(duration, 2),
            "transcription": transcription_data["texte_complet"],
            "nombre_mots": len(transcription_data["texte_complet"].split()),
            "debit_mots_par_minute": speech_rate,
            "fillers": fillers_data,
            "audio_features": audio_features,
            "segments": transcription_data["segments"],
            "language": detected_language
        }
        
        # Sauvegarder en JSON si demandé
        if output_json:
            with open(output_json, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            print(f" Résultats sauvegardés : {output_json}")
        
        print(f"\n{'='*60}")
        print(" EXTRACTION TERMINÉE")
        print(f"{'='*60}\n")
        
        return results


# ===================== EXEMPLE D'UTILISATION =====================

if __name__ == "__main__":
    # Créer l'extracteur
    extractor = AudioExtractor(model_size="base")
    
    # Chemin de votre vidéo test
    video_path = "tests/videos/presentation_test.mp4"
    
    # Extraire toutes les métriques
    results = extractor.extract_all_metrics(
        video_path,
        output_json="data/results/audio_metrics.json"
    )
    
    # Afficher un résumé
    if results:
        print("\n RÉSUMÉ DES MÉTRIQUES")
        print(f"  • Durée : {results['duree_secondes']}s")
        print(f"  • Mots : {results['nombre_mots']}")
        print(f"  • Débit : {results['debit_mots_par_minute']} mots/min")
        print(f"  • Fillers : {results['fillers']['nombre_total']} ({results['fillers']['pourcentage']}%)")
        print(f"  • Pauses : {results['audio_features']['nombre_pauses']}")
        print(f"  • Volume moyen : {results['audio_features']['volume_moyen']:.4f}")
        print(f"  • Pitch moyen : {results['audio_features']['pitch_moyen']:.2f} Hz")