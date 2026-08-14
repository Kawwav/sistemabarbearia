import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexto/AdminAuthContext'
import CadastrosAbas from './cadastrosabas'
import './admbarbeiros.css'

const CHAVE_BARBEIROS = 'barbearia_barbeiros'

const DIAS_SEMANA = [
  { chave: 'dom', label: 'Domingo', abrev: 'Dom' },
  { chave: 'seg', label: 'Segunda', abrev: 'Seg' },
  { chave: 'ter', label: 'Terça', abrev: 'Ter' },
  { chave: 'qua', label: 'Quarta', abrev: 'Qua' },
  { chave: 'qui', label: 'Quinta', abrev: 'Qui' },
  { chave: 'sex', label: 'Sexta', abrev: 'Sex' },
  { chave: 'sab', label: 'Sábado', abrev: 'Sáb' },
]

// jornada padrão: segunda a sábado, 09h às 19h, domingo fechado
function horarioPadrao() {
  return {
    dom: { ativo: false, inicio: '09:00', fim: '19:00' },
    seg: { ativo: true, inicio: '09:00', fim: '19:00' },
    ter: { ativo: true, inicio: '09:00', fim: '19:00' },
    qua: { ativo: true, inicio: '09:00', fim: '19:00' },
    qui: { ativo: true, inicio: '09:00', fim: '19:00' },
    sex: { ativo: true, inicio: '09:00', fim: '19:00' },
    sab: { ativo: true, inicio: '09:00', fim: '19:00' },
  }
}

// dados iniciais só pra não começar com a tela vazia; some assim que alguém edita a lista
const BARBEIROS_SEED = [
  { id: 'joao', nome: 'João Silva', foto: '/barbeiro1.jpg', horarioTrabalho: horarioPadrao() },
  { id: 'pedro', nome: 'Pedro Alves', foto: '/barbeiro2.jpg', horarioTrabalho: horarioPadrao() },
  { id: 'lucas', nome: 'Lucas Souza', foto: '/barbeiro3.jpg', horarioTrabalho: horarioPadrao() },
  { id: 'rafael', nome: 'Rafael Costa', foto: '/barbeiro4.jpg', horarioTrabalho: horarioPadrao() },
]

// TODO: troque essas funções por chamadas reais ao backend (GET/POST/PATCH/DELETE de barbeiros).
// Enquanto isso, tudo fica salvo no localStorage e é compartilhado com adm.jsx e novoagendamento.jsx.
function carregarBarbeiros() {
  try {
    const salvos = localStorage.getItem(CHAVE_BARBEIROS)
    if (salvos) return JSON.parse(salvos)
    localStorage.setItem(CHAVE_BARBEIROS, JSON.stringify(BARBEIROS_SEED))
    return BARBEIROS_SEED
  } catch {
    return BARBEIROS_SEED
  }
}

function salvarBarbeiros(lista) {
  try {
    localStorage.setItem(CHAVE_BARBEIROS, JSON.stringify(lista))
  } catch {
    // sem localStorage disponível, segue sem persistir
  }
}

const BARBEIRO_VAZIO = { nome: '', foto: '', horarioTrabalho: horarioPadrao() }

// resume a jornada em uma linha só: dias ativos + horário (ou aviso se variar por dia)
function resumoHorario(horarioTrabalho) {
  const dias = DIAS_SEMANA.filter((d) => horarioTrabalho?.[d.chave]?.ativo)
  if (dias.length === 0) return 'Sem dias de trabalho definidos'

  const combinacoes = new Set(dias.map((d) => `${horarioTrabalho[d.chave].inicio}-${horarioTrabalho[d.chave].fim}`))
  const listaDias = dias.map((d) => d.abrev).join(', ')

  if (combinacoes.size === 1) {
    const [inicio, fim] = combinacoes.values().next().value.split('-')
    return `${listaDias} · ${inicio} às ${fim}`
  }
  return `${listaDias} · horários variam por dia`
}

function IconeVoltar() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}

function IconeMais() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconeLapis() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function IconeLixeira() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z" />
    </svg>
  )
}

function IconeCamera() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

