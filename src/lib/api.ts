import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const GEMINI_KEY_STORAGE = 'parallelread_gemini_key';

export const getStoredApiKey = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
};

export const setStoredApiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
  } else {
    localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
  }
};

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

export const translateBatch = async (
  sentences: string[],
  targetLang: string = 'Hindi',
  apiKey?: string
) => {
  const effectiveKey = apiKey || getStoredApiKey();

  const response = await axios.post(
    `${API_URL}/translate`,
    {
      sentences,
      targetLang,
      apiKey: effectiveKey || undefined,
    },
    {
      headers: effectiveKey ? { 'x-gemini-api-key': effectiveKey } : {},
    }
  );
  return response.data; // { translations: string[] }
};
