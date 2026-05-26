import Header from '../components/header'
import Footer from '../components/footer'
import logo from "../assets/LogoFestaJulina.png";
import perfil from "../assets/pfp.png";
import LeitorQR from "../components/LeitorQr";
import '../styles/QrCode.css'

function App() {
  return(
    <>
      <Header imagem1={logo} imagem2={perfil}/>
        <div className="container">
          <div className="card">
            <div className="card-header">
              <h1>PORTAL DO ARRAIÁ</h1>
              <p>Aproxime o convite para validação</p>
            </div>
          <div className="qr-area">
            <LeitorQR />
          </div>
          <button className="btn-verificar">Verificar QR Code</button>
          <p className="status">Aguardando leitura...</p>
        </div>
      </div>
      <Footer/>
    </>
  )
}

export default App
