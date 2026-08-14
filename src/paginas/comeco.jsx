import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import logo from '/sualogo.png'
import { useAuth } from '../contexto/AuthContext'
import { useLenis } from '../contexto/SmoothScrollContext'
import './comeco.css'

gsap.registerPlugin(ScrollTrigger)

function Comeco({ onFinish, duracao = 2200 }) {
  const [subindo, setSubindo] = useState(false)
  const videoRef = useRef(null)
  const heroRef = useRef(null)
  const videoContainerRef = useRef(null)
  const navigate = useNavigate()
  const { estaLogado } = useAuth()
  const lenis = useLenis()
  function irParaAgendamento(e) {
    e.preventDefault()
    navigate(estaLogado ? '/agendar' : '/login')
  }

  function irParaAdmin(e) {
    e.preventDefault()
    navigate('/admin/login')
  }

  function descobrirMais(e) {
    e.preventDefault()

    const alvo = document.querySelector('#Time')
    if (!alvo) return

    if (lenis) {
      lenis.scrollTo(alvo, { offset: 0, duration: 1.2 })
    } else {
      // sem lenis (ex: prefers-reduced-motion ativo): scroll instantâneo nativo
      alvo.scrollIntoView({ behavior: 'auto' })
    }
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

  // encolher o video ao rolar para a secao de servicos (funciona em desktop e mobile)
  useLayoutEffect(() => {
    // normaliza o scroll no touch (evita saltos/travamentos do pin no iOS/Android)
    ScrollTrigger.normalizeScroll(true)

    const ctx = gsap.context(() => {
      // matchMedia: mesma animação, mas com o tamanho final e a distância de
      // scroll ajustados para telas menores
      const mm = gsap.matchMedia()

      mm.add(
        {
          isMobile: '(max-width: 640px)',
          isTablet: '(min-width: 641px) and (max-width: 1024px)',
          isDesktop: '(min-width: 1025px)',
        },
        (context) => {
          const { isMobile, isTablet } = context.conditions

          // no celular o alvo é relativo à largura da tela, para nunca
          // ficar maior que o viewport
          const tamanhoFinal = isMobile ? '82vw' : isTablet ? '260px' : '320px'
          const distanciaScroll = isMobile ? '+=100%' : '+=130%'

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: distanciaScroll,
              scrub: 1.8, // scrub alto = movimento suavizado, com "atraso" seguindo o scroll
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })

          // pequeno delay: os primeiros 20% do scroll nao encolhem nada
          tl.to(videoContainerRef.current, { duration: 0.2 })

          // encolhimento suave e gradual
          tl.to(videoContainerRef.current, {
            width: tamanhoFinal,
            height: tamanhoFinal,
            borderRadius: '24px',
            ease: 'power2.inOut',
            duration: 0.8,
          })
        }
      )
    }, heroRef)

    // recalcula as posições do ScrollTrigger quando o navegador mobile
    // esconde/mostra a barra de endereço (mudando a altura da viewport)
    const recalcular = () => ScrollTrigger.refresh()
    window.addEventListener('resize', recalcular)

    return () => {
      window.removeEventListener('resize', recalcular)
      ctx.revert()
    }
  }, [])

  return (
    <section className="comeco-hero" ref={heroRef}>
      <div className="comeco-video-container" ref={videoContainerRef}>
        <video
          ref={videoRef}
          className="comeco-video"
          src={`${import.meta.env.BASE_URL}fundo.mp4`}
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
        <a href="/admin/login" className="comeco-adm" onClick={irParaAdmin}>
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
        <a
          href="/agendar"
          className="comeco-agendar-mobile"
          onClick={irParaAgendamento}
        >
        </a>

        <a href="#Time" className="comeco-botao" onClick={descobrirMais}>
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