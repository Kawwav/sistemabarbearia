import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import './perfil.css'

const CHAVE_PERFIL = 'barbearia_perfil'
const CHAVE_NOTIFICACOES = 'barbearia_notificacoes'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const NOTIFICACOES_PADRAO = {
  lembretes: true,
  promocoes: false,
  novidades: true,
}

// aplica a máscara 000.000.000-00 enquanto o usuário digita
function formatarCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

// aplica a máscara (00) 00000-0000 enquanto o usuário digita
function formatarTelefone(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

function carregarPerfil() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PERFIL) || 'null')
  } catch {
    return null
  }
}

function salvarPerfil(perfil) {
  try {
    localStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfil))
  } catch {
    // sem localStorage disponível, segue sem persistir
  }
}

function carregarNotificacoes() {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE_NOTIFICACOES) || 'null')
    return salvas ? { ...NOTIFICACOES_PADRAO, ...salvas } : NOTIFICACOES_PADRAO
  } catch {
    return NOTIFICACOES_PADRAO
  }
}

function salvarNotificacoes(notificacoes) {
  try {
    localStorage.setItem(CHAVE_NOTIFICACOES, JSON.stringify(notificacoes))
  } catch {
    // sem localStorage disponível, segue sem persistir
  }
}

function Toggle({ ativo, onClick, rotulo }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      aria-label={rotulo}
      className={`perfil-toggle ${ativo ? 'perfil-toggle-ativo' : ''}`}
      onClick={onClick}
    >
      <span className="perfil-toggle-bolinha" />
    </button>
  )
}

