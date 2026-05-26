import "../styles/header.css"
import logo from '../assets/logo.png'

function Header() {
  return (
    <header>
      <img src={logo} className="logo" />
    </header>
  )
}

export default Header