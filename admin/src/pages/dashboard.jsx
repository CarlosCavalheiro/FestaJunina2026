import React, { useEffect, useMemo, useState } from "react";

import api from "../services/api";

import Header from "../components/header";
import Footer from "../components/footer";

import "../styles/dashboard.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaUsers,
  FaTicketAlt,
} from "react-icons/fa";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ingressos, setIngressos] = useState([]);
  const [respostas, setRespostas] = useState([]);

  const [lotes, setLotes] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const [filtroTipoUsuario, setFiltroTipoUsuario] = useState("");
  const [mostrarPesquisas, setMostrarPesquisas] = useState(false);
  const [filtroLote, setFiltroLote] = useState("");

  const [filtroReceita, setFiltroReceita] = useState("total");

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    try {
      setCarregando(true);
      setErro(false);

      let pedidosData = [];
      let usuariosData = [];
      let ingressosData = [];
      let perguntasData = [];
      let lotesData = [];

      try {
        const response = await api.get("/Lotes/ListarLotes");
        if (Array.isArray(response.data)) {
          lotesData = response.data;
        }
      } catch (error) {
        console.log("Erro ao carregar lotes da API:", error);
      }

      try {
        const response = await api.get("/Pedidos/ListarPedidos");
        pedidosData = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.log("Erro pedidos:", error);
      }

      try {
        const response = await api.get("/Usuario/ListarUsuarios");
        usuariosData = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.log("Erro usuarios:", error);
      }

      try {
        const response = await api.get("/Ingresso/ListarIngressos");
        ingressosData = Array.isArray(response.data)
          ? response.data
          : [];
      } catch (error) {
        console.log("Erro ingressos:", error);
      }

      try {
        const response = await api.get("/Pesquisa");
        perguntasData = Array.isArray(response.data)
          ? response.data
          : [];
      } catch (error) {
        console.log("Erro pesquisa:", error);
      }

      setPedidos(pedidosData);
      setUsuarios(usuariosData);
      setIngressos(ingressosData);
      setLotes(lotesData);

      const respostasTemp = [];

      for (const pergunta of perguntasData) {
        try {
          const respostaResponse = await api.get(
            `/Pesquisa/resposta-por-idpergunta?idPergunta=${pergunta.idPergunta}`,
          );

          respostasTemp.push({
            idPergunta: pergunta.idPergunta,
            pergunta: pergunta.descricaoPergunta,
            tipoPergunta: pergunta.tipoPergunta,
            idTpUser: pergunta.idTpUser,
            respostas: Array.isArray(respostaResponse.data)
              ? respostaResponse.data
              : [],
          });
        } catch (error) {
          console.log("Erro respostas:", error);
        }
      }

      setRespostas(respostasTemp);
    } catch (error) {
      console.log(error);
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }

  const ingressosFiltradosPorLote = useMemo(() => {
    if (!filtroLote) return ingressos;

    return ingressos.filter(
      (i) => Number(i.idLote) === Number(filtroLote),
    );
  }, [ingressos, filtroLote]);

  const pedidosFiltradosPorLote = useMemo(() => {
    if (!filtroLote) return pedidos;

    const idsPedidosDoLote = new Set(
      ingressosFiltradosPorLote
        .map((i) => i.idPedido)
        .filter((id) => id !== undefined && id !== null),
    );

    return pedidos.filter((p) =>
      idsPedidosDoLote.has(p.idPedido),
    );
  }, [
    pedidos,
    ingressosFiltradosPorLote,
    filtroLote,
  ]);

  const pedidosPendentes = useMemo(() => {
    return pedidosFiltradosPorLote.filter(
      (p) => Number(p.idStatus) === 1,
    ).length;
  }, [pedidosFiltradosPorLote]);

  const pedidosPagos = useMemo(() => {
    return pedidosFiltradosPorLote.filter(
      (p) => Number(p.idStatus) === 2,
    ).length;
  }, [pedidosFiltradosPorLote]);

  const pedidosCancelados = useMemo(() => {
    return pedidosFiltradosPorLote.filter(
      (p) => Number(p.idStatus) === 3,
    ).length;
  }, [pedidosFiltradosPorLote]);

  const valorTotalPago = useMemo(() => {
    return pedidosFiltradosPorLote
      .filter((p) => {
        const status = Number(p.idStatus);

        if (filtroReceita === "esperada") {
          return status === 1;
        } else if (filtroReceita === "confirmada") {
          return status === 2;
        } else {
          return status === 1 || status === 2;
        }
      })
      .reduce(
        (acc, item) => acc + Number(item.valor || 0),
        0,
      );
  }, [pedidosFiltradosPorLote, filtroReceita]);

  const dadosPedidos = [
    { nome: "Pendentes", valor: pedidosPendentes },
    { nome: "Pagos", valor: pedidosPagos },
    { nome: "Cancelados", valor: pedidosCancelados },
  ];

  const dadosLotes = useMemo(() => {
    const agrupado = {};

    ingressosFiltradosPorLote.forEach((ingresso) => {
      const loteEncontrado = lotes.find(
        (l) =>
          Number(l.idLote) === Number(ingresso.idLote),
      );

      const nomeLote =
        loteEncontrado?.descricao ||
        ingresso?.lote?.descricao ||
        `Lote ${ingresso?.idLote || "Sem lote"}`;

      agrupado[nomeLote] =
        (agrupado[nomeLote] || 0) + 1;
    });

    return Object.entries(agrupado).map(
      ([nome, valor]) => ({
        nome,
        valor,
      }),
    );
  }, [ingressosFiltradosPorLote, lotes]);

  const dadosTipos = useMemo(() => {
    const tiposMap = {
      1: "Família",
      2: "Colaborador",
      3: "Comunidade",
      4: "Aluno",
      5: "Infantil",
    };

    const agrupado = {};

    ingressosFiltradosPorLote.forEach((ingresso) => {
      const nomeTipo =
        tiposMap[Number(ingresso?.idTipo)] ||
        `Tipo ${ingresso?.idTipo || "Desconhecido"}`;

      agrupado[nomeTipo] =
        (agrupado[nomeTipo] || 0) + 1;
    });

    return Object.entries(agrupado).map(
      ([nome, valor]) => ({
        nome,
        valor,
      }),
    );
  }, [ingressosFiltradosPorLote]);

  const dadosUtilizacao = useMemo(() => {
    return [
      {
        nome: "Utilizados",
        valor: ingressosFiltradosPorLote.filter(
          (i) => i.status_validacao === true,
        ).length,
      },
      {
        nome: "Não utilizados",
        valor: ingressosFiltradosPorLote.filter(
          (i) => i.status_validacao !== true,
        ).length,
      },
    ];
  }, [ingressosFiltradosPorLote]);

  const perguntasFiltradas = useMemo(() => {
    if (!filtroTipoUsuario) return respostas;

    return respostas.filter(
      (item) =>
        Number(item.idTpUser) ===
        Number(filtroTipoUsuario),
    );
  }, [respostas, filtroTipoUsuario]);

  const formatarDadosAlternativas = (
    respostasLista,
  ) => {
    const contagem = {};

    respostasLista.forEach((resp) => {
      const textoResposta =
        resp.resposta || "Sem resposta";

      contagem[textoResposta] =
        (contagem[textoResposta] || 0) + 1;
    });

    return Object.entries(contagem).map(
      ([nome, valor]) => ({
        nome,
        valor,
      }),
    );
  };

  const renderPercentLabel = ({
    percent,
    nome,
  }) => `${nome}: ${(percent * 100).toFixed(1)}%`;

  const renderTooltipPercent = (
    value,
    name,
    props,
  ) => {
    const total =
      props.payload?.payload?.total || 0;

    const porcentagem =
      total > 0
        ? ((value / total) * 100).toFixed(1)
        : 0;

    return [`${porcentagem}%`, name];
  };

  const possuiDadosGrafico = dadosPedidos.some(
    (item) => item.valor > 0,
  );

  const possuiDadosLotes = dadosLotes.some(
    (item) => item.valor > 0,
  );

  const possuiDadosTipos = dadosTipos.some(
    (item) => item.valor > 0,
  );

  const possuiDadosUtilizacao =
    dadosUtilizacao.some(
      (item) => item.valor > 0,
    );

  const COLORS = [
    "#f59e0b",
    "#14b8a6",
    "#8b5cf6",
    "#ef4444",
    "#3b82f6",
    "#f97316",
  ];

  if (carregando) {
    return (
      <>
        <Header />

        <main className="main_dashboard">
          <div className="loading_dashboard">
            Carregando dashboard...
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (erro) {
    return (
      <>
        <Header />

        <main className="main_dashboard">
          <div className="erro_dashboard">
            Erro ao carregar dashboard
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="main_dashboard">
        <div className="topo_dashboard">
          <div>
            <h1 className="titulo_dashboard">
              Dashboard
            </h1>

            <p className="subtitulo_dashboard">
              Painel geral do sistema
            </p>
          </div>

          <div className="acoes_topo_dashboard">
            <button
              className="botao_toggle_dashboard"
              onClick={() =>
                setMostrarPesquisas(
                  !mostrarPesquisas,
                )
              }
            >
              {mostrarPesquisas
                ? "Ver gráficos gerais"
                : "Ver pesquisas"}
            </button>

            {mostrarPesquisas && (
              <select
                className="select_dashboard"
                value={filtroTipoUsuario}
                onChange={(e) =>
                  setFiltroTipoUsuario(
                    e.target.value,
                  )
                }
              >
                <option value="">
                  Todos os usuários
                </option>

                <option value="1">
                  Cliente
                </option>

                <option value="2">
                  Colaborador
                </option>

                <option value="3">
                  Entidade
                </option>
              </select>
            )}

            {!mostrarPesquisas && (
              <>
                <select
                  className="select_dashboard"
                  value={filtroReceita}
                  onChange={(e) =>
                    setFiltroReceita(
                      e.target.value,
                    )
                  }
                  style={{
                    marginLeft: "10px",
                  }}
                >
                  <option value="total">
                    Receita total
                  </option>

                  <option value="esperada">
                    Receita esperada
                  </option>

                  <option value="confirmada">
                    Receita confirmada
                  </option>
                </select>

                <select
                  className="select_dashboard"
                  value={filtroLote}
                  onChange={(e) =>
                    setFiltroLote(
                      e.target.value,
                    )
                  }
                  style={{
                    marginLeft: "10px",
                  }}
                >
                  <option value="">
                    Todos os lotes
                  </option>

                  {lotes.map((lote) => (
                    <option
                      key={lote.idLote}
                      value={lote.idLote}
                    >
                      {lote.descricao ||
                        `Lote ${lote.idLote}`}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {!mostrarPesquisas && (
          <section className="cards-dashboard">
            <div className="card-dashboard receita">
              <div>
                <h4>
                  {filtroReceita ===
                    "esperada" &&
                    "Receita esperada"}

                  {filtroReceita ===
                    "confirmada" &&
                    "Receita confirmada"}

                  {filtroReceita ===
                    "total" &&
                    "Valor arrecadado"}
                </h4>

                <p>
                  R${" "}
                  {valorTotalPago.toFixed(2)}
                </p>
              </div>

              <FaMoneyBillWave className="icone-card" />
            </div>

            <div className="card-dashboard pedidos">
              <div>
                <h4>Total de pedidos</h4>

                <p>
                  {
                    pedidosFiltradosPorLote.length
                  }
                </p>
              </div>

              <FaShoppingCart className="icone-card" />
            </div>

            <div className="card-dashboard usuarios">
              <div>
                <h4>Total de usuários</h4>

                <p>{usuarios.length}</p>
              </div>

              <FaUsers className="icone-card" />
            </div>

            <div className="card-dashboard ingressos">
              <div>
                <h4>
                  Total de ingressos
                </h4>

                <p>
                  {
                    ingressosFiltradosPorLote.length
                  }
                </p>
              </div>

              <FaTicketAlt className="icone-card" />
            </div>
          </section>
        )}

        {!mostrarPesquisas ? (
          <section className="dashboard-grid">
  <div className="grafico-card">
    <h3>Status dos pedidos</h3>

    <div className="grafico-container">
      {possuiDadosGrafico ? (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={dadosPedidos
                .filter((item) => item.valor > 0)
                .map((item) => ({
                  ...item,
                  total: dadosPedidos.reduce(
                    (acc, curr) => acc + curr.valor,
                    0,
                  ),
                }))}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={60}
              paddingAngle={4}
              label={renderPercentLabel}
            >
              {dadosPedidos
                .filter((item) => item.valor > 0)
                .map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
            </Pie>

            <Tooltip formatter={renderTooltipPercent} />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="sem_dados_dashboard">
          Nenhum dado disponível.
        </div>
      )}
    </div>
  </div>

  <div className="grafico-card">
    <h3>Ingressos por Lotes</h3>

    <div className="grafico-container">
      {possuiDadosLotes ? (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={dadosLotes
                .filter((item) => item.valor > 0)
                .map((item) => ({
                  ...item,
                  total: dadosLotes.reduce(
                    (acc, curr) => acc + curr.valor,
                    0,
                  ),
                }))}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={60}
              paddingAngle={4}
              label={renderPercentLabel}
            >
              {dadosLotes
                .filter((item) => item.valor > 0)
                .map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
            </Pie>

            <Tooltip formatter={renderTooltipPercent} />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="sem_dados_dashboard">
          Nenhum dado disponível.
        </div>
      )}
    </div>
  </div>

  <div className="grafico-card">
    <h3>Ingressos por Tipo</h3>

    <div className="grafico-container">
      {possuiDadosTipos ? (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={dadosTipos
                .filter((item) => item.valor > 0)
                .map((item) => ({
                  ...item,
                  total: dadosTipos.reduce(
                    (acc, curr) => acc + curr.valor,
                    0,
                  ),
                }))}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={60}
              paddingAngle={4}
              label={renderPercentLabel}
            >
              {dadosTipos
                .filter((item) => item.valor > 0)
                .map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
            </Pie>

            <Tooltip formatter={renderTooltipPercent} />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="sem_dados_dashboard">
          Nenhum dado disponível.
        </div>
      )}
    </div>
  </div>

  <div className="grafico-card">
    <h3>Utilização de Ingressos</h3>

    <div className="grafico-container">
      {possuiDadosUtilizacao ? (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={dadosUtilizacao
                .filter((item) => item.valor > 0)
                .map((item) => ({
                  ...item,
                  total: dadosUtilizacao.reduce(
                    (acc, curr) => acc + curr.valor,
                    0,
                  ),
                }))}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={60}
              paddingAngle={4}
              label={renderPercentLabel}
            >
              {dadosUtilizacao
                .filter((item) => item.valor > 0)
                .map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
            </Pie>

            <Tooltip formatter={renderTooltipPercent} />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="sem_dados_dashboard">
          Nenhum dado disponível.
        </div>
      )}
    </div>
  </div>
</section>
        ) : null}
      </main>

      <Footer />
    </>
  );
}