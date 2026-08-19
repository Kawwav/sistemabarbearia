import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexto/AdminAuthContext'
import AdminSidebar from './admsidebar'
import CadastrosAbas from './cadastrosabas'
import './admfiliais.css'

const CHAVE_FILIAIS = 'barbearia_filiais'

const FILIAIS_SEED = [
  { id: 'centro', nome: 'Filial Centro', endereco: 'Rua das Flores, 120', telefone: '' },
  { id: 'zonasul', nome: 'Filial Zona Sul', endereco: 'Av. Brasil, 850', telefone: '' },
]

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

function salvarFiliais(lista) {
  try {
    localStorage.setItem(CHAVE_FILIAIS, JSON.stringify(lista))
  } catch {
  }
}

const FILIAL_VAZIA = { nome: '', endereco: '', telefone: '' }

function IconeMais() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
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

function IconeLixeira() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z" />
    </svg>
  )
}

function FormFilial({ valor, aoMudar }) {
  return (
    <div className="admfiliais-form">
      <label className="admfiliais-campo">
        <span>Nome da filial</span>
        <input
          type="text"
          placeholder="Ex.: Filial Centro"
          value={valor.nome}
          onChange={(e) => aoMudar((atual) => ({ ...atual, nome: e.target.value }))}
        />
      </label>

      <label className="admfiliais-campo">
        <span>Endereço</span>
        <input
          type="text"
          placeholder="Rua, número e bairro"
          value={valor.endereco}
          onChange={(e) => aoMudar((atual) => ({ ...atual, endereco: e.target.value }))}
        />
      </label>

      <label className="admfiliais-campo">
        <span>Telefone (opcional)</span>
        <input
          type="text"
          placeholder="(00) 00000-0000"
          value={valor.telefone}
          onChange={(e) => aoMudar((atual) => ({ ...atual, telefone: e.target.value }))}
        />
      </label>
    </div>
  )
}

function AdminFiliais() {
  const navigate = useNavigate()
  const { admin, sairAdmin } = useAdminAuth()

  const [filiais, setFiliais] = useState(() => carregarFiliais())
  const [mostrarNova, setMostrarNova] = useState(false)
  const [novaFilial, setNovaFilial] = useState(FILIAL_VAZIA)
  const [editandoId, setEditandoId] = useState(null)
  const [rascunho, setRascunho] = useState(FILIAL_VAZIA)

  useEffect(() => {
    salvarFiliais(filiais)
  }, [filiais])

  function handleSair() {
    sairAdmin()
    navigate('/admin/login')
  }

  function abrirNova() {
    setNovaFilial(FILIAL_VAZIA)
    setMostrarNova(true)
    setEditandoId(null)
  }

  function fecharNova() {
    setMostrarNova(false)
  }

  const novaFilialValida = novaFilial.nome.trim() !== ''

  function salvarNova() {
    if (!novaFilialValida) return
    const filial = {
      id: `filial-${Date.now()}`,
      nome: novaFilial.nome.trim(),
      endereco: novaFilial.endereco.trim(),
      telefone: novaFilial.telefone.trim(),
    }
    setFiliais((atual) => [...atual, filial])
    setMostrarNova(false)
  }

  function remover(id) {
    setFiliais((atual) => atual.filter((f) => f.id !== id))
    if (editandoId === id) setEditandoId(null)
  }

  function iniciarEdicao(filial) {
    setEditandoId(filial.id)
    setRascunho({
      nome: filial.nome,
      endereco: filial.endereco || '',
      telefone: filial.telefone || '',
    })
    setMostrarNova(false)
  }

  function cancelarEdicao() {
    setEditandoId(null)
  }

  const rascunhoValido = rascunho.nome.trim() !== ''

  function salvarEdicao(id) {
    if (!rascunhoValido) return
    setFiliais((atual) =>
      atual.map((f) =>
        f.id === id
          ? { ...f, nome: rascunho.nome.trim(), endereco: rascunho.endereco.trim(), telefone: rascunho.telefone.trim() }
          : f
      )
    )
    setEditandoId(null)
  }

  return (
    <div className="admlayout">
      <AdminSidebar ativa="/admin/filiais" />
      <div className="admlayout-main">
      <section className="admfiliais">
      <div className="admfiliais-cabecalho">
        <div>
          <p className="admfiliais-etiqueta">Cadastros</p>
          <h1 className="admfiliais-titulo">Filiais</h1>
        </div>
        <div className="admfiliais-cabecalho-direita">
          <span className="admfiliais-email">{admin?.email}</span>
          <button type="button" className="admfiliais-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
      </div>

      <CadastrosAbas ativa="/admin/filiais" />

      <div className="admfiliais-barra">
        <span className="admfiliais-contagem">
          {filiais.length} filial{filiais.length !== 1 ? 'is' : ''} cadastrada{filiais.length !== 1 ? 's' : ''}
        </span>
        <button type="button" className="admfiliais-novo-abrir" onClick={abrirNova}>
          <IconeMais />
          Nova filial
        </button>
      </div>

      {mostrarNova && (
        <div className="admfiliais-cartao admfiliais-cartao-form">
          <h2 className="admfiliais-form-titulo">Nova filial</h2>
          <FormFilial valor={novaFilial} aoMudar={setNovaFilial} />
          <div className="admfiliais-form-acoes">
            <button type="button" className="admfiliais-salvar" disabled={!novaFilialValida} onClick={salvarNova}>
              Salvar filial
            </button>
            <button type="button" className="admfiliais-cancelar" onClick={fecharNova}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {filiais.length === 0 ? (
        <p className="admfiliais-vazio">Nenhuma filial cadastrada ainda.</p>
      ) : (
        <div className="admfiliais-lista">
          {filiais.map((filial) => {
            const emEdicao = editandoId === filial.id

            if (emEdicao) {
              return (
                <div key={filial.id} className="admfiliais-cartao admfiliais-cartao-form">
                  <h2 className="admfiliais-form-titulo">Editar filial</h2>
                  <FormFilial valor={rascunho} aoMudar={setRascunho} />
                  <div className="admfiliais-form-acoes">
                    <button
                      type="button"
                      className="admfiliais-salvar"
                      disabled={!rascunhoValido}
                      onClick={() => salvarEdicao(filial.id)}
                    >
                      Salvar alterações
                    </button>
                    <button type="button" className="admfiliais-cancelar" onClick={cancelarEdicao}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={filial.id} className="admfiliais-cartao">
                <div className="admfiliais-info">
                  <h2 className="admfiliais-nome">{filial.nome}</h2>
                  {(filial.endereco || filial.telefone) && (
                    <p className="admfiliais-detalhe">
                      {[filial.endereco, filial.telefone].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="admfiliais-acoes">
                  <button
                    type="button"
                    className="admfiliais-acao"
                    onClick={() => iniciarEdicao(filial)}
                    aria-label="Editar filial"
                    title="Editar filial"
                  >
                    <IconeLapis />
                  </button>
                  <button
                    type="button"
                    className="admfiliais-acao admfiliais-acao-remover"
                    onClick={() => remover(filial.id)}
                    aria-label="Remover filial"
                    title="Remover filial"
                  >
                    <IconeLixeira />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      </section>
      </div>
    </div>
  )
}

export default AdminFiliais