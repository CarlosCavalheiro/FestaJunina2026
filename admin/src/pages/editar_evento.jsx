import React, { useEffect, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import "../styles/editar_evento.css";
import api from "../services/api";

function EditarEvento() {
  const [view, setView] = useState("lista");

  const [eventos, setEventos] = useState([]);

  const [evento, setEvento] = useState({
    idEvento: 0,
    nomeEvento: "",
    data: "",
    ativo: true,
    local: "",
    descricao: "",
    qtde_Ingressos: 0,
    qtde_Lotes: 0,
  });

  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState(false);

  const [mensagemPopup, setMensagemPopup] = useState("");

  useEffect(() => {
    buscarEventos();
  }, []);

  async function buscarEventos() {
    try {
      const response = await api.get("/Eventos");

      setEventos(response.data);
    } catch (error) {
      console.error(error);

      setMensagemPopup("Erro ao carregar eventos");

      setPopup(true);
    }
  }

  function abrirEditar(eventoSelecionado) {
    setEvento({
      ...eventoSelecionado,

      data: eventoSelecionado.data ? eventoSelecionado.data.split("T")[0] : "",
    });

    setView("form");
  }

  function criarEvento() {
    setEvento({
      idEvento: 0,
      nomeEvento: "",
      data: "",
      ativo: true,
      local: "",
      descricao: "",
      qtde_Ingressos: 0,
      qtde_Lotes: 0,
    });

    setView("form");
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setEvento((prev) => ({
      ...prev,

      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function salvarEvento() {
    try {
      setLoading(true);

      const body = {
        nomeEvento: evento.nomeEvento,

        data: evento.data,

        ativo: evento.ativo,

        local: evento.local,

        descricao: evento.descricao,

        qtde_Ingressos: Number(evento.qtde_Ingressos),

        qtde_Lotes: Number(evento.qtde_Lotes),
      };

      if (evento.idEvento) {
        await api.put(`/Eventos/EditarEvento?id=${evento.idEvento}`, body);

        setMensagemPopup("Evento atualizado com sucesso!");
      } else {
        await api.post("/Eventos", body);

        setMensagemPopup("Evento criado com sucesso!");
      }

      setPopup(true);

      setView("lista");

      buscarEventos();
    } catch (error) {
      console.error(error);

      setMensagemPopup("Erro ao salvar evento");

      setPopup(true);
    } finally {
      setLoading(false);
    }
  }

  async function alterarStatusEvento(eventoSelecionado) {
    try {
      const body = {
        ...eventoSelecionado,

        ativo: !eventoSelecionado.ativo,
      };

      await api.put(
        `/Eventos/EditarEvento?id=${eventoSelecionado.idEvento}`,
        body,
      );

      setMensagemPopup(body.ativo ? "Evento ativado!" : "Evento desativado!");

      setPopup(true);

      buscarEventos();
    } catch (error) {
      console.error(error);

      setMensagemPopup("Erro ao alterar status");

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

      <main className="main_editar">
        <h2 className="titulo_editar">Eventos</h2>

        {view === "lista" && (
          <>
            <div className="text-end mb-4">
              <button className="btn btn-outline-success" onClick={criarEvento}>
                + Criar Evento
              </button>
            </div>

            {eventos.map((evento) => (
              <div className="lista_evento" key={evento.idEvento}>
                <div className="info_evento">
                  <div className="topo_evento">
                    <strong className="nome_evento">{evento.nomeEvento}</strong>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => abrirEditar(evento)}
                      >
                        Editar
                      </button>

                      <button
                        className={`btn btn-sm ${
                          evento.ativo
                            ? "btn-outline-danger"
                            : "btn-outline-success"
                        }`}
                        onClick={() => alterarStatusEvento(evento)}
                      >
                        {evento.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </div>

                  <p>
                    <strong>Descrição:</strong> {evento.descricao}
                  </p>

                  <p>
                    <strong>Data:</strong> {formatarData(evento.data)}
                  </p>

                  <p>
                    <strong>Ingressos:</strong> {evento.qtde_Ingressos}
                  </p>

                  <p>
                    <strong>Lotes:</strong> {evento.qtde_Lotes}
                  </p>

                  <p>
                    <strong>Local:</strong> {evento.local}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                    className={evento.ativo ? "status_ativo" : "status_inativo"}
                    >
                      {evento.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {view === "form" && (
          <div className="perguntas_editar">
            <h4 className="h4_editar">
              {evento.idEvento ? "Editar Evento" : "Criar Evento"}
            </h4>

            <h6 className="pergunta_editar">Nome do evento</h6>

            <input
              className="input_editar"
              type="text"
              name="nomeEvento"
              value={evento.nomeEvento}
              onChange={handleChange}
            />

            <h6 className="pergunta_editar">Descrição</h6>

            <input
              className="input_editar"
              type="text"
              name="descricao"
              value={evento.descricao}
              onChange={handleChange}
            />

            <h6 className="pergunta_editar">Data do evento</h6>

            <input
              className="input_editar"
              type="date"
              name="data"
              value={evento.data}
              onChange={handleChange}
            />

            <h6 className="pergunta_editar">Quantidade ingressos</h6>

            <input
              className="input_editar"
              type="number"
              name="qtde_Ingressos"
              value={evento.qtde_Ingressos}
              onChange={handleChange}
            />

            <h6 className="pergunta_editar">Quantidade lotes</h6>

            <input
              className="input_editar"
              type="number"
              name="qtde_Lotes"
              value={evento.qtde_Lotes}
              onChange={handleChange}
            />

            <h6 className="pergunta_editar">Local</h6>

            <input
              className="input_editar"
              type="text"
              name="local"
              value={evento.local}
              onChange={handleChange}
            />

            <div className="form-check mt-3">
              <input
                className="form-check-input"
                type="checkbox"
                name="ativo"
                checked={evento.ativo}
                onChange={handleChange}
              />

              <label className="form-check-label">
                {evento.ativo ? "Evento ativo" : "Evento inativo"}
              </label>
            </div>

            <div className="d-flex gap-3 mt-4">
              <button
                className="btn btn-outline-success w-50"
                onClick={salvarEvento}
                disabled={loading}
              >
                {loading
                  ? "Salvando..."
                  : evento.idEvento
                    ? "Salvar Alterações"
                    : "Criar Evento"}
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

      {popup && (
        <div className="popup_editar">
          <div className="popup_content_editar">
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

      <Footer />
    </>
  );
}

export default EditarEvento;
