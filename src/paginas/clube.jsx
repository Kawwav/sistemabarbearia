import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import './clube.css'

const CHAVE_MEMBROS = 'barbearia_membros'

// TODO: troque pelos planos, valores e direitos reais vindos do backend
const PLANOS = [
  {
    id: 'essencial',
    nome: 'Essencial',
    descricao: 'Pra quem vem sempre e quer economizar no dia a dia.',
    preco: 79,
    periodo: '/mês',
    destaque: false,
    direitos: [
      '2 cortes de cabelo por mês',
      '10% de desconto em produtos',
      'Prioridade na fila de espera',
    ],
  },
  {
    id: 'completo',
    nome: 'Completo',
    descricao: 'O favorito de quem cuida do visual toda semana.',
    preco: 129,
    periodo: '/mês',
    destaque: true,
    direitos: [
      'Cortes de cabelo ilimitados',
      'Barba incluída em toda visita',
      '20% de desconto em produtos',
      'Agendamento com prioridade máxima',
      '1 tratamento facial por mês',
    ],
  },
  {
    id: 'vip',
    nome: 'VIP',
    descricao: 'Atendimento exclusivo, sem fila e sem limites.',
    preco: 189,
    periodo: '/mês',
    destaque: false,
    direitos: [
      'Tudo do plano Completo',
      'Atendimento exclusivo com barbeiro titular',
      'Bebida de cortesia a cada visita',
      '30% de desconto em produtos',
    ],
  },
]

// TODO: troque por chamadas reais ao backend de assinatura/pagamento.
// A lista completa é usada em admclube.jsx pra montar o relatório de assinantes por plano.
function carregarMembros() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_MEMBROS) || '[]')
  } catch {
    return []
  }
}

function salvarMembros(lista) {
  try {
    localStorage.setItem(CHAVE_MEMBROS, JSON.stringify(lista))
  } catch {
    // sem localStorage disponível, segue sem persistir
  }
}

function IconeCheck() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function IconeCheckGrande() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function Clube() {
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [membros, setMembros] = useState(() => carregarMembros())
  const [planoEscolhido, setPlanoEscolhido] = useState(null)

  const email = usuario?.email?.toLowerCase() || ''
  const membroAtual = membros.find((m) => m.email?.toLowerCase() === email)

  function escolherPlano(plano) {
    // TODO: troque pela chamada real ao backend de assinatura/pagamento
    const novoMembro = {
      email: usuario?.email || '',
      nome: usuario?.nome || '',
      planoId: plano.id,
      desde: new Date().toISOString().slice(0, 10),
    }

    setMembros((atual) => {
      const semEsseEmail = atual.filter((m) => m.email?.toLowerCase() !== email)
      const lista = [...semEsseEmail, novoMembro]
      salvarMembros(lista)
      return lista
    })
    setPlanoEscolhido(plano)
  }

  if (planoEscolhido) {
    return (
      <section className="clube">
        <div className="clube-sucesso">
          <div className="clube-sucesso-icone">
            <IconeCheckGrande />
          </div>
          <h1 className="clube-sucesso-titulo">Bem-vindo ao {planoEscolhido.nome}!</h1>
          <p className="clube-sucesso-texto">
            Sua assinatura foi confirmada. Seus benefícios já estão liberados pro seu próximo agendamento.
          </p>
          <button type="button" className="clube-sucesso-botao" onClick={() => navigate('/agendar')}>
            Voltar para o início
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="clube">
      <div className="clube-conteudo">
        <button type="button" className="clube-voltar" onClick={() => navigate('/agendar')}>
          ← Voltar
        </button>

        <div className="clube-cabecalho">
          <p className="clube-etiqueta">Clube barbearia</p>
          <h1 className="clube-titulo">Escolha o plano ideal pra você</h1>
          <p className="clube-subtitulo">
            Assine e garanta benefícios exclusivos em cada visita. Cancele quando quiser.
          </p>
        </div>

        <div className="clube-planos">
          {PLANOS.map((plano) => {
            const ativo = membroAtual?.planoId === plano.id
            return (
              <div
                key={plano.id}
                className={`clube-plano ${plano.destaque ? 'clube-plano-destaque' : ''} ${ativo ? 'clube-plano-ativo' : ''}`}
              >
                {plano.destaque && <span className="clube-plano-etiqueta-popular">Mais popular</span>}

                <h2 className="clube-plano-nome">{plano.nome}</h2>
                <p className="clube-plano-descricao">{plano.descricao}</p>

                <div className="clube-plano-preco">
                  <span className="clube-plano-preco-valor">R$ {plano.preco}</span>
                  <span className="clube-plano-preco-periodo">{plano.periodo}</span>
                </div>

                <ul className="clube-plano-direitos">
                  {plano.direitos.map((direito) => (
                    <li key={direito} className="clube-plano-direito">
                      <span className="clube-plano-direito-icone">
                        <IconeCheck />
                      </span>
                      {direito}
                    </li>
                  ))}
                </ul>

                <button type="button" className="clube-plano-botao" onClick={() => escolherPlano(plano)}>
                  {ativo ? 'Seu plano atual' : 'Quero esse plano'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Clube