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

  const lotesFiltradosPorLote = useMemo(() => {
    if (!filtroLote) return lotes;

    return lotes.filter(
      (lote) => Number(lote.idLote) === Number(filtroLote),
    );
  }, [lotes, filtroLote]);

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

  const obterStatusValidacaoIngresso = (ingresso) => {
    const statusNormalizado = Number(
      ingresso?.idStatusValidacao ??
        ingresso?.IdStatusValidacao ??
        ingresso?.id_status_validacao,
    );

    if (Number.isFinite(statusNormalizado)) {
      return statusNormalizado;
    }

    if (ingresso?.status_validacao === true) {
      return 3;
    }

    if (ingresso?.status_validacao === false) {
      return 2;
    }

    return 0;
  };

  const ingressosAtivos = useMemo(() => {
    return ingressosFiltradosPorLote.filter(
      (ingresso) =>
        obterStatusValidacaoIngresso(ingresso) !== 4,
    );
  }, [ingressosFiltradosPorLote]);

  const totalIngressosCancelados = useMemo(() => {
    return ingressosFiltradosPorLote.filter(
      (ingresso) =>
        obterStatusValidacaoIngresso(ingresso) === 4,
    ).length;
  }, [ingressosFiltradosPorLote]);

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

  const dadosStatusIngressos = useMemo(() => {
    const contador = {
      invalido: 0,
      valido: 0,
      utilizado: 0,
      cancelados: 0,
      outros: 0,
    };

    ingressosFiltradosPorLote.forEach((ingresso) => {
      const status = obterStatusValidacaoIngresso(ingresso);

      if (status === 1) contador.invalido += 1;
      else if (status === 2) contador.valido += 1;
      else if (status === 3)
        contador.utilizado += 1;
      else if (status === 4)
        contador.cancelados += 1;
      else contador.outros += 1;
    });

    return [
      {
        nome: "Inválido",
        valor: contador.invalido,
      },
      { nome: "Válido", valor: contador.valido },
      {
        nome: "Utilizado",
        valor: contador.utilizado,
      },
      {
        nome: "Cancelado",
        valor: contador.cancelados,
      },
      { nome: "Outros", valor: contador.outros },
    ];
  }, [ingressosFiltradosPorLote]);

  const dadosLotesDisponibilidade = useMemo(() => {
    const vendidosPorLote = {};

    ingressosAtivos.forEach((ingresso) => {
      const idLote = Number(ingresso.idLote);
      vendidosPorLote[idLote] =
        (vendidosPorLote[idLote] || 0) + 1;
    });

    const dados = [];

    lotesFiltradosPorLote.forEach((lote) => {
      const idLote = Number(lote.idLote);
      const nomeLote =
        lote.descricao || `Lote ${idLote}`;

      const vendidos = Number(vendidosPorLote[idLote] || 0);
      const disponiveis = Math.max(
        Number(lote.qtdeIngressosLotes || 0) - vendidos,
        0,
      );

      dados.push({
        nome: `${nomeLote} - Vendidos/Reservados`,
        valor: vendidos,
        tipo: "vendidos",
      });

      dados.push({
        nome: `${nomeLote} - Disponíveis`,
        valor: disponiveis,
        tipo: "disponiveis",
      });
    });

    return dados;
  }, [ingressosAtivos, lotesFiltradosPorLote]);

  const dadosTipos = useMemo(() => {
    const tiposMap = {
      1: "Família",
      2: "Colaborador",
      3: "Comunidade",
      4: "Aluno",
      5: "Infantil",
    };

    const agrupado = {};

    ingressosAtivos.forEach((ingresso) => {
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
  }, [ingressosAtivos]);

  const dadosUtilizacao = useMemo(() => {
    return [
      {
        nome: "Utilizados",
        valor: ingressosFiltradosPorLote.filter(
          (i) =>
            obterStatusValidacaoIngresso(i) === 3,
        ).length,
      },
      {
        nome: "Não utilizados",
        valor: ingressosFiltradosPorLote.filter(
          (i) => {
            const status =
              obterStatusValidacaoIngresso(i);

            return status === 1 || status === 2;
          },
        ).length,
      },
      {
        nome: "Cancelados",
        valor: ingressosFiltradosPorLote.filter(
          (i) =>
            obterStatusValidacaoIngresso(i) === 4,
        ).length,
      },
    ];
  }, [ingressosFiltradosPorLote]);

  const totalIngressosDisponiveis = useMemo(() => {
    return lotesFiltradosPorLote.reduce(
      (acc, lote) => acc + Number(lote.qtdeIngressosLotes || 0),
      0,
    );
  }, [lotesFiltradosPorLote]);

  const ingressosVendidosOuReservados =
    ingressosAtivos.length;

  const ingressosNaoVendidos = Math.max(
    totalIngressosDisponiveis - ingressosVendidosOuReservados,
    0,
  );

  const dadosVisaoGeralIngressos = useMemo(() => {
    return [
      {
        nome: "Vendidos/Reservados",
        valor: ingressosVendidosOuReservados,
      },
      {
        nome: "Não vendidos",
        valor: ingressosNaoVendidos,
      },
    ];
  }, [
    ingressosVendidosOuReservados,
    ingressosNaoVendidos,
  ]);

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
    value,
    payload,
  }) => {
    const valorAbsoluto = Number(
      value ?? payload?.valor ?? 0,
    );

    return `${(percent * 100).toFixed(1)}%, ${valorAbsoluto}`;
  };

  const renderTooltipSomenteRotulo = ({
    active,
    payload,
  }) => {
    if (!active || !payload?.length) {
      return null;
    }

    const nome = payload[0]?.name || "";
    const cor = payload[0]?.color || "#0f172a";

    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "8px 10px",
          color: cor,
          fontWeight: 600,
          boxShadow:
            "0 8px 18px rgba(15, 23, 42, 0.12)",
        }}
      >
        {nome}
      </div>
    );
  };

  const prepararDadosGrafico = (dados) => {
    const dadosComValor = dados.filter(
      (item) => Number(item.valor) > 0,
    );

    const total = dadosComValor.reduce(
      (acc, curr) => acc + Number(curr.valor || 0),
      0,
    );

    return dadosComValor.map((item) => ({
      ...item,
      total,
    }));
  };

  const possuiDadosStatusIngressos =
    dadosStatusIngressos.some(
      (item) => item.valor > 0,
    );

  const possuiDadosLotesDisponibilidade =
    dadosLotesDisponibilidade.some(
    (item) => item.valor > 0,
    );

  const getCorLotesDisponibilidade = (
    item,
    index,
  ) => {
    if (item?.tipo === "disponiveis") {
      return "#94a3b8";
    }

    return COLORS[index % COLORS.length];
  };

  const possuiDadosTipos = dadosTipos.some(
    (item) => item.valor > 0,
  );

  const possuiDadosUtilizacao =
    dadosUtilizacao.some(
      (item) => item.valor > 0,
    );

  const possuiDadosVisaoGeralIngressos =
    dadosVisaoGeralIngressos.some(
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
                  {ingressosAtivos.length}
                </p>

                <span className="subvalor_card_dashboard">
                  de {totalIngressosDisponiveis} disponíveis
                </span>

                <span className="subvalor_card_dashboard">
                  cancelados: {totalIngressosCancelados}
                </span>
              </div>

              <FaTicketAlt className="icone-card" />
            </div>
          </section>
        )}

        {!mostrarPesquisas ? (
          <section className="dashboard-grid">
  <div className="grafico-card">
    <h3>Status dos ingressos</h3>

    <div className="grafico-container">
      {possuiDadosStatusIngressos ? (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={prepararDadosGrafico(
                dadosStatusIngressos,
              )}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={60}
              paddingAngle={4}
              label={renderPercentLabel}
            >
              {prepararDadosGrafico(
                dadosStatusIngressos,
              ).map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
            </Pie>

            <Tooltip content={renderTooltipSomenteRotulo} />

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
    <h3>Ingressos por lotes (vendidos x disponíveis)</h3>

    <div className="grafico-container">
      {possuiDadosLotesDisponibilidade ? (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={prepararDadosGrafico(
                dadosLotesDisponibilidade,
              )}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={60}
              paddingAngle={4}
              label={renderPercentLabel}
            >
              {prepararDadosGrafico(
                dadosLotesDisponibilidade,
              ).map((entry, index) => (
                  <Cell
                    key={index}
                    fill={getCorLotesDisponibilidade(
                      entry,
                      index,
                    )}
                  />
                ))}
            </Pie>

            <Tooltip content={renderTooltipSomenteRotulo} />

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
              data={prepararDadosGrafico(
                dadosTipos,
              )}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={60}
              paddingAngle={4}
              label={renderPercentLabel}
            >
              {prepararDadosGrafico(
                dadosTipos,
              ).map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
            </Pie>

            <Tooltip content={renderTooltipSomenteRotulo} />

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
              data={prepararDadosGrafico(
                dadosUtilizacao,
              )}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={60}
              paddingAngle={4}
              label={renderPercentLabel}
            >
              {prepararDadosGrafico(
                dadosUtilizacao,
              ).map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
            </Pie>

            <Tooltip content={renderTooltipSomenteRotulo} />

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

  {/*
  <div className="grafico-card">
    <h3>Visão geral dos ingressos</h3>

    <div className="grafico-container">
      {possuiDadosVisaoGeralIngressos ? (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={prepararDadosGrafico(
                dadosVisaoGeralIngressos,
              )}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={60}
              paddingAngle={4}
              label={renderPercentLabel}
            >
              {prepararDadosGrafico(
                dadosVisaoGeralIngressos,
              ).map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip content={renderTooltipSomenteRotulo} />

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
  */}
</section>
        ) : null}
      </main>

      <Footer />
    </>
  );
}