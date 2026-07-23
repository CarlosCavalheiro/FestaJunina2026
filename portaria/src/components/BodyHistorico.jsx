import { useEffect, useMemo, useState } from "react";
import Card from "./Card";
import api from "../services/api";
import "../styles/Historico.css";

const TIPOS_INGRESSO = [
  { id: 1, nome: "Família" },
  { id: 2, nome: "Colaborador" },
  { id: 3, nome: "Comunidade" },
  { id: 4, nome: "Aluno" },
  { id: 5, nome: "Infantil" },
];

function obterTipoIngresso(ingresso) {
  const idTipo = Number(ingresso.idTipo ?? ingresso.IdTipo);
  return TIPOS_INGRESSO.find((tipo) => tipo.id === idTipo)?.nome || "Outro";
}

function formatarDataHora(data) {
  if (!data) return "Horário não informado";

  const dataFormatada = new Date(data);
  if (Number.isNaN(dataFormatada.getTime())) return "Horário não informado";

  return dataFormatada.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

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
      const respostaErro = error?.response?.data;
      setErro(
        typeof respostaErro === "string"
          ? respostaErro
          : respostaErro?.mensagem || "Erro ao carregar ingressos",
      );
      setIngressos([]);
    } finally {
      setCarregando(false);
    }
  }

  const resumo = useMemo(() => {
    const totaisPorTipo = TIPOS_INGRESSO.map((tipo) => ({
      ...tipo,
      total: 0,
    }));

    ingressos.forEach((ingresso) => {
      const idTipo = Number(ingresso.idTipo ?? ingresso.IdTipo);
      const tipo = totaisPorTipo.find((item) => item.id === idTipo);

      if (tipo) {
        tipo.total += 1;
      }
    });

    return {
      total: ingressos.length,
      porTipo: totaisPorTipo,
    };
  }, [ingressos]);

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

  return (
    <main className="historico">
      <section className="historico-cabecalho">
        <div>
          <p className="historico-eyebrow">Controle de entrada</p>
          <h1>Histórico de ingressos lidos</h1>
          <p>Consulte todas as validações realizadas na portaria.</p>
        </div>

        <button className="btn-atualizar" onClick={carregarIngressosLidos}>
          Atualizar
        </button>
      </section>

      <section className="resumo-ingressos" aria-label="Resumo de ingressos lidos">
        <article className="card-resumo card-resumo-total">
          <span>Total de entradas</span>
          <strong>{resumo.total}</strong>
          <small>Ingressos validados</small>
        </article>

        {resumo.porTipo.map((tipo) => (
          <article className="card-resumo" key={tipo.id}>
            <span>{tipo.nome}</span>
            <strong>{tipo.total}</strong>
            <small>Ingressos lidos</small>
          </article>
        ))}
      </section>

      <section className="lista-ingressos">
        <div className="lista-ingressos-titulo">
          <h2>Entradas registradas</h2>
          <span>{resumo.total} {resumo.total === 1 ? "ingresso" : "ingressos"}</span>
        </div>

        {!ingressos.length ? (
          <p className="historico-vazio">Nenhum ingresso foi lido ainda.</p>
        ) : (
          <div className="containerCards">
            {ingressos.map((ingresso, index) => (
              <Card
                key={ingresso.idIngresso ?? ingresso.IdIngresso ?? ingresso.id ?? index}
                qtIngressos={ingresso.idIngresso ?? ingresso.IdIngresso ?? ingresso.numero ?? index + 1}
                tipoIngresso={obterTipoIngresso(ingresso)}
                status1="Validado"
                status2={formatarDataHora(ingresso.dtEntrada ?? ingresso.DtEntrada)}
                usuarioQueLeu={ingresso.usuarioQueLeu ?? ingresso.UsuarioQueLeu}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
