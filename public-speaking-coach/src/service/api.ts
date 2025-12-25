import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const speechService = {
  // MÉTHODE 1 : Envoi final (fichier complet)
  async uploadRecording(audioBlob: Blob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await api.post('/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // MÉTHODE 2 : Envoi par morceaux (Streaming HTTP)
  async uploadChunk(audioBlob: Blob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'chunk.webm');

    try {
      const response = await api.post('/stream-chunk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'envoi du chunk audio:", error);
      throw error;
    }
  },

  // RÉCUPÉRATION DES DONNÉES
  async getStats() {
    const response = await api.get('/stats');
    return response.data;
  }
};