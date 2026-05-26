import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import Reserva from "../components/Reserva/Reserva";
import Pix from "../components/PagamentoPix/Pix";
import Dinheiro from "../components/PagamentoDinheiro/Dinheiro";
import Api, { BLOB_COMPROVANTES_URL } from "../services/api";
import "../services/auth";
import Ingressos from "../components/Tickets/Tickets";

export default function MeusIngressos() {
  const [showPix, setShowPix] = useState(false);
  const [showDinheiro, setShowDinheiro] = useState(false);
  const [ingressos, setIngressos] = useState([]);
  const [valorPendente, setValorTotalPendente] = useState();
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null); 

  const navigate = useNavigate();

  function fecharModal() {
    console.log("Fechando modal - showDinheiro:", showDinheiro, "showPix:", showPix);
    setShowPix(false);
    setShowDinheiro(false)
    setPedidoSelecionado(null);
  }

  function SemLogin() {
    navigate("/loginUsuarios");
  }

  const ENDPOINT_LISTAR_INGRESSOS = "Ingresso/BuscarIngressoPorUsuario";
  
  const existePedidoPendente = ingressos.some(ingresso => ingresso.pedidoIdStatus === 1);

  const ingressosPendentes = ingressos.filter(ingresso => ingresso.pedidoIdStatus === 1); 
  
  const ComprovanteDoPedido = ingressos.find(ingresso => ingresso.pedidoFtComprovante);
  
  const pedidosAgrupados = ingressos.reduce((acumulador, ingresso) => {
    if (ingresso.pedidoFtComprovante) {
      if (!acumulador[ingresso.idPedido]) {
        acumulador[ingresso.idPedido] = {
          idPedido: ingresso.idPedido,
          pedidoFtComprovante: ingresso.pedidoFtComprovante,
          ingressos: []
        };
      }
      acumulador[ingresso.idPedido].ingressos.push(ingresso);
    }
    return acumulador;
  }, {});

  const pedidosComComprovante = Object.values(pedidosAgrupados);
  
  const valorTotalPendenteCalculado = ingressosPendentes.reduce(
    (total, ingresso) => total + (ingresso.valor ?? ingresso.Valor ?? 0),
    0,
  );

  const tokenString = localStorage.getItem("usuario");
  let tokenObj = null;
  try {
    tokenObj = tokenString ? JSON.parse(tokenString) : null;
  } catch (error) {
    console.warn("Erro ao ler token do localStorage:", error);
    tokenObj = null;
  }
  const token = tokenObj?.token ?? localStorage.getItem("token") ?? null;

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

  async function abrirModalPagamento() {
    try {
      const response = await Api.get(ENDPOINT_LISTAR_INGRESSOS, {
        params: {
          idUsuario: IdUsuario,
          cache: Date.now(),
        },
      });

      const ingressosAtualizados = response.data ?? [];

      const ingressoPendente = ingressosAtualizados.find(
        (ingresso) => Number(ingresso.pedidoIdStatus) === 1
      );

      if (!ingressoPendente) {
        alert("Você não possui pedido pendente para pagar.");
        return;
      }

      const tipoPagamento = Number(ingressoPendente.pedidoTipoPagamento);

      setPedidoSelecionado(ingressoPendente);

      let DescricaoPagamento = "";

      if (tipoPagamento === 1) {
        DescricaoPagamento = "Pix";
        setShowPix(true);
        return;
      }

      if (tipoPagamento === 2) {
        DescricaoPagamento = "Dinheiro";
        setShowDinheiro(true);
        return;
      }

      alert("Tipo de pagamento não encontrado no ingresso.");
    } catch (error) {
      console.error("Erro ao abrir pagamento:", error);
      alert("Erro ao buscar informações do pagamento.");
    }
  }

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

  async function getIngressos() {
    if (!token) {
      console.warn("Usuário não logado, pulando busca de ingressos.");
      navigate("/loginUsuarios");
      return;
    }

    try {
      const response = await Api.get(ENDPOINT_LISTAR_INGRESSOS, {
        params: {
          idUsuario: IdUsuario,
          cache: Date.now(),
        },
      });

      setIngressos(response.data ?? []);
    } catch (error) {
      console.error("Erro ao buscar ingressos:", error);
    }
  }

  useEffect(() => {
  async function carregarDados() {
    await getValorTotalPendente();
    await getIngressos();
  }
  carregarDados();
}, []);

  return (
    <>
      <Header />

      <main className={showPix || showDinheiro ? "blur-content" : ""}>
        <h2 className="titleMeusIngressos">Meus Ingressos</h2>

        <div className="PHIngressos">
          {!token ? (
            <p className="sem-ingressos">
              Você precisa estar logado para ver seus ingressos.
            </p>
          ) : ingressos.length === 0 ? (
            <p className="sem-ingressos">
              Você não possui ingressos cadastrados.
            </p>
          ) : (
            ingressos.map((ingresso) => (
              <Reserva item={ingresso} key={ingresso.idIngresso} />
            ))
          )}
        </div>

        {pedidosComComprovante.length > 0 && (
          <div className="comprovante">
            <h4 className="titleComprovante">Comprovante do Pedido:</h4>
            <a 
              href={`${BLOB_COMPROVANTES_URL}${ComprovanteDoPedido.pedidoFtComprovante}`}
              target="_blank" 
              rel="noopener noreferrer"
            >
              Ver Comprovante
            </a>
            <p className="Palert">Aguarde a validação do comprovante para realização de um novo pedido caso necessario</p>
          </div>
        )}

        {existePedidoPendente && (
          <div className="btn-Pagar">
            <h4 className="valorTotal" style={{ marginRight: "10px" }}>
              Valor Pendente: R${" "}
              {(valorPendente ?? valorTotalPendenteCalculado ?? 0).toFixed(2)}
            </h4>

            <button onClick={abrirModalPagamento} className="botaopagar">
              Pagar
            </button>
          </div>
        )}
      </main>

      <Footer />

      {showPix && pedidoSelecionado && (
        <Pix
          item={pedidoSelecionado}
          key={pedidoSelecionado.idPedido}
          onClose={fecharModal}
        />
      )}

      {showDinheiro && pedidoSelecionado && (
        <Dinheiro item={pedidoSelecionado} onClose={fecharModal} />
      )}
    </>
  );
}