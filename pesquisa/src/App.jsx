import { BrowserRouter, Routes, Route} from "react-router-dom";
import Header from "./components/Header"
import Footer from "./components/Footer"
import Formulario from "./components/Formulario"
import "./App.css"

function App() {
  return (
     <BrowserRouter basename="/Pesquisa/">
    <div className="app">
      <Header />
      <Formulario />
      <Footer />
    </div>
    </BrowserRouter>
  )
}

export default App