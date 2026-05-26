import "../styles/usuarios.css";
import { useEffect, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import api from "../services/api";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Usuarios() {
  const [search, setSearch] = useState("");
  const [perfil, setPerfil] = useState("");
  const [usuarios, setUsuario] = useState([]);

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [popup, setPopup] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");

  async function GetUser() {
    let dados = await api.get("/Usuario/ListarUsuarios");
    setUsuario(dados.data);
  }

  function handleEdit(usuario) {
    setUsuarioEditando({
      ...usuario,
      IdPerfil: Number(usuario.perfil?.id || usuario.perfil?.idPerfil),
    });

    setModalOpen(true);
  }

  async function alterarStatus(usuario) {
    try {
      await api.put(`/Usuario/AlterarStatus?id=${usuario.idUsuario}`, {
        status: !usuario.status,
      });

      setUsuario((prev) =>
        prev.map((u) =>
          u.idUsuario === usuario.idUsuario ? { ...u, status: !u.status } : u,
        ),
      );

      setMensagemPopup(
        usuario.status
          ? "Usuário desativado com sucesso!"
          : "Usuário ativado com sucesso!",
      );

      setPopup(true);
    } catch (error) {
      console.log(error.response?.data);
      console.log(error);

      setMensagemPopup("Erro ao alterar status!");
      setPopup(true);
    }
  }

  useEffect(() => {
    GetUser();
  }, []);

  const filtrados = usuarios.filter((u) => {
    return (
      u.nome?.toLowerCase().includes(search.toLowerCase()) &&
      (perfil === "" || u.perfil?.descricao === perfil)
    );
  });

  return (
    <>
      <Header />

      <main>
        <div className="container_usuarios">
          <h4 className="h4_usuarios">Usuários cadastrados</h4>

          <div className="filters_usuarios">
            <input
              id="search"
              type="search"
              placeholder="Pesquisar por nome de usuário"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
              <option value="">Filtrar por...</option>
              <option value="Administrador">Administrador</option>
              <option value="Portaria">Portaria</option>
              <option value="Cliente">Cliente</option>
            </select>
          </div>

          <div className="table_responsive_usuarios">
            <table className="table table-striped table_usuarios">
              <thead>
                <tr>
                  <th className="th_usuarios">Nome Completo</th>
                  <th className="th_usuarios">Email</th>
                  <th className="th_usuarios">Telefone</th>
                  <th className="th_usuarios">Perfil</th>
                  <th className="th_usuarios">Deficiência</th>
                  <th className="th_usuarios">Status</th>
                  <th className="th_usuarios">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.length > 0 ? (
                  filtrados.map((u) => (
                    <tr key={u.idUsuario || u.email} className="tr_usuarios">
                      <td>{u.nome}</td>
                      <td>{u.email}</td>
                      <td>{u.telefone}</td>

                      <td>{u.perfil.descricao}</td>

                      <td>
                        {u.possuiDeficiencia && u.tipoDeficiencia ? (
                          <button
                            className="btn_link_deficiencia"
                            onClick={() => {
                              setMensagemPopup(
                                `Deficiência: ${u.tipoDeficiencia}`,
                              );
                              setPopup(true);
                            }}
                          >
                            Ver deficiência
                          </button>
                        ) : (
                          <span className="text-secondary">Não possui</span>
                        )}
                      </td>

                      <td>
                        {u.status ? (
                          <span className="text-success fw-bold">Ativo</span>
                        ) : (
                          <span className="text-danger fw-bold">Inativo</span>
                        )}
                      </td>

                      <td>
                        <div className="acoes_usuarios">
                          <button
                            className="btn btn-outline-warning"
                            onClick={() => handleEdit(u)}
                          >
                            Editar
                          </button>

                          <button
                            className={
                              u.status
                                ? "btn btn-outline-danger btn-status"
                                : "btn btn-outline-success btn-status"
                            }
                            onClick={() => alterarStatus(u)}
                          >
                            {u.status ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="td_empty_usuarios">
                      Nenhum dado encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {popup && (
        <div className="popup_usuarios">
          <div className="popup_content_usuarios container_usuarios">
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

      {modalOpen && (
        <div
          className="popupEditar_usuarios"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="popup_contentEditar_usuarios container_usuarios"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Editar Usuário</h3>

            <label>Nome</label>
            <input
              value={usuarioEditando?.nome || ""}
              onChange={(e) =>
                setUsuarioEditando((prev) => ({
                  ...prev,
                  nome: e.target.value,
                }))
              }
            />

            <label>Email</label>
            <input
              value={usuarioEditando?.email || ""}
              onChange={(e) =>
                setUsuarioEditando((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />

            <div>
              <label>Senha</label>

              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Deixe em branco para manter a atual"
                  value={usuarioEditando?.novaSenha || ""}
                  onChange={(e) =>
                    setUsuarioEditando((prev) => ({
                      ...prev,
                      novaSenha: e.target.value,
                    }))
                  }
                />

                <button
                  type="button"
                  className="btn_olho_usuarios"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  <i
                    className={mostrarSenha ? "bi bi-eye-slash" : "bi bi-eye"}
                  />
                </button>
              </div>
            </div>

            <label>Telefone</label>
            <input
              value={usuarioEditando?.telefone || ""}
              onChange={(e) =>
                setUsuarioEditando((prev) => ({
                  ...prev,
                  telefone: e.target.value,
                }))
              }
            />

            <label>Perfil</label>
            <select
              value={usuarioEditando?.idPerfil ?? ""}
              onChange={(e) =>
                setUsuarioEditando((prev) => ({
                  ...prev,
                  IdPerfil: Number(e.target.value),
                }))
              }
            >
              <option value={1}>Administrador</option>
              <option value={2}>Portaria</option>
              <option value={3}>Cliente</option>
            </select>

            <div className="modal_actions_usuarios">
              <button
                className="btn btn-outline-danger"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>

              <button
                className="btn btn-outline-success"
                onClick={async () => {
                  try {
                    const body = {
                      nome: usuarioEditando.nome,
                      email: usuarioEditando.email,
                      senha: usuarioEditando.novaSenha || "",
                      telefone: usuarioEditando.telefone,
                      idPerfil: Number(usuarioEditando.IdPerfil),
                    };

                    await api.put(
                      `/Usuario/EditarUsuario?id=${usuarioEditando.idUsuario}`,
                      body,
                    );

                    setModalOpen(false);

                    setMensagemPopup("Usuário atualizado com sucesso!");
                    setPopup(true);

                    GetUser();
                  } catch (error) {
                    console.log(error.response?.data);

                    setMensagemPopup("Erro ao atualizar usuário!");
                    setPopup(true);
                  }
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
