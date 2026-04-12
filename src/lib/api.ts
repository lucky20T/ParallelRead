import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const uploadFile = async (file: File, targetLang: string = 'Hindi') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetLang', targetLang);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data; // { sentences: string[] }
};

export const uploadText = async (rawText: string, targetLang: string = 'Hindi') => {
  const response = await axios.post(`${API_URL}/upload`, { rawText, targetLang });
  return response.data;
};

export const translateBatch = async (sentences: string[], targetLang: string = 'Hindi') => {
  const response = await axios.post(`${API_URL}/translate`, {
    sentences,
    targetLang,
  });
  return response.data; // { translations: string[] }
};
