import axios from "axios";

const DEFAULT_API_ORIGIN =
  "https://api-festajulina.senailp.com.br/";

const API_ACCESS_POINT = (
  import.meta.env.VITE_API_URL ||
  DEFAULT_API_ORIGIN
).trim();

const normalizedApiAccessPoint = API_ACCESS_POINT.endsWith("/")
  ? API_ACCESS_POINT
  : `${API_ACCESS_POINT}/`;

export const API_BASE_URL = import.meta.env.DEV
  ? "/api/"
  : normalizedApiAccessPoint.endsWith("api/")
    ? normalizedApiAccessPoint
    : `${normalizedApiAccessPoint}api/`;

export const API_ORIGIN = API_BASE_URL.replace(/api\/$/, "");

const BLOB_UPLOADS_ACCESS_POINT = (
  import.meta.env.VITE_BLOB_UPLOADS_URL ||
  "https://storage.senailp.com.br/festa-julina/"
).trim();

export const BLOB_UPLOADS_BASE_URL = BLOB_UPLOADS_ACCESS_POINT.endsWith("/")
  ? BLOB_UPLOADS_ACCESS_POINT
  : `${BLOB_UPLOADS_ACCESS_POINT}/`;

export const BLOB_FOTO_PERFIL_URL = `${BLOB_UPLOADS_BASE_URL}fotoperfil/`;
export const BLOB_COMPROVANTES_URL = `${BLOB_UPLOADS_BASE_URL}comprovantes/`;
export const BLOB_QRCODES_URL = `${BLOB_UPLOADS_BASE_URL}qrcodes/`;

const api = axios.create({
  baseURL: API_BASE_URL,
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