function Perfil() {
  const navigate = useNavigate()
  const { usuario, estaLogado, sair } = useAuth()

  // essa tela é só pra quem já entrou; sem login, manda de volta pro formulário
  useEffect(() => {
    if (!estaLogado) navigate('/login')
  }, [estaLogado, navigate])

  // dados pessoais, começando pelo que já existe da conta e completando com o que foi salvo antes
  const [dados, setDados] = useState(() => {
    const salvos = carregarPerfil()
    return {
      nome: usuario?.nome || salvos?.nome || '',
      email: usuario?.email || salvos?.email || '',
      cpf: usuario?.cpf || salvos?.cpf || '',
      telefone: salvos?.telefone || '',
      endereco: salvos?.endereco || '',
    }
  })
  const [errosDados, setErrosDados] = useState({})
  const [salvandoDados, setSalvandoDados] = useState(false)
  const [mensagemDados, setMensagemDados] = useState('')

  // segurança: trocar e-mail
  const [novoEmail, setNovoEmail] = useState('')
  const [senhaParaEmail, setSenhaParaEmail] = useState('')
  const [errosEmail, setErrosEmail] = useState({})
  const [salvandoEmail, setSalvandoEmail] = useState(false)
  const [mensagemEmail, setMensagemEmail] = useState('')

  // segurança: trocar senha
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [errosSenha, setErrosSenha] = useState({})
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [mensagemSenha, setMensagemSenha] = useState('')

  // notificações
  const [notificacoes, setNotificacoes] = useState(() => carregarNotificacoes())

  useEffect(() => {
    salvarNotificacoes(notificacoes)
  }, [notificacoes])

  function alternarNotificacao(chave) {
    setNotificacoes((atual) => ({ ...atual, [chave]: !atual[chave] }))
  }

  function handleCampoDados(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
  }

  async function salvarDados(e) {
    e.preventDefault()
    const erros = {}
    if (dados.nome.trim().length < 2) erros.nome = 'Informe seu nome completo'
    if (!EMAIL_REGEX.test(dados.email)) erros.email = 'E-mail inválido'

    setErrosDados(erros)
    setMensagemDados('')
    if (Object.keys(erros).length > 0) return

    setSalvandoDados(true)
    try {
      // TODO: troque pela chamada real ao backend pra atualizar o cadastro
      // await fetch('/api/perfil', { method: 'PUT', body: JSON.stringify(dados) })
      await new Promise((resolve) => setTimeout(resolve, 600))
      salvarPerfil(dados)
      setMensagemDados('Dados atualizados com sucesso!')
    } finally {
      setSalvandoDados(false)
    }
  }

  async function trocarEmail(e) {
    e.preventDefault()
    const erros = {}
    if (!EMAIL_REGEX.test(novoEmail)) erros.novoEmail = 'E-mail inválido'
    if (senhaParaEmail.length < 6) erros.senhaParaEmail = 'Digite sua senha atual'

    setErrosEmail(erros)
    setMensagemEmail('')
    if (Object.keys(erros).length > 0) return

    setSalvandoEmail(true)
    try {
      // TODO: troque pela chamada real ao backend pra confirmar e trocar o e-mail
      await new Promise((resolve) => setTimeout(resolve, 600))
      setDados((atual) => ({ ...atual, email: novoEmail }))
      setNovoEmail('')
      setSenhaParaEmail('')
      setMensagemEmail('E-mail atualizado com sucesso!')
    } finally {
      setSalvandoEmail(false)
    }
  }

  async function trocarSenha(e) {
    e.preventDefault()
    const erros = {}
    if (senhaAtual.length < 6) erros.senhaAtual = 'Digite sua senha atual'
    if (novaSenha.length < 6) erros.novaSenha = 'Mínimo de 6 caracteres'
    if (confirmarSenha !== novaSenha) erros.confirmarSenha = 'As senhas não coincidem'

    setErrosSenha(erros)
    setMensagemSenha('')
    if (Object.keys(erros).length > 0) return

    setSalvandoSenha(true)
    try {
      // TODO: troque pela chamada real ao backend pra trocar a senha
      await new Promise((resolve) => setTimeout(resolve, 600))
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      setMensagemSenha('Senha atualizada com sucesso!')
    } finally {
      setSalvandoSenha(false)
    }
  }

  function handleSair() {
    if (sair) sair()
    navigate('/login')
  }

  if (!estaLogado) return null

  const inicial = dados.nome?.trim()?.[0]?.toUpperCase() || '?'

  return (
    <section className="perfil">
      <div className="perfil-conteudo">
        <button type="button" className="perfil-voltar" onClick={() => navigate('/agendar')}>
          ← Voltar
        </button>

        <div className="perfil-cabecalho">
          <p className="perfil-etiqueta">Sua conta</p>
          <h1 className="perfil-titulo">Meu perfil</h1>
        </div>

        {/* dados pessoais */}
        <div className="perfil-secao">
          <div className="perfil-avatar-linha">
            <span className="perfil-avatar">{inicial}</span>
            <div>
              <p className="perfil-avatar-nome">{dados.nome || 'Seu nome'}</p>
              <p className="perfil-avatar-email">{dados.email || 'seuemail@exemplo.com'}</p>
            </div>
          </div>

          <form onSubmit={salvarDados} noValidate>
            <div className="perfil-grade">
              <label className="perfil-campo">
                Nome completo
                <input
                  type="text"
                  value={dados.nome}
                  onChange={(e) => handleCampoDados('nome', e.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                />
                {errosDados.nome && <small>{errosDados.nome}</small>}
              </label>

              <label className="perfil-campo">
                E-mail
                <input
                  type="email"
                  value={dados.email}
                  onChange={(e) => handleCampoDados('email', e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                />
                {errosDados.email && <small>{errosDados.email}</small>}
              </label>

              <label className="perfil-campo">
                CPF
                <input
                  type="text"
                  inputMode="numeric"
                  value={dados.cpf}
                  onChange={(e) => handleCampoDados('cpf', formatarCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </label>

              <label className="perfil-campo">
                Telefone
                <input
                  type="text"
                  inputMode="numeric"
                  value={dados.telefone}
                  onChange={(e) => handleCampoDados('telefone', formatarTelefone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  maxLength={15}
                />
              </label>

              <label className="perfil-campo perfil-campo-largo">
                Endereço
                <input
                  type="text"
                  value={dados.endereco}
                  onChange={(e) => handleCampoDados('endereco', e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                  autoComplete="street-address"
                />
              </label>
            </div>

            <div className="perfil-acoes">
              <button type="submit" className="perfil-botao" disabled={salvandoDados}>
                {salvandoDados ? 'Salvando...' : 'Salvar alterações'}
              </button>
              {mensagemDados && <p className="perfil-mensagem">{mensagemDados}</p>}
            </div>
          </form>
        </div>

        {/* segurança da conta */}
        <div className="perfil-secao">
          <div className="perfil-secao-cabecalho">
            <h2 className="perfil-secao-titulo">Segurança da conta</h2>
            <p className="perfil-secao-descricao">Troque seu e-mail de acesso ou sua senha.</p>
          </div>

          <h3 className="perfil-subsecao-titulo">Trocar e-mail</h3>
          <form onSubmit={trocarEmail} noValidate>
            <div className="perfil-grade">
              <label className="perfil-campo">
                Novo e-mail
                <input
                  type="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="novoemail@exemplo.com"
                  autoComplete="email"
                />
                {errosEmail.novoEmail && <small>{errosEmail.novoEmail}</small>}
              </label>

              <label className="perfil-campo">
                Senha atual
                <input
                  type="password"
                  value={senhaParaEmail}
                  onChange={(e) => setSenhaParaEmail(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {errosEmail.senhaParaEmail && <small>{errosEmail.senhaParaEmail}</small>}
              </label>
            </div>

            <div className="perfil-acoes">
              <button type="submit" className="perfil-botao" disabled={salvandoEmail}>
                {salvandoEmail ? 'Salvando...' : 'Atualizar e-mail'}
              </button>
              {mensagemEmail && <p className="perfil-mensagem">{mensagemEmail}</p>}
            </div>
          </form>

          <hr className="perfil-divisor" />

          <h3 className="perfil-subsecao-titulo">Trocar senha</h3>
          <form onSubmit={trocarSenha} noValidate>
            <div className="perfil-grade">
              <label className="perfil-campo perfil-campo-largo">
                Senha atual
                <input
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {errosSenha.senhaAtual && <small>{errosSenha.senhaAtual}</small>}
              </label>

              <label className="perfil-campo">
                Nova senha
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                {errosSenha.novaSenha && <small>{errosSenha.novaSenha}</small>}
              </label>

              <label className="perfil-campo">
                Confirmar nova senha
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                />
                {errosSenha.confirmarSenha && <small>{errosSenha.confirmarSenha}</small>}
              </label>
            </div>

            <div className="perfil-acoes">
              <button type="submit" className="perfil-botao" disabled={salvandoSenha}>
                {salvandoSenha ? 'Salvando...' : 'Atualizar senha'}
              </button>
              {mensagemSenha && <p className="perfil-mensagem">{mensagemSenha}</p>}
            </div>
          </form>
        </div>

        {/* notificações */}
        <div className="perfil-secao">
          <div className="perfil-secao-cabecalho">
            <h2 className="perfil-secao-titulo">Notificações</h2>
            <p className="perfil-secao-descricao">Escolha o que você quer receber.</p>
          </div>

          <div className="perfil-notificacoes">
            <div className="perfil-notificacao">
              <div className="perfil-notificacao-texto">
                <p className="perfil-notificacao-titulo">Lembretes de agendamento</p>
                <p className="perfil-notificacao-descricao">Avisos sobre horários marcados, próximos de acontecer.</p>
              </div>
              <Toggle
                ativo={notificacoes.lembretes}
                onClick={() => alternarNotificacao('lembretes')}
                rotulo="Lembretes de agendamento"
              />
            </div>

            <div className="perfil-notificacao">
              <div className="perfil-notificacao-texto">
                <p className="perfil-notificacao-titulo">Promoções e descontos</p>
                <p className="perfil-notificacao-descricao">Ofertas do clube barbearia e cupons especiais.</p>
              </div>
              <Toggle
                ativo={notificacoes.promocoes}
                onClick={() => alternarNotificacao('promocoes')}
                rotulo="Promoções e descontos"
              />
            </div>

            <div className="perfil-notificacao">
              <div className="perfil-notificacao-texto">
                <p className="perfil-notificacao-titulo">Novidades</p>
                <p className="perfil-notificacao-descricao">Novos serviços, barbeiros e atualizações da barbearia.</p>
              </div>
              <Toggle
                ativo={notificacoes.novidades}
                onClick={() => alternarNotificacao('novidades')}
                rotulo="Novidades"
              />
            </div>
          </div>
        </div>

        <button type="button" className="perfil-sair" onClick={handleSair}>
          Sair da conta
        </button>
      </div>
    </section>
  )
}

export default Perfil
