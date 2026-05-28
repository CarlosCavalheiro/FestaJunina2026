import React, { useState, useEffect } from "react";
import "../components/Cadastrar/Cadastrar.css";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../components/Popup/Popup.css";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

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
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const [pcd, setPcd] = useState(false);
  const [descricaoPcd, setDescricaoPcd] = useState("");

  const [popup, setPopup] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setSenha("");
    setConfirmarSenha("");
  }, []);

  function toggleSenha() {
    setMostrarSenha((prev) => !prev);
  }

  async function RegisterUser(e) {
    e.preventDefault();

    const nomeTratado = nome.trim();
    const emailTratado = email.trim().toLowerCase();
    const telefoneTratado = telefone.trim();
    const tipoDeficienciaTratado = descricaoPcd.trim();

    if (!nomeTratado || !emailTratado || !telefoneTratado) {
      setMensagemPopup("Preencha todos os campos obrigatórios.");
      setPopup(true);
      return;
    }

    // Evita cadastro com campos invertidos por preenchimento automático incorreto.
    if (nomeTratado.includes("@")) {
      setMensagemPopup("Verifique o campo nome. Parece que um e-mail foi informado nele.");
      setPopup(true);
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagemPopup("As Senhas não coincidem");
      setPopup(true);
      return;
    }

    try {
      const payload = {
        nome: nomeTratado,
        email: emailTratado,
        senha,
        telefone: telefoneTratado,
        idPerfil: 3,
        possuiDeficiencia: pcd,
        tipoDeficiencia: pcd ? tipoDeficienciaTratado : "",
      };

      await api.post("/Usuario/Registro", payload);

      setMensagemPopup("Cadastro Realizado com Êxito");
      //navigate("/loginUsuarios");
      setPopup(true);

      setNome("");
      setEmail("");
      setTelefone("");
      setSenha("");
      setConfirmarSenha("");
      setPcd(false);
      setDescricaoPcd("");
    } catch (error) {
      console.log(error.response?.data);
      setMensagemPopup("Falha ao realizar o Cadastro");
      setPopup(true);
    }
  }

  return (
    <>
      <Header />

      <main className="login-container">
        <div className="login-card">
          <div className="card-header">
            <h2>Criar conta</h2>
          </div>

          <form autoComplete="off" onSubmit={RegisterUser}>
            {/* NOME */}
            <div className="input-group">
              <h2 className="iniciais2">Seu nome:</h2>

              <input
                name="nome"
                value={nome}
                type="text"
                placeholder="Digite seu nome"
                autoComplete="name"
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <span className="error-msg">Este campo é obrigatório</span>
            </div>

            {/* EMAIL */}
            <div className="input-group">
              <h2 className="iniciais2">Seu email:</h2>

              <input
                name="email"
                type="email"
                placeholder="seu.email@senai.br"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <span className="error-msg">Este campo é obrigatório</span>
            </div>

            {/* TELEFONE */}
            <div className="input-group">
              <h2 className="iniciais2">Seu Telefone:</h2>

              <input
                name="telefone"
                type="tel"
                placeholder="14 999999999"
                autoComplete="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
              />

              <span className="error-msg">Este campo é obrigatório</span>
            </div>

            {/* SENHA */}
            <h2 className="iniciais1">Senha:</h2>

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

            {/* CONFIRMAR SENHA */}
            <h2 className="iniciais1">Confirmar Senha:</h2>

            <div className="input-group">
              <div className="password-container">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="********"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
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

            {/* PCD */}
            <div className="input-group">
              <h2 className="iniciais2">Possui alguma deficiência?</h2>

              <div className="pcd-options">
                <label>
                  <input
                    type="radio"
                    name="pcd"
                    value={true}
                    checked={pcd == true}
                    onChange={() => setPcd(true)}
                  />
                  Sim
                </label>

                <label>
                  <input
                    type="radio"
                    name="pcd"
                    value={false}
                    checked={pcd == false}
                    onChange={() => setPcd(false)}
                  />
                  Não
                </label>
              </div>
            </div>

            {/* DESCRIÇÃO PCD */}
            {pcd === true && (
              <div className="input-group">
                <h2 className="iniciais2">Qual sua deficiência?</h2>

                <textarea
                  placeholder="Descreva sua deficiência..."
                  value={descricaoPcd}
                  onChange={(e) => setDescricaoPcd(e.target.value)}
                  className="textarea-pcd"
                />
              </div>
            )}

            {/* TERMOS */}
            <div className="privacy-box">
              <label className="checkbox-container-top">
                <input type="checkbox" required />

                <span className="terms-text">
                  Aceito todos os{" "}
                  <strong>termos e políticas de privacidade</strong>, incluindo
                  o uso de <strong>cookies</strong>.
                </span>
              </label>
            </div>

            {/* BOTÃO */}
            <button type="submit" className="btn-primary">
              Criar conta
            </button>

            <div className="separator">ou</div>

            <Link to="/loginUsuarios">
              <button type="button" className="btn-secondary">
                Se já tiver uma conta clique aqui
              </button>
            </Link>
          </form>

          {popup && (
            <div className="popup">
              <p>{mensagemPopup}</p>


          <button onClick={() => navigate("/loginUsuarios")}>
            Fechar
          </button>
            </div>
          )}
        </div>
      </main>
      <Footer/>
    </>
  );
}

export default Entrar;