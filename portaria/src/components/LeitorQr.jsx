import { useEffect, useRef, useState } from "react";
import CryptoJS from "crypto-js";
import { Html5Qrcode } from "html5-qrcode";
import "../styles/QrCode.css";

export default function LeitorQR() {
  const html5QrCodeRef = useRef(null);
  const startedRef = useRef(false);

  const [resultado, setResultado] = useState("Aguardando leitura...");
  const [isCooldown, setIsCooldown] = useState(false);

  const [popup, setPopup] = useState({
    aberto: false,
    mensagem: "",
    tipo: ""
  });

  const chave = import.meta.env.VITE_QR_SECRET;

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      iniciarCamera();
    }

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function iniciarCamera() {
    try {
      Html5Qrcode.getCameras().catch(() => {});

      const html5QrCode = new Html5Qrcode("leitor");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 30,
          qrbox: {
            width: 300,
            height: 300
          },
          aspectRatio: 1,
          disableFlip: true
        },
        onScanSuccess,
        onScanFailure
      );
    } catch (err) {
      console.error(err);
      setResultado("Erro ao acessar câmera");
    }
  }

  function onScanSuccess(decodedText) {
    if (isCooldown) return;

    setIsCooldown(true);

    if (html5QrCodeRef.current?.isScanning) {
      html5QrCodeRef.current.pause();
    }

    try {
      const bytes = CryptoJS.AES.decrypt(decodedText, chave);
      const textoOriginal = bytes.toString(CryptoJS.enc.Utf8);

      if (!textoOriginal) {
        throw new Error("QR incompatível");
      }

      const dados = JSON.parse(textoOriginal);
      const id = dados.id;

      const usedQRCodesAtuais =
        JSON.parse(localStorage.getItem("usedQRCodes")) || {};

      if (usedQRCodesAtuais[id]) {
        abrirPopup(`QR ${id} já foi utilizado`, "erro");
      } else {
        const novos = {
          ...usedQRCodesAtuais,
          [id]: true
        };

        localStorage.setItem(
          "usedQRCodes",
          JSON.stringify(novos)
        );

        abrirPopup(`QR ${id} liberado com sucesso`, "sucesso");
      }

    } catch (erro) {
      console.error("Erro na decodificação:", erro);
      abrirPopup("QR Code inválido", "erro");
    }
  }

  function abrirPopup(mensagem, tipo) {
    setPopup({
      aberto: true,
      mensagem,
      tipo
    });
  }

  function onScanFailure() {

  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Leitor de QR Code</h2>

      <div
        id="leitor"
        style={{
          width: "320px",
          margin: "20px auto"
        }}
      ></div>

      <p style={{ fontWeight: "bold" }}>
        {resultado}
      </p>

      {popup.aberto && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>
              {popup.tipo === "erro"
                ? "Erro"
                : "Sucesso"}
            </h3>

            <p>{popup.mensagem}</p>

            <button
              onClick={() => {
                setPopup({
                  aberto: false,
                  mensagem: "",
                  tipo: ""
                });

                setResultado("Aguardando leitura...");
                setIsCooldown(false);

                html5QrCodeRef.current?.resume();
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}