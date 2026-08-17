// src/config/api.js
import axios from "axios";

// Get the API URL from environment variables
const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:4000";

const API_URL = rawApiUrl.toString().trim().replace(/^['"]+|['"]+$/g, "").replace(/\/$/, "");

// In development, use localhost:4000, in production use the API_URL
const baseURL = import.meta.env.DEV ? "http://localhost:4000" : API_URL;

console.log(`🔗 API Base URL: ${baseURL} (${import.meta.env.DEV ? 'Development' : 'Production'})`);

const apiClient = axios.create({
  baseURL: baseURL, // Always use the baseURL
  withCredentials: true, // Important for cookies
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.error(`❌ API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ No response from server:', error.request);
      console.error('Please make sure the backend server is running on port 4000');
    } else {
      // Something happened in setting up the request
      console.error('❌ Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export { API_URL as API, apiClient };
export default API_URL;