import "../components/Login/login_usuarios.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { login, usuarioLogado } from "../services/auth";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "../pages/recuperarSenha";

function EyeIcon({ visible }) {
  return visible ? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-5 0-9.27-3.11-11-7.5" />
      <path d="M22.54 6.46A10.07 10.07 0 0 0 12 5c-5 0-9.27 3.11-11 7.5" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

function Entrar() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senha, setSenha] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  async function fazerLogin(e) {
    e.preventDefault();

    if (usuarioLogado()) {
      navigate("/");
      return;
    }

    const sucesso = await login(email, senha);

    if (sucesso) {
      navigate("/");
    } else {
      alert("login Inválido");
    }
  }

  //equivalente ao clearPasswordField
  useEffect(() => {
    setSenha("");

    if (usuarioLogado()) {
      navigate("/");
    }
  }, []);

  // equivalente ao toggle()
  function toggleSenha() {
    setMostrarSenha((prev) => !prev);
  }

  return (
    <>
      <Header />

      <main className="login-container">
        <div className="login-card">
          <div className="card-header">
            <h2>Entrar na Festa</h2>
            <p className="subtitle">
              Acesse sua conta para participar do nosso arraiá
            </p>
          </div>

          <form autoComplete="off" onSubmit={fazerLogin}>
            <div className="input-group">
              <h2 className="iniciais2">seu email:</h2>
              <input
                type="email"
                placeholder="seu.email@senai.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="error-msg">Este campo é obrigatório</span>
            </div>

            <h2 className="iniciais1">senha:</h2>

            <div className="input-group">
              <div className="password-container">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="********"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="new-password"
                  required
                />

                <span
                  className="toggle-password"
                  onClick={toggleSenha}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSenha();
                    }
                  }}
                  role="button"
                  tabIndex="0"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  <EyeIcon visible={mostrarSenha} />
                </span>
              </div>

              <span className="error-msg">Este campo é obrigatório</span>
            </div>

            <div className="access-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span>Lembrar de mim</span>
              </label>

            {/* <label className="checkbox-container">
              <input type="checkbox" />
              <span>Lembrar de mim</span>
            </label> */}

            {<Link to="/recuperarSenha" className="forgot-password">
              Esqueci minha senha
            </Link>}
          </div>

            <button type="submit" className="btn-primary">
              Entrar no Arraiá
            </button>

            <div className="separator">ou</div>

            <Link to="/Cadastrar">
              <button type="button" className="btn-secondary">
                Criar uma conta
              </button>
            </Link>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Entrar;
