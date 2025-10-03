import axios from 'axios';

// API base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add bankset header
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('sv-bankset');
    if (stored) {
      let headerValue;
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          headerValue = parsed.join(',');
        }
      } catch {
        // Stored value was not JSON – fall back to the raw string.
        headerValue = stored;
      }

      if (!headerValue && typeof stored === 'string' && stored.trim().length > 0) {
        headerValue = stored;
      }

      if (headerValue) {
        config.headers['X-SV-Banks'] = headerValue;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Health & Status
  health: () => api.get('/health'),
  status: () => api.get('/status'),
  
  // Banks
  getBanks: () => api.get('/banks'),
  
  // Bible
  getSchemas: (params = {}) => api.get('/bible/schemas', { params }),
  getSchemasCompat: () => api.get('/bible/schemas/compat'),
  getSchemasLexicon: () => api.get('/bible/schemas/lexicon'),
  getMetaphors: (params = {}) => api.get('/bible/metaphors', { params }),
  getFrames: () => api.get('/bible/frames'),
  getBlendRules: () => api.get('/bible/blend_rules'),
  
  // Retrieval
  search: (data) => api.post('/retrieval/search', data),
  
  // Compose
  composePlan: (data) => api.post('/compose/plan', data),
  composeBeat: (data) => api.post('/compose/beat', data),
  compose: (data) => api.post('/compose', data),
  
  // Generate
  generate: (data) => api.post('/generate', data),
  
  // Blend
  blend: (data) => api.post('/blend', data),
  
  // Evaluate
  evaluate: (data) => api.post('/evaluate', data),
  evaluateBatch: (data) => api.post('/evaluate/batch', data),
  framecheck: (data) => api.post('/eval/framecheck', data),
  
  // Control
  expectation: (data) => api.post('/control/expectation', data),
  viewpoint: (data) => api.post('/control/viewpoint', data),
  attention: (data) => api.post('/control/attention', data),
  
  // Gold
  goldStats: (params = {}) => api.get('/gold/stats', { params }),
  
  // P12 Film Plan
  filmPlan: (data, params = {}) => api.post('/p12/filmplan', data, { params }),
};

export default api;
