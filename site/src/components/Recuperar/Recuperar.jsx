import { useState } from "react";
import "./Recuperar.css";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "../Popup/Popup.css";

function EyeIcon({ open }) {
  return open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a21.77 21.77 0 015.06-5.94" />
      <path d="M1 1l22 22" />
      <path d="M9.9 4.24A10.94 10.94 0 0112 5c7 0 11 7 11 7a21.77 21.77 0 01-4.06 5.06" />
    </svg>
  );
}

export default function Recuperar() {
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [senha, setSenha] = useState("");

  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [email, setEmail] = useState("");

  const [popup, setPopup] = useState(false);

  const [mensagemPopup, setMensagemPopup] = useState("");

  async function recuperarSenha(e) {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      setMensagemPopup("As senhas não coincidem");

      setPopup(true);

      return;
    }

    try {
      const response = await api.post(
        "/Usuario/solicitarMudancaSenha",
        {
          email: email,
          senha: senha,
        }
      );

      console.log(response.data);

      setMensagemPopup(
        "Enviamos um email para confirmar a alteração da senha!"
      );

      setPopup(true);
    } catch (error) {

  console.log("ERRO COMPLETO:", error);

  console.log(
    "STATUS:",
    error.response?.status
  );

  console.log(
    "RESPOSTA:",
    error.response?.data
  );

  if (error.response?.status === 404) {

    setMensagemPopup(
      "Não existe conta com esse email!"
    );

  } else {

    setMensagemPopup(
      "Erro no servidor. Veja o console."
    );
  }

  setPopup(true);
}
  }

  return (
    <div className="card-container">
      <form
        className="card"
        onSubmit={recuperarSenha}
      >
        <h2>Redefinir Senha</h2>

        <p className="subtitle">
          Crie uma nova senha para sua conta
        </p>

        <div className="input-group">
          <label>Seu Email</label>

          <div className="input-wrapper">
            <input
              type="email"
              placeholder="seu.email@senai.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Nova Senha</label>

          <div className="input-wrapper">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="********"
              value={senha}
              onChange={(e) =>
                setSenha(e.target.value)
              }
              required
            />

            <span
              className="eye"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              <EyeIcon open={showPassword} />
            </span>
          </div>
        </div>

        <div className="input-group">
          <label>
            Confirmar Nova Senha
          </label>

          <div className="input-wrapper">
            <input
              type={
                showConfirm
                  ? "text"
                  : "password"
              }
              placeholder="********"
              value={confirmarSenha}
              onChange={(e) =>
                setConfirmarSenha(
                  e.target.value
                )
              }
              required
            />

            <span
              className="eye"
              onClick={() =>
                setShowConfirm(!showConfirm)
              }
            >
              <EyeIcon open={showConfirm} />
            </span>
          </div>
        </div>

        <Link
          to="/loginUsuarios"
          className="return-login"
        >
          Voltar para o login
        </Link>

        <button
          type="submit"
          className="btn-primary"
        >
          SALVAR NOVA SENHA
        </button>
      </form>

      {popup && (
        <div className="popup">
          <p>{mensagemPopup}</p>

          <button
            onClick={() => setPopup(false)}
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}