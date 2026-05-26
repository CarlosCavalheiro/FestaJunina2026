import "../styles/header.css";
import { Link } from "react-router-dom";
import logo from "../assets/LogoFestaJulina.png";
import perfil from "../assets/pfp.png";
import useLogout from "../hooks/logout";

export default function Header_login() {
  const logout = useLogout();

  return (
    <header className="header">
      <img src={logo} className="logo" alt="Logo" />
      <div className="conta">
        <img src={perfil} className="login" alt="Perfil" />
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
