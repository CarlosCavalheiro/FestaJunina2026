import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/login.css";
import api from "../services/api";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header_login from "../components/header_login";
import Footer_login from "../components/footer_login";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const erroQuery = query.get("erro");

  const mensagem =
    erroQuery === "nao_logado" ? "Você precisa estar logado!" : "";

  async function handleLogin(e) {
    e.preventDefault();

    setErro("");

    try {
      const { data } = await api.post("/Usuario/login", {
        email,
        senha,
      });

      if (!data?.token) {
        setErro("Login inválido.");
        return;
      }

      if (data.perfil?.toLowerCase() !== "administrador") {
        setErro("Apenas administradores podem acessar.");
        return;
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          idUsuario: data.idUsuario,
          nome: data.nome,
          email: data.email,
          perfil: data.perfil,
        }),
      );

      localStorage.setItem("idUsuario", data.idUsuario);

      localStorage.setItem("usuarioNome", data.nome);

      localStorage.setItem("perfil", data.perfil);

      localStorage.setItem("logado", "true");

      //api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setErro(err.response?.data || err.message || "Erro ao fazer login.");
    }
  }

  return (
    <>
      <Header_login />

      <main className="main_login">
        <div className="login-container">
          <h1>Login</h1>

          {mensagem && <p className="alerta">{mensagem}</p>}

          {erro && (
            <div className="erro-container erro">
              <p className="erro">{erro}</p>
            </div>
          )}

          <form className="form_login" onSubmit={handleLogin}>
            <input
              className="input_login"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="senha-container">
              <input
                className="input_login"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              <button
                type="button"
                className="btn-olho_login"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                <i className={mostrarSenha ? "bi bi-eye-slash" : "bi bi-eye"} />
              </button>
            </div>

            <button className="entrar" type="submit">
              Entrar
            </button>
          </form>
        </div>
      </main>

      <Footer_login />
    </>
  );
}
