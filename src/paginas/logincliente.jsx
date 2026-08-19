import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import './logincliente.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// aplica a máscara 000.000.000-00 enquanto o usuário digita
function formatarCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

// validação oficial dos dígitos verificadores do CPF
function cpfValido(cpfFormatado) {
  const cpf = cpfFormatado.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number(cpf[9])) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number(cpf[10])) return false

  return true
}

function IconeOlho({ aberto }) {
  return aberto ? (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.6 21.6 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a21.6 21.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  )
}

function IconeEmail() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M3 6.5l9 6.5 9-6.5" />
    </svg>
  )
}

function IconeCadeado() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    </svg>
  )
}

function IconeUsuario() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  )
}

function IconeId() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <circle cx="8.5" cy="12" r="2.2" />
      <path d="M13.5 10h5M13.5 14h3.5" />
    </svg>
  )
}

function IconeMarca() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 11-13h-7l0-7z" />
    </svg>
  )
}

function IconeGoogle() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.8 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16 4 9.1 8.5 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4C29.6 35.4 27 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9 39.5 15.9 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.4C41.5 35.9 44 30.4 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  )
}

function LoginCliente() {
  const navigate = useNavigate()
  const { entrar } = useAuth()
  const [modo, setModo] = useState('login')

  // campos do login
  const [emailLogin, setEmailLogin] = useState('')
  const [senhaLogin, setSenhaLogin] = useState('')
  const [verSenhaLogin, setVerSenhaLogin] = useState(false)

  // campos do registro
  const [nome, setNome] = useState('')
  const [emailRegistro, setEmailRegistro] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [cpf, setCpf] = useState('')
  const [senhaRegistro, setSenhaRegistro] = useState('')
  const [verSenhaRegistro, setVerSenhaRegistro] = useState(false)

  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  function trocarModo(novoModo) {
    setModo(novoModo)
    setErros({})
    setMensagem('')
  }

  function handleCpfChange(e) {
    setCpf(formatarCPF(e.target.value))
  }

  async function handleLogin(e) {
    e.preventDefault()
    const novosErros = {}

    if (!EMAIL_REGEX.test(emailLogin)) novosErros.emailLogin = 'E-mail inválido'
    if (senhaLogin.length < 6) novosErros.senhaLogin = 'Senha muito curta'

    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    setEnviando(true)
    setMensagem('')
    try {
      // TODO: troque pela chamada real ao seu backend de autenticação
      // const resposta = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: emailLogin, senha: senhaLogin }),
      // })
      await new Promise((resolve) => setTimeout(resolve, 800))
      setMensagem('Login realizado com sucesso!')

      // guarda a sessão e manda o cliente direto pra tela de agendamento
      entrar({ nome: emailLogin.split('@')[0], email: emailLogin })
      navigate('/agendar')
    } catch {
      setMensagem('Não foi possível entrar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  async function handleRegistro(e) {
    e.preventDefault()
    const novosErros = {}

    if (nome.trim().length < 2) novosErros.nome = 'Informe seu nome completo'
    if (!EMAIL_REGEX.test(emailRegistro)) novosErros.emailRegistro = 'E-mail inválido'
    if (!dataNascimento) novosErros.dataNascimento = 'Informe sua data de nascimento'
    if (!cpfValido(cpf)) novosErros.cpf = 'CPF inválido'
    if (senhaRegistro.length < 6) novosErros.senhaRegistro = 'Mínimo de 6 caracteres'

    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    setEnviando(true)
    setMensagem('')
    try {
      // TODO: troque pela chamada real ao seu backend de cadastro
      // const resposta = await fetch('/api/registro', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ nome, email: emailRegistro, dataNascimento, cpf, senha: senhaRegistro }),
      // })
      await new Promise((resolve) => setTimeout(resolve, 800))
      setMensagem('Conta criada com sucesso!')

      // guarda a sessão e manda o cliente direto pra tela de agendamento
      entrar({ nome, email: emailRegistro, dataNascimento, cpf })
      navigate('/agendar')
    } catch {
      setMensagem('Não foi possível criar sua conta. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  function handleGoogle() {
    // TODO: integre com o Google Identity Services (ex.: lib @react-oauth/google).
    // Quando o login do Google tiver sucesso de verdade, chame:
    //   entrar({ nome: perfilGoogle.name, email: perfilGoogle.email })
    //   navigate('/agendar')
    console.log('Continuar com Google')
  }

  return (
    <section className="logincliente">
      <div className="logincliente-cartao">
        <div className="logincliente-marca">
          <span className="logincliente-marca-simbolo">
            <IconeMarca />
          </span>
          <span className="logincliente-marca-texto">Agenda</span>
        </div>

        <div className="logincliente-abas" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'login'}
            className={`logincliente-aba ${modo === 'login' ? 'logincliente-aba-ativa' : ''}`}
            onClick={() => trocarModo('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'registro'}
            className={`logincliente-aba ${modo === 'registro' ? 'logincliente-aba-ativa' : ''}`}
            onClick={() => trocarModo('registro')}
          >
            Criar conta
          </button>
        </div>

        {modo === 'login' ? (
          <form className="logincliente-formulario" onSubmit={handleLogin} noValidate>
            <h1 className="logincliente-titulo">Bem-vindo de volta</h1>
            <p className="logincliente-subtitulo">Entre para gerenciar seus agendamentos</p>

            <label className="logincliente-campo">
              <span>E-mail</span>
              <div className="logincliente-campo-com-icone">
                <IconeEmail />
                <input
                  type="email"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                />
              </div>
              {erros.emailLogin && <small className="logincliente-erro">{erros.emailLogin}</small>}
            </label>

            <label className="logincliente-campo">
              <span>Senha</span>
              <div className="logincliente-campo-com-icone logincliente-campo-senha">
                <IconeCadeado />
                <input
                  type={verSenhaLogin ? 'text' : 'password'}
                  value={senhaLogin}
                  onChange={(e) => setSenhaLogin(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="logincliente-alternar-senha"
                  onClick={() => setVerSenhaLogin((v) => !v)}
                  aria-label={verSenhaLogin ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <IconeOlho aberto={verSenhaLogin} />
                </button>
              </div>
              {erros.senhaLogin && <small className="logincliente-erro">{erros.senhaLogin}</small>}
            </label>

            <button type="submit" className="logincliente-botao" disabled={enviando}>
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>

            {mensagem && <p className="logincliente-mensagem">{mensagem}</p>}

            <div className="logincliente-divisor">
              <span>ou continue com</span>
            </div>

            <button type="button" className="logincliente-google" onClick={handleGoogle}>
              <IconeGoogle />
              Continuar com Google
            </button>
          </form>
        ) : (
          <form className="logincliente-formulario" onSubmit={handleRegistro} noValidate>
            <h1 className="logincliente-titulo">Crie sua conta</h1>
            <p className="logincliente-subtitulo">Leva menos de um minuto</p>

            <label className="logincliente-campo">
              <span>Nome completo</span>
              <div className="logincliente-campo-com-icone">
                <IconeUsuario />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </div>
              {erros.nome && <small className="logincliente-erro">{erros.nome}</small>}
            </label>

            <label className="logincliente-campo">
              <span>E-mail</span>
              <div className="logincliente-campo-com-icone">
                <IconeEmail />
                <input
                  type="email"
                  value={emailRegistro}
                  onChange={(e) => setEmailRegistro(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                />
              </div>
              {erros.emailRegistro && <small className="logincliente-erro">{erros.emailRegistro}</small>}
            </label>

            <div className="logincliente-linha">
              <label className="logincliente-campo">
                <span>Data de nascimento</span>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  autoComplete="bday"
                />
                {erros.dataNascimento && <small className="logincliente-erro">{erros.dataNascimento}</small>}
              </label>

              <label className="logincliente-campo">
                <span>CPF</span>
                <div className="logincliente-campo-com-icone">
                  <IconeId />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                {erros.cpf && <small className="logincliente-erro">{erros.cpf}</small>}
              </label>
            </div>

            <label className="logincliente-campo">
              <span>Senha</span>
              <div className="logincliente-campo-com-icone logincliente-campo-senha">
                <IconeCadeado />
                <input
                  type={verSenhaRegistro ? 'text' : 'password'}
                  value={senhaRegistro}
                  onChange={(e) => setSenhaRegistro(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="logincliente-alternar-senha"
                  onClick={() => setVerSenhaRegistro((v) => !v)}
                  aria-label={verSenhaRegistro ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <IconeOlho aberto={verSenhaRegistro} />
                </button>
              </div>
              {erros.senhaRegistro && <small className="logincliente-erro">{erros.senhaRegistro}</small>}
            </label>

            <button type="submit" className="logincliente-botao" disabled={enviando}>
              {enviando ? 'Criando conta...' : 'Criar conta'}
            </button>

            {mensagem && <p className="logincliente-mensagem">{mensagem}</p>}

            <div className="logincliente-divisor">
              <span>ou continue com</span>
            </div>

            <button type="button" className="logincliente-google" onClick={handleGoogle}>
              <IconeGoogle />
              Continuar com Google
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default LoginCliente