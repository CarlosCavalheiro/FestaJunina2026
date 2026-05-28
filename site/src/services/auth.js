import api from "./api";

function obterPayloadJwt(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const partes = token.split(".");
  if (partes.length < 2) {
    return null;
  }

  try {
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function tokenExpirado(token) {
  const payload = obterPayloadJwt(token);
  const exp = Number(payload?.exp);

  if (!Number.isFinite(exp) || exp <= 0) {
    return false;
  }

  const agora = Math.floor(Date.now() / 1000);
  return exp <= agora;
}

export async function login(email, senha) {
  try {
    const response = await api.post("Usuario/login", {
      email,
      senha,
    });

    const id = response.data.IdUsuario;
    const token = response.data.Token;
    const FotoPerfil = response.data.imagemPerfil;

    // console.log(response.data);
    localStorage.setItem("usuario", JSON.stringify(response.data));
    localStorage.setItem("token", token);
    localStorage.setItem("idUsuario", id);
    localStorage.setItem("fotoPerfil", FotoPerfil);

    return true;
  } catch (error) {
    console.log(error.response?.data);
    return false;
  }
}

export function usuarioLogado() {
  const token = localStorage.getItem("token");

  if (!token) {
    return false;
  }

  if (tokenExpirado(token)) {
    logout();
    return false;
  }

  return true;
}

export function logout() {
  
  localStorage.removeItem(
    "token"
  );
  
  localStorage.removeItem(
    "usuario"
  );
  
  localStorage.removeItem(
    "perfil"
  );
  
  localStorage.removeItem(
    "idUsuario"
  );
  
  localStorage.removeItem(
    "fotoPerfil"
  );
}

export async function solicitarMudancaSenha(
  email,
  senha
) {
  try {
    
    const response = await api.post(
      "Usuario/solicitarMudancaSenha",
      {
        email,
        senha,
      }
    );
    
    // Esta função era para fins de testes e deve ser removida na aplicação final
    // console.log(response.data);

    return true;
    
  } catch (error) {
    
    // console.log(error.response?.data);
    
    return false;
  }
}