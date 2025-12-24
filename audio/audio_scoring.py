import json
from pathlib import Path


class AudioScorer:
    def __init__(self):
        """
        Initialise le scorer avec les seuils optimaux
        """
        # Seuils pour le débit (mots/minute)
        self.debit_optimal_min = 130
        self.debit_optimal_max = 160
        self.debit_trop_lent = 100
        self.debit_trop_rapide = 200
        
        # Seuils pour les fillers (%)
        self.filler_excellent = 3
        self.filler_bon = 7
        self.filler_moyen = 12
        
        # Seuils pour les pauses
        self.pause_ideale_min = 0.8
        self.pause_ideale_max = 2.5
        self.pause_frequence_ideale = 15  # Secondes entre pauses
        
        # Seuils pour le volume
        self.volume_optimal_min = 0.02
        self.volume_optimal_max = 0.15
        
        # Seuils pour la variation de pitch (intonation)
        self.pitch_variation_min = 20  # Hz minimum pour être expressif
    
    def score_debit(self, debit_mpm):
        """
        Score le débit de parole (0-10)
        
        Args:
            debit_mpm: Débit en mots par minute
            
        Returns:
            Score entre 0 et 10
        """
        if self.debit_optimal_min <= debit_mpm <= self.debit_optimal_max:
            return 10
        elif debit_mpm < self.debit_trop_lent:
            # Trop lent : pénalité progressive
            ratio = debit_mpm / self.debit_trop_lent
            return max(3, 10 * ratio)
        elif debit_mpm > self.debit_trop_rapide:
            # Trop rapide : pénalité progressive
            excess = debit_mpm - self.debit_trop_rapide
            return max(2, 10 - (excess / 20))
        else:
            # Entre optimal et limites : dégrade linéairement
            if debit_mpm < self.debit_optimal_min:
                distance = self.debit_optimal_min - debit_mpm
                penalty = distance / (self.debit_optimal_min - self.debit_trop_lent) * 3
                return 10 - penalty
            else:
                distance = debit_mpm - self.debit_optimal_max
                penalty = distance / (self.debit_trop_rapide - self.debit_optimal_max) * 4
                return 10 - penalty
    
    def score_fillers(self, pourcentage_fillers):
        """
        Score les mots de remplissage (0-10)
        
        Args:
            pourcentage_fillers: % de fillers dans le discours
            
        Returns:
            Score entre 0 et 10
        """
        if pourcentage_fillers <= self.filler_excellent:
            return 10
        elif pourcentage_fillers <= self.filler_bon:
            # Dégradation linéaire de 10 à 7
            ratio = (pourcentage_fillers - self.filler_excellent) / (self.filler_bon - self.filler_excellent)
            return 10 - (ratio * 3)
        elif pourcentage_fillers <= self.filler_moyen:
            # Dégradation de 7 à 5
            ratio = (pourcentage_fillers - self.filler_bon) / (self.filler_moyen - self.filler_bon)
            return 7 - (ratio * 2)
        else:
            # Au-delà de moyen : pénalité forte
            excess = pourcentage_fillers - self.filler_moyen
            return max(1, 5 - (excess / 5))
    
    def score_pauses(self, pauses, duree_totale):
        """
        Score la qualité des pauses (0-10)
        
        Args:
            pauses: Liste des pauses avec durée
            duree_totale: Durée totale de la présentation
            
        Returns:
            Score entre 0 et 10
        """
        if not pauses:
            return 5  # Aucune pause = neutre
        
        # 1. Score sur la durée moyenne des pauses
        durees = [p["duree"] for p in pauses]
        duree_moyenne = sum(durees) / len(durees)
        
        if self.pause_ideale_min <= duree_moyenne <= self.pause_ideale_max:
            score_duree = 10
        elif duree_moyenne < self.pause_ideale_min:
            score_duree = 7  # Pauses trop courtes
        elif duree_moyenne > 4:
            score_duree = 4  # Pauses trop longues
        else:
            score_duree = 8
        
        # 2. Score sur la fréquence des pauses
        frequence = duree_totale / len(pauses) if len(pauses) > 0 else 0
        
        if 10 <= frequence <= 20:
            score_frequence = 10  # Bon rythme
        elif frequence < 5:
            score_frequence = 6  # Trop de pauses
        elif frequence > 30:
            score_frequence = 5  # Pas assez de pauses
        else:
            score_frequence = 8
        
        # Score final : moyenne pondérée
        return (score_duree * 0.6 + score_frequence * 0.4)
    
    def score_volume(self, volume_moyen, volume_std):
        """
        Score le volume et sa variation (0-10)
        
        Args:
            volume_moyen: Volume moyen (RMS)
            volume_std: Écart-type du volume
            
        Returns:
            Score entre 0 et 10
        """
        # Score sur le niveau moyen
        if self.volume_optimal_min <= volume_moyen <= self.volume_optimal_max:
            score_niveau = 10
        elif volume_moyen < self.volume_optimal_min:
            # Trop faible
            ratio = volume_moyen / self.volume_optimal_min
            score_niveau = max(4, 10 * ratio)
        else:
            # Trop fort (rare)
            score_niveau = 8
        
        # Score sur la variation (dynamique)
        # Une bonne variation montre de l'expressivité
        if volume_std > 0.01:
            score_variation = 10
        elif volume_std > 0.005:
            score_variation = 8
        else:
            score_variation = 6  # Monotone
        
        return (score_niveau * 0.7 + score_variation * 0.3)
    
    def score_intonation(self, pitch_std):
        """
        Score l'intonation (variation du pitch) (0-10)
        
        Args:
            pitch_std: Écart-type du pitch
            
        Returns:
            Score entre 0 et 10
        """
        if pitch_std >= self.pitch_variation_min:
            return 10  # Intonation expressive
        elif pitch_std >= 10:
            return 7  # Acceptable
        elif pitch_std >= 5:
            return 5  # Monotone
        else:
            return 3  # Très monotone
    
    def calculate_scores(self, metrics):
        """
        Calcule tous les scores à partir des métriques
        
        Args:
            metrics: dict avec les métriques audio
            
        Returns:
            dict avec tous les scores
        """
        # Extraction des données
        debit = metrics.get("debit_mots_par_minute", 0)
        fillers = metrics.get("fillers", {})
        audio_features = metrics.get("audio_features", {})
        duree = metrics.get("duree_secondes", 1)
        
        # Calcul des scores individuels
        score_debit_val = self.score_debit(debit)
        score_fillers_val = self.score_fillers(fillers.get("pourcentage", 0))
        score_pauses_val = self.score_pauses(audio_features.get("pauses", []), duree)
        score_volume_val = self.score_volume(
            audio_features.get("volume_moyen", 0),
            audio_features.get("volume_std", 0)
        )
        score_intonation_val = self.score_intonation(audio_features.get("pitch_std", 0))
        
        # Score global (moyenne pondérée)
        weights = {
            "debit": 0.25,
            "fillers": 0.20,
            "pauses": 0.20,
            "volume": 0.15,
            "intonation": 0.20
        }
        
        score_global = (
            score_debit_val * weights["debit"] +
            score_fillers_val * weights["fillers"] +
            score_pauses_val * weights["pauses"] +
            score_volume_val * weights["volume"] +
            score_intonation_val * weights["intonation"]
        )
        
        return {
            "debit": round(score_debit_val, 2),
            "fillers": round(score_fillers_val, 2),
            "pauses": round(score_pauses_val, 2),
            "volume": round(score_volume_val, 2),
            "intonation": round(score_intonation_val, 2),
            "global_audio": round(score_global, 2),
            "weights": weights
        }
    
    def score_from_file(self, metrics_json_path, output_json=None):
        """
        Charge un fichier de métriques et calcule les scores
        
        Args:
            metrics_json_path: Chemin du JSON avec les métriques
            output_json: Chemin du JSON de sortie (optionnel)
            
        Returns:
            dict avec métriques + scores
        """
        print(f"\n CALCUL DES SCORES : {Path(metrics_json_path).name}")
        print("=" * 60)
        
        # Charger les métriques
        with open(metrics_json_path, 'r', encoding='utf-8') as f:
            metrics = json.load(f)
        
        # Calculer les scores
        scores = self.calculate_scores(metrics)
        
        # Combiner métriques + scores
        result = {
            "video_path": metrics.get("video_path"),
            "metriques_brutes": metrics,
            "scores_audio": scores
        }
        
        # Afficher résumé
        print("\n SCORES CALCULÉS :")
        print(f"  • Débit : {scores['debit']}/10")
        print(f"  • Fillers : {scores['fillers']}/10")
        print(f"  • Pauses : {scores['pauses']}/10")
        print(f"  • Volume : {scores['volume']}/10")
        print(f"  • Intonation : {scores['intonation']}/10")
        print(f"  • SCORE GLOBAL AUDIO : {scores['global_audio']}/10")
        
        # Sauvegarder si demandé
        if output_json:
            with open(output_json, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"\n Scores sauvegardés : {output_json}")
        
        print("=" * 60 + "\n")
        
        return result


# ===================== EXEMPLE D'UTILISATION =====================

if __name__ == "__main__":
    scorer = AudioScorer()
    
    # Calculer scores depuis un fichier de métriques
    results = scorer.score_from_file(
        "data/results/audio_metrics.json",
        output_json="data/results/audio_scores.json"
    )