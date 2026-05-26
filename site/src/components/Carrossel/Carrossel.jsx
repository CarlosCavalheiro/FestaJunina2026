import "./carrossel.css";
import { useState, useEffect } from "react";

import b1 from "../../assets/banner3.png";
import b2 from "../../assets/banner2.jpg";

const imagens = [b1, b2];

export default function Carrossel() {
  const [index, setIndex] = useState(0);

  function proximo() {
    setIndex((i) => (i + 1) % imagens.length);
  }

  function voltar() {
    setIndex((i) =>
      i === 0 ? imagens.length - 1 : i - 1
    );
  }

  useEffect(() => {
    const intervalo = setInterval(proximo, 8000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="carrossel">
      <img src={imagens[index]} className="fotos" />

      <button id="voltar" onClick={voltar}>
        {"<"}
      </button>

      <button id="ir" onClick={proximo}>
        {">"}
      </button>
    </div>
  );
}