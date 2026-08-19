import { useNavigate } from 'react-router-dom'
import './admsidebar.css'

function IconeCalendario() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconeCliente() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconeEstrela() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5 15.09 9l7.16.62-5.41 4.7 1.64 6.99L12 17.77 5.52 21.3l1.64-6.99-5.41-4.7L8.91 9 12 2.5Z" />
    </svg>
  )
}

function IconeCadastros() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
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

function IconeGlobo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  )
}

const ITENS = [
  { chave: 'agendamentos', rotulo: 'Agendamentos', rota: '/admin', Icone: IconeCalendario },
  { chave: 'clientes', rotulo: 'Clientes', rota: '/admin/clientes', Icone: IconeCliente },
  { chave: 'clube', rotulo: 'Clube ', rota: '/admin/clube', Icone: IconeEstrela },
  { chave: 'cadastros', rotulo: 'Cadastros', rota: '/admin/barbeiros', Icone: IconeCadastros },
  { chave: 'financeiro', rotulo: 'Financeiro', rota: '/admin/financeiro', Icone: IconeCifrao },
  { chave: 'editarsite', rotulo: 'Editar site', rota: '/admin/editar-site', Icone: IconeGlobo },
]

const ROTAS_CADASTROS = ['/admin/barbeiros', '/admin/servicos', '/admin/filiais']

function itemEstaAtivo(item, ativa) {
  if (item.chave === 'cadastros') return ROTAS_CADASTROS.includes(ativa)
  return item.rota === ativa
}
function AdminSidebar({ ativa }) {
  const navigate = useNavigate()

  return (
    <aside className="admsidebar">
      <div className="admsidebar-marca">
        <span className="admsidebar-marca-nome">Barbearia </span>
        <span className="admsidebar-marca-etiqueta">Painel administrativo</span>
      </div>

      <nav className="admsidebar-nav">
        {ITENS.map((item) => {
          const ativo = itemEstaAtivo(item, ativa)
          const emBreve = item.rota === null

          return (
            <button
              key={item.chave}
              type="button"
              className={`admsidebar-item ${ativo ? 'admsidebar-item-ativo' : ''} ${emBreve ? 'admsidebar-item-desabilitado' : ''}`}
              onClick={() => item.rota && navigate(item.rota)}
              disabled={emBreve}
              title={emBreve ? `${item.rotulo} — em breve` : item.rotulo}
            >
              <item.Icone />
              <span className="admsidebar-item-rotulo">{item.rotulo}</span>
              {emBreve && <span className="admsidebar-badge">Em breve</span>}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default AdminSidebar