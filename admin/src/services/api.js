// src/services/api.js
import axios from "axios";

const API_ACCESS_POINT = (
  import.meta.env.VITE_API_URL ||
  "https://apifestajunina-ayd4h6eabvg2dqhm.brazilsouth-01.azurewebsites.net/"
).trim();

const normalizedApiAccessPoint = API_ACCESS_POINT.endsWith("/")
  ? API_ACCESS_POINT
  : `${API_ACCESS_POINT}/`;

const API_BASE_URL = normalizedApiAccessPoint.endsWith("api/")
  ? normalizedApiAccessPoint
  : `${normalizedApiAccessPoint}api/`;

const BLOB_UPLOADS_ACCESS_POINT = (
  import.meta.env.VITE_BLOB_UPLOADS_URL ||
  "https://arquivosfestajunina.blob.core.windows.net/uploads"
).trim();

export const BLOB_UPLOADS_BASE_URL = BLOB_UPLOADS_ACCESS_POINT.endsWith("/")
  ? BLOB_UPLOADS_ACCESS_POINT
  : `${BLOB_UPLOADS_ACCESS_POINT}/`;

export const BLOB_COMPROVANTES_URL = `${BLOB_UPLOADS_BASE_URL}comprovantes/`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

export default api;
