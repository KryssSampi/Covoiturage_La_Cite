import axios from "axios";
import { getToken } from "../auth/jwt.service";

const api = axios.create({
  baseURL: "/api/admin",
});

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${getToken()}`;
  return config;
});

export default api;