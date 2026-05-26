import axios from "axios";

const api = axios.create({
  //baseURL: "http://10.90.132.4/api/api/",
  baseURL: "https://apifestajulina.senailp.com.br/api/",
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
