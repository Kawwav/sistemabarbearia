import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexto/AdminAuthContext'
import AdminSidebar from './admsidebar'
import './admclube.css'

const CHAVE_MEMBROS = 'barbearia_membros'

const PLANOS = [
  { id: 'essencial', nome: 'Essencial', preco: 79 },
  { id: 'completo', nome: 'Completo', preco: 129 },
  { id: 'vip', nome: 'VIP', preco: 189 },
]

function carregarMembros() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_MEMBROS) || '[]')
  } catch {
    return []
  }
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatarData(data) {
  if (!data) return ''
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function AdminClube() {
  const navigate = useNavigate()
  const { admin, sairAdmin } = useAdminAuth()

  const [membros] = useState(() => carregarMembros())

  function handleSair() {
    sairAdmin()
    navigate('/admin/login')
  }

  const planosComAssinantes = useMemo(() => {
    return PLANOS.map((plano) => {
      const assinantes = membros
        .filter((m) => m.planoId === plano.id)
        .sort((a, b) => (b.desde || '').localeCompare(a.desde || ''))
      return {
        ...plano,
        assinantes,
        receita: assinantes.length * plano.preco,
      }
    })
  }, [membros])

  const totalAssinantes = membros.length
  const receitaTotal = planosComAssinantes.reduce((total, p) => total + p.receita, 0)

  return (
    <div className="admlayout">
      <AdminSidebar ativa="/admin/clube" />
      <div className="admlayout-main">
      <section className="admclube">
      <div className="admclube-cabecalho">
        <div>
          <p className="admclube-etiqueta">Assinaturas</p>
          <h1 className="admclube-titulo">Clube</h1>
        </div>
        <div className="admclube-cabecalho-direita">
          <span className="admclube-email">{admin?.email}</span>
          <button type="button" className="admclube-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
      </div>

      <div className="admclube-resumo">
        <div className="admclube-resumo-cartao">
          <span className="admclube-resumo-etiqueta">Assinantes ativos</span>
          <span className="admclube-resumo-valor">{totalAssinantes}</span>
        </div>
        <div className="admclube-resumo-cartao admclube-resumo-destaque">
          <span className="admclube-resumo-etiqueta">Receita recorrente estimada</span>
          <span className="admclube-resumo-valor">
            R$ {formatarMoeda(receitaTotal)}
            <span className="admclube-resumo-periodo">/mês</span>
          </span>
        </div>
      </div>

      {totalAssinantes === 0 ? (
        <p className="admclube-vazio">Ninguém assinou o Clube ainda.</p>
      ) : (
        <div className="admclube-planos">
          {planosComAssinantes.map((plano) => (
            <div key={plano.id} className="admclube-plano-cartao">
              <div className="admclube-plano-cabecalho">
                <div>
                  <h2 className="admclube-plano-nome">{plano.nome}</h2>
                  <span className="admclube-plano-preco">R$ {formatarMoeda(plano.preco)}/mês por assinante</span>
                </div>
                <div className="admclube-plano-numeros">
                  <span className="admclube-plano-contagem">
                    {plano.assinantes.length} assinante{plano.assinantes.length !== 1 ? 's' : ''}
                  </span>
                  <span className="admclube-plano-receita">R$ {formatarMoeda(plano.receita)}/mês</span>
                </div>
              </div>

              {plano.assinantes.length > 0 ? (
                <div className="admclube-assinantes">
                  {plano.assinantes.map((assinante) => (
                    <div key={assinante.email || assinante.nome} className="admclube-assinante-linha">
                      <div className="admclube-assinante-info">
                        <span className="admclube-assinante-nome">
                          {assinante.nome || assinante.email || 'Sem nome'}
                        </span>
                        {assinante.nome && assinante.email && (
                          <span className="admclube-assinante-email">{assinante.email}</span>
                        )}
                      </div>
                      <span className="admclube-assinante-desde">Desde {formatarData(assinante.desde)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="admclube-plano-vazio">Nenhum assinante nesse plano ainda.</p>
              )}
            </div>
          ))}
        </div>
      )}
      </section>
      </div>
    </div>
  )
}

export default AdminClube