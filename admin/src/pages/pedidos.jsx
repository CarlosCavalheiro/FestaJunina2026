import "../styles/pedidos.css";
import Header from "../components/header";
import Footer from "../components/footer";
import { useEffect, useState } from "react";
import api, { BLOB_COMPROVANTES_URL } from "../services/api";

const statusMap = {
  1: "Reservado",
  2: "Pago",
  3: "Cancelado",
  4: "Verificando",
};

const pagamentoMap = {
  1: "Pix",
  2: "Dinheiro",
};

function Pedidos() {
  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [busca, setBusca] = useState("");

  const [popup, setPopup] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");

  const [confirmPopup, setConfirmPopup] = useState(false);

  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const [acaoSelecionada, setAcaoSelecionada] = useState(null);

  function getNomeUsuario(idUsuario) {
    const user = usuarios.find(
      (u) => String(u.idUsuario) === String(idUsuario),
    );

    return user ? user.nome : "Desconhecido";
  }

  function abrirConfirmacao(idPedido, status) {
    setPedidoSelecionado(idPedido);

    setAcaoSelecionada(status);

    setConfirmPopup(true);
  }

  async function alterarStatus(idPedido, novoStatus) {
    try {
      const idUsuario = localStorage.getItem("idUsuario");

      await api.put(
        `/Pedidos/AlterarStatusdoPedido?id=${idPedido}&id_usuario=${idUsuario}&novoStatus=${novoStatus}`,
      );

      setPedidos((prev) =>
        prev.map((p) =>
          p.idPedido === idPedido
            ? {
                ...p,
                idStatus: novoStatus,
                ultimaAcaoPor: Number(idUsuario),
              }
            : p,
        ),
      );

      setMensagemPopup(
        novoStatus === 2
          ? "Pedido aprovado com sucesso!"
          : "Pedido cancelado com sucesso!",
      );

      setPopup(true);
    } catch (error) {
      console.error(error);

      setMensagemPopup("Erro ao atualizar pedido");

      setPopup(true);
    }
  }

  async function carregarPedidos() {
    try {
      const res = await api.get("/Pedidos/ListarPedidos");

      setPedidos(res.data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    }
  }

  async function carregarUsuarios() {
    try {
      const res = await api.get("/Usuario/ListarUsuarios");

      setUsuarios(res.data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }

  useEffect(() => {
    carregarPedidos();

    carregarUsuarios();
  }, []);

  const pedidosFiltrados = pedidos
    .filter((p) => {
      const matchStatus = !filtroStatus || String(p.idStatus) === filtroStatus;

      const matchBusca =
        !busca ||
        getNomeUsuario(p.idUsuario)
          ?.toLowerCase()
          .includes(busca.toLowerCase());

      return matchStatus && matchBusca;
    })
    .sort((a, b) => b.idPedido - a.idPedido);

  return (
    <>
      <Header />

      <main className="main_pedidos">
        <div className="container_pedidos">
          <h4 className="h4_pedidos">Pedidos</h4>

          <div className="filters_pedidos">
            <input
              className="input_pedidos"
              type="search"
              placeholder="Pesquisar por nome de usuário"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select
              className="select_pedidos"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Filtrar por...</option>

              <option value="1">Reservado</option>

              <option value="2">Pago</option>

              <option value="3">Cancelado</option>
            </select>
          </div>

          <div className="table_container_pedidos">
            <table className="table table-striped table_pedidos">
              <thead>
                <tr>
                  <th>ID</th>

                  <th>Usuário</th>

                  <th>Data</th>

                  <th>Valor</th>

                  <th>Qtd</th>

                  <th>Pagamento</th>

                  <th>Status</th>

                  <th>Última ação por</th>

                  <th>Comprovante</th>

                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((p) => (
                    <tr key={p.idPedido}>
                      <td>{p.idPedido}</td>

                      <td>{getNomeUsuario(p.idUsuario)}</td>

                      <td>
                        {p.dtaReserva
                          ? new Date(p.dtaReserva).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>R$ {p.valor}</td>

                      <td>{p.quantidade}</td>

                      <td>{pagamentoMap[p.tipoPagamento] || "-"}</td>

                      <td>
                        <span
                          className={
                            p.idStatus === 1
                              ? "status-pendente"
                              : p.idStatus === 4
                                ? "status-verificando"
                              : p.idStatus === 2
                                ? "status-pago"
                                : "status-cancelado"
                          }
                        >
                          {statusMap[p.idStatus]}
                        </span>
                      </td>

                      <td>
                        {p.ultimaAcaoPor
                          ? getNomeUsuario(p.ultimaAcaoPor)
                          : "-"}
                      </td>

                      <td>
                        {p.ftComprovante ? (
                          <a
                            href={`${BLOB_COMPROVANTES_URL}${p.ftComprovante}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link_comprovante"
                          >
                            Acessar comprovante
                          </a>
                        ) : (
                          "Sem comprovante"
                        )}
                      </td>

                      <td>
                        {p.idStatus === 1 || p.idStatus === 4 ? (
                          <div className="acoes_pedidos">
                            <button
                              className="btn btn-outline-success btn_pedido"
                              onClick={() =>
                                abrirConfirmacao(p.idPedido, 2)
                              }
                            >
                              Aprovar
                            </button>

                            <button
                              className="btn btn-outline-danger btn_pedido"
                              onClick={() =>
                                abrirConfirmacao(p.idPedido, 3)
                              }
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="acoes_pedidos">
                            {p.idStatus === 2 && (
                              <span className="alert alert-success p-2 aviso_pedido">
                                Pedido Aprovado
                              </span>
                            )}

                            {p.idStatus === 3 && (
                              <span className="alert alert-danger p-2 aviso_pedido">
                                Pedido Cancelado
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10">Nenhum pedido encontrado</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {confirmPopup && (
        <div className="confirm_overlay">
          <div className="confirm_box">
            <h4 className="confirm_title">
              {acaoSelecionada === 2
                ? "Confirmar Aprovação"
                : "Confirmar Cancelamento"}
            </h4>

            <p className="confirm_text">
              {acaoSelecionada === 2
                ? "Deseja realmente aprovar este pedido?"
                : "Deseja realmente cancelar este pedido?"}
            </p>

            <div className="confirm_buttons">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setConfirmPopup(false)}
              >
                Voltar
              </button>

              <button
                className={`btn ${
                  acaoSelecionada === 2
                    ? "btn-success"
                    : "btn-danger"
                }`}
                onClick={() => {
                  alterarStatus(
                    pedidoSelecionado,
                    acaoSelecionada,
                  );

                  setConfirmPopup(false);
                }}
              >
                {acaoSelecionada === 2
                  ? "Sim, Aprovar"
                  : "Sim, Cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {popup && (
        <div className="popup_pedidos">
          <div className="popup_content_pedidos">
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

export default Pedidos;