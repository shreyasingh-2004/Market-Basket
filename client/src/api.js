import axios from "axios";

const API = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "")
  .toString()
  .trim()
  .replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? "" : API,
  withCredentials: true,
});

export { API, apiClient };
export default API;
