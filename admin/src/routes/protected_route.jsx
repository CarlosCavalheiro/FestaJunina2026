import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const usuario = localStorage.getItem("usuario");
  const perfil = localStorage.getItem("perfil");

  if (!token || !usuario) {
    return <Navigate to="/login?erro=nao_logado" replace />;
  }

  if (perfil !== "Administrador") {
    return <Navigate to="/login?erro=sem_permissao" replace />;
  }

  return children;
}
