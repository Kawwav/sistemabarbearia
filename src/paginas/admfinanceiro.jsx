import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexto/AdminAuthContext'
import AdminSidebar from './admsidebar'
import './admfinanceiro.css'

const CHAVE_AGENDAMENTOS = 'barbearia_agendamentos'
const CHAVE_BARBEIROS = 'barbearia_barbeiros'

const STATUS = {
  AGENDADO: 'agendado',
  CONCLUIDO: 'concluido',
  NAO_COMPARECEU: 'nao_compareceu',
}

function carregarAgendamentos() {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS) || '[]')
    return lista.map((a) => ({ status: STATUS.AGENDADO, ...a }))
  } catch {
    return []
  }
}

function carregarBarbeiros() {
  try {
    const salvos = localStorage.getItem(CHAVE_BARBEIROS)
    return salvos ? JSON.parse(salvos) : []
  } catch {
    return []
  }
}

function paraDataLocal(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function intervaloDoPeriodo(periodo) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  if (periodo === 'todos') return { inicio: null, fim: null }

  if (periodo === 'hoje') {
    const data = paraDataLocal(hoje)
    return { inicio: data, fim: data }
  }

  if (periodo === 'semana') {
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - hoje.getDay())
    const fimSemana = new Date(inicioSemana)
    fimSemana.setDate(inicioSemana.getDate() + 6)
    return { inicio: paraDataLocal(inicioSemana), fim: paraDataLocal(fimSemana) }
  }

  if (periodo === 'mes') {
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    return { inicio: paraDataLocal(inicioMes), fim: paraDataLocal(fimMes) }
  }

  return { inicio: null, fim: null }
}

function intervaloAnterior(periodo) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  if (periodo === 'todos') return { inicio: null, fim: null, valido: false }

  if (periodo === 'hoje') {
    const ontem = new Date(hoje)
    ontem.setDate(hoje.getDate() - 1)
    const data = paraDataLocal(ontem)
    return { inicio: data, fim: data, valido: true }
  }

  if (periodo === 'semana') {
    const inicioSemanaAtual = new Date(hoje)
    inicioSemanaAtual.setDate(hoje.getDate() - hoje.getDay())
    const fimAnterior = new Date(inicioSemanaAtual)
    fimAnterior.setDate(inicioSemanaAtual.getDate() - 1)
    const inicioAnterior = new Date(fimAnterior)
    inicioAnterior.setDate(fimAnterior.getDate() - 6)
    return { inicio: paraDataLocal(inicioAnterior), fim: paraDataLocal(fimAnterior), valido: true }
  }

  if (periodo === 'mes') {
    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
    return { inicio: paraDataLocal(inicioMesAnterior), fim: paraDataLocal(fimMesAnterior), valido: true }
  }

  return { inicio: null, fim: null, valido: false }
}

function variacao(atual, anterior) {
  if (anterior === null || anterior === undefined || anterior === 0) return null
  return ((atual - anterior) / anterior) * 100
}

const PERIODOS = [
  { id: 'hoje', nome: 'Hoje' },
  { id: 'semana', nome: 'Esta semana' },
  { id: 'mes', nome: 'Este mês' },
  { id: 'todos', nome: 'Tudo' },
]

function formatarMoeda(valor) {
  return (valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatarDataCurta(data) {
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function rotuloRelativo(data, hojeStr, ontemStr) {
  if (data === hojeStr) return 'Hoje'
  if (data === ontemStr) return 'Ontem'
  return formatarDataCurta(data)
}

const DIAS_SEMANA_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function IconeCifrao() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function IconeTesoura() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.5 8.5 20 20M20 4 8.5 15.5" />
    </svg>
  )
}

function IconeEtiqueta() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41 11 22l-9-9L11 2l9.59 9.41Z" />
      <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconeAlerta() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  )
}

function Badge({ valor, inverso }) {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return null
  const positivo = inverso ? valor <= 0 : valor >= 0
  const sinal = valor > 0 ? '+' : ''
  return (
    <span className={`fin-kpi-badge ${positivo ? 'fin-kpi-badge-positivo' : 'fin-kpi-badge-negativo'}`}>
      {sinal}
      {valor.toFixed(1)}%
    </span>
  )
}

