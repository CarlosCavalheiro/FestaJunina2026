import "../App.css";
import { lazy, Suspense, useState } from "react";
import data from "../assets/data.png";
import hora from "../assets/hora.png";
import local from "../assets/local.png";
import publico from "../assets/publico.png";
import Modal from "../components/Modal/Modal";
import "../services/auth.js";
//import { usuarioLogado } from "../services/auth";

const Header = lazy(() => import("../components/Header/Header"));
const Carrossel = lazy(() => import("../components/Carrossel/Carrossel"));
const Card = lazy(() => import("../components/Card/Card"));
const Tickets = lazy(() => import("../components/Tickets/Tickets"));
const Footer = lazy(() => import("../components/Footer/Footer"));

export default function Home() {
  const [modalAberto, setModalAberto] = useState(false);
  const [textoModal, setTextoModal] = useState("");
  const [callbackModal, setCallbackModal] = useState(null);

  function abrirModal(texto, callback = null) {
    setTextoModal(texto);

    setCallbackModal(() => callback);

    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);

    if (callbackModal) {
      callbackModal();
    }
  }

  return (
    <Suspense fallback={null}>
      <Header abrirModal={abrirModal} />
      <main>
        <Carrossel />

        <div className="card-container">
          <Card img={data} titulo="DATA" texto="25 de Julho sábado" />
          <Card img={hora} titulo="HORÁRIO" texto="Das 18h30 às 22h" />
          <Card img={local} titulo="LOCAL" texto="SENAI Lençóis Paulista SP" />
          <Card
            img={publico}
            titulo="ATENÇÃO"
            texto="Maiores de 18 anos trazer Documento!"
          />
        </div>
        <div className="ingressos">
          <p>GARANTA SEUS INGRESSOS!</p>
        </div>
        <Tickets />
      </main>

      {modalAberto && <Modal texto={textoModal} fechar={fecharModal} />}

      <Footer />
    </Suspense>
  );
}
