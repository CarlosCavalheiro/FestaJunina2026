import "../styles/header.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import logo from "../assets/LogoFestaJulina.png";
import perfil from "../assets/pfp.png";

export default function Header() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("logado");
    navigate("/login");
  }

  return (
    <header className="header">
      <nav className="navbar">
        <div className="menu">

        </div>
      </nav>

      <img src={logo} className="logo" />

      <div className="conta">
        <img src={perfil} className="login" />
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
