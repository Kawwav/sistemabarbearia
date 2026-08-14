import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import logo from '/sualogo.png'
import { useAuth } from '../contexto/AuthContext'
import './comeco.css'

gsap.registerPlugin(ScrollTrigger)

function Comeco({ onFinish, duracao = 2200 }) {
  const [subindo, setSubindo] = useState(false)
  const videoRef = useRef(null)
  const heroRef = useRef(null)
  const videoContainerRef = useRef(null)
  const navigate = useNavigate()
  const { estaLogado } = useAuth()

  // se já estiver logado, vai direto pro agendamento; senão, pede login primeiro
  function irParaAgendamento(e) {
    e.preventDefault()
    navigate(estaLogado ? '/agendar' : '/login')
  }

  // velocidade do video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.6
    }
  }, [])

  // cortina de abertura
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const iniciarSubida = setTimeout(() => setSubindo(true), duracao)
    const finalizar = setTimeout(() => {
      document.body.style.overflow = ''
      onFinish?.()
    }, duracao + 1100) // 1100ms = tempo da animação da cortina subindo

    return () => {
      clearTimeout(iniciarSubida)
      clearTimeout(finalizar)
      document.body.style.overflow = ''
    }
  }, [duracao, onFinish])

  // encolher o video ao rolar para a secao de servicos
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=130%',
          scrub: 1.8, // scrub alto = movimento suavizado, com "atraso" seguindo o scroll
          pin: true,
          pinSpacing: true,
        },
      })

      // pequeno delay: os primeiros 20% do scroll nao encolhem nada
      tl.to(videoContainerRef.current, { duration: 0.2 })

      // encolhimento suave e gradual
      tl.to(videoContainerRef.current, {
        width: '320px',
        height: '320px',
        borderRadius: '24px',
        ease: 'power2.inOut',
        duration: 0.8,
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="comeco-hero" ref={heroRef}>
      <div className="comeco-video-container" ref={videoContainerRef}>
        <video
          ref={videoRef}
          className="comeco-video"
          src="/fundo.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="comeco-video-escurecer" />
      </div>

      <div className="comeco-logo-topo">
        <img src={logo} alt="Logo" className="comeco-boasvindas-logo" />
      </div>

      <div className="comeco-acoes-topo">
        <a href="/agendar" className="comeco-agendar" onClick={irParaAgendamento}>
          Agendar
        </a>
        <a href="/admin/login" className="comeco-adm">
          Adm
        </a>
      </div>

      <div className="comeco-boasvindas">
        <span className="comeco-eyebrow">Desde 2000</span>
        <h1 className="comeco-boasvindas-texto">
          Seja bem-vindo à
          <br />
          Barbearia Nome
        </h1>
        <a href="#servicos" className="comeco-botao">
          Descubra mais
          <span className="comeco-botao-icone">↓</span>
        </a>
      </div>

      <div className={`comeco-cortina${subindo ? ' comeco-subir' : ''}`}>
        <div className="comeco-conteudo">
          <img src={logo} alt="Logo" className="comeco-logo" />
          <div className="comeco-barra">
            <div
              className="comeco-progresso"
              style={{ animationDuration: `${duracao}ms` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Comeco