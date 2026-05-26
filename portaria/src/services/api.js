import axios from "axios";

const api = axios.create({
    baseURL: "https://apifestajulina.senailp.com.br/api/"
});

export default api;