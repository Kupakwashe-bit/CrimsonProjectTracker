import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

export const uploadProject = async ({ file, projectId, metadata = {}, onUploadProgress }) => {
  if (!file) {
    throw new Error('No project file provided');
  }

  const formData = new FormData();
  formData.append('project', file);

  if (projectId) {
    formData.append('projectId', projectId);
  }

  Object.entries(metadata).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value);
  });

  try {
    console.log('Sending request to:', `${API_BASE}/analysis/upload`);
    const { data } = await apiClient.post('/analysis/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onUploadProgress || undefined,
    });
    console.log('Response received:', data);
    return data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response) {
      throw new Error(error.response.data?.error || `Server error: ${error.response.status}`);
    }
    if (error.request) {
      const networkError = new Error('No response from server. Is the server running on port 5000?');
      networkError.code = 'ERR_NETWORK';
      throw networkError;
    }
    throw error;
  }
};

export const fetchAnalysisHistory = async (projectId) => {
  if (!projectId) return [];
  const { data } = await apiClient.get(`/analysis/history/${projectId}`);
  return data.history || [];
};

export const compareAnalyses = async ({ projectId, analysisA, analysisB }) => {
  if (!projectId || !analysisA || !analysisB) {
    throw new Error('Project and analysis identifiers are required for comparison');
  }

  const { data } = await apiClient.post('/analysis/compare', {
    projectId,
    analysisA,
    analysisB,
  });

  return data;
};

export const fetchActivityFeed = async () => {
  const { data } = await apiClient.get('/activity/logs');
  return data.logs || [];
};

export default {
  uploadProject,
  fetchAnalysisHistory,
  compareAnalyses,
  fetchActivityFeed,
};

