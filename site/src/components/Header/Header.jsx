import "./header.css";
import logo from "../../assets/Logo.png";
import conta from "../../assets/conta.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usuarioLogado, logout } from "../../services/auth";
import "../Popup/Popup.css";
import api, { BLOB_FOTO_PERFIL_URL, BLOB_UPLOADS_BASE_URL } from "../../services/api";

function montarUrlsFotoPerfil(fotoPerfil) {
  if (!fotoPerfil) {
    return [];
  }

  const valor = String(fotoPerfil).trim();
  if (!valor) {
    return [];
  }

  // Quando a API já retorna URL completa (inclusive com SAS), usa diretamente.
  if (/^https?:\/\//i.test(valor)) {
    return [valor];
  }

  const normalizado = valor.replace(/^\/+/, "");
  const normalizadoLower = normalizado.toLowerCase();

  if (normalizadoLower.startsWith("uploads/")) {
    return [`${BLOB_UPLOADS_BASE_URL}${normalizado.slice("uploads/".length)}`];
  }

  if (normalizadoLower.startsWith("fotoperfil/")) {
    return [`${BLOB_UPLOADS_BASE_URL}${normalizado}`];
  }

  return [
    `${BLOB_FOTO_PERFIL_URL}${normalizado}`,
    `${BLOB_UPLOADS_BASE_URL}FotoPerfil/${normalizado}`,
  ];
}

