import { createContext, useContext, useEffect, useState } from 'react'

const AdminAuthContext = createContext(null)
const CHAVE_ARMAZENAMENTO = 'barbearia_admin'
export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_ARMAZENAMENTO)
      return salvo ? JSON.parse(salvo) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (admin) {
        localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(admin))
      } else {
        localStorage.removeItem(CHAVE_ARMAZENAMENTO)
      }
    } catch {
    }
  }, [admin])

  function entrarAdmin(dadosAdmin) {
    setAdmin(dadosAdmin)
  }

  function sairAdmin() {
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, adminEstaLogado: !!admin, entrarAdmin, sairAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const contexto = useContext(AdminAuthContext)
  if (!contexto) {
    throw new Error('useAdminAuth precisa ser usado dentro de um <AdminAuthProvider>')
  }
  return contexto
}
