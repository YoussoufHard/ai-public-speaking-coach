import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const speechService = {
  // MÉTHODE 1 : Envoi final (fichier complet)
  async uploadRecording(fileOrBlob: File | Blob) {
    const formData = new FormData();

    // Determine the file object to append
    let fileToUpload: File;

    if (fileOrBlob instanceof File) {
      fileToUpload = fileOrBlob;
    } else {
      // If it's a Blob (from recording), create a File object with .mp4 extension
      fileToUpload = new File([fileOrBlob], 'recording.mp4', { type: 'video/mp4' });
    }

    formData.append('file', fileToUpload);

    try {
      // Using the same endpoint as the UI frontend
      const response = await api.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // No custom headers needed besides content-type usually handled by axios/browser with FormData
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'analyse:", error);
      throw error;
    }
  },

  async generateAudio(text: string, lang: string = 'fr') {
    const response = await api.post('/tts', { text, lang }, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  },

  // Mock analysis for testing if needed, similar to UI
  async getMockAnalysis() {
    const response = await api.get('/analyze/mock');
    return response.data;
  }
};