// formulário compartilhado entre "novo barbeiro" e "editar barbeiro"
function FormBarbeiro({ valor, aoMudar, idCampo }) {
  function handleFoto(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    const leitor = new FileReader()
    leitor.onload = () => aoMudar((atual) => ({ ...atual, foto: leitor.result }))
    leitor.readAsDataURL(arquivo)
  }

  function mudarDia(chave, campo, valorCampo) {
    aoMudar((atual) => ({
      ...atual,
      horarioTrabalho: {
        ...atual.horarioTrabalho,
        [chave]: { ...atual.horarioTrabalho[chave], [campo]: valorCampo },
      },
    }))
  }

  return (
    <div className="admbarbeiros-form">
      <div className="admbarbeiros-form-foto">
        {valor.foto ? (
          <img src={valor.foto} alt="" className="admbarbeiros-avatar admbarbeiros-avatar-grande" />
        ) : (
          <span className="admbarbeiros-avatar admbarbeiros-avatar-grande admbarbeiros-avatar-vazio">
            {(valor.nome || '?').trim().charAt(0).toUpperCase()}
          </span>
        )}
        <label className="admbarbeiros-foto-upload" htmlFor={`${idCampo}-foto`}>
          <IconeCamera />
          {valor.foto ? 'Trocar foto' : 'Adicionar foto'}
        </label>
        <input id={`${idCampo}-foto`} type="file" accept="image/*" onChange={handleFoto} hidden />
      </div>

      <label className="admbarbeiros-campo">
        <span>Nome</span>
        <input
          type="text"
          placeholder="Nome do barbeiro"
          value={valor.nome}
          onChange={(e) => aoMudar((atual) => ({ ...atual, nome: e.target.value }))}
        />
      </label>

      <div className="admbarbeiros-dias">
        <span className="admbarbeiros-dias-titulo">Horário de trabalho</span>
        {DIAS_SEMANA.map((dia) => {
          const horarioDia = valor.horarioTrabalho[dia.chave]
          return (
            <div key={dia.chave} className={`admbarbeiros-dia-linha ${!horarioDia.ativo ? 'admbarbeiros-dia-linha-inativa' : ''}`}>
              <label className="admbarbeiros-dia-toggle">
                <input
                  type="checkbox"
                  checked={horarioDia.ativo}
                  onChange={(e) => mudarDia(dia.chave, 'ativo', e.target.checked)}
                />
                <span>{dia.label}</span>
              </label>
              <input
                type="time"
                value={horarioDia.inicio}
                disabled={!horarioDia.ativo}
                onChange={(e) => mudarDia(dia.chave, 'inicio', e.target.value)}
              />
              <span className="admbarbeiros-dia-ate">às</span>
              <input
                type="time"
                value={horarioDia.fim}
                disabled={!horarioDia.ativo}
                onChange={(e) => mudarDia(dia.chave, 'fim', e.target.value)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AdminBarbeiros() {
  const navigate = useNavigate()
  const { admin, sairAdmin } = useAdminAuth()

  const [barbeiros, setBarbeiros] = useState(() => carregarBarbeiros())
  const [mostrarNovo, setMostrarNovo] = useState(false)
  const [novoBarbeiro, setNovoBarbeiro] = useState(BARBEIRO_VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [rascunho, setRascunho] = useState(BARBEIRO_VAZIO)

  useEffect(() => {
    salvarBarbeiros(barbeiros)
  }, [barbeiros])

  function handleSair() {
    sairAdmin()
    navigate('/admin/login')
  }

  function abrirNovo() {
    setNovoBarbeiro({ ...BARBEIRO_VAZIO, horarioTrabalho: horarioPadrao() })
    setMostrarNovo(true)
    setEditandoId(null)
  }

  function fecharNovo() {
    setMostrarNovo(false)
  }

  const novoBarbeiroValido = novoBarbeiro.nome.trim() !== ''

  function salvarNovo() {
    if (!novoBarbeiroValido) return
    const barbeiro = {
      id: `barbeiro-${Date.now()}`,
      nome: novoBarbeiro.nome.trim(),
      foto: novoBarbeiro.foto,
      horarioTrabalho: novoBarbeiro.horarioTrabalho,
    }
    setBarbeiros((atual) => [...atual, barbeiro])
    setMostrarNovo(false)
  }

  function remover(id) {
    setBarbeiros((atual) => atual.filter((b) => b.id !== id))
    if (editandoId === id) setEditandoId(null)
  }

  function iniciarEdicao(barbeiro) {
    setEditandoId(barbeiro.id)
    setRascunho({
      nome: barbeiro.nome,
      foto: barbeiro.foto || '',
      horarioTrabalho: barbeiro.horarioTrabalho || horarioPadrao(),
    })
    setMostrarNovo(false)
  }

  function cancelarEdicao() {
    setEditandoId(null)
  }

  const rascunhoValido = rascunho.nome.trim() !== ''

  function salvarEdicao(id) {
    if (!rascunhoValido) return
    setBarbeiros((atual) =>
      atual.map((b) =>
        b.id === id
          ? { ...b, nome: rascunho.nome.trim(), foto: rascunho.foto, horarioTrabalho: rascunho.horarioTrabalho }
          : b
      )
    )
    setEditandoId(null)
  }

  return (
    <section className="admbarbeiros">
      <div className="admbarbeiros-cabecalho">
        <div>
          <button type="button" className="admbarbeiros-voltar" onClick={() => navigate('/admin')}>
            <IconeVoltar />
            Voltar aos agendamentos
          </button>
          <p className="admbarbeiros-etiqueta">Cadastros</p>
          <h1 className="admbarbeiros-titulo">Barbeiros</h1>
        </div>
        <div className="admbarbeiros-cabecalho-direita">
          <span className="admbarbeiros-email">{admin?.email}</span>
          <button type="button" className="admbarbeiros-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
      </div>

      <CadastrosAbas ativa="/admin/barbeiros" />

      <div className="admbarbeiros-barra">
        <span className="admbarbeiros-contagem">
          {barbeiros.length} barbeiro{barbeiros.length !== 1 ? 's' : ''} cadastrado{barbeiros.length !== 1 ? 's' : ''}
        </span>
        <button type="button" className="admbarbeiros-novo-abrir" onClick={abrirNovo}>
          <IconeMais />
          Novo barbeiro
        </button>
      </div>

      {mostrarNovo && (
        <div className="admbarbeiros-cartao admbarbeiros-cartao-form">
          <h2 className="admbarbeiros-form-titulo">Novo barbeiro</h2>
          <FormBarbeiro valor={novoBarbeiro} aoMudar={setNovoBarbeiro} idCampo="novo-barbeiro" />
          <div className="admbarbeiros-form-acoes">
            <button type="button" className="admbarbeiros-salvar" disabled={!novoBarbeiroValido} onClick={salvarNovo}>
              Salvar barbeiro
            </button>
            <button type="button" className="admbarbeiros-cancelar" onClick={fecharNovo}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {barbeiros.length === 0 ? (
        <p className="admbarbeiros-vazio">Nenhum barbeiro cadastrado ainda.</p>
      ) : (
        <div className="admbarbeiros-lista">
          {barbeiros.map((barbeiro) => {
            const emEdicao = editandoId === barbeiro.id

            if (emEdicao) {
              return (
                <div key={barbeiro.id} className="admbarbeiros-cartao admbarbeiros-cartao-form">
                  <h2 className="admbarbeiros-form-titulo">Editar barbeiro</h2>
                  <FormBarbeiro valor={rascunho} aoMudar={setRascunho} idCampo={`editar-${barbeiro.id}`} />
                  <div className="admbarbeiros-form-acoes">
                    <button
                      type="button"
                      className="admbarbeiros-salvar"
                      disabled={!rascunhoValido}
                      onClick={() => salvarEdicao(barbeiro.id)}
                    >
                      Salvar alterações
                    </button>
                    <button type="button" className="admbarbeiros-cancelar" onClick={cancelarEdicao}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={barbeiro.id} className="admbarbeiros-cartao">
                <div className="admbarbeiros-cartao-topo">
                  {barbeiro.foto ? (
                    <img src={barbeiro.foto} alt="" className="admbarbeiros-avatar" />
                  ) : (
                    <span className="admbarbeiros-avatar admbarbeiros-avatar-vazio">
                      {(barbeiro.nome || '?').trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="admbarbeiros-info">
                    <h2 className="admbarbeiros-nome">{barbeiro.nome}</h2>
                    <p className="admbarbeiros-horario-resumo">{resumoHorario(barbeiro.horarioTrabalho)}</p>
                  </div>
                </div>
                <div className="admbarbeiros-acoes">
                  <button
                    type="button"
                    className="admbarbeiros-acao"
                    onClick={() => iniciarEdicao(barbeiro)}
                    aria-label="Editar barbeiro"
                    title="Editar barbeiro"
                  >
                    <IconeLapis />
                  </button>
                  <button
                    type="button"
                    className="admbarbeiros-acao admbarbeiros-acao-remover"
                    onClick={() => remover(barbeiro.id)}
                    aria-label="Remover barbeiro"
                    title="Remover barbeiro"
                  >
                    <IconeLixeira />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default AdminBarbeiros