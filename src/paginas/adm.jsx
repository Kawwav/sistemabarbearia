import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexto/AdminAuthContext'
import './adm.css'

const CHAVE_AGENDAMENTOS = 'barbearia_agendamentos'
const CHAVE_BLOQUEIOS = 'barbearia_bloqueios'
const CHAVE_BARBEIROS = 'barbearia_barbeiros'

const STATUS = {
  AGENDADO: 'agendado',
  CONCLUIDO: 'concluido',
  NAO_COMPARECEU: 'nao_compareceu',
}

const STATUS_ETIQUETA = {
  [STATUS.AGENDADO]: 'Agendado',
  [STATUS.CONCLUIDO]: 'Concluído',
  [STATUS.NAO_COMPARECEU]: 'Não compareceu',
}

// jornada padrão usada ao semear os barbeiros pela primeira vez (ver admbarbeiros.jsx)
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

const BARBEIROS_SEED = [
  { id: 'joao', nome: 'João Silva', foto: '/barbeiro1.jpg', horarioTrabalho: horarioPadrao() },
  { id: 'pedro', nome: 'Pedro Alves', foto: '/barbeiro2.jpg', horarioTrabalho: horarioPadrao() },
  { id: 'lucas', nome: 'Lucas Souza', foto: '/barbeiro3.jpg', horarioTrabalho: horarioPadrao() },
  { id: 'rafael', nome: 'Rafael Costa', foto: '/barbeiro4.jpg', horarioTrabalho: horarioPadrao() },
]

// os barbeiros agora são cadastrados em Cadastros > Barbeiros (admbarbeiros.jsx) e ficam
// salvos no localStorage; essa função só lê a lista atual (não seria necessária com backend real)
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

const CHAVE_SERVICOS = 'barbearia_servicos'
const CHAVE_FILIAIS = 'barbearia_filiais'

// serviços e filiais padrão, usados só na primeira carga; depois disso quem manda é o
// que estiver salvo no localStorage (cadastrado em Cadastros > Serviços / Filiais)
const SERVICOS_SEED = [
  { id: 'cabelo', nome: 'Cabelo', preco: 45 },
  { id: 'barba', nome: 'Barba', preco: 35 },
  { id: 'sobrancelha', nome: 'Sobrancelha', preco: 20 },
  { id: 'cabelo-barba', nome: 'Cabelo + Barba', preco: 70 },
  { id: 'pigmentacao', nome: 'Pigmentação', preco: 40 },
]

const FILIAIS_SEED = [
  { id: 'centro', nome: 'Filial Centro', endereco: 'Rua das Flores, 120', telefone: '' },
  { id: 'zonasul', nome: 'Filial Zona Sul', endereco: 'Av. Brasil, 850', telefone: '' },
]

// serviços agora são cadastrados em Cadastros > Serviços (admservicos.jsx) e ficam
// salvos no localStorage; essa função só lê a lista atual (não seria necessária com backend real)
function carregarServicos() {
  try {
    const salvos = localStorage.getItem(CHAVE_SERVICOS)
    if (salvos) return JSON.parse(salvos)
    localStorage.setItem(CHAVE_SERVICOS, JSON.stringify(SERVICOS_SEED))
    return SERVICOS_SEED
  } catch {
    return SERVICOS_SEED
  }
}

// filiais agora são cadastradas em Cadastros > Filiais (admfiliais.jsx) e ficam
// salvas no localStorage; essa função só lê a lista atual (não seria necessária com backend real)
function carregarFiliais() {
  try {
    const salvas = localStorage.getItem(CHAVE_FILIAIS)
    if (salvas) return JSON.parse(salvas)
    localStorage.setItem(CHAVE_FILIAIS, JSON.stringify(FILIAIS_SEED))
    return FILIAIS_SEED
  } catch {
    return FILIAIS_SEED
  }
}

const NOVO_AGENDAMENTO_VAZIO = {
  cliente: '',
  email: '',
  barbeiro: '',
  filial: '',
  servicos: [],
  data: '',
  horario: '',
  observacoes: '',
}

// período rápido pro filtro de data; "personalizado" libera os campos de/até
const PERIODOS = [
  { id: 'todos', nome: 'Qualquer período' },
  { id: 'hoje', nome: 'Hoje' },
  { id: 'semana', nome: 'Esta semana' },
  { id: 'mes', nome: 'Este mês' },
  { id: 'personalizado', nome: 'Personalizado' },
]

const FILTROS_VAZIOS = {
  barbeiro: '',
  filial: '',
  status: '',
  periodo: 'todos',
  dataInicio: '',
  dataFim: '',
}

