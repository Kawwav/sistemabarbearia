import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import './agendar.css'

function IconeSeta() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function Agendar() {
  const navigate = useNavigate()
  const { usuario, estaLogado } = useAuth()

  // essa tela é só pra quem já entrou; sem login, manda de volta pro formulário
  useEffect(() => {
    if (!estaLogado) navigate('/login')
  }, [estaLogado, navigate])

  if (!estaLogado) return null

  const primeiroNome = usuario?.nome?.split(' ')[0] || 'visitante'

  return (
    <section className="agendar">
      <div className="agendar-topo">
        <span className="agendar-saudacao">Que bom te ver por aqui</span>
        <h1 className="agendar-nome">Olá, {primeiroNome}</h1>
      </div>

      <div className="agendar-opcoes">
        <button
          type="button"
          className="agendar-cartao"
          onClick={() => navigate('/clube')}
        >
          <div className="agendar-cartao-texto">
            <h2 className="agendar-cartao-titulo">Conheça o clube barbearia</h2>
            <p className="agendar-cartao-descricao">
              Benefícios, descontos e vantagens exclusivas pra quem é da casa.
            </p>
          </div>
          <span className="agendar-cartao-icone">
            <IconeSeta />
          </span>
        </button>

        <button
          type="button"
          className="agendar-cartao agendar-cartao-principal"
          onClick={() => navigate('/agendar/novo')}
        >
          <div className="agendar-cartao-texto">
            <h2 className="agendar-cartao-titulo">Novo agendamento</h2>
            <p className="agendar-cartao-descricao">
              Escolha o serviço, o barbeiro e o horário que combinam com você.
            </p>
          </div>
          <span className="agendar-cartao-icone">
            <IconeSeta />
          </span>
        </button>

        <button
          type="button"
          className="agendar-cartao"
          onClick={() => navigate('/agendar/meus')}
        >
          <div className="agendar-cartao-texto">
            <h2 className="agendar-cartao-titulo">Meus agendamentos</h2>
            <p className="agendar-cartao-descricao">
              Veja seus horários marcados, os serviços escolhidos e os valores.
            </p>
          </div>
          <span className="agendar-cartao-icone">
            <IconeSeta />
          </span>
        </button>

        <button
          type="button"
          className="agendar-cartao"
          onClick={() => navigate('/perfil')}
        >
          <div className="agendar-cartao-texto">
            <h2 className="agendar-cartao-titulo">Meu perfil</h2>
            <p className="agendar-cartao-descricao">
              Seus dados, segurança da conta e preferências de notificação.
            </p>
          </div>
          <span className="agendar-cartao-icone">
            <IconeSeta />
          </span>
        </button>
      </div>
    </section>
  )
}

export default Agendar