export default function Header() {
  const [menu, setMenu] = useState(false);
  const [menuPerfil, setMenuPerfil] = useState(false);
  const [popup, setPopup] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [popupFoto, setPopupFoto] = useState(false);
  const [foto, setFoto] = useState(null);
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const [fotoPerfilAtual, setFotoPerfilAtual] = useState(null); 
  const [indiceTentativaFoto, setIndiceTentativaFoto] = useState(0);

  const navigate = useNavigate();
  const logado = usuarioLogado();

  const alternarMenuPrincipal = () => {
    setMenu((aberto) => !aberto);
    setMenuPerfil(false);
  };

  const alternarMenuPerfil = () => {
    setMenuPerfil((aberto) => !aberto);
    setMenu(false);
  };

  
  useEffect(() => {
    const readFromStorage = () => {
      const usuarioString = localStorage.getItem("usuario");
      let usuarioObj = null;
      try {
        usuarioObj = usuarioString ? JSON.parse(usuarioString) : null;
      } catch (error) {
        usuarioObj = null;
      }

      const fotoSalva = usuarioObj?.fotoPerfil ?? localStorage.getItem("fotoPerfil") ?? null;
      setFotoPerfilAtual(fotoSalva);
      setImagemFalhou(false);
      setIndiceTentativaFoto(0);
    };

    readFromStorage();

    const handler = (e) => {
      const usuarioAtualizado = e?.detail ?? null;
      if (usuarioAtualizado) {
        const fotoSalva = usuarioAtualizado?.fotoPerfil ?? localStorage.getItem("fotoPerfil") ?? null;
        setFotoPerfilAtual(fotoSalva);
        setImagemFalhou(false);
        setIndiceTentativaFoto(0);
      } else {
        readFromStorage();
      }
    };

    window.addEventListener("usuarioAtualizado", handler);
    return () => window.removeEventListener("usuarioAtualizado", handler);
  }, []);

  function sair() {
    logout();
    navigate("/");
  }

  async function EnviarFoto() {
    if (!foto) {
      setMensagemPopup("Selecione uma imagem!");
      setPopup(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("foto", foto);
      formData.append("file", foto);
      
      const usuarioString = localStorage.getItem("usuario");
      let usuarioObj = null;
      try {
        usuarioObj = usuarioString ? JSON.parse(usuarioString) : null;
      } catch (error) {
        console.warn("Erro ao ler usuário do localStorage:", error);
        usuarioObj = null;
      }

      const IdUsuario = usuarioObj?.IdUsuario ?? usuarioObj?.idUsuario ?? localStorage.getItem("idUsuario");

      if (!IdUsuario) {
        setMensagemPopup("Erro: ID do usuário não encontrado!");
        setPopup(true);
        return;
      }

      const endpoint = `Usuario/ImagemPerfil`;
      const response = await api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          id: IdUsuario,
        },
      });

      const fotoRetornada = response.data?.fotoPerfil ?? response.data?.imagemPerfil;
      
      if (fotoRetornada) {
        setFotoPerfilAtual(fotoRetornada);

        const usuarioAtualizado = { ...usuarioObj, fotoPerfil: fotoRetornada };
        localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
        localStorage.setItem("fotoPerfil", fotoRetornada);
        setImagemFalhou(false);
        setIndiceTentativaFoto(0);

        try {
          window.dispatchEvent(new CustomEvent("usuarioAtualizado", { detail: usuarioAtualizado }));
        } catch (e) {
          // se CustomEvent não estiver disponível por algum motivo, apenas ignore
        }
      }

      setMensagemPopup("Foto atualizada! Faça login novamente para ver a nova foto.");
      setPopup(true);
      setPopupFoto(false);
      setFoto(null);
      
    } catch (error) {
      console.error("Erro ao enviar foto:", error.response ?? error);
      const mensagemErro = error.response?.data?.title ||
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "Erro ao enviar foto!";
      setMensagemPopup(`Erro: ${mensagemErro}`);
      setPopup(true);
    }
  }

  const usuarioStorage = localStorage.getItem("usuario");
  const usuario = usuarioStorage ? JSON.parse(usuarioStorage) : null;
  
  let fotoPerfilUsuario = fotoPerfilAtual; 
  
  let imagemPerfil = conta;
  
  if (fotoPerfilUsuario && !imagemFalhou) {
    const urlsPossiveis = montarUrlsFotoPerfil(fotoPerfilUsuario);
    const urlBase = urlsPossiveis[indiceTentativaFoto] ?? null;
    if (urlBase) {
      const separador = urlBase.includes("?") ? "&" : "?";
      const timestamp = new Date().getTime();
      imagemPerfil = `${urlBase}${separador}t=${timestamp}`;
    }
  }

  const handleImageError = () => {
    const urlsPossiveis = montarUrlsFotoPerfil(fotoPerfilUsuario);
    if (indiceTentativaFoto + 1 < urlsPossiveis.length) {
      setIndiceTentativaFoto((valorAtual) => valorAtual + 1);
      return;
    }
    setImagemFalhou(true);
  };

  return (
    <header>
      <nav className="menu">
        <button className="btn-menu" onClick={alternarMenuPrincipal}>
          ☰
        </button>

        {menu && (
          <div className="links-menu">
            <button onClick={() => {
              navigate("/");
              setMenu(false);
            }}>
              Início
            </button>

            <button onClick={() => {
              navigate("/meusIngressos");
              setMenu(false);
            }}>
              Meus ingressos
            </button>

            <a
              href="https://api.whatsapp.com/send/?phone=5514999052383&text&type=phone_number&app_absent=0"
              onClick={() => setMenu(false)}
            >
              Fale Conosco
            </a>
          </div>
        )}
      </nav>
      
      <img
        src={logo}
        className="logo"
        alt="logo"
        onClick={() => navigate("/")}
      />
      
      <div className="conta">
        <p className="bemvindo">{usuario ? `Olá, ${usuario.usuario}!` : " "}</p>
 
        <img
          src={imagemPerfil}
          className="login"
          alt="perfil"
          onClick={alternarMenuPerfil}
          onError={handleImageError}
        />

        {menuPerfil && (
          <div className="menu-perfil">
            <div className="perfil-container">
              <div className="avatar-wrapper">
                <div
                  className="avatar-wrapper"
                  onClick={() => setPopupFoto(true)}
                >
                  <img 
                    src={imagemPerfil} 
                    className="avatar-img" 
                    alt="avatar"
                    onError={handleImageError}
                  />
                  <div className="editar-overlay">Editar</div>
                </div>
              </div>
              <h3 className="perfil-titulo">
                {usuario ? `Olá, ${usuario.usuario}!` : "Olá! Seja Bem Vindo(a)"}
              </h3>

              {logado ? (
                <button onClick={sair} className="btn-criar-conta">
                  Sair
                </button>
              ) : (
                <button
                  onClick={() => navigate("/loginUsuarios")}
                  className="btn-criar-conta"
                >
                  login
                </button>
              )}
            </div>
          </div>
        )}
        
        {popup && (
          <div className="popup">
            <p>{mensagemPopup}</p>
            <button onClick={() => setPopup(false)}>Fechar</button>
          </div>
        )}
        
        {popupFoto && (
          <div className="modal-overlay">
            <div className="modal-foto">
              <h2>Alterar Foto de Perfil</h2>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFoto(e.target.files[0])}
              />
              <div className="botoes-modal">
                <button className="btn-upload" onClick={EnviarFoto}>
                  Salvar Foto
                </button>
                <button
                  className="btn-cancelar"
                  onClick={() => setPopupFoto(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}