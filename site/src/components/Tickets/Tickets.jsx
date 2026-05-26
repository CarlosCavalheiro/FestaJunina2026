import { useState, useEffect } from "react";
import "./Tickets.css";
import Modal from "../Modal/Modal";
import ModalTicket from "../Modal/modalTicket";
import Api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function Ingressos() {
  const navigate = useNavigate();

  const [lotes, setLotes] = useState([]);

  const LoteAtivo = lotes.find(
    (lote) => lote.ativo === true
  );

  async function carregarLotes() {
    const ENDPOINT_LISTAR_LOTES = "Lotes/ListarLotes";

    try {
      const response = await Api.get(ENDPOINT_LISTAR_LOTES);

      const LoteDados = response.data.sort(
        (a, b) => new Date(a.dataCriacao) - new Date(b.dataCriacao),
      );

      if (LoteAtivo == false) {
      abrirModal(
        "Não tem lotes em aberto atualmente, aguarde um novo lote ser aberto.",
      );
      return;
    }

      setLotes(LoteDados);
    } catch (error) {
      console.log("Erro completo:", error);
      abrirModal("Erro ao carregar lotes");
    }
  }

  useEffect(() => {
    carregarLotes();
  }, []);

  function buscarLotePorTipo(tipoIngresso) {
    const tipoLote = tipoIngresso === 5 ? 2 : 1;

    return lotes
      .filter(
        (lote) => lote.tipoLote === tipoLote && lote.ativo && lote.saldo > 0,
      )
      .sort((a, b) => a.idLote - b.idLote)[0];
  }

  const lotesComunsOrdenados = lotes
    .filter((l) => l.tipoLote === 1 && l.ativo && l.saldo > 0)
    .sort((a, b) => a.idLote - b.idLote);

  const loteAtual = lotesComunsOrdenados[0];
  const MAX_TOTAL = 4;

  const [tickets, setTickets] = useState([
    { nome: "Ingresso Infantil", tipo: 5, preco: 7, qtd: 0 },
    { nome: "Ingresso Aluno", tipo: 4, preco: 14, qtd: 0 },
    { nome: "Ingresso Colaborador", tipo: 2, preco: 14, qtd: 0 },
    { nome: "Ingresso Família", tipo: 1, preco: 14, qtd: 0 },
    { nome: "Ingresso Comunidade", tipo: 3, preco: 14, qtd: 0 },
  ]);

  const [modal, setModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [pedidoValido, setPedidoValido] = useState(false);

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

  const tokenString = localStorage.getItem("usuario");
  let tokenObj = null;
  try {
    tokenObj = tokenString ? JSON.parse(tokenString)?.token : null;
  } catch (error) {
    console.warn("Erro ao ler token do localStorage:", error);
    tokenObj = null;
  }

  const token = tokenObj?.token ?? localStorage.getItem("token") ?? null;

  const listaIngresso = tickets.flatMap((ticket) => {
    const lote = buscarLotePorTipo(ticket.tipo);
    if (ticket.qtd > 0) {
      return Array.from({ length: ticket.qtd }, () => ({
        Valor: ticket.preco,
        QrCode: "",
        IdUsuario: IdUsuario,
        IdTipo: ticket.tipo,
        IdLote: lote?.idLote || lote?.IdLote,
        IdStatusValidacao: 1,
      }));
    }
    return [];
  });

  const QtdLote = lotes.find((l) => l.tipoLote === 1 && l.ativo);

  function PedidoEmAberto() {
    abrirModal(
      "Você já possui um pedido aberto ou ele está aguardando a validação. Por favor, finalize o pagamento do pedido existente antes de criar um novo.",
    );
    setCarregando(true);
    setTimeout(() => {
      setCarregando(false);
      navigate("/meusIngressos");
    }, 2200);
  }

  function RedirecionamentoCriadoPedido() {
    abrirModal(
      "Pedido criado com sucesso! Redirecionando para pagamento."
    );
    setCarregando(true);
    setTimeout(() => {
      setCarregando(false);
      navigate("/meusIngressos")
    }, 3000);
  }

  function abrirModal(texto, callback = null) {
    setModalText(texto);
    setModalAction(callback);
    setModal(true);
  }

  function fecharModal() {
    setModal(false);

    if (modalAction) {
      const acao = modalAction;
      setModalAction(null);
      acao();
      return;
    }
  }

  async function VerificarPedidoPendente() {
    const ENDPOINT_VERIFICAR_PEDIDO = "Pedidos/PedidoComStatusPendente";

    if (!token) {
      abrirModal(
        "Você não está logado! Faça login para prosseguir com o pagamento.",
      );
      return false;
    }

    if (!IdUsuario) {
      abrirModal("Erro ao identificar usuário. Tente novamente.");
      return false;
    }

    try {
      setCarregando(true);

      const response = await Api.get(ENDPOINT_VERIFICAR_PEDIDO, {
        params: { IdUsuario: IdUsuario },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const temPedidoPendente = response.data === true;

      if (temPedidoPendente) {
        setPedidoValido(false);
        PedidoEmAberto();
        return false;
      } else {
        setPedidoValido(true);
        handleProsseguir();
        return false;
      }
    } catch (error) {
      console.error("Erro ao verificar pedido pendente:", error);

      if (error.response?.status === 401) {
        abrirModal("Sua sessão expirou. Faça login novamente.");
      } else if (error.response?.status === 404) {
        abrirModal("Usuário não encontrado. Faça login novamente.");
      } else if (error.response?.status === 500) {
        abrirModal("Erro no servidor. Tente novamente mais tarde.");
      } else {
        abrirModal("Erro ao verificar pedido. Tente novamente.");
      }

      return false;
    } finally {
      setCarregando(false);
    }
  }

  async function handleProsseguir() {
    const ENDPOINT_PEDIDOS = "Pedidos/CriarPedido";

    const token = localStorage.getItem("token");

    const tipoPagamento = paymentMethod == 1 ? 1 : 2;

    if (!token) {
      abrirModal(
        "Você não está logado! Faça login para prosseguir com o pagamento.",
      );
      return;
    }

    if (LoteAtivo == false) {
      abrirModal(
        "Não tem lotes em aberto atualmente, aguarde um novo lote ser aberto.",
      );
      return;
    }

    if (totalQtd === 0) {
      abrirModal("Selecione pelo menos um ingresso para prosseguir.");
      return;
    }

    try {
      setCarregando(true);
      console.log("Criando pedido com token:", token);

      console.log("Lista Ingressos: ", listaIngresso);
      const pedidoResponse = await Api.post(
        ENDPOINT_PEDIDOS,
        {
          IdUsuario: IdUsuario,
          Quantidade: totalQtd,
          IdLote: 3,
          Valor: totalValor,
          TipoPagamento: tipoPagamento,
          ListaIngressos: listaIngresso,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("Dados enviados:", pedidoResponse.data);

      RedirecionamentoCriadoPedido();
    } catch (erro) {
      const dados = erro.response?.data;

      abrirModal(`${dados?.mensagem}\n${dados?.inner}\n${dados?.inner2}`);
    } finally {
      setCarregando(false);
    }
  }

  function formatar(valor) {
    return "R$ " + valor.toFixed(2).replace(".", ",");
  }

  const totalQtd = tickets.reduce((s, t) => s + t.qtd, 0);
  const totalValor = tickets.reduce((s, t) => s + t.qtd * t.preco, 0);

  function alterar(index, delta) {
    if (delta > 0 && totalQtd >= MAX_TOTAL) {
      abrirModal("Máximo de 4 ingressos permitido.");
      return;
    }

    setTickets((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, qtd: Math.max(0, t.qtd + delta) } : t,
      ),
    );
  }

  return (
    <>
      <div className="garantaing">
        <h2 className="titulo-lote">
          {loteAtual?.descricao || "Carregando..."}
          {" | "}
          {loteAtual?.saldo || 0}
          {" ingressos restantes"}
        </h2>

        <div className="box">
          {tickets.map((t, i) => (
            <div className="row" key={i}>
              <div className="label">
                {t.nome} - {formatar(t.preco)}
              </div>

              <div className="controls">
                <button className="btn-menos" onClick={() => alterar(i, -1)}>
                  -
                </button>
                <div className="qty">{t.qtd}</div>
                <button className="btn-mais" onClick={() => alterar(i, 1)}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="payment-method">
          <label>Escolha a forma de pagamento:</label>
          <div className="payment-options">
            <label>
              <input
                type="radio"
                name="payment"
                value="pix"
                checked={paymentMethod === 1}
                onChange={() => setPaymentMethod(1)}
              />
              PIX
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                value="dinheiro"
                checked={paymentMethod === 2}
                onChange={() => setPaymentMethod(2)}
              />
              Dinheiro
            </label>
          </div>
        </div>

        <div className="linha-total">
          <div className="total-label">
            <span>
              Total <strong>{totalQtd}</strong>
            </span>
            <span>{formatar(totalValor)}</span>
          </div>
        </div>

        <div className="prossegir-div">
          <button className="btn-prosseguir" onClick={VerificarPedidoPendente}>
            {carregando ? "Processando..." : "PROSSEGUIR"}
          </button>
        </div>
      </div>

      {modal &&
        (modalText ===
        "Você não está logado! Faça login para prosseguir com o pagamento." ? (
          <ModalTicket texto={modalText} fechar={fecharModal} />
        ) : (
          <Modal texto={modalText} fechar={fecharModal} />
        ))}
    </>
  );
}