function AdminFinanceiro() {
  const navigate = useNavigate()
  const { admin, sairAdmin } = useAdminAuth()

  const [agendamentos] = useState(() => carregarAgendamentos())
  const [barbeiros] = useState(() => carregarBarbeiros())
  const [periodo, setPeriodo] = useState('semana')

  function handleSair() {
    sairAdmin()
    navigate('/admin/login')
  }

  const hojeStr = paraDataLocal(new Date())
  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1)
  const ontemStr = paraDataLocal(ontem)

  const { inicio, fim } = intervaloDoPeriodo(periodo)

  const doPeriodo = useMemo(() => {
    return agendamentos.filter((a) => {
      if (inicio && a.data < inicio) return false
      if (fim && a.data > fim) return false
      return true
    })
  }, [agendamentos, inicio, fim])

  const metricas = useMemo(() => {
    const concluidos = doPeriodo.filter((a) => a.status === STATUS.CONCLUIDO)
    const naoCompareceu = doPeriodo.filter((a) => a.status === STATUS.NAO_COMPARECEU)
    const agendado = doPeriodo.filter((a) => a.status === STATUS.AGENDADO)

    const faturamento = concluidos.reduce((soma, a) => soma + (Number(a.valor) || 0), 0)
    const ticketMedio = concluidos.length > 0 ? faturamento / concluidos.length : 0

    const resolvidos = concluidos.length + naoCompareceu.length
    const taxaNaoComparecimento = resolvidos > 0 ? (naoCompareceu.length / resolvidos) * 100 : 0

    return {
      faturamento,
      clientesAtendidos: concluidos.length,
      ticketMedio,
      taxaNaoComparecimento,
      concluidosCount: concluidos.length,
      agendadoCount: agendado.length,
      naoCompareceuCount: naoCompareceu.length,
      totalStatus: concluidos.length + agendado.length + naoCompareceu.length,
    }
  }, [doPeriodo])

  const metricasAnteriores = useMemo(() => {
    const { inicio: inicioAnt, fim: fimAnt, valido } = intervaloAnterior(periodo)
    if (!valido) return null

    const lista = agendamentos.filter((a) => {
      if (inicioAnt && a.data < inicioAnt) return false
      if (fimAnt && a.data > fimAnt) return false
      return true
    })

    const concluidos = lista.filter((a) => a.status === STATUS.CONCLUIDO)
    const naoCompareceu = lista.filter((a) => a.status === STATUS.NAO_COMPARECEU)

    const faturamento = concluidos.reduce((soma, a) => soma + (Number(a.valor) || 0), 0)
    const ticketMedio = concluidos.length > 0 ? faturamento / concluidos.length : 0
    const resolvidos = concluidos.length + naoCompareceu.length
    const taxaNaoComparecimento = resolvidos > 0 ? (naoCompareceu.length / resolvidos) * 100 : 0

    return { faturamento, clientesAtendidos: concluidos.length, ticketMedio, taxaNaoComparecimento }
  }, [agendamentos, periodo])

  const variacaoFaturamento = variacao(metricas.faturamento, metricasAnteriores?.faturamento)
  const variacaoClientes = variacao(metricas.clientesAtendidos, metricasAnteriores?.clientesAtendidos)
  const variacaoTicket = variacao(metricas.ticketMedio, metricasAnteriores?.ticketMedio)
  const variacaoNaoComparecimento = variacao(metricas.taxaNaoComparecimento, metricasAnteriores?.taxaNaoComparecimento)

  const tendencia = useMemo(() => {
    const dias = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dias.push(paraDataLocal(d))
    }

    return dias.map((data) => {
      const valor = agendamentos
        .filter((a) => a.data === data && a.status === STATUS.CONCLUIDO)
        .reduce((soma, a) => soma + (Number(a.valor) || 0), 0)
      const diaSemana = new Date(`${data}T00:00:00`).getDay()
      return { data, valor, rotulo: DIAS_SEMANA_ABREV[diaSemana] }
    })
  }, [agendamentos])

  const maiorValorTendencia = Math.max(1, ...tendencia.map((t) => t.valor))

  const graficoPontos = useMemo(() => {
    const largura = 640
    const altura = 180
    const passo = largura / (tendencia.length - 1)
    return tendencia.map((t, i) => {
      const x = i * passo
      const y = altura - (t.valor / maiorValorTendencia) * (altura - 24) - 8
      return { x, y, ...t }
    })
  }, [tendencia, maiorValorTendencia])

  const linhaSvg = graficoPontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaSvg = `${linhaSvg} L ${graficoPontos[graficoPontos.length - 1]?.x || 0} 180 L 0 180 Z`

  const atividadeRecente = useMemo(() => {
    return doPeriodo
      .filter((a) => a.status === STATUS.CONCLUIDO)
      .sort((a, b) => (a.data === b.data ? b.horario.localeCompare(a.horario) : b.data.localeCompare(a.data)))
      .slice(0, 6)
  }, [doPeriodo])

  const rankingBarbeiros = useMemo(() => {
    const mapa = new Map()
    doPeriodo
      .filter((a) => a.status === STATUS.CONCLUIDO)
      .forEach((a) => {
        const atual = mapa.get(a.barbeiro) || { nome: a.barbeiro, total: 0, atendimentos: 0 }
        atual.total += Number(a.valor) || 0
        atual.atendimentos += 1
        mapa.set(a.barbeiro, atual)
      })
    return Array.from(mapa.values()).sort((a, b) => b.total - a.total).slice(0, 5)
  }, [doPeriodo])

  const maiorTotalBarbeiro = Math.max(1, ...rankingBarbeiros.map((b) => b.total))

  const nomeAdmin = admin?.email ? admin.email.split('@')[0] : 'admin'

  const anguloConcluido = metricas.totalStatus > 0 ? (metricas.concluidosCount / metricas.totalStatus) * 360 : 0
  const anguloAgendado = metricas.totalStatus > 0 ? (metricas.agendadoCount / metricas.totalStatus) * 360 : 0

  return (
    <div className="admlayout">
      <AdminSidebar ativa="/admin/financeiro" />
      <div className="admlayout-main">
        <section className="fin">
          <div className="fin-cabecalho">
            <div>
              <p className="fin-saudacao">Olá, {nomeAdmin} 👋</p>
              <h1 className="fin-titulo">Financeiro</h1>
            </div>
            <div className="fin-cabecalho-direita">
              <div className="fin-periodo">
                {PERIODOS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`fin-periodo-item ${periodo === p.id ? 'fin-periodo-item-ativo' : ''}`}
                    onClick={() => setPeriodo(p.id)}
                  >
                    {p.nome}
                  </button>
                ))}
              </div>
              <button type="button" className="fin-sair" onClick={handleSair}>
                Sair
              </button>
            </div>
          </div>

          <div className="fin-kpis">
            <div className="fin-kpi-cartao">
              <span className="fin-kpi-icone-mini">
                <IconeCifrao />
              </span>
              <div className="fin-kpi-linha-rotulo">
                <span className="fin-kpi-rotulo">Faturamento</span>
                <Badge valor={variacaoFaturamento} />
              </div>
              <span className="fin-kpi-valor">{formatarMoeda(metricas.faturamento)}</span>
              <span className="fin-kpi-legenda">
                {metricas.concluidosCount} atendimento{metricas.concluidosCount !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="fin-kpi-cartao">
              <span className="fin-kpi-icone-mini">
                <IconeTesoura />
              </span>
              <div className="fin-kpi-linha-rotulo">
                <span className="fin-kpi-rotulo">Clientes atendidos</span>
                <Badge valor={variacaoClientes} />
              </div>
              <span className="fin-kpi-valor">{metricas.clientesAtendidos}</span>
              <span className="fin-kpi-legenda">
                {metricas.totalStatus} agendamento{metricas.totalStatus !== 1 ? 's' : ''} no período
              </span>
            </div>

            <div className="fin-kpi-cartao">
              <span className="fin-kpi-icone-mini">
                <IconeEtiqueta />
              </span>
              <div className="fin-kpi-linha-rotulo">
                <span className="fin-kpi-rotulo">Ticket médio</span>
                <Badge valor={variacaoTicket} />
              </div>
              <span className="fin-kpi-valor">{formatarMoeda(metricas.ticketMedio)}</span>
              <span className="fin-kpi-legenda">por atendimento concluído</span>
            </div>

            <div className="fin-kpi-cartao">
              <span className="fin-kpi-icone-mini fin-kpi-icone-mini-alerta">
                <IconeAlerta />
              </span>
              <div className="fin-kpi-linha-rotulo">
                <span className="fin-kpi-rotulo">Não comparecimento</span>
                <Badge valor={variacaoNaoComparecimento} inverso />
              </div>
              <span className="fin-kpi-valor">{metricas.taxaNaoComparecimento.toFixed(1)}%</span>
              <span className="fin-kpi-legenda">
                {metricas.naoCompareceuCount} de {metricas.concluidosCount + metricas.naoCompareceuCount} resolvidos
              </span>
            </div>
          </div>

          <div className="fin-grade-principal">
            <div className="fin-cartao fin-grafico-cartao">
              <div className="fin-cartao-cabecalho">
                <h2>Faturamento nos últimos 7 dias</h2>
              </div>

              <svg className="fin-grafico" viewBox="0 0 640 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="finGradiente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--fin-accent)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--fin-accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaSvg} fill="url(#finGradiente)" stroke="none" />
                <path d={linhaSvg} fill="none" stroke="var(--fin-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {graficoPontos.map((p) => (
                  <circle key={p.data} cx={p.x} cy={p.y} r={p.data === hojeStr ? 5 : 3.5} fill={p.data === hojeStr ? 'var(--fin-accent)' : '#fff'} stroke="var(--fin-accent)" strokeWidth="2" />
                ))}
              </svg>
              <div className="fin-grafico-eixo">
                {tendencia.map((t) => (
                  <span key={t.data} className={t.data === hojeStr ? 'fin-grafico-eixo-hoje' : ''}>
                    {t.rotulo}
                  </span>
                ))}
              </div>
            </div>

            <div className="fin-cartao fin-status-cartao">
              <div className="fin-cartao-cabecalho">
                <h2>Status no período</h2>
              </div>

              <div
                className="fin-donut"
                style={{
                  background: `conic-gradient(var(--fin-ok) 0deg ${anguloConcluido}deg, var(--fin-accent) ${anguloConcluido}deg ${anguloConcluido + anguloAgendado}deg, var(--fin-alerta) ${anguloConcluido + anguloAgendado}deg 360deg)`,
                }}
              >
                <div className="fin-donut-centro">
                  <span className="fin-donut-numero">{metricas.totalStatus}</span>
                  <span className="fin-donut-rotulo">agendamentos</span>
                </div>
              </div>

              <div className="fin-legenda">
                <div className="fin-legenda-item">
                  <span className="fin-legenda-ponto" style={{ background: 'var(--fin-ok)' }} />
                  Concluídos
                  <span className="fin-legenda-valor">{metricas.concluidosCount}</span>
                </div>
                <div className="fin-legenda-item">
                  <span className="fin-legenda-ponto" style={{ background: 'var(--fin-accent)' }} />
                  Agendados
                  <span className="fin-legenda-valor">{metricas.agendadoCount}</span>
                </div>
                <div className="fin-legenda-item">
                  <span className="fin-legenda-ponto" style={{ background: 'var(--fin-alerta)' }} />
                  Não compareceram
                  <span className="fin-legenda-valor">{metricas.naoCompareceuCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="fin-grade-secundaria">
            <div className="fin-cartao">
              <div className="fin-cartao-cabecalho">
                <h2>Atividade recente</h2>
              </div>

              {atividadeRecente.length === 0 ? (
                <p className="fin-vazio">Nenhum atendimento concluído neste período.</p>
              ) : (
                <div className="fin-atividade-lista">
                  {atividadeRecente.map((item, i) => (
                    <div key={`${item.data}-${item.horario}-${i}`} className="fin-atividade-item">
                      <span className="fin-atividade-avatar">{(item.cliente || '?').charAt(0).toUpperCase()}</span>
                      <div className="fin-atividade-texto">
                        <span className="fin-atividade-cliente">{item.cliente || 'Sem nome'}</span>
                        <span className="fin-atividade-detalhe">
                          {item.servico} · {item.barbeiro}
                        </span>
                      </div>
                      <div className="fin-atividade-direita">
                        <span className="fin-atividade-valor">{formatarMoeda(item.valor)}</span>
                        <span className="fin-atividade-data">
                          {rotuloRelativo(item.data, hojeStr, ontemStr)} · {item.horario}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="fin-cartao">
              <div className="fin-cartao-cabecalho">
                <h2>Top barbeiros</h2>
              </div>

              {rankingBarbeiros.length === 0 ? (
                <p className="fin-vazio">Sem faturamento registrado neste período.</p>
              ) : (
                <div className="fin-ranking-lista">
                  {rankingBarbeiros.map((b, i) => (
                    <div key={b.nome} className="fin-ranking-item">
                      <span className="fin-ranking-posicao">{i + 1}</span>
                      <div className="fin-ranking-texto">
                        <div className="fin-ranking-topo">
                          <span className="fin-ranking-nome">{b.nome}</span>
                          <span className="fin-ranking-valor">{formatarMoeda(b.total)}</span>
                        </div>
                        <div className="fin-ranking-barra-fundo">
                          <div
                            className="fin-ranking-barra"
                            style={{ width: `${Math.max(6, (b.total / maiorTotalBarbeiro) * 100)}%` }}
                          />
                        </div>
                        <span className="fin-ranking-atendimentos">
                          {b.atendimentos} atendimento{b.atendimentos !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminFinanceiro