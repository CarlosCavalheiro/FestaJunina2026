import QRPix from "../../assets/qrcode-pix.webp";
import { useState } from "react";
import { useEffect } from "react";
import Modal from "../Modal/Modal";
import Api from "../../services/api";
import "./Pix.css";

export default function Pix({ item, onClose }) {

    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [valorPendente, setValorTotalPendente] = useState();

    const FileChange = (Event) => {
        const file = Event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFileName(file.name);
        }
    }

    const usuarioString = localStorage.getItem("usuario");
    let usuarioObj = null;
    try {
        usuarioObj = usuarioString ? JSON.parse(usuarioString) : null;
    } catch (error) {
        console.warn("Erro ao ler usuário do localStorage:", error);
        usuarioObj = null;
    }
    const IdUsuario =
        usuarioObj?.IdUsuario ??
        usuarioObj?.idUsuario ??
        localStorage.getItem("idUsuario") ??
        null;

    const IdPedido = item.idPedido;

    const copiarChavePix = async () => {
        const chavePix = "05.766.694/0001-96";
        try {
            await navigator.clipboard.writeText(chavePix);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (erro) {
            console.error("Erro ao copiar chave PIX:", erro);
        }
    };

    async function getValorTotalPendente() {

    // if (!token) {
    //   console.warn("Usuário não logado, pulando busca de valor total pendente.");
    //   navigate("/loginUsuarios");
    //   return;
    // }
    
        const ENDPOINT_VALOR_TOTAL = "Pedidos/ValorTotalPendentePorUsuario";
        try {
        const response = await Api.get("Pedidos/ValorTotalPendentePorUsuario", {
            params: {
            IdUsuario: IdUsuario,
            },
        });

        setValorTotalPendente(response.data ?? 0);
        } catch (error) {
        console.error("Erro ao buscar valor pendente:", error);
        }
    }

    const Confirmar = async () => {
        if (!selectedFile) {
            alert("Por favor, anexe o comprovante PIX");
            return;
        }

        setLoading(true);

        try {
            const ENDPOINT_FT_COMPROVANTE = "Pedidos/PublicarComprovante";

            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await Api.post(ENDPOINT_FT_COMPROVANTE, formData, 
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                params: {
                    id: IdPedido,
                },
            });

            if (response.status === 200) {
            alert("Comprovante enviado com sucesso!");
            setLoading(false);
            onClose();
        }
        } catch (erro) {
            console.error("Erro ao enviar comprovante PIX:", erro);
            alert("Falha ao enviar comprovante. Tente novamente.");
            setLoading(false);
            return;
        }
    };

    const OverlayClick = (e) => {
        if (e.target.classList.contains('modal-overlay-pix')) {
            onClose();
        }
    };

    useEffect(() => {
      async function carregarDados() {
        await getValorTotalPendente();
      }
      carregarDados();
    }, []);

    return(
        <>
            <div className="modal-overlay-pix" onClick={OverlayClick}>
                <div className="container">
                    <div className="card">

                        <button className="close-modal-btn" onClick={onClose}>×</button>

                        <div className="left">
                            <div className="qr-box">
                                <img
                                src={QRPix}
                                alt="QR Code"
                                />
                            </div>
                            <div className="pix-key-container">
                                <p className="pix-key">CHAVE PIX: 05.766.694/0001-96</p>
                                <button 
                                    className="copy-pix-btn"
                                    onClick={copiarChavePix}
                                    title="Copiar chave PIX"
                                >
                                    {copied ? "✓ Copiado!" : " Copiar"}
                                </button>
                            </div>
                        </div>

                        <div className="right">
                            <input
                            type="text"
                            value="Aguadando pagamento..."
                            disabled
                            className="input-top"
                            />
                            <div className="upload-box">
                                <span>Anexar comprovante PIX</span>
                                <input 
                                    type="file"
                                    onChange={FileChange}
                                    id="file-upload" //talvez mudar
                                    accept="image/*,.pdf" //talvez muito mudar
                                />
                                {fileName && (
                                    <span className="file-selected">📎 {fileName}</span>
                                )}
                            </div>
                            <div className={`valorTotal-Box ${fileName ? 'valorTotal-Box-has-file' : ''}`}>
                                <h4 className="valorTotal-Pix" style={{ marginRight: "10px" }}>
                                    Valor à pagar: R$ {(valorPendente ?? 0).toFixed(2)}
                                </h4>
                            </div>
                            <button 
                                className="action-btn"
                                onClick={Confirmar}
                                disabled={loading}
                                >
                                {loading ? "Processando..." : "Confirmar"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}