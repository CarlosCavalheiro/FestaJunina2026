import { useEffect, useState } from "react";
import Card from "./Card";
import api from "../services/api";
import "../styles/Historico.css";

export default function BodyHistorico() {
  const [ingressos, setIngressos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarIngressosLidos();
  }, []);

  async function carregarIngressosLidos() {
    try {
      setCarregando(true);
      const response = await api.get("/Verificador/listar-ingressos-lidos");
      const dados = response?.data?.dados || response?.data || [];
      setIngressos(Array.isArray(dados) ? dados : []);
      setErro("");
    } catch (error) {
      console.error("Erro ao carregar ingressos lidos:", error);
      setErro(error?.response?.data?.mensagem || "Erro ao carregar ingressos");
      setIngressos([]);
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <div className="containerCards">
        <p>Carregando histórico de ingressos...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="containerCards">
        <p style={{ color: "red" }}>Erro: {erro}</p>
        <button onClick={carregarIngressosLidos}>Tentar novamente</button>
      </div>
    );
  }

  if (!ingressos.length) {
    return (
      <div className="containerCards">
        <p>Nenhum ingresso foi lido ainda.</p>
      </div>
    );
  }

  return (
    <div className="containerCards">
      {ingressos.map((ingresso, index) => (
        <Card
          key={ingresso.id || index}
          imagem={ingresso.qrCodeUrl || ingresso.imagemUrl || ""}
          qtIngressos={ingresso.idIngresso || ingresso.numero || index + 1}
          tipoIngresso={ingresso.nomeTipo || ingresso.tipo || "Ingresso"}
          status1={ingresso.statusValidacao || "Validado"}
          status2={new Date(ingresso.dataValidacao || new Date()).toLocaleDateString("pt-BR")}
        />
      ))}
    </div>
  );
}