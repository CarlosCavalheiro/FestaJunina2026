import "./App.css";

import {
  lazy,
  Suspense,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

const LoginUsuario = lazy(() =>
  import("./pages/loginUsuarios.jsx")
);

const RecuperarSenha = lazy(() =>
  import("./pages/recuperarSenha")
);

const MeusIngressos = lazy(() =>
  import("./pages/meusIngressos.jsx")
);

const Home = lazy(() =>
  import("./pages/Home")
);

const Cadastrar = lazy(() =>
  import("./pages/Cadastrar.jsx")
);

const ConfirmarSenha = lazy(() => 
  import("./pages/ConfirmarSenha")
);

export default function App() {
  return (
    <BrowserRouter>

      <Suspense
        fallback={(
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Carregando...
          </div>
        )}
      >

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/recuperarSenha"
            element={<RecuperarSenha />}
          />

          <Route
            path="/loginUsuarios"
            element={<LoginUsuario />}
          />

          <Route
            path="/Cadastrar"
            element={<Cadastrar />}
          />

          <Route
            path="/meusIngressos"
            element={<MeusIngressos />}
          />

          <Route 
            path="/confirmarSenha" 
            element={<ConfirmarSenha />} 
          />

        </Routes>

      </Suspense>

    </BrowserRouter>
  );
}