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

const api = axios.create({
    baseURL: API_BASE_URL
});

export default api;