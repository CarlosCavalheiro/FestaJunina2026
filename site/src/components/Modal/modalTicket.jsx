import "./modal.css";
import { useNavigate } from "react-router-dom";

export default function Modal({ texto, fechar }) {

  const navigate = useNavigate();

  function irParaLogin() {
    fechar();
    navigate("/loginUsuarios");
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <p>{texto}</p>

        <button onClick={irParaLogin}>
          Entrar
        </button>

      </div>
    </div>
  );
}