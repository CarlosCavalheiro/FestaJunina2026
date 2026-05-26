import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const logado = localStorage.getItem("logado");

  if (!logado) {
    return <Navigate to="/login?erro=nao_logado" replace />;
  }

  return children;
}
