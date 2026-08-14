import { Routes, Route, Navigate } from 'react-router-dom'
import Comeco from './paginas/comeco'
import Time from './paginas/Time'
import Salao from './paginas/salao'
import Footer from './componentes/footer'
import LoginCliente from './paginas/logincliente'
import Agendar from './paginas/agendar'
import NovoAgendamento from './paginas/novoagendamento'
import MeusAgendamentos from './paginas/meusagendamentos'
import Clube from './paginas/clube'
import Perfil from './paginas/perfil'
import AdminLogin from './paginas/adminlogin'
import Admin from './paginas/adm'
import AdminBarbeiros from './paginas/admbarbeiros'
import AdminServicos from './paginas/admservicos'
import AdminFiliais from './paginas/admfiliais'
import AdminClube from './paginas/admclube'
import AdminClientes from './paginas/admclientes'
import { useAuth } from './contexto/AuthContext'
import { useAdminAuth } from './contexto/AdminAuthContext'

// página inicial: as seções de sempre, uma embaixo da outra
function Inicio() {
  return (
    <>
      <Comeco />
      <Time />
      <Salao />
      <Footer />
    </>
  )
}

// só deixa passar pra /agendar quem já está logado como cliente
function RotaProtegida({ children }) {
  const { estaLogado } = useAuth()
  return estaLogado ? children : <Navigate to="/login" replace />
}

// só deixa passar pra /admin quem já está logado como admin
function RotaProtegidaAdmin({ children }) {
  const { adminEstaLogado } = useAdminAuth()
  return adminEstaLogado ? children : <Navigate to="/admin/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<LoginCliente />} />
      <Route
        path="/agendar"
        element={
          <RotaProtegida>
            <Agendar />
          </RotaProtegida>
        }
      />
      <Route
        path="/agendar/novo"
        element={
          <RotaProtegida>
            <NovoAgendamento />
          </RotaProtegida>
        }
      />
      <Route
        path="/agendar/meus"
        element={
          <RotaProtegida>
            <MeusAgendamentos />
          </RotaProtegida>
        }
      />
      <Route
        path="/clube"
        element={
          <RotaProtegida>
            <Clube />
          </RotaProtegida>
        }
      />
      <Route
        path="/perfil"
        element={
          <RotaProtegida>
            <Perfil />
          </RotaProtegida>
        }
      />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RotaProtegidaAdmin>
            <Admin />
          </RotaProtegidaAdmin>
        }
      />
      <Route
        path="/admin/barbeiros"
        element={
          <RotaProtegidaAdmin>
            <AdminBarbeiros />
          </RotaProtegidaAdmin>
        }
      />
      <Route
        path="/admin/servicos"
        element={
          <RotaProtegidaAdmin>
            <AdminServicos />
          </RotaProtegidaAdmin>
        }
      />
      <Route
        path="/admin/filiais"
        element={
          <RotaProtegidaAdmin>
            <AdminFiliais />
          </RotaProtegidaAdmin>
        }
      />
      <Route
        path="/admin/clube"
        element={
          <RotaProtegidaAdmin>
            <AdminClube />
          </RotaProtegidaAdmin>
        }
      />
      <Route
        path="/admin/clientes"
        element={
          <RotaProtegidaAdmin>
            <AdminClientes />
          </RotaProtegidaAdmin>
        }
      />
    </Routes>
  )
}

export default App