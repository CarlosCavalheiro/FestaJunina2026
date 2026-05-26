import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function ConfirmarSenha() {
  const [params] = useSearchParams();
  const [mensagem, setMensagem] = useState("Confirmando alteração...");

  useEffect(() => {
    async function confirmarSenha() {
      try {
        const token = params.get("token");

        if (!token) {
          setMensagem("Token não encontrado.");
          return;
        }

        await api.put(`/Usuario/confirmarMudancaSenha?token=${token}`);

        setMensagem("Senha alterada com sucesso!");
      } catch (error) {
        console.log(error.response?.data);
        setMensagem("Link inválido ou expirado.");
      }
    }

    confirmarSenha();
  }, [params]);

  return (
    <main style={{ padding: "40px", textAlign: "center" }}>
      <h2>{mensagem}</h2>

      <Link to="/loginUsuarios">
        Voltar para o login
      </Link>
    </main>
  );
}