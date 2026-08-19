import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexto/AdminAuthContext'
import AdminSidebar from './admsidebar'
import './admeditarsite.css'

const SECOES = [
  { chave: 'identidade', rotulo: 'Identidade' },
  { chave: 'inicio', rotulo: 'Início' },
  { chave: 'time', rotulo: 'Time' },
  { chave: 'salao', rotulo: 'Salão' },
  { chave: 'rodape', rotulo: 'Rodapé' },
]

const ESTADO_INICIAL = {
  identidade: {
    logo: '',
    nomeBarbearia: 'Barbearia Nome',
  },
  inicio: {
    tipoFundo: 'video',
    video: '',
    imagem: '',
    desde: 'Desde 2000',
    textoBoasVindas: 'Seja bem-vindo à\nBarbearia Nome',
  },
  time: {
    titulo: 'Conheça nosso time',
    membros: [
      { id: 'joao', nome: 'João Silva', cargo: 'Barbeiro', foto: '' },
      { id: 'pedro', nome: 'Pedro Alves', cargo: 'Barbeiro', foto: '' },
      { id: 'lucas', nome: 'Lucas Souza', cargo: 'Barbeiro', foto: '' },
      { id: 'rafael', nome: 'Rafael Costa', cargo: 'Barbeiro', foto: '' },
    ],
    frases: [
      'Cada corte conta uma história',
      'Tradição e estilo em cada detalhe',
      'Paixão pelo que fazemos',
    ],
  },
  salao: {
    titulo: 'Conheça\nnossa barbearia',
    imagens: [
      { id: 'salao-1', src: '' },
      { id: 'salao-2', src: '' },
      { id: 'salao-3', src: '' },
      { id: 'salao-4', src: '' },
      { id: 'salao-5', src: '' },
    ],
    mapaLink: 'https://www.google.com/maps?q=Barbearia&output=embed',
  },
  rodape: {
    nomeBarbearia: 'Barbearia Nome',
    endereco: 'Rua das Flores, 120 — Centro',
    instagram: 'https://instagram.com/barbearianome',
    whatsapp: 'https://wa.me/5511999999999',
  },
}

function lerArquivoComoDataUrl(arquivo, aoCarregar) {
  if (!arquivo) return
  const leitor = new FileReader()
  leitor.onload = () => aoCarregar(leitor.result)
  leitor.readAsDataURL(arquivo)
}

function IconeGlobo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  )
}

function IconeImagem() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  )
}

function IconeVideo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="15" height="14" rx="2" />
      <path d="m17 10 5-3v10l-5-3" />
    </svg>
  )
}

function IconeUsuarios() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconeCasa() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M9 22V12h6v10" />
    </svg>
  )
}

function IconeRodape() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 15h18" />
    </svg>
  )
}

function IconeCamera() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function IconeMais() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconeX() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function IconeInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconeWhatsapp() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function IconePino() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconeAviso() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  )
}

function BotaoSalvarSecao() {
  const [confirmado, setConfirmado] = useState(false)
  const timeoutRef = useRef(null)

  function handleClick() {
    setConfirmado(true)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setConfirmado(false), 2200)
  }

  return (
    <div className="editsite-secao-acoes">
      <button type="button" className="editsite-salvar" onClick={handleClick}>
        Salvar alterações
      </button>
      <span className={`editsite-salvo-confirmacao ${confirmado ? 'editsite-salvo-confirmacao-visivel' : ''}`}>
        Alterações salvas
      </span>
    </div>
  )
}

function CabecalhoSecao({ Icone, titulo, descricao }) {
  return (
    <div className="editsite-secao-cabecalho">
      <span className="editsite-secao-icone">
        <Icone />
      </span>
      <div>
        <h2 className="editsite-secao-titulo">{titulo}</h2>
        <p className="editsite-secao-descricao">{descricao}</p>
      </div>
    </div>
  )
}

