import "./footer.css";

import logo from "../../assets/Logo.png";
import insta from "../../assets/insta.png";
import face from "../../assets/face.png";

export default function Footer() {
  return (
    <footer>
      <div className="links-footer">
        <a href="/">
          <img src={logo} className="logo-footer" />
        </a>

        <div>
          <p className="sobre-footer">Atendimento</p>
          <a href="https://api.whatsapp.com/send/?phone=551432693959&text&type=phone_number&app_absent=0">Fale Conosco</a>
        </div>

        <div>
          <p className="sobre-footer">Sobre a Escola</p>
          <a href="https://www.sp.senai.br/unidade/lencoispaulista/">
            Escola Senai
          </a>
        </div>

        <div>
          <p className="sobre-footer">Redes Sociais</p>
          <a href="https://www.instagram.com/senailencoispaulista/">
            <img src={insta} className="icon-social" />
          </a>
          <a href="https://www.facebook.com/senaisp.lencoispaulista/?locale=pt_BR">
            <img src={face} className="icon-social" />
          </a>
        </div>
      </div>

      <div className="direitos">
        © Todos os direitos reservados - Alunos Desenvolvimento de Sistemas
        SENAI 2025/2026
      </div>
    </footer>
  );
}
