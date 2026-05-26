import { useState, useRef, useEffect } from "react";
import api from "../Services/api";
import "../styles/main.css";

function Formulario() {
  const [tipo, setTipo] = useState("");
  const [popup, setPopup] = useState(false);
  const [erros, setErros] = useState({});
  const [respostas, setRespostas] = useState({});
  const [perguntasApi, setPerguntasApi] = useState(null);
  const [loading, setLoading] = useState(true);

  const refsPerguntas = useRef({});

  useEffect(() => {
    async function fetchPerguntas() {
      try {
        const response = await api.get("/Pesquisa");

        const data = response.data.data || response.data;

        const organizadas = {
          comunidade: data.filter(
            (p) => Number(p.idTpUser) === 1
          ),

          colaboradores: data.filter(
            (p) => Number(p.idTpUser) === 2
          ),

          entidades: data.filter(
            (p) => Number(p.idTpUser) === 3
          ),
        };

        setPerguntasApi(organizadas);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchPerguntas();
  }, []);

  const selecionar = (perguntaId, valor) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: valor,
    }));

    setErros((prev) => {
      const novo = { ...prev };
      delete novo[perguntaId];
      return novo;
    });
  };

  const validar = () => {
    let novosErros = {};

    const perguntasObrigatorias =
      perguntasApi?.[tipo]?.filter(
        (p) => Number(p.tipoPergunta) !== 2
      ) || [];

    perguntasObrigatorias.forEach((p) => {
      if (!respostas[p.idPergunta]) {
        novosErros[p.idPergunta] = true;
      }
    });

    setErros(novosErros);

    return (
      Object.keys(novosErros).length === 0
    );
  };

  const enviarFormulario = async () => {
    if (!tipo) return;

    if (!validar()) return;

    try {
      const respostasFormatadas =
        Object.entries(respostas).map(
          ([idPergunta, resposta]) => ({
            idPergunta:
              Number(idPergunta),
            resposta,
          })
        );

      for (const item of respostasFormatadas) {
        await api.post(
          "/Pesquisa/registro-resposta",
          item
        );
      }

      setPopup(true);
    } catch (error) {
      console.error(
        error.response?.data || error
      );
    }
  };

  const gerarClasse = (op) => {
    return op
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  if (loading) {
    return <p>Carregando perguntas...</p>;
  }

  return (
    <div className="card_formulario">
      <h1 className="h1Form">
        Pesquisa de Satisfação
      </h1>

      <select
        className="selectForm"
        value={tipo}
        onChange={(e) => {
          setTipo(
            e.target.value
              .toLowerCase()
              .trim()
          );

          setRespostas({});
          setErros({});
        }}
      >
        <option value="" disabled>
          Escolha uma opção
        </option>

        <option value="comunidade">
          Cliente
        </option>

        <option value="colaboradores">
          Aluno que trabalhou na festa
        </option>

        <option value="entidades">
          Entidade
        </option>
      </select>

      {tipo === "comunidade" &&
        perguntasApi?.comunidade?.map(
          (p) => (
            <div
              key={p.idPergunta}
              ref={(el) =>
                (refsPerguntas.current[
                  p.idPergunta
                ] = el)
              }
              className={`fundo campos ${
                erros[p.idPergunta]
                  ? "error"
                  : ""
              }`}
            >
              <p>
                {p.descricaoPergunta}
              </p>

              {Number(p.tipoPergunta) === 2 ? (
                <textarea
                  className="Sugestao"
                  placeholder="Digite sua resposta..."
                  value={
                    respostas[p.idPergunta] ||
                    ""
                  }
                  onChange={(e) =>
                    selecionar(
                      p.idPergunta,
                      e.target.value
                    )
                  }
                />
              ) : (
                <div className="grupo-botoes">

                  {p.idPergunta === 38 ? (

                    Array.from(
                      { length: 10 },
                      (_, i) => i + 1
                    ).map((num) => (
                      <button
                        type="button"
                        key={num}
                        className={`btn-opcao btn-numero ${
                          respostas[
                            p.idPergunta
                          ] === String(num)
                            ? "ativo"
                            : ""
                        }`}
                        onClick={() =>
                          selecionar(
                            p.idPergunta,
                            String(num)
                          )
                        }
                      >
                        {num}
                      </button>
                    ))

                  ) : (

                    [
                      "Excelente",
                      "Ótimo",
                      "Boa",
                      "Regular",
                      "Ruim",
                    ].map((op) => (
                      <button
                        type="button"
                        key={op}
                        className={`btn-opcao btn-${gerarClasse(
                          op
                        )} ${
                          respostas[
                            p.idPergunta
                          ] === op
                            ? "ativo"
                            : ""
                        }`}
                        onClick={() =>
                          selecionar(
                            p.idPergunta,
                            op
                          )
                        }
                      >
                        {op}
                      </button>
                    ))

                  )}

                </div>
              )}
            </div>
          )
        )}

      {tipo === "colaboradores" &&
        perguntasApi?.colaboradores?.map(
          (p) => (
            <div
              key={p.idPergunta}
              ref={(el) =>
                (refsPerguntas.current[
                  p.idPergunta
                ] = el)
              }
              className={`fundo campos ${
                erros[p.idPergunta]
                  ? "error"
                  : ""
              }`}
            >
              <p>
                {p.descricaoPergunta}
              </p>

              {Number(p.tipoPergunta) === 2 ? (
                <textarea
                  className="Sugestao"
                  placeholder="Digite sua resposta..."
                  value={
                    respostas[p.idPergunta] ||
                    ""
                  }
                  onChange={(e) =>
                    selecionar(
                      p.idPergunta,
                      e.target.value
                    )
                  }
                />
              ) : (
                <div className="grupo-botoes">
                  {[
                    "Excelente",
                    "Ótimo",
                    "Boa",
                    "Regular",
                    "Ruim",
                  ].map((op) => (
                    <button
                      type="button"
                      key={op}
                      className={`btn-opcao btn-${gerarClasse(
                        op
                      )} ${
                        respostas[
                          p.idPergunta
                        ] === op
                          ? "ativo"
                          : ""
                      }`}
                      onClick={() =>
                        selecionar(
                          p.idPergunta,
                          op
                        )
                      }
                    >
                      {op}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        )}

      {tipo === "entidades" &&
        perguntasApi?.entidades?.map(
          (p, index) => {
            if (
              Number(p.tipoPergunta) === 2
            ) {
              return (
                <div
                  key={p.idPergunta}
                  className={`fundo campos ${
                    erros[p.idPergunta]
                      ? "error"
                      : ""
                  }`}
                >
                  <p>
                    {p.descricaoPergunta}
                  </p>

                  <textarea
                    className="Sugestao"
                    placeholder="Digite sua resposta..."
                    value={
                      respostas[
                        p.idPergunta
                      ] || ""
                    }
                    onChange={(e) =>
                      selecionar(
                        p.idPergunta,
                        e.target.value
                      )
                    }
                  />
                </div>
              );
            }

            const opcoes =
              index === 0
                ? [
                    "Sim",
                    "Talvez",
                    "Não",
                  ]
                : [
                    "Excelente",
                    "Ótimo",
                    "Boa",
                    "Regular",
                    "Ruim",
                  ];

            return (
              <div
                key={p.idPergunta}
                className={`fundo campos ${
                  erros[p.idPergunta]
                    ? "error"
                    : ""
                }`}
              >
                <p>
                  {p.descricaoPergunta}
                </p>

                <div className="grupo-botoes">
                  {opcoes.map((op) => (
                    <button
                      type="button"
                      key={op}
                      className={`btn-opcao btn-${gerarClasse(
                        op
                      )} ${
                        respostas[
                          p.idPergunta
                        ] === op
                          ? "ativo"
                          : ""
                      }`}
                      onClick={() =>
                        selecionar(
                          p.idPergunta,
                          op
                        )
                      }
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>
            );
          }
        )}

      {tipo && (
        <button
          className="buttonForm"
          onClick={enviarFormulario}
        >
          Enviar
        </button>
      )}

      {popup && (
        <div className="popup">
          <div className="popup-content">
            <p>
              Formulário enviado com
              sucesso
            </p>

            <button
              onClick={() => {
                setPopup(false);
                setTipo("");
                setErros({});
                setRespostas({});
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Formulario;