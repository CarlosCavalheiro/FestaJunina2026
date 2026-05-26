import api from "./api";

var logado = false;
export async function login(email, senha) {
  try { if (!logado) {
    const response = await api.post(
      "Usuario/login",
      {
        email,
        senha,
      }
    );
    
    const id = response.data.IdUsuario;
    const token = response.data.Token;
    const FotoPerfil = response.data.imagemPerfil;
    
    // console.log(response.data);
    localStorage.setItem("usuario", JSON.stringify(response.data));
    localStorage.setItem("token", token);
    localStorage.setItem("idUsuario", id);
    localStorage.setItem("fotoPerfil", FotoPerfil);
    
    logado = true;
    return true;
  } 
  
} catch (error) {
  
  console.log(error.response?.data);
  
  return false;
}
}

export function usuarioLogado() {
  return !!localStorage.getItem(
    "token"
  );
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
  logado = false;
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
export default logado;