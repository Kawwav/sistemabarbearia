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
  const [lembrar, setLembrar] = useState(false)
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
      <div className="adminlogin-coluna adminlogin-coluna-formulario">
        <div className="adminlogin-conteudo">
          <div className="adminlogin-marca">

          </div>

          <div className="adminlogin-cabecalho">
            <h1 className="adminlogin-titulo">Bem-vindo de volta</h1>
            <p className="adminlogin-subtitulo">Digite seu e-mail e senha para acessar o painel administrativo.</p>
          </div>

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

            <div className="adminlogin-opcoes">
              <label className="adminlogin-lembrar">
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(e) => setLembrar(e.target.checked)}
                />
                <span>Lembrar-me</span>
              </label>
            </div>

            {erro && <small className="adminlogin-erro">{erro}</small>}

            <button type="submit" className="adminlogin-botao" disabled={enviando}>
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="adminlogin-copyright">Copyright © {new Date().getFullYear()} Barbearia LTDA.</p>
      </div>

      <div className="adminlogin-coluna adminlogin-coluna-imagem">
        <img src={`${import.meta.env.BASE_URL}1.png`} alt="Painel administrativo" className="adminlogin-imagem" />
      </div>
    </section>
  )
}

export default AdminLogin