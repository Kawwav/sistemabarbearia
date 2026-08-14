import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexto/AdminAuthContext'
import './adm.css'
import './admclientes.css'

const CHAVE_AGENDAMENTOS = 'barbearia_agendamentos'

const STATUS_ETIQUETA = {
  agendado: 'Agendado',
  concluido: 'Concluído',
  nao_compareceu: 'Não compareceu',
}

// lê os mesmos agendamentos usados em Painel > Agendamentos (adm.jsx); é a única fonte
// de dados de cliente que existe hoje, então a lista de clientes é derivada dela
function carregarAgendamentos() {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS) || '[]')
    return lista.map((a) => ({ status: a.status || 'agendado', ...a }))
  } catch {
    return []
  }
}

function formatarData(data) {
  if (!data) return '—'
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function iniciais(nome) {
  const partes = (nome || '').trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  const primeiro = partes[0][0]
  const ultimo = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeiro + ultimo).toUpperCase()
}

function IconeVoltar() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function IconeChevron({ aberto }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`cli-chevron ${aberto ? 'cli-chevron-aberto' : ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function IconeEmail() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  )
}

function IconeTelefone() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function AdminClientes() {
  const navigate = useNavigate()
  const { admin, sairAdmin } = useAdminAuth()

  const [agendamentos] = useState(() => carregarAgendamentos())
  const [busca, setBusca] = useState('')
  const [expandido, setExpandido] = useState(null)

  // agrupa os agendamentos por cliente (usa o e-mail como identidade quando existe,
  // já que dois clientes podem ter o mesmo nome; sem e-mail, cai pro nome mesmo)
  const clientes = useMemo(() => {
    const mapa = new Map()

    agendamentos.forEach((a) => {
      const nome = (a.cliente || '').trim() || 'Sem nome'
      const emailNormalizado = (a.email || '').trim().toLowerCase()
      const chave = emailNormalizado || `nome:${nome.toLowerCase()}`

      if (!mapa.has(chave)) {
        mapa.set(chave, { chave, nome, email: '', telefone: '', historico: [] })
      }

      const cliente = mapa.get(chave)
      // mantém sempre o dado de contato mais recente que o cliente informou
      if (a.email) cliente.email = a.email
      if (a.telefone) cliente.telefone = a.telefone
      if (a.cliente) cliente.nome = a.cliente
      cliente.historico.push(a)
    })

    return Array.from(mapa.values())
      .map((cliente) => {
        const historico = [...cliente.historico].sort((a, b) => {
          if (a.data === b.data) return (b.horario || '').localeCompare(a.horario || '')
          return (b.data || '').localeCompare(a.data || '')
        })
        const concluidos = historico.filter((h) => h.status === 'concluido')
        const totalGasto = concluidos.reduce((soma, h) => soma + (Number(h.valor) || 0), 0)

        return {
          ...cliente,
          historico,
          totalAgendamentos: historico.length,
          totalGasto,
          ultimaVisita: historico[0]?.data || null,
        }
      })
      .sort((a, b) => (b.ultimaVisita || '').localeCompare(a.ultimaVisita || ''))
  }, [agendamentos])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return clientes
    return clientes.filter((c) => `${c.nome} ${c.email} ${c.telefone}`.toLowerCase().includes(termo))
  }, [clientes, busca])

  function alternarExpandido(chave) {
    setExpandido((atual) => (atual === chave ? null : chave))
  }

  function handleSair() {
    sairAdmin()
    navigate('/admin/login')
  }

  return (
    <section className="adm">
      <div className="adm-cabecalho">
        <div>
          <p className="adm-etiqueta">Painel administrativo</p>
          <h1 className="adm-titulo">Clientes</h1>
        </div>
        <div className="adm-cabecalho-direita">
          <button type="button" className="adm-cadastros" onClick={() => navigate('/admin')}>
            <IconeVoltar />
            Agendamentos
          </button>
          <span className="adm-email">{admin?.email}</span>
          <button type="button" className="adm-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
      </div>

      <div className="adm-barra-ferramentas">
        <input
          type="text"
          className="adm-busca"
          placeholder="Buscar por nome, e-mail ou telefone"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <span className="adm-contagem">
          {filtrados.length} cliente{filtrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filtrados.length === 0 ? (
        <p className="adm-vazio">Nenhum cliente encontrado.</p>
      ) : (
        <div className="cli-lista">
          {filtrados.map((cliente) => {
            const aberto = expandido === cliente.chave

            return (
              <div key={cliente.chave} className={`cli-cartao ${aberto ? 'cli-cartao-aberto' : ''}`}>
                <button type="button" className="cli-resumo" onClick={() => alternarExpandido(cliente.chave)}>
                  <span className="cli-avatar">{iniciais(cliente.nome)}</span>

                  <div className="cli-dados">
                    <span className="cli-nome">{cliente.nome}</span>
                    <span className="cli-contato">
                      {cliente.email && (
                        <span className="cli-contato-item">
                          <IconeEmail />
                          {cliente.email}
                        </span>
                      )}
                      {cliente.telefone && (
                        <span className="cli-contato-item">
                          <IconeTelefone />
                          {cliente.telefone}
                        </span>
                      )}
                      {!cliente.email && !cliente.telefone && (
                        <span className="cli-contato-item cli-sem-contato">Sem dados de contato</span>
                      )}
                    </span>
                  </div>

                  <div className="cli-metricas">
                    <div className="cli-metrica">
                      <span className="cli-metrica-valor">{cliente.totalAgendamentos}</span>
                      <span className="cli-metrica-rotulo">
                        agendamento{cliente.totalAgendamentos !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="cli-metrica">
                      <span className="cli-metrica-valor">{formatarData(cliente.ultimaVisita)}</span>
                      <span className="cli-metrica-rotulo">última visita</span>
                    </div>
                  </div>

                  <IconeChevron aberto={aberto} />
                </button>

                {aberto && (
                  <div className="cli-historico">
                    <h3 className="cli-historico-titulo">Histórico de agendamentos</h3>
                    <div className="adm-tabela">
                      {cliente.historico.map((item, indice) => (
                        <div key={`${cliente.chave}-${indice}`} className="adm-linha">
                          <span className="adm-horario">{item.horario}</span>
                          <div className="adm-info">
                            <div className="adm-info-topo">
                              <span className="adm-cliente">{formatarData(item.data)}</span>
                              {item.status && item.status !== 'agendado' && (
                                <span
                                  className={`adm-status adm-status-${item.status === 'concluido' ? 'concluido' : 'nao-compareceu'}`}
                                >
                                  {STATUS_ETIQUETA[item.status]}
                                </span>
                              )}
                            </div>
                            <span className="adm-detalhe">
                              {item.servico} · {item.barbeiro}
                              {item.filial ? ` · ${item.filial}` : ''}
                              {item.valor ? ` · R$ ${item.valor}` : ''}
                            </span>
                            {item.observacoes && <span className="adm-obs">{item.observacoes}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default AdminClientes
