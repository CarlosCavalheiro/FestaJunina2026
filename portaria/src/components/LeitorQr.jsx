import { useEffect, useRef, useState } from "react";
import CryptoJS from "crypto-js";
import { Html5Qrcode } from "html5-qrcode";
import "../styles/QrCode.css";

export default function LeitorQR() {
  const html5QrCodeRef = useRef(null);
  const startedRef = useRef(false);

  const [resultado, setResultado] = useState("Aguardando leitura...");
  const [isCooldown, setIsCooldown] = useState(false);
  const [cameraMode, setCameraMode] = useState("environment");
  const [cameraError, setCameraError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const [popup, setPopup] = useState({
    aberto: false,
    mensagem: "",
    tipo: ""
  });

  const chave = import.meta.env.VITE_QR_SECRET;

  useEffect(() => {
    const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    setIsMobile(mobile);

    if (!startedRef.current) {
      startedRef.current = true;
      iniciarCamera(mobile ? "environment" : cameraMode);
    }

    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function iniciarCamera(preferencia = "environment") {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Este navegador não suporta acesso à câmera.");
      }

      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        throw new Error("A câmera precisa de uma conexão segura (HTTPS ou localhost).");
      }

      if (html5QrCodeRef.current?.isScanning) {
        await html5QrCodeRef.current.stop().catch(() => {});
      }

      const html5QrCode = new Html5Qrcode("leitor");
      html5QrCodeRef.current = html5QrCode;

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras?.length) {
        throw new Error("Nenhuma câmera disponível neste dispositivo.");
      }

      const camera = selecionarCamera(cameras, preferencia);

      if (!camera) {
        throw new Error("Não foi possível encontrar a câmera desejada.");
      }

      await html5QrCode.start(
        camera.id,
        {
          fps: 30,
          qrbox: {
            width: 300,
            height: 300
          },
          aspectRatio: 1,
          disableFlip: false
        },
        onScanSuccess,
        onScanFailure
      );

      setCameraMode(preferencia);
      setResultado("Aguardando leitura...");
      setCameraError("");
    } catch (err) {
      console.error(err);
      const mensagem = err?.message || "Erro ao acessar câmera";
      setCameraError(mensagem);
      setResultado(mensagem);
    }
  }

  function selecionarCamera(cameras, preferencia) {
    const preferenciaNormalizada = preferencia.toLowerCase();

    const cameraPreferida = cameras.find((camera) => {
      const rotulo = (camera.label || "").toLowerCase();

      if (preferenciaNormalizada === "user" || preferenciaNormalizada === "front" || preferenciaNormalizada === "frontal") {
        return rotulo.includes("front") || rotulo.includes("user") || rotulo.includes("frontal") || rotulo.includes("selfie");
      }

      return rotulo.includes("back") || rotulo.includes("rear") || rotulo.includes("environment") || rotulo.includes("traseira") || rotulo.includes("traseiro");
    });

    return cameraPreferida || cameras[0];
  }

  async function trocarCamera(preferencia) {
    setCameraMode(preferencia);
    await iniciarCamera(preferencia);
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
    if (resultado !== "Posicione o QR no centro da câmera.") {
      setResultado("Posicione o QR no centro da câmera.");
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Leitor de QR Code</h2>

      <div className="camera-controls">
        <button
          className="camera-toggle"
          onClick={() => trocarCamera("environment")}
        >
          {isMobile ? "Traseira (padrão)" : "Câmera traseira"}
        </button>
        <button
          className="camera-toggle"
          onClick={() => trocarCamera("user")}
        >
          {isMobile ? "Frontal" : "Câmera frontal"}
        </button>
      </div>

      <div
        id="leitor"
        style={{
          width: "320px",
          margin: "20px auto"
        }}
      ></div>

      <p className="camera-status">
        {resultado}
      </p>

      {cameraError && (
        <p className="camera-error">{cameraError}</p>
      )}

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