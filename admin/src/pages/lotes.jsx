import React, { useEffect, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import api from "../services/api";
import "../styles/lotes.css";

function LotesEvento() {
  const [lotes, setLotes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [popup, setPopup] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");

  const [view, setView] = useState("lista");
  const [modo, setModo] = useState("criar");

  const tipoLote = {
    1: "Normal",
    2: "Infantil",
  };

  const [loteForm, setLoteForm] = useState({
    idLote: null,
    idEvento: "",
    tipoLote: "",
    qtdeIngressosLotes: 0,
    valorIng: 0,
    dataFechamento: "",
    descricao: "",
    ativo: true,
  });

  useEffect(() => {
    buscarLotes();
    buscarEventos();
  }, []);

  async function buscarLotes() {
    try {
      const response = await api.get("/Lotes/ListarLotes");

      const dados = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      const hoje = new Date();

      for (const lote of dados) {
        const dataFechamento = new Date(lote.dataFechamento);

        const loteExpirado = dataFechamento < hoje;
        const semSaldo = lote.saldo <= 0;

        if ((loteExpirado || semSaldo) && lote.ativo) {
          try {
            await api.put(`/Lotes/DesativarLote?id=${lote.idLote}`, {
              ativo: false,
            });

            lote.ativo = false;
          } catch (error) {
            console.log("Erro ao desativar lote automaticamente");
          }
        }
      }

      setLotes(dados);
    } catch (error) {
      setMensagemPopup("Erro ao buscar lotes");
      setPopup(true);
    } finally {
      setLoading(false);
    }
  }

  async function buscarEventos() {
    try {
      const response = await api.get("/Eventos");

      const dados = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setEventos(dados);
    } catch (error) {
      setMensagemPopup("Erro ao buscar eventos");
      setPopup(true);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setLoteForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function abrirCriar() {
    setModo("criar");

    setLoteForm({
      idLote: null,
      idEvento: "",
      tipoLote: "",
      qtdeIngressosLotes: 0,
      valorIng: 0,
      dataFechamento: "",
      descricao: "",
      ativo: true,
    });

    setView("form");
  }

  function abrirEditar(lote) {
    setModo("editar");

    setLoteForm({
      idLote: lote.idLote,
      idEvento: String(lote.idEvento),
      tipoLote: String(lote.tipoLote),
      qtdeIngressosLotes: lote.qtdeIngressosLotes,
      valorIng: lote.valorIng,
      dataFechamento: lote.dataFechamento?.split("T")[0],
      descricao: lote.descricao,
      saldo: lote.saldo,
      ativo: lote.ativo,
    });

    setView("form");
  }

  async function salvarLote() {
    if (!loteForm.idEvento) {
      setMensagemPopup("Selecione um evento");
      setPopup(true);
      return;
    }

    try {
      const body = {
        idEvento: Number(loteForm.idEvento),
        tipoLote: Number(loteForm.tipoLote),
        qtdeIngressosLotes: Number(loteForm.qtdeIngressosLotes),
        valorIng: Number(loteForm.valorIng),
        dataFechamento: loteForm.dataFechamento,
        descricao: loteForm.descricao,
        ativo: loteForm.ativo,
        saldo:
          modo === "criar"
            ? Number(loteForm.qtdeIngressosLotes)
            : Number(loteForm.saldo),
      };

      if (modo === "editar") {
        await api.put(`/Lotes/EditarLote?id=${loteForm.idLote}`, body);
        setMensagemPopup("Lote editado com sucesso!");
      } else {
        await api.post("/Lotes/CriarLote", body);
        setMensagemPopup("Lote criado com sucesso!");
      }

      setPopup(true);
      setView("lista");
      buscarLotes();
    } catch (error) {
      setMensagemPopup("Erro ao salvar lote");
      setPopup(true);
    }
  }

  async function alterarStatusLote(lote) {
    const hoje = new Date();
    const dataFechamento = new Date(lote.dataFechamento);

    const loteExpirado = dataFechamento < hoje;
    const semSaldo = lote.saldo <= 0;

    if (!lote.ativo && (loteExpirado || semSaldo)) {
      setMensagemPopup("Não é possível ativar um lote expirado ou sem saldo.");
      setPopup(true);
      return;
    }

    try {
      await api.put(`/Lotes/DesativarLote?id=${lote.idLote}`, {
        ativo: !lote.ativo,
      });

      setMensagemPopup(
        !lote.ativo
          ? "Lote ativado com sucesso!"
          : "Lote desativado com sucesso!",
      );

      setPopup(true);
      buscarLotes();
    } catch (error) {
      setMensagemPopup("Erro ao alterar status do lote");
      setPopup(true);
    }
  }

  function formatarData(data) {
    if (!data) return "";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  return (
    <>
      <Header />

      <main className="main_lotes">
        <h2 className="titulo_lotes">Lotes</h2>

        {view === "lista" && (
          <>
            <div className="text-end mb-3">
              <button className="btn btn-outline-success" onClick={abrirCriar}>
                + Criar Lote
              </button>
            </div>

            {loading ? (
              <p className="text-center">Carregando...</p>
            ) : lotes.length === 0 ? (
              <p className="text-center">Nenhum lote encontrado</p>
            ) : (
              lotes
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.dataFechamento) - new Date(b.dataFechamento),
                )
                .map((lote, index) => (
                  <div
                    key={lote.idLote}
                    className="d-flex justify-content-between align-items-center border-bottom py-2"
                  >
                    <div>
                      <strong>{lote.descricao || `Lote ${index + 1}`}</strong>
                      <br />
                      <strong>Evento:</strong>{" "}
                      {
                        eventos.find(
                          (evento) => evento.idEvento === lote.idEvento,
                        )?.nomeEvento
                      }
                      <br />
                      <strong>Tipo Lote: </strong> {tipoLote[lote.tipoLote] ?? "Não informado"}
                      <br />
                      <strong>Valor: </strong> R$ {lote.valorIng}
                      <br />
                      <strong>Ingressos: </strong> {lote.qtdeIngressosLotes}
                      <br />
                      <strong>Saldo: </strong> {lote.saldo}
                      <br />
                      <strong>Data de fechamento:</strong> {formatarData(lote.dataFechamento)}
                      <br />
                      <strong>Status:</strong>{" "}
                      <span
                        className={`fw-bold ${
                        lote.ativo ? "text-success" : "text-danger"
                    }`}
                      >
                        {lote.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => abrirEditar(lote)}
                      >
                        Editar
                      </button>

                      <button
                        className={`btn btn-sm ${
                          lote.ativo
                            ? "btn-outline-danger"
                            : "btn-outline-success"
                        }`}
                        onClick={() => alterarStatusLote(lote)}
                      >
                        {lote.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </div>
                ))
            )}
          </>
        )}

        {view === "form" && (
          <div className="perguntas_lotes">
            <h4>{modo === "editar" ? "Editar Lote" : "Criar Lote"}</h4>

            <h6>Evento</h6>
            <select
              className="input_lotes"
              name="idEvento"
              value={loteForm.idEvento}
              onChange={handleChange}
            >
              <option value="">Selecione um evento</option>
              {eventos.map((evento) => (
                <option key={evento.idEvento} value={String(evento.idEvento)}>
                  {evento.nomeEvento}
                </option>
              ))}
            </select>

            <h6 className="h6_lotes">Nome do lote</h6>
            <input
              className="input_lotes"
              name="descricao"
              value={loteForm.descricao}
              onChange={handleChange}
            />

            <h6 className="h6_lotes">Tipo do lote</h6>
            <select
              className="input_lotes"
              name="tipoLote"
              value={loteForm.tipoLote}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              {Object.entries(tipoLote).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>

            <h6 className="h6_lotes">Quantidade ingressos</h6>
            <input
              className="input_lotes"
              type="number"
              name="qtdeIngressosLotes"
              value={loteForm.qtdeIngressosLotes}
              onChange={handleChange}
            />

            <h6 className="h6_lotes">Valor</h6>
            <input
              className="input_lotes"
              type="number"
              name="valorIng"
              value={loteForm.valorIng}
              onChange={handleChange}
            />

            <h6 className="h6_lotes">Data fechamento</h6>
            <input
              className="input_lotes"
              type="date"
              name="dataFechamento"
              value={loteForm.dataFechamento}
              onChange={handleChange}
            />

            <div className="d-flex gap-3 mt-3">
              <button
                className="btn btn-outline-success w-50"
                onClick={salvarLote}
              >
                {modo === "editar" ? "Salvar" : "Criar"}
              </button>

              <button
                className="btn btn-outline-danger w-50"
                onClick={() => setView("lista")}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {popup && (
        <div className="popup_lotes">
          <div className="popup_content_lotes">
            <p>{mensagemPopup}</p>
            <button
              onClick={() => setPopup(false)}
              className="btn btn-outline-danger"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default LotesEvento;
