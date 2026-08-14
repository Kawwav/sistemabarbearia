import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const CHAVE_ARMAZENAMENTO = 'barbearia_usuario'

// Guarda o usuário logado no localStorage por enquanto.
// Quando você tiver um backend de verdade, troque isso por um token/sessão real.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_ARMAZENAMENTO)
      return salvo ? JSON.parse(salvo) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (usuario) {
        localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(usuario))
      } else {
        localStorage.removeItem(CHAVE_ARMAZENAMENTO)
      }
    } catch {
      // localStorage indisponível (ex.: modo privado) — segue sem persistir
    }
  }, [usuario])

  function entrar(dadosUsuario) {
    setUsuario(dadosUsuario)
  }

  function sair() {
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, estaLogado: !!usuario, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth precisa ser usado dentro de um <AuthProvider>')
  }
  return contexto
}
