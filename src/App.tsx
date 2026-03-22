import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ScrollToHash } from './components/ScrollToHash'
import { Consultoria } from './pages/Consultoria'
import { Home } from './pages/Home'
import { Presencial } from './pages/Presencial'
import { FichaInicial } from './pages/FichaInicial'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/consultoria" element={<Consultoria />} />
        <Route path="/atendimento-presencial" element={<Presencial />} />
        <Route path="/ficha-inicial" element={<FichaInicial />} />
        <Route
          path="/consultoria/ficha-inicial"
          element={<Navigate to="/ficha-inicial" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
