import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./routes/protected_route";
import "./services/api";

// Lazy loading das páginas
const Login = lazy(() => import("./pages/login"));
const Usuarios = lazy(() => import("./pages/usuarios"));
const Pedidos = lazy(() => import("./pages/pedidos"));
const Perguntas = lazy(() => import("./pages/perguntas"));
const EditarEvento = lazy(() => import("./pages/editar_evento"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Lotes = lazy(() => import("./pages/lotes"));

export default function App() {
  return (
    <BrowserRouter basename="/Admin">
      <Suspense fallback={<div>Carregando...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <Usuarios />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pedidos"
            element={
              <ProtectedRoute>
                <Pedidos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/perguntas"
            element={
              <ProtectedRoute>
                <Perguntas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editar_evento"
            element={
              <ProtectedRoute>
                <EditarEvento />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lotes"
            element={
              <ProtectedRoute>
                <Lotes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
