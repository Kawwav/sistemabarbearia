import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexto/AdminAuthContext'
import CadastrosAbas from './cadastrosabas'
import './admservicos.css'

const CHAVE_SERVICOS = 'barbearia_servicos'

// dados iniciais só pra não começar com a tela vazia; some assim que alguém edita a lista
const SERVICOS_SEED = [
  { id: 'cabelo', nome: 'Cabelo', preco: 45 },
  { id: 'barba', nome: 'Barba', preco: 35 },
  { id: 'sobrancelha', nome: 'Sobrancelha', preco: 20 },
  { id: 'cabelo-barba', nome: 'Cabelo + Barba', preco: 70 },
  { id: 'pigmentacao', nome: 'Pigmentação', preco: 40 },
]

// TODO: troque essas funções por chamadas reais ao backend (GET/POST/PATCH/DELETE de serviços).
// Enquanto isso, tudo fica salvo no localStorage e é compartilhado com adm.jsx e novoagendamento.jsx.
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

function salvarServicos(lista) {
  try {
    localStorage.setItem(CHAVE_SERVICOS, JSON.stringify(lista))
  } catch {
    // sem localStorage disponível, segue sem persistir
  }
}

const SERVICO_VAZIO = { nome: '', preco: '' }

function formatarPreco(preco) {
  return Number(preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function IconeVoltar() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}

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

// formulário compartilhado entre "novo serviço" e "editar serviço"
function FormServico({ valor, aoMudar, idCampo }) {
  return (
    <div className="admservicos-form">
      <label className="admservicos-campo">
        <span>Nome do serviço</span>
        <input
          type="text"
          placeholder="Ex.: Corte de cabelo"
          value={valor.nome}
          onChange={(e) => aoMudar((atual) => ({ ...atual, nome: e.target.value }))}
        />
      </label>

      <label className="admservicos-campo">
        <span>Preço</span>
        <div className="admservicos-preco-campo">
          <span className="admservicos-preco-prefixo">R$</span>
          <input
            id={`${idCampo}-preco`}
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={valor.preco}
            onChange={(e) => aoMudar((atual) => ({ ...atual, preco: e.target.value }))}
          />
        </div>
      </label>
    </div>
  )
}

function AdminServicos() {
  const navigate = useNavigate()
  const { admin, sairAdmin } = useAdminAuth()

  const [servicos, setServicos] = useState(() => carregarServicos())
  const [mostrarNovo, setMostrarNovo] = useState(false)
  const [novoServico, setNovoServico] = useState(SERVICO_VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [rascunho, setRascunho] = useState(SERVICO_VAZIO)

  useEffect(() => {
    salvarServicos(servicos)
  }, [servicos])

  function handleSair() {
    sairAdmin()
    navigate('/admin/login')
  }

  function abrirNovo() {
    setNovoServico(SERVICO_VAZIO)
    setMostrarNovo(true)
    setEditandoId(null)
  }

  function fecharNovo() {
    setMostrarNovo(false)
  }

  const novoServicoValido = novoServico.nome.trim() !== '' && Number(novoServico.preco) > 0

  function salvarNovo() {
    if (!novoServicoValido) return
    const servico = {
      id: `servico-${Date.now()}`,
      nome: novoServico.nome.trim(),
      preco: Number(novoServico.preco),
    }
    setServicos((atual) => [...atual, servico])
    setMostrarNovo(false)
  }

  function remover(id) {
    setServicos((atual) => atual.filter((s) => s.id !== id))
    if (editandoId === id) setEditandoId(null)
  }

  function iniciarEdicao(servico) {
    setEditandoId(servico.id)
    setRascunho({ nome: servico.nome, preco: String(servico.preco) })
    setMostrarNovo(false)
  }

  function cancelarEdicao() {
    setEditandoId(null)
  }

  const rascunhoValido = rascunho.nome.trim() !== '' && Number(rascunho.preco) > 0

  function salvarEdicao(id) {
    if (!rascunhoValido) return
    setServicos((atual) =>
      atual.map((s) =>
        s.id === id ? { ...s, nome: rascunho.nome.trim(), preco: Number(rascunho.preco) } : s
      )
    )
    setEditandoId(null)
  }

  return (
    <section className="admservicos">
      <div className="admservicos-cabecalho">
        <div>
          <button type="button" className="admservicos-voltar" onClick={() => navigate('/admin')}>
            <IconeVoltar />
            Voltar aos agendamentos
          </button>
          <p className="admservicos-etiqueta">Cadastros</p>
          <h1 className="admservicos-titulo">Serviços</h1>
        </div>
        <div className="admservicos-cabecalho-direita">
          <span className="admservicos-email">{admin?.email}</span>
          <button type="button" className="admservicos-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
      </div>

      <CadastrosAbas ativa="/admin/servicos" />

      <div className="admservicos-barra">
        <span className="admservicos-contagem">
          {servicos.length} serviço{servicos.length !== 1 ? 's' : ''} cadastrado{servicos.length !== 1 ? 's' : ''}
        </span>
        <button type="button" className="admservicos-novo-abrir" onClick={abrirNovo}>
          <IconeMais />
          Novo serviço
        </button>
      </div>

      {mostrarNovo && (
        <div className="admservicos-cartao admservicos-cartao-form">
          <h2 className="admservicos-form-titulo">Novo serviço</h2>
          <FormServico valor={novoServico} aoMudar={setNovoServico} idCampo="novo-servico" />
          <div className="admservicos-form-acoes">
            <button type="button" className="admservicos-salvar" disabled={!novoServicoValido} onClick={salvarNovo}>
              Salvar serviço
            </button>
            <button type="button" className="admservicos-cancelar" onClick={fecharNovo}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {servicos.length === 0 ? (
        <p className="admservicos-vazio">Nenhum serviço cadastrado ainda.</p>
      ) : (
        <div className="admservicos-lista">
          {servicos.map((servico) => {
            const emEdicao = editandoId === servico.id

            if (emEdicao) {
              return (
                <div key={servico.id} className="admservicos-cartao admservicos-cartao-form">
                  <h2 className="admservicos-form-titulo">Editar serviço</h2>
                  <FormServico valor={rascunho} aoMudar={setRascunho} idCampo={`editar-${servico.id}`} />
                  <div className="admservicos-form-acoes">
                    <button
                      type="button"
                      className="admservicos-salvar"
                      disabled={!rascunhoValido}
                      onClick={() => salvarEdicao(servico.id)}
                    >
                      Salvar alterações
                    </button>
                    <button type="button" className="admservicos-cancelar" onClick={cancelarEdicao}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={servico.id} className="admservicos-cartao">
                <div className="admservicos-info">
                  <h2 className="admservicos-nome">{servico.nome}</h2>
                  <span className="admservicos-preco">R$ {formatarPreco(servico.preco)}</span>
                </div>
                <div className="admservicos-acoes">
                  <button
                    type="button"
                    className="admservicos-acao"
                    onClick={() => iniciarEdicao(servico)}
                    aria-label="Editar serviço"
                    title="Editar serviço"
                  >
                    <IconeLapis />
                  </button>
                  <button
                    type="button"
                    className="admservicos-acao admservicos-acao-remover"
                    onClick={() => remover(servico.id)}
                    aria-label="Remover serviço"
                    title="Remover serviço"
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
  )
}

export default AdminServicos
