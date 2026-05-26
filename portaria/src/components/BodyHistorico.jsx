import Card from "./Card";
import "../styles/Historico.css";
import QrcodeExemplo from "../assets/QrcodeExemplo.png";
import QrcodeExemplo2 from "../assets/QrcodeExemplo2.png";
import QrcodeExemplo3 from "../assets/QrcodeExemplo3.png";
import QrcodeExemplo4 from "../assets/QrcodeExemplo4.png";


export default function BodyHistorico() {
    return(
        
            <div className="containerCards">
                <Card imagem={QrcodeExemplo2} qtIngressos={1} tipoIngresso="Infantil" status1="Cadastrado" />
                <Card imagem={QrcodeExemplo2} qtIngressos={2} tipoIngresso="Adulto" status1="Cadastrado" />
                <Card imagem={QrcodeExemplo4} qtIngressos={3} tipoIngresso="Colaborador" status1="Cadastrado" />
                <Card imagem={QrcodeExemplo4} qtIngressos={4} tipoIngresso="Instituição" status2="Cadastrado" />
                <Card imagem={QrcodeExemplo2} qtIngressos={5} tipoIngresso="Infantil" status2="Cadastrado" />
                <Card imagem={QrcodeExemplo2} qtIngressos={6} tipoIngresso="Adulto" status2="Cadastrado" />
                <Card imagem={QrcodeExemplo4} qtIngressos={7} tipoIngresso="Colaborador" status1="Cadastrado" />
                <Card imagem={QrcodeExemplo4} qtIngressos={8} tipoIngresso="Instituição" status1="Cadastrado" />
            </div>
        
    )
}