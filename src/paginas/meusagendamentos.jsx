import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import './meusagendamentos.css'

const CHAVE_AGENDAMENTOS = 'barbearia_agendamentos'
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function carregarAgendamentos() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS) || '[]')
  } catch {
    return []
  }
}

function salvarAgendamentos(lista) {
  try {
    localStorage.setItem(CHAVE_AGENDAMENTOS, JSON.stringify(lista))
  } catch {
    // sem localStorage disponível, segue sem persistir
  }
}

// junta data + horário num Date pra comparar com "agora" e saber se já passou
function jaPassou(data, horario) {
  const [hora, minuto] = horario.split(':').map(Number)
  const dataHorario = new Date(`${data}T00:00:00`)
  dataHorario.setHours(hora, minuto, 0, 0)
  return dataHorario < new Date()
}

function IconeLixeira() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z" />
    </svg>
  )
}

function MeusAgendamentos() {
  const navigate = useNavigate()
  const { usuario, estaLogado } = useAuth()

  const [agendamentos, setAgendamentos] = useState(() => carregarAgendamentos())

  // essa tela é só pra quem já entrou; sem login, manda de volta pro formulário
  useEffect(() => {
    if (!estaLogado) navigate('/login')
  }, [estaLogado, navigate])

  // mantém o localStorage em dia sempre que a lista muda (ex.: após cancelar)
  useEffect(() => {
    salvarAgendamentos(agendamentos)
  }, [agendamentos])

  function cancelar(indiceOriginal) {
    setAgendamentos((atual) => atual.filter((_, i) => i !== indiceOriginal))
  }

  // só os agendamentos do cliente logado, do mais próximo pro mais distante
  const meusAgendamentos = useMemo(() => {
    const email = usuario?.email?.toLowerCase() || ''

    const comIndice = agendamentos
      .map((agendamento, indiceOriginal) => ({ ...agendamento, indiceOriginal }))
      .filter((a) => a.email?.toLowerCase() === email)

    return comIndice.sort((a, b) => {
      if (a.data === b.data) return a.horario.localeCompare(b.horario)
      return a.data.localeCompare(b.data)
    })
  }, [agendamentos, usuario])

  if (!estaLogado) return null

  return (
    <section className="meusagendamentos">
      <div className="meusagendamentos-conteudo">
        <button type="button" className="meusagendamentos-voltar" onClick={() => navigate('/agendar')}>
          ← Voltar
        </button>

        <div className="meusagendamentos-cabecalho">
          <p className="meusagendamentos-etiqueta">Sua agenda</p>
          <h1 className="meusagendamentos-titulo">Meus agendamentos</h1>
        </div>

        {meusAgendamentos.length === 0 ? (
          <div className="meusagendamentos-vazio">
            <p className="meusagendamentos-vazio-texto">Você ainda não tem nenhum agendamento marcado.</p>
            <button type="button" className="meusagendamentos-vazio-botao" onClick={() => navigate('/agendar/novo')}>
              Marcar horário
            </button>
          </div>
        ) : (
          <div className="meusagendamentos-lista">
            {meusAgendamentos.map((item) => {
              const data = new Date(`${item.data}T00:00:00`)
              const passou = jaPassou(item.data, item.horario)
              const servicos = item.servico ? item.servico.split(', ') : []

              return (
                <div
                  key={item.indiceOriginal}
                  className={`meusagendamentos-cartao ${passou ? 'meusagendamentos-cartao-passado' : ''}`}
                >
                  <div className="meusagendamentos-data">
                    <span className="meusagendamentos-data-dia">{data.getDate()}</span>
                    <span className="meusagendamentos-data-mes">{MESES[data.getMonth()]}</span>
                    <span className="meusagendamentos-data-hora">{item.horario}</span>
                  </div>

                  <div className="meusagendamentos-detalhes">
                    <div className="meusagendamentos-cabecalho-linha">
                      <div>
                        <h2 className="meusagendamentos-barbeiro">{item.barbeiro}</h2>
                        {item.filial && <p className="meusagendamentos-filial">{item.filial}</p>}
                      </div>
                      <span
                        className={`meusagendamentos-status ${passou ? 'meusagendamentos-status-concluido' : ''}`}
                      >
                        {passou ? 'Concluído' : 'Agendado'}
                      </span>
                    </div>

                    <div className="meusagendamentos-servicos">
                      {servicos.map((servico) => (
                        <span key={servico} className="meusagendamentos-servico-chip">
                          {servico}
                        </span>
                      ))}
                    </div>

                    {item.observacoes && <p className="meusagendamentos-obs">{item.observacoes}</p>}

                    <div className="meusagendamentos-rodape-linha">
                      <span className="meusagendamentos-valor">
                        {typeof item.valor === 'number' ? `R$ ${item.valor}` : '—'}
                      </span>

                      {!passou && (
                        <button
                          type="button"
                          className="meusagendamentos-cancelar"
                          onClick={() => cancelar(item.indiceOriginal)}
                        >
                          <IconeLixeira />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default MeusAgendamentos
