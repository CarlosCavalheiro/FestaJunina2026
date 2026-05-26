import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/protected_route";
import Body from "./components/Body";

const Login = lazy(() => import("./pages/login"));
const Qrcode = lazy(() => import("./pages/QrCode"));
const Historico = lazy(() => import("./pages/Historico"));

export default function App() {
  return (
    <BrowserRouter basename="/portaria">
      <Suspense fallback={<div>Carregando...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/QrCode"
            element={
              <ProtectedRoute>
                <Qrcode />
              </ProtectedRoute>
            }
          />

          <Route
            path="/HistoricoQr"
            element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            }
          />

          <Route path="/leitor" element={<Body />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}