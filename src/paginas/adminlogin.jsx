import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexto/AdminAuthContext'
import './adminlogin.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

function AdminLogin() {
  const navigate = useNavigate()
  const { entrarAdmin } = useAdminAuth()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!EMAIL_REGEX.test(email) || senha.length < 6) {
      setErro('Informe um e-mail e senha válidos.')
      return
    }

    setErro('')
    setEnviando(true)
    try {
      // TODO: troque por uma chamada real ao backend, que deve validar as
      // credenciais no servidor. Nunca confie em checagem de senha só no front-end
      // (qualquer pessoa consegue ler o código-fonte do navegador).
      // const resposta = await fetch('/api/admin/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, senha }),
      // })
      // if (!resposta.ok) throw new Error('Credenciais inválidas')

      await new Promise((resolve) => setTimeout(resolve, 700))

      entrarAdmin({ email })
      navigate('/admin')
    } catch {
      setErro('E-mail ou senha incorretos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="adminlogin">
      <div className="adminlogin-cartao">
        <span className="adminlogin-etiqueta">Área restrita</span>
        <h1 className="adminlogin-titulo">Painel administrativo</h1>
        <p className="adminlogin-subtitulo">Acesso exclusivo para a equipe da barbearia</p>

        <form className="adminlogin-formulario" onSubmit={handleSubmit} noValidate>
          <label className="adminlogin-campo">
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@barbearia.com"
              autoComplete="username"
            />
          </label>

          <label className="adminlogin-campo">
            <span>Senha</span>
            <div className="adminlogin-campo-senha">
              <input
                type={verSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="adminlogin-alternar-senha"
                onClick={() => setVerSenha((v) => !v)}
                aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <IconeOlho aberto={verSenha} />
              </button>
            </div>
          </label>

          {erro && <small className="adminlogin-erro">{erro}</small>}

          <button type="submit" className="adminlogin-botao" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default AdminLogin
