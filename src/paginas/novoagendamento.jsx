import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import './novoagendamento.css'

const CHAVE_AGENDAMENTOS = 'barbearia_agendamentos'
const CHAVE_BLOQUEIOS = 'barbearia_bloqueios'
const CHAVE_BARBEIROS = 'barbearia_barbeiros'
const CHAVE_FILIAIS = 'barbearia_filiais'
const CHAVE_SERVICOS = 'barbearia_servicos'
const NOMES_DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const CHAVES_DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']

// filial padrão usada só na primeira carga; depois disso quem manda é o que estiver
// salvo no localStorage (cadastrado em Cadastros > Filiais, no painel admin).
// Se a barbearia tiver só uma filial, deixe a lista com 1 item — a etapa some sozinha.
const FILIAIS_SEED = [
  { id: 'centro', nome: 'Filial Centro', endereco: 'Rua das Flores, 120' },
  { id: 'zonasul', nome: 'Filial Zona Sul', endereco: 'Av. Brasil, 850' },
]

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

// jornada padrão usada ao semear os barbeiros pela primeira vez
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

// barbeiros agora são cadastrados em Cadastros > Barbeiros no painel admin (admbarbeiros.jsx)
// e ficam salvos no localStorage, incluindo foto e horário de trabalho de cada um
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

// serviços e preços padrão, usados só na primeira carga; depois disso quem manda é o
// que estiver salvo no localStorage (cadastrado em Cadastros > Serviços, no painel admin)
const SERVICOS_SEED = [
  { id: 'cabelo', nome: 'Cabelo', preco: 45 },
  { id: 'barba', nome: 'Barba', preco: 35 },
  { id: 'sobrancelha', nome: 'Sobrancelha', preco: 20 },
  { id: 'cabelo-barba', nome: 'Cabelo + Barba', preco: 70 },
  { id: 'pigmentacao', nome: 'Pigmentação', preco: 40 },
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

function carregarBloqueios() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_BLOQUEIOS) || '[]')
  } catch {
    return []
  }
}

// um bloqueio vale se for pra "todos os barbeiros" (campo vazio) ou pro barbeiro escolhido
function bloqueioValePara(bloqueio, chaveDia, nomeBarbeiro) {
  if (bloqueio.data !== chaveDia) return false
  return !bloqueio.barbeiro || bloqueio.barbeiro === nomeBarbeiro
}

function diaBloqueado(bloqueios, chaveDia, nomeBarbeiro) {
  return bloqueios.some((b) => b.diaTodo && bloqueioValePara(b, chaveDia, nomeBarbeiro))
}

function horarioBloqueado(bloqueios, chaveDia, hora, nomeBarbeiro) {
  return bloqueios.some((b) => {
    if (!bloqueioValePara(b, chaveDia, nomeBarbeiro)) return false
    if (b.diaTodo) return true
    return hora >= b.horarioInicio && hora < b.horarioFim
  })
}

// um horário já marcado por outro cliente (mesmo barbeiro, mesmo dia, mesmo horário) fica indisponível
function horarioJaMarcado(agendamentos, chaveDia, hora, nomeBarbeiro) {
  return agendamentos.some((a) => a.data === chaveDia && a.horario === hora && a.barbeiro === nomeBarbeiro)
}

// gera os 7 dias da semana atual (dom a sáb), marcando os que já passaram
// e os que estão disponíveis pra agendamento (respeitando a jornada do barbeiro)
function gerarDiasDaSemana(bloqueios, barbeiro) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay())

  const dias = []
  for (let i = 0; i < 7; i++) {
    const data = new Date(inicioSemana)
    data.setDate(inicioSemana.getDate() + i)

    const chave = data.toISOString().slice(0, 10)
    const bloqueado = diaBloqueado(bloqueios, chave, barbeiro?.nome)
    const horarioDoDia = barbeiro?.horarioTrabalho?.[CHAVES_DIAS[data.getDay()]]
    // sem horário cadastrado pro barbeiro, assume disponível (evita travar a tela)
    const barbeiroTrabalhaNesseDia = horarioDoDia ? horarioDoDia.ativo : true

    dias.push({
      data,
      chave,
      passado: data < hoje,
      disponivel: barbeiroTrabalhaNesseDia && !bloqueado,
      bloqueado,
    })
  }
  return dias
}

