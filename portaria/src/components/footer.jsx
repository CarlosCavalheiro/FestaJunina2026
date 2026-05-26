import "../styles/footer.css";
import { Link } from "react-router-dom";

import logo from "../assets/LogoFestaJulina.png";
import insta from "../assets/insta.png";
import facebook from "../assets/face.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="links-footer container">
        <img src={logo} className="logo-footer" />

        <div>
          <p className="sobre-footer">Opções</p>
          <Link to="/QrCode">Qr Code</Link>
          <Link to="/Historico">Histórico</Link>
        </div>

        <div>
          <p className="sobre-footer">Redes Sociais</p>
          <div className="redesSociais">
            <img src={insta} className="icon-social" />
            <a
              href="https://www.instagram.com/senailencoispaulista?igsh=N2tteHQ3dnc2MmU2"
              className="links-footer"
            >
              Instagram
            </a>
            <img src={facebook} className="icon-social" />
            <a
              href="https://www.facebook.com/senaisp.lencoispaulista/"
              className="links-footer"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
