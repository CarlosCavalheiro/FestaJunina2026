import "../styles/perguntas.css";
import { useState, useEffect } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import api from "../services/api";

export default function Perguntas() {
  const [grupo, setGrupo] = useState(2);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);

  const [popup, setPopup] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");

  const [novaPergunta, setNovaPergunta] = useState({
    texto: "",
    tipoPergunta: 2,
  });

  const [perguntaEditando, setPerguntaEditando] = useState({
    id: null,
    texto: "",
    tipoPergunta: 2,
  });

  const [perguntas, setPerguntas] = useState([]);

  async function getPerguntas() {
    try {
      const response = await api.get("/Pesquisa");
      setPerguntas(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getPerguntas();
  }, []);

  const filtradas = perguntas.filter((p) => p.idTpUser === grupo);

  function abrirModal() {
    setNovaPergunta({
      texto: "",
      tipoPergunta: 2,
    });

    setMostrarModal(true);
  }

  async function salvarPergunta() {
    try {
      await api.post("/Pesquisa/registro-pergunta", {
        descricaoPergunta: novaPergunta.texto,
        idTpUser: grupo,
        tipoPergunta: novaPergunta.tipoPergunta,
      });

      setMostrarModal(false);
      getPerguntas();
    } catch (error) {
      console.log(error);
    }
  }

  async function excluirPergunta(id) {
    try {
      await api.delete(`/Pesquisa/delete-pergunta?id=${id}`);
      getPerguntas();
    } catch (error) {
      setMensagemPopup(
        "Esta pergunta não pode ser excluída porque possui respostas vinculadas.",
      );

      setPopup(true);
    }
  }

  function abrirEditar(pergunta) {
    setPerguntaEditando({
      id: pergunta.idPergunta,
      texto: pergunta.descricaoPergunta,
      tipoPergunta: pergunta.tipoPergunta,
    });

    setMostrarEditar(true);
  }

  async function salvarEdicao() {
    try {
      await api.put("/Pesquisa/editar-pergunta", {
        idPergunta: perguntaEditando.id,
        descricaoPergunta: perguntaEditando.texto,
        tipoPergunta: perguntaEditando.tipoPergunta,
      });

      setMostrarEditar(false);
      getPerguntas();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Header />

      <main>
        <div className="container_perguntas">
          <h3 className="h3_perguntas">Perguntas cadastradas</h3>

          <div className="filters_perguntas">
            <select
              value={grupo}
              onChange={(e) => setGrupo(Number(e.target.value))}
            >
              <option value={1}>Cliente</option>
              <option value={2}>Colaborador</option>
              <option value={3}>Entidade</option>
            </select>

            <button className="btn btn-primary" onClick={abrirModal}>
              + Nova pergunta
            </button>
          </div>

          <div className="table_container_perguntas">
            <table className="table_perguntas">
              <thead>
                <tr>
                  <th>Pergunta</th>
                  <th>Tipo</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filtradas.length > 0 ? (
                  filtradas.map((p) => (
                    <tr className="tr_perguntas" key={p.idPergunta}>
                      <td>{p.descricaoPergunta}</td>

                      <td>
                        {p.tipoPergunta === 2 ? "Dissertativa" : "Alternativa"}
                      </td>

                      <td>
                        <div className="acoes_perguntas">
                          <button
                            className="btn btn-outline-warning"
                            onClick={() => abrirEditar(p)}
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-outline-danger"
                            onClick={() => excluirPergunta(p.idPergunta)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="vazio_perguntas">
                      Nenhuma pergunta encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {mostrarModal && (
        <div
          className="modal_overlay_perguntas"
          onClick={() => setMostrarModal(false)}
        >
          <div className="modal_perguntas" onClick={(e) => e.stopPropagation()}>
            <div className="modal_header_perguntas">
              <h5>Nova Pergunta</h5>

              <button onClick={() => setMostrarModal(false)}>×</button>
            </div>

            <select
              className="select_tipo_pergunta"
              value={novaPergunta.tipoPergunta}
              onChange={(e) =>
                setNovaPergunta({
                  ...novaPergunta,
                  tipoPergunta: Number(e.target.value),
                })
              }
            >
              <option value={2}>Dissertativa</option>
              <option value={1}>Alternativa</option>
            </select>

            <textarea
              className="input_perguntas"
              placeholder="Digite a pergunta"
              value={novaPergunta.texto}
              onChange={(e) =>
                setNovaPergunta({
                  ...novaPergunta,
                  texto: e.target.value,
                })
              }
            />

            <div className="modal_actions_perguntas">
              <button className="btn btn-success" onClick={salvarPergunta}>
                Salvar
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarEditar && (
        <div
          className="modal_overlay_perguntas"
          onClick={() => setMostrarEditar(false)}
        >
          <div
            className="modal_perguntas modal_editar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal_header_perguntas">
              <h5>Editar Pergunta</h5>

              <button onClick={() => setMostrarEditar(false)}>×</button>
            </div>

            <select
              className="input_perguntas"
              value={perguntaEditando.tipoPergunta}
              onChange={(e) =>
                setPerguntaEditando({
                  ...perguntaEditando,
                  tipoPergunta: Number(e.target.value),
                })
              }
            >
              <option value={2}>Dissertativa</option>
              <option value={1}>Alternativa</option>
            </select>

            <textarea
              className="input_perguntas"
              value={perguntaEditando.texto}
              onChange={(e) =>
                setPerguntaEditando({
                  ...perguntaEditando,
                  texto: e.target.value,
                })
              }
            />

            <div className="modal_actions_perguntas">
              <button className="btn btn-primary" onClick={salvarEdicao}>
                Salvar alterações
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setMostrarEditar(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {popup && (
        <div className="popup_perguntas">
          <div className="popup_content_perguntas">
            <p>{mensagemPopup}</p>

            <button
              className="btn btn-outline-danger"
              onClick={() => setPopup(false)}
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