// TODO: quando tiver backend de verdade, essa checagem de ocupação deve virar uma consulta ao servidor
function gerarHorariosDoDia(chaveDia, bloqueios, agendamentos, barbeiro) {
  const diaSemana = new Date(`${chaveDia}T00:00:00`).getDay()
  const horarioDoDia = barbeiro?.horarioTrabalho?.[CHAVES_DIAS[diaSemana]]
  const inicio = horarioDoDia?.ativo ? horarioDoDia.inicio : '09:00'
  const fim = horarioDoDia?.ativo ? horarioDoDia.fim : '19:00'

  const [horaFim, minutoFim] = fim.split(':').map(Number)
  let [hora, minuto] = inicio.split(':').map(Number)

  const horarios = []
  while (hora < horaFim || (hora === horaFim && minuto < minutoFim)) {
    horarios.push(`${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`)
    minuto += 30
    if (minuto >= 60) {
      minuto -= 60
      hora += 1
    }
  }

  return horarios.map((hora) => ({
    hora,
    ocupado:
      horarioBloqueado(bloqueios, chaveDia, hora, barbeiro?.nome) ||
      horarioJaMarcado(agendamentos, chaveDia, hora, barbeiro?.nome),
  }))
}

function IconeCheck() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function NovoAgendamento() {
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [filiais] = useState(() => carregarFiliais())
  const [servicos] = useState(() => carregarServicos())

  const temMaisDeUmaFilial = filiais.length > 1

  const [filialSelecionada, setFilialSelecionada] = useState(temMaisDeUmaFilial ? null : filiais[0])
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState(null)
  const [servicosSelecionados, setServicosSelecionados] = useState([])
  const [diaSelecionado, setDiaSelecionado] = useState(null)
  const [horarioSelecionado, setHorarioSelecionado] = useState(null)
  const [observacoes, setObservacoes] = useState('')
  const [concluido, setConcluido] = useState(false)
  const [horarioIndisponivel, setHorarioIndisponivel] = useState(false)

  const [bloqueios, setBloqueios] = useState(() => carregarBloqueios())
  const [agendamentosExistentes, setAgendamentosExistentes] = useState(() => carregarAgendamentos())
  const [barbeiros] = useState(() => carregarBarbeiros())

  // busca de novo os dados salvos (outros clientes podem ter marcado enquanto essa tela estava aberta)
  function atualizarDisponibilidade() {
    setBloqueios(carregarBloqueios())
    setAgendamentosExistentes(carregarAgendamentos())
  }

  const diasDaSemana = useMemo(
    () => gerarDiasDaSemana(bloqueios, barbeiroSelecionado),
    [bloqueios, barbeiroSelecionado]
  )
  const horariosDoDia = useMemo(
    () =>
      diaSelecionado
        ? gerarHorariosDoDia(diaSelecionado.chave, bloqueios, agendamentosExistentes, barbeiroSelecionado)
        : [],
    [diaSelecionado, bloqueios, agendamentosExistentes, barbeiroSelecionado]
  )

  const etapaBarbeiroLiberada = Boolean(filialSelecionada)
  const etapaServicosLiberada = etapaBarbeiroLiberada && Boolean(barbeiroSelecionado)
  const etapaHorarioLiberada = etapaServicosLiberada && servicosSelecionados.length > 0

  const podeConfirmar =
    Boolean(filialSelecionada) &&
    Boolean(barbeiroSelecionado) &&
    servicosSelecionados.length > 0 &&
    Boolean(diaSelecionado) &&
    Boolean(horarioSelecionado)

  function selecionarBarbeiro(barbeiro) {
    setBarbeiroSelecionado(barbeiro)
    // a disponibilidade de dias/horários depende do barbeiro (bloqueios e agendamentos são por barbeiro)
    atualizarDisponibilidade()
    setDiaSelecionado(null)
    setHorarioSelecionado(null)
  }

  function alternarServico(id) {
    setServicosSelecionados((atual) =>
      atual.includes(id) ? atual.filter((s) => s !== id) : [...atual, id]
    )

    // trocar os serviços invalida o horário já escolhido (a duração pode mudar)
    setDiaSelecionado(null)
    setHorarioSelecionado(null)
  }

  function selecionarDia(dia) {
    setDiaSelecionado(dia)
    setHorarioSelecionado(null)
    setHorarioIndisponivel(false)
    // pega a foto mais recente de agendamentos/bloqueios antes de mostrar os horários do dia
    atualizarDisponibilidade()
  }

  function confirmarAgendamento() {
    if (!podeConfirmar) return

    // última checagem: alguém pode ter marcado esse mesmo horário entre a seleção e o clique em confirmar
    const agendamentosAgora = carregarAgendamentos()
    const bloqueiosAgora = carregarBloqueios()
    const aindaLivre =
      !horarioJaMarcado(agendamentosAgora, diaSelecionado.chave, horarioSelecionado, barbeiroSelecionado.nome) &&
      !horarioBloqueado(bloqueiosAgora, diaSelecionado.chave, horarioSelecionado, barbeiroSelecionado.nome)

    if (!aindaLivre) {
      setHorarioIndisponivel(true)
      setHorarioSelecionado(null)
      setAgendamentosExistentes(agendamentosAgora)
      setBloqueios(bloqueiosAgora)
      return
    }

    const servicosEscolhidos = servicos.filter((s) => servicosSelecionados.includes(s.id))
    const valorTotal = servicosEscolhidos.reduce((total, s) => total + s.preco, 0)

    const novoAgendamento = {
      filial: filialSelecionada?.nome,
      cliente: usuario?.nome || 'Cliente',
      email: usuario?.email || '',
      barbeiro: barbeiroSelecionado.nome,
      servico: servicosEscolhidos.map((s) => s.nome).join(', '),
      valor: valorTotal,
      data: diaSelecionado.chave,
      horario: horarioSelecionado,
      observacoes: observacoes.trim(),
    }

    salvarAgendamentos([...agendamentosAgora, novoAgendamento])
    setConcluido(true)
  }

  if (concluido) {
    return (
      <section className="novoagendamento">
        <div className="novoagendamento-sucesso">
          <div className="novoagendamento-sucesso-icone">
            <IconeCheck />
          </div>
          <h1 className="novoagendamento-sucesso-titulo">Agendamento confirmado!</h1>
          <p className="novoagendamento-sucesso-texto">
            Te esperamos {NOMES_DIAS[diaSelecionado.data.getDay()]}, às {horarioSelecionado}, com{' '}
            {barbeiroSelecionado.nome}.
          </p>
          <button type="button" className="novoagendamento-sucesso-botao" onClick={() => navigate('/agendar')}>
            Voltar para o início
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="novoagendamento">
      <div className="novoagendamento-conteudo">
        <button type="button" className="novoagendamento-voltar" onClick={() => navigate('/agendar')}>
          ← Voltar
        </button>

        <div className="novoagendamento-cabecalho">
          <p className="novoagendamento-etiqueta">Novo agendamento</p>
          <h1 className="novoagendamento-titulo">Vamos marcar seu horário</h1>
        </div>

        {temMaisDeUmaFilial && (
          <div className="novoagendamento-etapa">
            <div className="novoagendamento-etapa-cabecalho">
              <span className="novoagendamento-etapa-numero">1</span>
              <h2 className="novoagendamento-etapa-titulo">Escolher filial</h2>
            </div>
            <div className="novoagendamento-grade">
              {filiais.map((filial) => (
                <button
                  type="button"
                  key={filial.id}
                  className={`novoagendamento-opcao ${filialSelecionada?.id === filial.id ? 'novoagendamento-opcao-ativa' : ''}`}
                  onClick={() => setFilialSelecionada(filial)}
                >
                  <span className="novoagendamento-opcao-nome">{filial.nome}</span>
                  <span className="novoagendamento-opcao-detalhe">{filial.endereco}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`novoagendamento-etapa ${!etapaBarbeiroLiberada ? 'novoagendamento-etapa-desabilitada' : ''}`}>
          <div className="novoagendamento-etapa-cabecalho">
            <span className="novoagendamento-etapa-numero">{temMaisDeUmaFilial ? 2 : 1}</span>
            <h2 className="novoagendamento-etapa-titulo">Escolher barbeiro</h2>
          </div>
          <div className="novoagendamento-grade">
            {barbeiros.map((barbeiro) => (
              <button
                type="button"
                key={barbeiro.id}
                className={`novoagendamento-opcao ${barbeiroSelecionado?.id === barbeiro.id ? 'novoagendamento-opcao-ativa' : ''}`}
                onClick={() => selecionarBarbeiro(barbeiro)}
              >
                {barbeiro.foto ? (
                  <img src={barbeiro.foto} alt="" className="novoagendamento-barbeiro-avatar" />
                ) : (
                  <span className="novoagendamento-barbeiro-avatar novoagendamento-barbeiro-avatar-vazio">
                    {(barbeiro.nome || '?').trim().charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="novoagendamento-opcao-nome">{barbeiro.nome}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`novoagendamento-etapa ${!etapaServicosLiberada ? 'novoagendamento-etapa-desabilitada' : ''}`}>
          <div className="novoagendamento-etapa-cabecalho">
            <span className="novoagendamento-etapa-numero">{temMaisDeUmaFilial ? 3 : 2}</span>
            <h2 className="novoagendamento-etapa-titulo">Escolher serviços</h2>
          </div>
          <div className="novoagendamento-chips">
            {servicos.map((servico) => (
              <button
                type="button"
                key={servico.id}
                className={`novoagendamento-chip ${servicosSelecionados.includes(servico.id) ? 'novoagendamento-chip-ativo' : ''}`}
                onClick={() => alternarServico(servico.id)}
              >
                {servico.nome}
                <span className="novoagendamento-chip-preco">R$ {servico.preco}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`novoagendamento-etapa ${!etapaHorarioLiberada ? 'novoagendamento-etapa-desabilitada' : ''}`}>
          <div className="novoagendamento-etapa-cabecalho">
            <span className="novoagendamento-etapa-numero">{temMaisDeUmaFilial ? 4 : 3}</span>
            <h2 className="novoagendamento-etapa-titulo">Escolher horário</h2>
          </div>

          <div className="novoagendamento-dias">
            {diasDaSemana.map((dia) => (
              <button
                type="button"
                key={dia.chave}
                disabled={dia.passado || !dia.disponivel}
                className={`novoagendamento-dia ${diaSelecionado?.chave === dia.chave ? 'novoagendamento-dia-ativo' : ''}`}
                onClick={() => selecionarDia(dia)}
              >
                <span className="novoagendamento-dia-semana">{NOMES_DIAS[dia.data.getDay()]}</span>
                <span className="novoagendamento-dia-numero">{dia.data.getDate()}</span>
                {!dia.passado && !dia.disponivel && (
                  <span className="novoagendamento-dia-indisponivel">{dia.bloqueado ? 'Bloqueado' : 'Fechado'}</span>
                )}
              </button>
            ))}
          </div>

          {diaSelecionado && (
            <>
              {horarioIndisponivel && (
                <p className="novoagendamento-horario-aviso">
                  Esse horário acabou de ser marcado por outro cliente. Escolha outro horário abaixo.
                </p>
              )}
              {horariosDoDia.some((h) => !h.ocupado) ? (
                <div className="novoagendamento-horarios">
                  {horariosDoDia.map(({ hora, ocupado }) => (
                    <button
                      type="button"
                      key={hora}
                      disabled={ocupado}
                      className={`novoagendamento-horario ${horarioSelecionado === hora ? 'novoagendamento-horario-ativo' : ''}`}
                      onClick={() => setHorarioSelecionado(hora)}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="novoagendamento-sem-horario">Sem horários disponíveis nesse dia.</p>
              )}
            </>
          )}
        </div>

        {horarioSelecionado && (
          <div className="novoagendamento-etapa novoagendamento-observacoes">
            <div className="novoagendamento-etapa-cabecalho">
              <h2 className="novoagendamento-etapa-titulo">Observações (opcional)</h2>
            </div>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Alguma preferência ou detalhe que o barbeiro deveria saber?"
            />
          </div>
        )}
      </div>

      <div className={`novoagendamento-resumo ${podeConfirmar ? 'novoagendamento-resumo-visivel' : ''}`}>
        <div className="novoagendamento-resumo-texto">
          <span className="novoagendamento-resumo-linha">
            <strong>{barbeiroSelecionado?.nome}</strong> · {servicosSelecionados.length} serviço
            {servicosSelecionados.length !== 1 ? 's' : ''}
          </span>
          {diaSelecionado && horarioSelecionado && (
            <span className="novoagendamento-resumo-linha">
              {NOMES_DIAS[diaSelecionado.data.getDay()]}, {diaSelecionado.data.getDate()} às {horarioSelecionado}
            </span>
          )}
        </div>
        <button type="button" className="novoagendamento-confirmar" disabled={!podeConfirmar} onClick={confirmarAgendamento}>
          Confirmar agendamento
        </button>
      </div>
    </section>
  )
}

export default NovoAgendamento