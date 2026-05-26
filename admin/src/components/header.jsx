import "../styles/header.css";
import { Link } from "react-router-dom";
import logo from "../assets/LogoFestaJulina.png";
import perfil from "../assets/pfp.png";
import useLogout from "../hooks/logout";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Header() {
  const logout = useLogout();

  const [usuarios, setUsuarios] = useState([]);

  const idUsuario = localStorage.getItem("idUsuario");

  function getNomeUsuario(id) {
    const user = usuarios.find((u) => String(u.idUsuario) === String(id));

    return user ? user.nome : "Usuário";
  }

  async function carregarUsuarios() {
    try {
      const res = await api.get("/Usuario/ListarUsuarios");
      setUsuarios(res.data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <header className="header">
      <nav className="navbar">
        <div className="menu">
          <button className="btn-menu">☰</button>

          <div className="links-menu">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/usuarios">Usuários</Link>
            <Link to="/pedidos">Pedidos</Link>
            <Link to="/editar_evento">Evento</Link>
            <Link to="/lotes">Lotes</Link>
            <Link to="/perguntas">Perguntas</Link>
          </div>
        </div>
      </nav>

      <img src={logo} className="logo" alt="Logo" />

      <div className="conta">
        <div className="usuario-info">
          <span className="nome-usuario">Olá, {getNomeUsuario(idUsuario)}</span>

          <img src={perfil} className="login" alt="Perfil" />
        </div>

        <div className="opcoes-login">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            Sair
          </a>
        </div>
      </div>
    </header>
  );
}