function AdminEditarSite() {
  const navigate = useNavigate()
  const { admin, sairAdmin } = useAdminAuth()

  const [dados, setDados] = useState(ESTADO_INICIAL)
  const [secaoAtiva, setSecaoAtiva] = useState('identidade')

  function handleSair() {
    sairAdmin()
    navigate('/admin/login')
  }

  function irParaSecao(chave) {
    setSecaoAtiva(chave)
    document.getElementById(`secao-${chave}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function atualizarIdentidade(campo, valor) {
    setDados((atual) => ({ ...atual, identidade: { ...atual.identidade, [campo]: valor } }))
  }

  function atualizarInicio(campo, valor) {
    setDados((atual) => ({ ...atual, inicio: { ...atual.inicio, [campo]: valor } }))
  }

  function atualizarTime(campo, valor) {
    setDados((atual) => ({ ...atual, time: { ...atual.time, [campo]: valor } }))
  }

  function atualizarMembro(id, campo, valor) {
    setDados((atual) => ({
      ...atual,
      time: {
        ...atual.time,
        membros: atual.time.membros.map((m) => (m.id === id ? { ...m, [campo]: valor } : m)),
      },
    }))
  }

  function atualizarFrase(indice, valor) {
    setDados((atual) => ({
      ...atual,
      time: {
        ...atual.time,
        frases: atual.time.frases.map((f, i) => (i === indice ? valor : f)),
      },
    }))
  }

  function atualizarSalao(campo, valor) {
    setDados((atual) => ({ ...atual, salao: { ...atual.salao, [campo]: valor } }))
  }

  function atualizarImagemSalao(id, src) {
    setDados((atual) => ({
      ...atual,
      salao: {
        ...atual.salao,
        imagens: atual.salao.imagens.map((img) => (img.id === id ? { ...img, src } : img)),
      },
    }))
  }

  function adicionarImagemSalao(src) {
    setDados((atual) => ({
      ...atual,
      salao: {
        ...atual.salao,
        imagens: [...atual.salao.imagens, { id: `salao-${Date.now()}`, src }],
      },
    }))
  }

  function removerImagemSalao(id) {
    setDados((atual) => ({
      ...atual,
      salao: { ...atual.salao, imagens: atual.salao.imagens.filter((img) => img.id !== id) },
    }))
  }

  function atualizarRodape(campo, valor) {
    setDados((atual) => ({ ...atual, rodape: { ...atual.rodape, [campo]: valor } }))
  }

  const inputNovaImagemRef = useRef(null)

  return (
    <div className="admlayout">
      <AdminSidebar ativa="/admin/editar-site" />
      <div className="admlayout-main">
        <section className="editsite">
          <div className="editsite-cabecalho">
            <div>
              <p className="editsite-etiqueta">Painel administrativo</p>
              <h1 className="editsite-titulo">Editar site</h1>
              <p className="editsite-subtitulo">
                Ajuste os textos e imagens exibidos no site público da barbearia.
              </p>
            </div>
            <div className="editsite-cabecalho-direita">
              <span className="editsite-email">{admin?.email}</span>
              <button type="button" className="editsite-sair" onClick={handleSair}>
                Sair
              </button>
            </div>
          </div>

          <nav className="editsite-nav">
            {SECOES.map((secao) => (
              <button
                key={secao.chave}
                type="button"
                className={`editsite-nav-item ${secaoAtiva === secao.chave ? 'editsite-nav-item-ativo' : ''}`}
                onClick={() => irParaSecao(secao.chave)}
              >
                {secao.rotulo}
              </button>
            ))}
          </nav>

          <div className="editsite-secoes">
            <div id="secao-identidade" className="editsite-secao">
              <CabecalhoSecao
                Icone={IconeGlobo}
                titulo="Identidade do site"
                descricao="A logo e o nome aparecem em todas as páginas: início, agendamento, painel admin, etc."
              />
              <div className="editsite-form">
                <div className="editsite-campo">
                  <span>Logo da barbearia</span>
                  <div className="editsite-upload-linha">
                    <span className="editsite-preview editsite-preview-logo">
                      {dados.identidade.logo ? <img src={dados.identidade.logo} alt="Logo" /> : <IconeImagem />}
                    </span>
                    <label className="editsite-upload-botao" htmlFor="upload-logo">
                      <IconeCamera />
                      {dados.identidade.logo ? 'Trocar logo' : 'Adicionar logo'}
                    </label>
                    <input
                      id="upload-logo"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => lerArquivoComoDataUrl(e.target.files?.[0], (url) => atualizarIdentidade('logo', url))}
                    />
                  </div>
                </div>

                <label className="editsite-campo">
                  <span>Nome da barbearia</span>
                  <input
                    type="text"
                    value={dados.identidade.nomeBarbearia}
                    onChange={(e) => atualizarIdentidade('nomeBarbearia', e.target.value)}
                    placeholder="Ex.: Barbearia Nome"
                  />
                </label>
              </div>
              <BotaoSalvarSecao />
            </div>
            <div id="secao-inicio" className="editsite-secao">
              <CabecalhoSecao
                Icone={IconeCasa}
                titulo="Página inicial"
                descricao="Fundo do topo (vídeo ou imagem), texto de fundação e a mensagem de boas-vindas."
              />
              <div className="editsite-form">
                <div className="editsite-campo">
                  <span>Fundo do topo</span>
                  <div className="editsite-alternador">
                    <button
                      type="button"
                      className={`editsite-alternador-item ${dados.inicio.tipoFundo === 'video' ? 'editsite-alternador-item-ativo' : ''}`}
                      onClick={() => atualizarInicio('tipoFundo', 'video')}
                    >
                      <IconeVideo /> Vídeo
                    </button>
                    <button
                      type="button"
                      className={`editsite-alternador-item ${dados.inicio.tipoFundo === 'imagem' ? 'editsite-alternador-item-ativo' : ''}`}
                      onClick={() => atualizarInicio('tipoFundo', 'imagem')}
                    >
                      <IconeImagem /> Imagem
                    </button>
                  </div>
                </div>

                {dados.inicio.tipoFundo === 'video' ? (
                  <div className="editsite-campo">
                    <span>Vídeo de fundo</span>
                    <div className="editsite-upload-linha">
                      <span className="editsite-preview editsite-preview-retangular">
                        {dados.inicio.video ? (
                          <video src={dados.inicio.video} muted />
                        ) : (
                          <IconeVideo />
                        )}
                      </span>
                      <label className="editsite-upload-botao" htmlFor="upload-video-inicio">
                        <IconeCamera />
                        {dados.inicio.video ? 'Trocar vídeo' : 'Adicionar vídeo'}
                      </label>
                      <input
                        id="upload-video-inicio"
                        type="file"
                        accept="video/*"
                        hidden
                        onChange={(e) => lerArquivoComoDataUrl(e.target.files?.[0], (url) => atualizarInicio('video', url))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="editsite-campo">
                    <span>Imagem de fundo</span>
                    <div className="editsite-upload-linha">
                      <span className="editsite-preview editsite-preview-retangular">
                        {dados.inicio.imagem ? <img src={dados.inicio.imagem} alt="Fundo do início" /> : <IconeImagem />}
                      </span>
                      <label className="editsite-upload-botao" htmlFor="upload-imagem-inicio">
                        <IconeCamera />
                        {dados.inicio.imagem ? 'Trocar imagem' : 'Adicionar imagem'}
                      </label>
                      <input
                        id="upload-imagem-inicio"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => lerArquivoComoDataUrl(e.target.files?.[0], (url) => atualizarInicio('imagem', url))}
                      />
                    </div>
                  </div>
                )}

                <label className="editsite-campo">
                  <span>Texto "desde quando existe"</span>
                  <input
                    type="text"
                    value={dados.inicio.desde}
                    onChange={(e) => atualizarInicio('desde', e.target.value)}
                    placeholder="Ex.: Desde 2000"
                  />
                </label>

                <label className="editsite-campo">
                  <span>
                    Texto de boas-vindas <span className="editsite-campo-dica">(uma quebra de linha separa as duas linhas do título)</span>
                  </span>
                  <textarea
                    value={dados.inicio.textoBoasVindas}
                    onChange={(e) => atualizarInicio('textoBoasVindas', e.target.value)}
                    placeholder={'Seja bem-vindo à\nBarbearia Nome'}
                  />
                </label>
              </div>
              <BotaoSalvarSecao />
            </div>
            <div id="secao-time" className="editsite-secao">
              <CabecalhoSecao
                Icone={IconeUsuarios}
                titulo="Nosso time"
                descricao="Fotos e nomes dos barbeiros exibidos na seção do time, e as frases que aparecem entre eles."
              />
              <div className="editsite-form">
                <label className="editsite-campo">
                  <span>Título da seção</span>
                  <input
                    type="text"
                    value={dados.time.titulo}
                    onChange={(e) => atualizarTime('titulo', e.target.value)}
                  />
                </label>

                <div className="editsite-sublista">
                  <div className="editsite-sublista-titulo">
                    <span>Barbeiros</span>
                  </div>
                  {dados.time.membros.map((membro) => (
                    <div key={membro.id} className="editsite-item-membro">
                      <span className="editsite-preview editsite-preview-avatar">
                        {membro.foto ? (
                          <img src={membro.foto} alt={membro.nome} />
                        ) : (
                          (membro.nome || '?').trim().charAt(0).toUpperCase()
                        )}
                      </span>
                      <div className="editsite-item-membro-campos">
                        <input
                          type="text"
                          value={membro.nome}
                          onChange={(e) => atualizarMembro(membro.id, 'nome', e.target.value)}
                          placeholder="Nome do barbeiro"
                        />
                        <input
                          type="text"
                          value={membro.cargo}
                          onChange={(e) => atualizarMembro(membro.id, 'cargo', e.target.value)}
                          placeholder="Cargo (ex.: Barbeiro)"
                        />
                      </div>
                      <label className="editsite-upload-botao" htmlFor={`upload-membro-${membro.id}`}>
                        <IconeCamera />
                        {membro.foto ? 'Trocar foto' : 'Adicionar foto'}
                      </label>
                      <input
                        id={`upload-membro-${membro.id}`}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) =>
                          lerArquivoComoDataUrl(e.target.files?.[0], (url) => atualizarMembro(membro.id, 'foto', url))
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="editsite-sublista">
                  <div className="editsite-sublista-titulo">
                    <span>Frases entre os membros</span>
                  </div>
                  {dados.time.frases.map((frase, indice) => (
                    <div key={indice} className="editsite-item-frase">
                      <span>{String(indice + 1).padStart(2, '0')}</span>
                      <input
                        type="text"
                        value={frase}
                        onChange={(e) => atualizarFrase(indice, e.target.value)}
                        placeholder="Frase exibida entre os barbeiros"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <BotaoSalvarSecao />
            </div>
            <div id="secao-salao" className="editsite-secao">
              <CabecalhoSecao
                Icone={IconeImagem}
                titulo="Salão"
                descricao="Título da seção, imagens do carrossel e a localização exibida no mapa."
              />
              <div className="editsite-form">
                <label className="editsite-campo">
                  <span>
                    Título da seção <span className="editsite-campo-dica">(uma quebra de linha separa as duas linhas)</span>
                  </span>
                  <textarea
                    value={dados.salao.titulo}
                    onChange={(e) => atualizarSalao('titulo', e.target.value)}
                    placeholder={'Conheça\nnossa barbearia'}
                  />
                </label>

                <div className="editsite-campo">
                  <span>Imagens do carrossel</span>
                  <div className="editsite-grade-imagens">
                    {dados.salao.imagens.map((imagem) => (
                      <div key={imagem.id} className="editsite-imagem-cartao">
                        {imagem.src ? (
                          <img src={imagem.src} alt="Ambiente da barbearia" />
                        ) : (
                          <label
                            htmlFor={`upload-salao-${imagem.id}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100px',
                              color: '#6a6a6a',
                              cursor: 'pointer',
                            }}
                          >
                            <IconeImagem />
                          </label>
                        )}
                        <input
                          id={`upload-salao-${imagem.id}`}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) =>
                            lerArquivoComoDataUrl(e.target.files?.[0], (url) => atualizarImagemSalao(imagem.id, url))
                          }
                        />
                        <button
                          type="button"
                          className="editsite-imagem-remover"
                          onClick={() => removerImagemSalao(imagem.id)}
                          aria-label="Remover imagem"
                          title="Remover imagem"
                        >
                          <IconeX />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="editsite-imagem-adicionar"
                      onClick={() => inputNovaImagemRef.current?.click()}
                    >
                      <IconeMais />
                      Adicionar
                    </button>
                    <input
                      ref={inputNovaImagemRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => lerArquivoComoDataUrl(e.target.files?.[0], (url) => adicionarImagemSalao(url))}
                    />
                  </div>
                </div>

                <label className="editsite-campo">
                  <span>Localização (link de incorporação do Google Maps)</span>
                  <div className="editsite-campo-icone">
                    <IconePino />
                    <input
                      type="url"
                      value={dados.salao.mapaLink}
                      onChange={(e) => atualizarSalao('mapaLink', e.target.value)}
                      placeholder="https://www.google.com/maps?q=...&output=embed"
                    />
                  </div>
                </label>
              </div>
              <BotaoSalvarSecao />
            </div>
            <div id="secao-rodape" className="editsite-secao">
              <CabecalhoSecao
                Icone={IconeRodape}
                titulo="Rodapé"
                descricao="Nome, endereço e links de contato exibidos no rodapé do site."
              />
              <div className="editsite-form">
                <label className="editsite-campo">
                  <span>Nome da barbearia (exibido no rodapé)</span>
                  <input
                    type="text"
                    value={dados.rodape.nomeBarbearia}
                    onChange={(e) => atualizarRodape('nomeBarbearia', e.target.value)}
                  />
                </label>

                <label className="editsite-campo">
                  <span>Endereço</span>
                  <div className="editsite-campo-icone">
                    <IconePino />
                    <input
                      type="text"
                      value={dados.rodape.endereco}
                      onChange={(e) => atualizarRodape('endereco', e.target.value)}
                      placeholder="Rua, número — Bairro"
                    />
                  </div>
                </label>

                <div className="editsite-linha">
                  <label className="editsite-campo">
                    <span>Link do Instagram</span>
                    <div className="editsite-campo-icone">
                      <IconeInstagram />
                      <input
                        type="url"
                        value={dados.rodape.instagram}
                        onChange={(e) => atualizarRodape('instagram', e.target.value)}
                        placeholder="https://instagram.com/seuinstagram"
                      />
                    </div>
                  </label>

                  <label className="editsite-campo">
                    <span>Link do WhatsApp</span>
                    <div className="editsite-campo-icone">
                      <IconeWhatsapp />
                      <input
                        type="url"
                        value={dados.rodape.whatsapp}
                        onChange={(e) => atualizarRodape('whatsapp', e.target.value)}
                        placeholder="https://wa.me/55DDNÚMERO"
                      />
                    </div>
                  </label>
                </div>
              </div>
              <BotaoSalvarSecao />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminEditarSite