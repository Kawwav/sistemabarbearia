import './footer.css'
import { useEffect, useRef, useState, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { useAuth } from '../contexto/AuthContext'
const modeloTesoura = '/barbers_scissors.glb'

// frase que corre da direita para a esquerda no topo do footer
const FRASE_MARQUEE = '"o bom trabalho se faz como as formigas fazem as coisas: pouco a pouco" — Lafcadio Hearn'

// dados de contato / funcionamento — ajuste com as informações reais da barbearia
const ENDERECO = 'Rua Exemplo, 123 — São Paulo, SP'
const HORARIO = 'Seg a Sáb · 9h às 20h'
const LINK_INSTAGRAM = 'https://instagram.com/barbearia'
const LINK_WHATSAPP = 'https://wa.me/5511999999999'

// ícones em svg puro, sem dependência externa
function IconeAgendar(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconeInstagram(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconeWhatsApp(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21l1.4-4.2A8.5 8.5 0 1 1 8 19.6L3 21z" />
      <path d="M8.5 9.5c.2 2 2 3.8 4 4 .6.1 1-.5.7-1l-.6-1a.6.6 0 0 0-.7-.2l-.7.3a4.6 4.6 0 0 1-2-2l.3-.7a.6.6 0 0 0-.2-.7l-1-.6c-.5-.3-1.1.1-1 .7z" />
    </svg>
  )
}

function useRevelar(threshold = 0.2) {
  const ref = useRef(null)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -100px 0px' }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [threshold])

  return [ref, visivel]
}

function Tesoura3D({ visivel }) {
  const { scene } = useGLTF(modeloTesoura)
  const ref = useRef(null)

  // ponto de partida: canto inferior esquerdo, fora do centro
  const posicaoInicial = useRef([-6, -3.5, 0])
  const posicaoAlvo = [0, 0, 0]

useFrame(() => {
  if (!ref.current) return

  const alvo = visivel ? posicaoAlvo : posicaoInicial.current
  ref.current.position.x += (alvo[0] - ref.current.position.x) * 0.045
  ref.current.position.y += (alvo[1] - ref.current.position.y) * 0.045

  ref.current.rotation.x = 0.3
  ref.current.rotation.z = 0.6
  ref.current.rotation.y += 0.004
})
return (
  <primitive
    ref={ref}
    object={scene}
    position={posicaoInicial.current}
    rotation={[0.3, 0, 0.6]}
    scale={10.1}
  />
)
}

function FooterMarquee({ texto }) {
  // duplica o conteúdo para o loop ficar contínuo
  return (
    <div className="footer-marquee-wrap">
      <div className="footer-marquee-texto">
        <span>{texto}</span>
        <span aria-hidden="true">{texto}</span>
      </div>
    </div>
  )
}

function Footer() {
  const [ref, visivel] = useRevelar()
  const navigate = useNavigate()
  const { estaLogado } = useAuth()

  // se já estiver logado, vai direto pro agendamento; senão, pede login primeiro
  function irParaAgendamento(e) {
    e.preventDefault()
    navigate(estaLogado ? '/agendar' : '/login')
  }

  return (
    <footer className="footer" ref={ref}>
      <div className="footer-conteudo">
        <div className="footer-topo">
          <div className="footer-topo-esquerda" aria-hidden="true" />

          <h2 className="footer-marca">BARBEARIA</h2>

          <div className="footer-lado-direito">
            <FooterMarquee texto={FRASE_MARQUEE} />

            <div className="footer-cena">
              <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[5, 5, 5]} intensity={1.8} />
                <directionalLight position={[-5, -2, 3]} intensity={0.6} />
                <Environment preset="studio" />
                <Suspense fallback={null}>
                  <Tesoura3D visivel={visivel} />
                </Suspense>
              </Canvas>
            </div>
          </div>
        </div>

        <div className="footer-baixo">
          <div className="footer-baixo-coluna">
            <span className="footer-baixo-rotulo">Localização</span>
            <p className="footer-endereco">{ENDERECO}</p>
            <p className="footer-data">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="footer-baixo-coluna footer-baixo-direita">
            <span className="footer-baixo-rotulo">Horário</span>
            <p className="footer-horario">{HORARIO}</p>

            <div className="footer-social">
              <a
                href="/agendar"
                className="footer-social-link"
                aria-label="Agendar horário"
                onClick={irParaAgendamento}
              >
                <IconeAgendar />
                <span>Agendar</span>
              </a>
              <a
                href={LINK_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Instagram"
              >
                <IconeInstagram />
                <span>Instagram</span>
              </a>
              <a
                href={LINK_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="WhatsApp"
              >
                <IconeWhatsApp />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <p className="footer-copyright">
        © {new Date().getFullYear()} Barbearia Nome. Todos os direitos reservados.
      </p>
    </footer>
  )
}

useGLTF.preload(modeloTesoura)

export default Footer