// formata Date -> "AAAA-MM-DD" no fuso local (evita o desvio de um dia do toISOString)
function paraDataLocal(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

// converte o período rápido escolhido em um intervalo [inicio, fim] de datas (strings AAAA-MM-DD)
function intervaloDoPeriodo(periodo, dataInicio, dataFim) {
  if (periodo === 'personalizado') return { inicio: dataInicio || null, fim: dataFim || null }
  if (periodo === 'todos') return { inicio: null, fim: null }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

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

const TIPOS_BLOQUEIO = [
  { id: 'folga', nome: 'Folga do barbeiro' },
  { id: 'feriado', nome: 'Feriado' },
  { id: 'manutencao', nome: 'Manutenção' },
]

const TIPO_BLOQUEIO_ETIQUETA = Object.fromEntries(TIPOS_BLOQUEIO.map((t) => [t.id, t.nome]))

const NOVO_BLOQUEIO_VAZIO = {
  tipo: 'folga',
  barbeiro: '',
  data: '',
  diaTodo: true,
  horarioInicio: '',
  horarioFim: '',
  motivo: '',
}

function carregarAgendamentos() {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS) || '[]')
    // agendamentos antigos não tinham status; tudo que já existia entra como "agendado"
    return lista.map((a) => ({ status: STATUS.AGENDADO, ...a }))
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

function carregarBloqueios() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_BLOQUEIOS) || '[]')
  } catch {
    return []
  }
}

function salvarBloqueios(lista) {
  try {
    localStorage.setItem(CHAVE_BLOQUEIOS, JSON.stringify(lista))
  } catch {
    // sem localStorage disponível, segue sem persistir
  }
}

function formatarData(data) {
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

// formata número em reais, ex.: 1234.5 -> "R$ 1.234,50"
function formatarMoeda(valor) {
  return (valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function gerarId(prefixo) {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function IconeLixeira() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z" />
    </svg>
  )
}

function IconeCheck() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function IconeX() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
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

function IconeMais() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconeFiltro() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  )
}

function IconeCliente() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconeUsuarios() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconeCadeado() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function IconeEstrela() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5 15.09 9l7.16.62-5.41 4.7 1.64 6.99L12 17.77 5.52 21.3l1.64-6.99-5.41-4.7L8.91 9 12 2.5Z" />
    </svg>
  )
}

function IconeCalendario() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconeCifrao() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function IconeGrafico() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-4 4" />
    </svg>
  )
}

function IconeAlerta() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  )
}

