import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://192.168.1.23:5000/api'; // Change this to your backend URL

// Gemini API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Control verbose logging
const VERBOSE_MODE = process.env.VERBOSE_API_LOGGING === 'true';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Gemini API client for chat/analysis
const geminiClient = axios.create({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Mock data for development
const mockInsights = {
  insights: [
    { id: '1', feature: 'Data Exposure', riskLevel: 'MEDIUM' as const, score: 65, description: 'Sample risk' },
  ],
};

const mockDatasets = {
  datasets: [
    { id: '1', name: 'sample.csv', size: '2.4 MB', uploadedAt: '2024-03-25', status: 'completed' as const },
  ],
};

export const uploadCSV = async (file: any) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    // Return mock success on error
    if (VERBOSE_MODE) console.warn('Upload (mock mode):', error);
    return { fileId: 'mock-' + Date.now(), fileName: 'file.csv', size: 1024, status: 'completed' };
  }
};

export const sendChatMessage = async (message: string) => {
  try {
    // Try backend first
    const response = await apiClient.post('/chat', {
      message,
    });
    return response.data;
  } catch (error) {
    // Fallback to Gemini if backend is unavailable
    if (GEMINI_API_KEY) {
      try {
        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: message,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 256,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );
        
        const reply = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
        return { reply };
      } catch (geminiError) {
        if (VERBOSE_MODE) console.error('Gemini error:', geminiError);
      }
    }
    // Return mock response if all else fails
    if (VERBOSE_MODE) console.warn('Chat (mock mode):', error);
    return { reply: 'Demo response. Backend down or API key missing.' };
  }
};

export const getInsights = async () => {
  try {
    const response = await apiClient.get('/insights');
    return response.data;
  } catch (error) {
    // Return mock data on error
    if (VERBOSE_MODE) console.warn('Insights (mock mode):', error);
    return mockInsights;
  }
};

export const getDatasets = async () => {
  try {
    const response = await apiClient.get('/datasets');
    return response.data;
  } catch (error) {
    // Return mock data on error
    if (VERBOSE_MODE) console.warn('Datasets (mock mode):', error);
    return mockDatasets;
  }
};
