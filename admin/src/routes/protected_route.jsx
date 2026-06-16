import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const usuarioStorage = localStorage.getItem("usuario");
  const perfilStorage = localStorage.getItem("perfil");

  let usuario = null;
  try {
    usuario = usuarioStorage ? JSON.parse(usuarioStorage) : null;
  } catch {
    usuario = null;
  }

  const perfilUsuario = String(
    perfilStorage ||
      usuario?.perfil ||
      usuario?.Perfil ||
      "",
  )
    .trim()
    .toLowerCase();

  if (!token || !usuarioStorage) {
    return <Navigate to="/login?erro=nao_logado" replace />;
  }

  if (perfilUsuario !== "administrador") {
    return <Navigate to="/login?erro=sem_permissao" replace />;
  }

  return children;
}
