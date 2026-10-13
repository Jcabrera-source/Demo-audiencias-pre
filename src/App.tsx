import type { ReactElement } from 'react'
import './App.css'
import { CrearAudienciaPage } from './features/crear-audiencia/CrearAudienciaPage'
import buildingBackground from './assets/fondo-poder-judicial-corrientes.png'
import judicialLogo from './assets/logo-poder-judicial-corrientes.png'

function InstitutionalFooter(): ReactElement {
  return (
    <footer className="institutional-footer">
      <div className="institutional-footer__inner">
        <div className="institutional-footer__brand">
          <img
            src={judicialLogo}
            alt="Provincia de Corrientes - Poder Judicial"
          />
        </div>
        <nav className="institutional-footer__links" aria-label="Organismos">
          <a href="#consejo">CONSEJO DE LA MAGISTRATURA</a>
          <a href="#jurado">JURADO DE ENJUICIAMIENTO</a>
          <a href="#ministerio">MINISTERIO PÚBLICO</a>
          <a href="#junta">JUNTA ELECTORAL</a>
          <a href="#organismos">ORGANISMOS</a>
        </nav>
        <div className="institutional-footer__qr" aria-label="Código QR institucional">
          <span>QR</span>
        </div>
      </div>
    </footer>
  )
}

function App(): ReactElement {
  return (
    <div className="app-shell">
      <img
        className="app-background-image"
        src={buildingBackground}
        alt=""
        aria-hidden="true"
      />
      <CrearAudienciaPage />
      <InstitutionalFooter />
    </div>
  )
}

export default App
