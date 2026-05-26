import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function useLogout() {
  const navigate = useNavigate();

  async function logout() {
    try {
      const usuarioStorage = localStorage.getItem("usuario");

      let email = null;

      try {
        email = usuarioStorage ? JSON.parse(usuarioStorage)?.email : null;
      } catch {
        email = null;
      }

      if (email) {
        await api.post(`/Usuario/logout?email=${email}`);
      }
    } catch {
      // sem log nenhum
    } finally {
      delete api.defaults.headers.common.Authorization;

      localStorage.clear();

      navigate("/login", { replace: true });
    }
  }

  return logout;
}