function IconeSino() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function Admin() {
  const navigate = useNavigate()
  const { admin, sairAdmin } = useAdminAuth()

  const [agendamentos, setAgendamentos] = useState(() => carregarAgendamentos())
  const [barbeiros] = useState(() => carregarBarbeiros())
  const [servicos] = useState(() => carregarServicos())
  const [filiais] = useState(() => carregarFiliais())
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [editandoIndice, setEditandoIndice] = useState(null)
  const [rascunho, setRascunho] = useState({ barbeiro: '', data: '', horario: '' })
  const [mostrarNovo, setMostrarNovo] = useState(false)
  const [novoAgendamento, setNovoAgendamento] = useState(NOVO_AGENDAMENTO_VAZIO)
  const [bloqueios, setBloqueios] = useState(() => carregarBloqueios())
  const [mostrarBloqueio, setMostrarBloqueio] = useState(false)
  const [novoBloqueio, setNovoBloqueio] = useState(NOVO_BLOQUEIO_VAZIO)
  const [notificacoes, setNotificacoes] = useState([])
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false)
  const [toasts, setToasts] = useState([])
  const notificacoesRef = useRef(null)

  // mantém o localStorage em dia sempre que a lista muda (ex.: após alterar status)
  useEffect(() => {
    salvarAgendamentos(agendamentos)
  }, [agendamentos])

  useEffect(() => {
    salvarBloqueios(bloqueios)
  }, [bloqueios])

  // avisa o admin quando chega um agendamento novo que não foi criado por ele
  // mesmo nesta aba (ex.: cliente reservando pelo site). Ações feitas aqui (excluir,
  // editar, "Novo agendamento" manual) já atualizam o estado direto, então não
  // disparam esse aviso — só o que aparece "por fora" (outra aba ou o polling).
  function notificarNovosAgendamentos(novos) {
    if (novos.length === 0) return

    const novasNotificacoes = novos.map((a) => ({
      id: gerarId('notif'),
      cliente: a.cliente || 'Sem nome',
      data: a.data,
      horario: a.horario,
      servico: a.servico,
      lida: false,
    }))

    setNotificacoes((atual) => [...novasNotificacoes, ...atual].slice(0, 30))

    novasNotificacoes.forEach((notificacao) => {
      const toastId = gerarId('toast')
      setToasts((atual) => [...atual, { ...notificacao, toastId }])
      setTimeout(() => {
        setToasts((atual) => atual.filter((t) => t.toastId !== toastId))
      }, 6000)
    })
  }

  useEffect(() => {
    function sincronizarComStorage() {
      let listaAtual
      try {
        listaAtual = JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS) || '[]').map((a) => ({
          status: a.status || STATUS.AGENDADO,
          ...a,
        }))
      } catch {
        return
      }

      setAgendamentos((atual) => {
        // só reage quando surgiram itens NOVOS (a lista cresceu); alterações feitas
        // aqui mesmo já estão refletidas em "atual", então não geram notificação duplicada
        if (listaAtual.length <= atual.length) return atual
        const novos = listaAtual.slice(atual.length)
        notificarNovosAgendamentos(novos)
        return listaAtual
      })
    }

    function aoMudarStorage(evento) {
      if (evento.key === CHAVE_AGENDAMENTOS) sincronizarComStorage()
    }

    // 'storage' cobre quando o agendamento chega por outra aba/janela; o intervalo
    // é um reforço pra não depender só do evento (alguns navegadores atrasam em aba oculta)
    window.addEventListener('storage', aoMudarStorage)
    const intervalo = setInterval(sincronizarComStorage, 5000)

    return () => {
      window.removeEventListener('storage', aoMudarStorage)
      clearInterval(intervalo)
    }
  }, [])

  function excluir(indice) {
    setAgendamentos((atual) => atual.filter((_, i) => i !== indice))
    if (editandoIndice === indice) setEditandoIndice(null)
  }

  function alternarStatus(indice, novoStatus) {
    setAgendamentos((atual) =>
      atual.map((a, i) => {
        if (i !== indice) return a
        // clicar de novo no mesmo status desfaz e volta pra "agendado"
        const status = a.status === novoStatus ? STATUS.AGENDADO : novoStatus
        return { ...a, status }
      })
    )
  }

  function iniciarEdicao(item) {
    setEditandoIndice(item.indiceOriginal)
    setRascunho({ barbeiro: item.barbeiro, data: item.data, horario: item.horario })
  }

  function cancelarEdicao() {
    setEditandoIndice(null)
  }

  function salvarEdicao(indice) {
    if (!rascunho.barbeiro || !rascunho.data || !rascunho.horario) return

    setAgendamentos((atual) =>
      atual.map((a, i) =>
        i === indice
          ? { ...a, barbeiro: rascunho.barbeiro, data: rascunho.data, horario: rascunho.horario }
          : a
      )
    )
    setEditandoIndice(null)
  }

  function handleSair() {
    sairAdmin()
    navigate('/admin/login')
  }

  // fecha o painel de notificações quando o clique acontece fora dele (ou com a tecla Esc)
  useEffect(() => {
    if (!mostrarNotificacoes) return

    function aoClicarFora(evento) {
      if (notificacoesRef.current && !notificacoesRef.current.contains(evento.target)) {
        setMostrarNotificacoes(false)
      }
    }

    function aoPressionarTecla(evento) {
      if (evento.key === 'Escape') setMostrarNotificacoes(false)
    }

    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoPressionarTecla)

    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoPressionarTecla)
    }
  }, [mostrarNotificacoes])

  function alternarNotificacoes() {
    setMostrarNotificacoes((atual) => {
      const proximo = !atual
      // ao abrir o painel, marca tudo como lido (o sino já cumpriu o papel de avisar)
      if (proximo) setNotificacoes((n) => n.map((item) => ({ ...item, lida: true })))
      return proximo
    })
  }

  function limparNotificacoes() {
    setNotificacoes([])
  }

  const notificacoesNaoLidas = notificacoes.filter((n) => !n.lida).length

  function abrirNovo() {
    setNovoAgendamento(NOVO_AGENDAMENTO_VAZIO)
    setMostrarNovo(true)
    setMostrarBloqueio(false)
    setEditandoIndice(null)
  }

  function fecharNovo() {
    setMostrarNovo(false)
  }

  function alternarServicoNovo(id) {
    setNovoAgendamento((atual) => ({
      ...atual,
      servicos: atual.servicos.includes(id)
        ? atual.servicos.filter((s) => s !== id)
        : [...atual.servicos, id],
    }))
  }

  const novoAgendamentoValido =
    novoAgendamento.cliente.trim() !== '' &&
    Boolean(novoAgendamento.barbeiro) &&
    novoAgendamento.servicos.length > 0 &&
    Boolean(novoAgendamento.data) &&
    Boolean(novoAgendamento.horario)

  function salvarNovo() {
    if (!novoAgendamentoValido) return

    const servicosEscolhidos = servicos.filter((s) => novoAgendamento.servicos.includes(s.id))
    const valorTotal = servicosEscolhidos.reduce((total, s) => total + s.preco, 0)

    const agendamento = {
      cliente: novoAgendamento.cliente.trim(),
      // sem e-mail o cliente não aparece em "Meus agendamentos" dele, mas continua listado aqui
      email: novoAgendamento.email.trim(),
      barbeiro: novoAgendamento.barbeiro,
      filial: novoAgendamento.filial,
      servico: servicosEscolhidos.map((s) => s.nome).join(', '),
      valor: valorTotal,
      data: novoAgendamento.data,
      horario: novoAgendamento.horario,
      observacoes: novoAgendamento.observacoes.trim(),
      status: STATUS.AGENDADO,
    }

    setAgendamentos((atual) => [...atual, agendamento])
    setMostrarNovo(false)
  }

  function abrirBloqueio() {
    setNovoBloqueio(NOVO_BLOQUEIO_VAZIO)
    setMostrarBloqueio(true)
    setMostrarNovo(false)
    setEditandoIndice(null)
  }

  function fecharBloqueio() {
    setMostrarBloqueio(false)
  }

  const novoBloqueioValido =
    Boolean(novoBloqueio.data) &&
    (novoBloqueio.tipo !== 'folga' || Boolean(novoBloqueio.barbeiro)) &&
    (novoBloqueio.diaTodo || (Boolean(novoBloqueio.horarioInicio) && Boolean(novoBloqueio.horarioFim)))

  function salvarBloqueio() {
    if (!novoBloqueioValido) return

    const bloqueio = {
      id: `bloqueio-${Date.now()}`,
      tipo: novoBloqueio.tipo,
      // folga é sempre de um barbeiro específico; feriado e manutenção, por padrão, valem pra todos
      barbeiro: novoBloqueio.tipo === 'folga' ? novoBloqueio.barbeiro : novoBloqueio.barbeiro || '',
      data: novoBloqueio.data,
      diaTodo: novoBloqueio.diaTodo,
      horarioInicio: novoBloqueio.diaTodo ? '' : novoBloqueio.horarioInicio,
      horarioFim: novoBloqueio.diaTodo ? '' : novoBloqueio.horarioFim,
      motivo: novoBloqueio.motivo.trim(),
    }

    setBloqueios((atual) =>
      [...atual, bloqueio].sort((a, b) => a.data.localeCompare(b.data))
    )
    setMostrarBloqueio(false)
  }

  function removerBloqueio(id) {
    setBloqueios((atual) => atual.filter((b) => b.id !== id))
  }

  // true quando algum filtro (além da busca por texto) está ativo
  const temFiltrosAtivos =
    Boolean(filtros.barbeiro) ||
    Boolean(filtros.filial) ||
    Boolean(filtros.status) ||
    filtros.periodo !== 'todos'

  function limparFiltros() {
    setFiltros(FILTROS_VAZIOS)
  }

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const comIndice = agendamentos.map((agendamento, indiceOriginal) => ({ ...agendamento, indiceOriginal }))

    const { inicio, fim } = intervaloDoPeriodo(filtros.periodo, filtros.dataInicio, filtros.dataFim)

    const lista = comIndice.filter((a) => {
      if (termo && !`${a.cliente} ${a.email} ${a.servico} ${a.barbeiro}`.toLowerCase().includes(termo)) {
        return false
      }
      if (filtros.barbeiro && a.barbeiro !== filtros.barbeiro) return false
      if (filtros.filial && a.filial !== filtros.filial) return false
      if (filtros.status && (a.status || STATUS.AGENDADO) !== filtros.status) return false
      if (inicio && a.data < inicio) return false
      if (fim && a.data > fim) return false
      return true
    })

    return lista.sort((a, b) => {
      if (a.data === b.data) return a.horario.localeCompare(b.horario)
      return a.data.localeCompare(b.data)
    })
  }, [agendamentos, busca, filtros])

  const grupos = useMemo(() => {
    const mapa = new Map()
    filtrados.forEach((agendamento) => {
      const chave = agendamento.data
      if (!mapa.has(chave)) mapa.set(chave, [])
      mapa.get(chave).push(agendamento)
    })
    return Array.from(mapa.entries())
  }, [filtrados])

  // métricas dos cards do topo: sempre calculadas sobre TODOS os agendamentos
  // (não sobre a lista filtrada/buscada), pra dar uma visão geral fixa do salão
  const metricas = useMemo(() => {
    const hoje = paraDataLocal(new Date())
    const { inicio: inicioSemana, fim: fimSemana } = intervaloDoPeriodo('semana', '', '')

    const agendamentosHoje = agendamentos.filter((a) => a.data === hoje)

    const faturamentoHoje = agendamentos
      .filter((a) => a.data === hoje && a.status === STATUS.CONCLUIDO)
      .reduce((soma, a) => soma + (Number(a.valor) || 0), 0)

    const faturamentoSemana = agendamentos
      .filter((a) => a.data >= inicioSemana && a.data <= fimSemana && a.status === STATUS.CONCLUIDO)
      .reduce((soma, a) => soma + (Number(a.valor) || 0), 0)

    // taxa de cancelamento = "não compareceu" sobre o total de agendamentos já
    // resolvidos (concluídos + não compareceu); os que ainda estão "agendado" não entram
    const resolvidos = agendamentos.filter(
      (a) => a.status === STATUS.CONCLUIDO || a.status === STATUS.NAO_COMPARECEU
    )
    const naoCompareceram = resolvidos.filter((a) => a.status === STATUS.NAO_COMPARECEU).length
    const taxaCancelamento = resolvidos.length > 0 ? (naoCompareceram / resolvidos.length) * 100 : 0

    return {
      totalHoje: agendamentosHoje.length,
      faturamentoHoje,
      faturamentoSemana,
      taxaCancelamento,
    }
  }, [agendamentos])

  return (
    <section className="adm">
      {toasts.length > 0 && (
        <div className="adm-toasts">
          {toasts.map((toast) => (
            <div key={toast.toastId} className="adm-toast">
              <span className="adm-toast-icone">
                <IconeSino />
              </span>
              <div className="adm-toast-texto">
                <span className="adm-toast-titulo">Novo agendamento</span>
                <span className="adm-toast-detalhe">
                  {toast.cliente} · {formatarData(toast.data)} às {toast.horario}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="adm-cabecalho">
        <div>
          <p className="adm-etiqueta">Painel administrativo</p>
          <h1 className="adm-titulo">Agendamentos</h1>
        </div>
        <div className="adm-cabecalho-direita">
          <div className="adm-sino-wrap" ref={notificacoesRef}>
            <button
              type="button"
              className="adm-sino"
              onClick={alternarNotificacoes}
              aria-label="Notificações"
              title="Notificações"
            >
              <IconeSino />
              {notificacoesNaoLidas > 0 && (
                <span className="adm-sino-badge">{notificacoesNaoLidas > 9 ? '9+' : notificacoesNaoLidas}</span>
              )}
            </button>

            {mostrarNotificacoes && (
              <div className="adm-notificacoes-painel">
                <div className="adm-notificacoes-cabecalho">
                  <span>Notificações</span>
                  <div className="adm-notificacoes-cabecalho-acoes">
                    {notificacoes.length > 0 && (
                      <button type="button" className="adm-notificacoes-limpar" onClick={limparNotificacoes}>
                        Limpar
                      </button>
                    )}
                    <button
                      type="button"
                      className="adm-notificacoes-fechar"
                      onClick={() => setMostrarNotificacoes(false)}
                      aria-label="Fechar notificações"
                      title="Fechar"
                    >
                      <IconeX />
                    </button>
                  </div>
                </div>

                {notificacoes.length === 0 ? (
                  <p className="adm-notificacoes-vazio">Nenhum agendamento novo por aqui ainda.</p>
                ) : (
                  <div className="adm-notificacoes-lista">
                    {notificacoes.map((notificacao) => (
                      <div key={notificacao.id} className="adm-notificacao-item">
                        <span className="adm-cliente">{notificacao.cliente}</span>
                        <span className="adm-detalhe">
                          Novo agendamento · {formatarData(notificacao.data)} às {notificacao.horario}
                          {notificacao.servico ? ` · ${notificacao.servico}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button type="button" className="adm-cadastros" onClick={() => navigate('/admin/clientes')}>
            <IconeCliente />
            Clientes
          </button>
          <button type="button" className="adm-cadastros" onClick={() => navigate('/admin/clube')}>
            <IconeEstrela />
            Clube Falcão
          </button>
          <button type="button" className="adm-cadastros" onClick={() => navigate('/admin/barbeiros')}>
            <IconeUsuarios />
            Cadastros
          </button>
          <span className="adm-email">{admin?.email}</span>
          <button type="button" className="adm-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
      </div>

      <div className="adm-metricas">
        <div className="adm-metrica-cartao">
          <span className="adm-metrica-icone">
            <IconeCalendario />
          </span>
          <div className="adm-metrica-texto">
            <span className="adm-metrica-valor">{metricas.totalHoje}</span>
            <span className="adm-metrica-rotulo">
              agendamento{metricas.totalHoje !== 1 ? 's' : ''} hoje
            </span>
          </div>
        </div>

        <div className="adm-metrica-cartao">
          <span className="adm-metrica-icone">
            <IconeCifrao />
          </span>
          <div className="adm-metrica-texto">
            <span className="adm-metrica-valor">{formatarMoeda(metricas.faturamentoHoje)}</span>
            <span className="adm-metrica-rotulo">faturamento hoje</span>
          </div>
        </div>

        <div className="adm-metrica-cartao">
          <span className="adm-metrica-icone">
            <IconeGrafico />
          </span>
          <div className="adm-metrica-texto">
            <span className="adm-metrica-valor">{formatarMoeda(metricas.faturamentoSemana)}</span>
            <span className="adm-metrica-rotulo">faturamento na semana</span>
          </div>
        </div>

        <div className="adm-metrica-cartao">
          <span className="adm-metrica-icone adm-metrica-icone-alerta">
            <IconeAlerta />
          </span>
          <div className="adm-metrica-texto">
            <span className="adm-metrica-valor">{metricas.taxaCancelamento.toFixed(1)}%</span>
            <span className="adm-metrica-rotulo">taxa de não comparecimento</span>
          </div>
        </div>
      </div>

      <div className="adm-barra-ferramentas">
        <input
          type="text"
          className="adm-busca"
          placeholder="Buscar por cliente, e-mail, serviço ou barbeiro"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <span className="adm-contagem">
          {filtrados.length} agendamento{filtrados.length !== 1 ? 's' : ''}
        </span>
        <button
          type="button"
          className={`adm-bloquear-abrir ${temFiltrosAtivos ? 'adm-filtros-abrir-ativo' : ''}`}
          onClick={() => setMostrarFiltros((v) => !v)}
        >
          <IconeFiltro />
          Filtros{temFiltrosAtivos ? ` (${[filtros.barbeiro, filtros.filial, filtros.status, filtros.periodo !== 'todos' ? filtros.periodo : ''].filter(Boolean).length})` : ''}
        </button>
        <button type="button" className="adm-novo-abrir" onClick={abrirNovo}>
          <IconeMais />
          Novo agendamento
        </button>
        <button type="button" className="adm-bloquear-abrir" onClick={abrirBloqueio}>
          <IconeCadeado />
          Bloquear horário
        </button>
      </div>

      {mostrarFiltros && (
        <div className="adm-filtros">
          <label className="adm-filtro-campo">
            <span>Barbeiro</span>
            <select
              value={filtros.barbeiro}
              onChange={(e) => setFiltros((f) => ({ ...f, barbeiro: e.target.value }))}
            >
              <option value="">Todos</option>
              {barbeiros.map((b) => (
                <option key={b.id} value={b.nome}>
                  {b.nome}
                </option>
              ))}
            </select>
          </label>

          {filiais.length > 1 && (
            <label className="adm-filtro-campo">
              <span>Filial</span>
              <select
                value={filtros.filial}
                onChange={(e) => setFiltros((f) => ({ ...f, filial: e.target.value }))}
              >
                <option value="">Todas</option>
                {filiais.map((f) => (
                  <option key={f.id} value={f.nome}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="adm-filtro-campo">
            <span>Status</span>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">Todos</option>
              {Object.values(STATUS).map((s) => (
                <option key={s} value={s}>
                  {STATUS_ETIQUETA[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="adm-filtro-campo">
            <span>Período</span>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros((f) => ({ ...f, periodo: e.target.value }))}
            >
              {PERIODOS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>

          {filtros.periodo === 'personalizado' && (
            <>
              <label className="adm-filtro-campo">
                <span>De</span>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros((f) => ({ ...f, dataInicio: e.target.value }))}
                />
              </label>
              <label className="adm-filtro-campo">
                <span>Até</span>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros((f) => ({ ...f, dataFim: e.target.value }))}
                />
              </label>
            </>
          )}

          {temFiltrosAtivos && (
            <button type="button" className="adm-filtros-limpar" onClick={limparFiltros}>
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {mostrarNovo && (
        <div className="adm-novo-cartao">
          <div className="adm-novo-cabecalho">
            <div>
              <h2 className="adm-novo-titulo">Agendamento manual</h2>
              <p className="adm-novo-subtitulo">Pra cliente que ligou ou chegou sem passar pelo app.</p>
            </div>
          </div>

          <div className="adm-novo-grade">
            <label className="adm-novo-campo">
              <span>Cliente</span>
              <input
                type="text"
                placeholder="Nome do cliente"
                value={novoAgendamento.cliente}
                onChange={(e) => setNovoAgendamento((a) => ({ ...a, cliente: e.target.value }))}
              />
            </label>
            <label className="adm-novo-campo">
              <span>E-mail (opcional)</span>
              <input
                type="email"
                placeholder="cliente@email.com"
                value={novoAgendamento.email}
                onChange={(e) => setNovoAgendamento((a) => ({ ...a, email: e.target.value }))}
              />
            </label>
            <label className="adm-novo-campo">
              <span>Barbeiro</span>
              <select
                value={novoAgendamento.barbeiro}
                onChange={(e) => setNovoAgendamento((a) => ({ ...a, barbeiro: e.target.value }))}
              >
                <option value="">Selecione</option>
                {barbeiros.map((b) => (
                  <option key={b.id} value={b.nome}>
                    {b.nome}
                  </option>
                ))}
              </select>
            </label>
            {filiais.length > 1 && (
              <label className="adm-novo-campo">
                <span>Filial</span>
                <select
                  value={novoAgendamento.filial}
                  onChange={(e) => setNovoAgendamento((a) => ({ ...a, filial: e.target.value }))}
                >
                  <option value="">Selecione</option>
                  {filiais.map((f) => (
                    <option key={f.id} value={f.nome}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="adm-novo-campo">
              <span>Data</span>
              <input
                type="date"
                value={novoAgendamento.data}
                onChange={(e) => setNovoAgendamento((a) => ({ ...a, data: e.target.value }))}
              />
            </label>
            <label className="adm-novo-campo">
              <span>Horário</span>
              <input
                type="time"
                value={novoAgendamento.horario}
                onChange={(e) => setNovoAgendamento((a) => ({ ...a, horario: e.target.value }))}
              />
            </label>

            <div className="adm-novo-campo adm-novo-campo-largo">
              <span>Serviços</span>
              <div className="adm-novo-chips">
                {servicos.map((servico) => (
                  <button
                    type="button"
                    key={servico.id}
                    className={`adm-novo-chip ${novoAgendamento.servicos.includes(servico.id) ? 'adm-novo-chip-ativo' : ''}`}
                    onClick={() => alternarServicoNovo(servico.id)}
                  >
                    {servico.nome}
                    <span className="adm-novo-chip-preco">R$ {servico.preco}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="adm-novo-campo adm-novo-campo-largo">
              <span>Observações (opcional)</span>
              <textarea
                placeholder="Alguma preferência ou detalhe que o barbeiro deveria saber?"
                value={novoAgendamento.observacoes}
                onChange={(e) => setNovoAgendamento((a) => ({ ...a, observacoes: e.target.value }))}
              />
            </label>
          </div>

          <div className="adm-novo-acoes">
            <button type="button" className="adm-novo-salvar" disabled={!novoAgendamentoValido} onClick={salvarNovo}>
              Salvar agendamento
            </button>
            <button type="button" className="adm-novo-cancelar" onClick={fecharNovo}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {mostrarBloqueio && (
        <div className="adm-bloqueio-cartao">
          <div className="adm-novo-cabecalho">
            <div>
              <h2 className="adm-novo-titulo">Bloquear horário</h2>
              <p className="adm-novo-subtitulo">Folga do barbeiro, feriado ou manutenção — some da grade de agendamento.</p>
            </div>
          </div>

          <div className="adm-novo-grade">
            <label className="adm-novo-campo">
              <span>Tipo</span>
              <select
                value={novoBloqueio.tipo}
                onChange={(e) => setNovoBloqueio((b) => ({ ...b, tipo: e.target.value }))}
              >
                {TIPOS_BLOQUEIO.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-novo-campo">
              <span>Barbeiro {novoBloqueio.tipo !== 'folga' && '(opcional)'}</span>
              <select
                value={novoBloqueio.barbeiro}
                onChange={(e) => setNovoBloqueio((b) => ({ ...b, barbeiro: e.target.value }))}
              >
                <option value="">Todos os barbeiros</option>
                {barbeiros.map((b) => (
                  <option key={b.id} value={b.nome}>
                    {b.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-novo-campo">
              <span>Data</span>
              <input
                type="date"
                value={novoBloqueio.data}
                onChange={(e) => setNovoBloqueio((b) => ({ ...b, data: e.target.value }))}
              />
            </label>

            <label className="adm-bloqueio-diatodo">
              <input
                type="checkbox"
                checked={novoBloqueio.diaTodo}
                onChange={(e) => setNovoBloqueio((b) => ({ ...b, diaTodo: e.target.checked }))}
              />
              <span>Bloquear o dia inteiro</span>
            </label>

            {!novoBloqueio.diaTodo && (
              <>
                <label className="adm-novo-campo">
                  <span>Início</span>
                  <input
                    type="time"
                    value={novoBloqueio.horarioInicio}
                    onChange={(e) => setNovoBloqueio((b) => ({ ...b, horarioInicio: e.target.value }))}
                  />
                </label>
                <label className="adm-novo-campo">
                  <span>Fim</span>
                  <input
                    type="time"
                    value={novoBloqueio.horarioFim}
                    onChange={(e) => setNovoBloqueio((b) => ({ ...b, horarioFim: e.target.value }))}
                  />
                </label>
              </>
            )}

            <label className="adm-novo-campo adm-novo-campo-largo">
              <span>Motivo (opcional)</span>
              <input
                type="text"
                placeholder="Ex.: consulta médica, reforma no salão..."
                value={novoBloqueio.motivo}
                onChange={(e) => setNovoBloqueio((b) => ({ ...b, motivo: e.target.value }))}
              />
            </label>
          </div>

          <div className="adm-novo-acoes">
            <button type="button" className="adm-novo-salvar" disabled={!novoBloqueioValido} onClick={salvarBloqueio}>
              Salvar bloqueio
            </button>
            <button type="button" className="adm-novo-cancelar" onClick={fecharBloqueio}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {bloqueios.length > 0 && (
        <div className="adm-bloqueios-lista">
          <h2 className="adm-bloqueios-titulo">Horários bloqueados</h2>
          <div className="adm-tabela">
            {bloqueios.map((b) => (
              <div key={b.id} className="adm-bloqueio-linha">
                <span className={`adm-status adm-status-bloqueio-${b.tipo}`}>{TIPO_BLOQUEIO_ETIQUETA[b.tipo]}</span>
                <div className="adm-info">
                  <span className="adm-cliente">{formatarData(b.data)}</span>
                  <span className="adm-detalhe">
                    {b.barbeiro || 'Todos os barbeiros'} · {b.diaTodo ? 'Dia inteiro' : `${b.horarioInicio} às ${b.horarioFim}`}
                  </span>
                  {b.motivo && <span className="adm-obs">{b.motivo}</span>}
                </div>
                <button
                  type="button"
                  className="adm-acao adm-cancelar"
                  onClick={() => removerBloqueio(b.id)}
                  aria-label="Remover bloqueio"
                  title="Remover bloqueio"
                >
                  <IconeLixeira />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {grupos.length === 0 ? (
        <p className="adm-vazio">Nenhum agendamento encontrado.</p>
      ) : (
        <div className="adm-grupos">
          {grupos.map(([data, itens]) => (
            <div key={data} className="adm-grupo">
              <h2 className="adm-grupo-titulo">{formatarData(data)}</h2>
              <div className="adm-tabela">
                {itens.map((item) => {
                  const status = item.status || STATUS.AGENDADO
                  const emEdicao = editandoIndice === item.indiceOriginal

                  if (emEdicao) {
                    return (
                      <div key={item.indiceOriginal} className="adm-linha adm-linha-editando">
                        <div className="adm-editar-form">
                          <label className="adm-editar-campo">
                            <span>Barbeiro</span>
                            <select
                              value={rascunho.barbeiro}
                              onChange={(e) => setRascunho((r) => ({ ...r, barbeiro: e.target.value }))}
                            >
                              {barbeiros.map((b) => (
                                <option key={b.id} value={b.nome}>
                                  {b.nome}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="adm-editar-campo">
                            <span>Data</span>
                            <input
                              type="date"
                              value={rascunho.data}
                              onChange={(e) => setRascunho((r) => ({ ...r, data: e.target.value }))}
                            />
                          </label>
                          <label className="adm-editar-campo">
                            <span>Horário</span>
                            <input
                              type="time"
                              value={rascunho.horario}
                              onChange={(e) => setRascunho((r) => ({ ...r, horario: e.target.value }))}
                            />
                          </label>
                          <div className="adm-editar-acoes">
                            <button
                              type="button"
                              className="adm-editar-salvar"
                              onClick={() => salvarEdicao(item.indiceOriginal)}
                            >
                              Salvar
                            </button>
                            <button type="button" className="adm-editar-cancelar" onClick={cancelarEdicao}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={item.indiceOriginal}
                      className={`adm-linha ${status !== STATUS.AGENDADO ? 'adm-linha-resolvida' : ''}`}
                    >
                      <span className="adm-horario">{item.horario}</span>
                      <div className="adm-info">
                        <div className="adm-info-topo">
                          <span className="adm-cliente">{item.cliente || 'Sem nome'}</span>
                          {status !== STATUS.AGENDADO && (
                            <span
                              className={`adm-status adm-status-${status === STATUS.CONCLUIDO ? 'concluido' : 'nao-compareceu'}`}
                            >
                              {STATUS_ETIQUETA[status]}
                            </span>
                          )}
                        </div>
                        <span className="adm-detalhe">
                          {item.servico} · {item.barbeiro}
                          {item.filial ? ` · ${item.filial}` : ''}
                        </span>
                        {item.observacoes && <span className="adm-obs">{item.observacoes}</span>}
                      </div>

                      <div className="adm-acoes">
                        <button
                          type="button"
                          className="adm-acao adm-acao-editar"
                          onClick={() => iniciarEdicao(item)}
                          aria-label="Editar agendamento"
                          title="Editar agendamento"
                        >
                          <IconeLapis />
                        </button>
                        <button
                          type="button"
                          className={`adm-acao adm-acao-concluir ${status === STATUS.CONCLUIDO ? 'adm-acao-concluir-ativa' : ''}`}
                          onClick={() => alternarStatus(item.indiceOriginal, STATUS.CONCLUIDO)}
                          aria-label="Marcar como concluído"
                          title="Marcar como concluído"
                        >
                          <IconeCheck />
                        </button>
                        <button
                          type="button"
                          className={`adm-acao adm-acao-naocompareceu ${status === STATUS.NAO_COMPARECEU ? 'adm-acao-naocompareceu-ativa' : ''}`}
                          onClick={() => alternarStatus(item.indiceOriginal, STATUS.NAO_COMPARECEU)}
                          aria-label="Marcar que não compareceu"
                          title="Marcar que não compareceu"
                        >
                          <IconeX />
                        </button>
                        <button
                          type="button"
                          className="adm-acao adm-cancelar"
                          onClick={() => excluir(item.indiceOriginal)}
                          aria-label="Excluir agendamento"
                          title="Excluir agendamento"
                        >
                          <IconeLixeira />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Admin