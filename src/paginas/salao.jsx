import './salao.css'
import { useEffect, useRef, useState } from 'react'

function Salao() {
  const imagens = [
    '/salao1.jpg',
    '/salao2.jpg',
    '/salao3.jpg',
    '/salao4.jpg',
    '/salao5.jpg',
  ]

  const trilhaRef = useRef(null)
  const posicaoRef = useRef(0)
  const arrastandoRef = useRef(false)
  const inicioXRef = useRef(0)
  const inicioPosicaoRef = useRef(0)
  const [arrastando, setArrastando] = useState(false)

  useEffect(() => {
    let frameId

    const animar = () => {
      if (!arrastandoRef.current && trilhaRef.current) {
        posicaoRef.current -= 0.4
        const largura = trilhaRef.current.scrollWidth / 2

        if (posicaoRef.current <= -largura) {
          posicaoRef.current += largura
        }

        trilhaRef.current.style.transform = `translateX(${posicaoRef.current}px)`
      }
      frameId = requestAnimationFrame(animar)
    }

    frameId = requestAnimationFrame(animar)
    return () => cancelAnimationFrame(frameId)
  }, [])

  const iniciarArraste = (x) => {
    arrastandoRef.current = true
    setArrastando(true)
    inicioXRef.current = x
    inicioPosicaoRef.current = posicaoRef.current
  }

  const moverArraste = (x) => {
    if (!arrastandoRef.current || !trilhaRef.current) return

    const delta = x - inicioXRef.current
    let novaPosicao = inicioPosicaoRef.current + delta
    const largura = trilhaRef.current.scrollWidth / 2

    if (novaPosicao <= -largura) novaPosicao += largura
    if (novaPosicao > 0) novaPosicao -= largura

    posicaoRef.current = novaPosicao
    trilhaRef.current.style.transform = `translateX(${novaPosicao}px)`
  }

  const finalizarArraste = () => {
    arrastandoRef.current = false
    setArrastando(false)
  }

  return (
    <section className="salao">
      <h2 className="salao-titulo">
        <span>Conheça</span>
        <span>nossa barbearia</span>
      </h2>

      <div
        className="salao-carrossel"
        onMouseDown={(e) => iniciarArraste(e.clientX)}
        onMouseMove={(e) => moverArraste(e.clientX)}
        onMouseUp={finalizarArraste}
        onMouseLeave={finalizarArraste}
        onTouchStart={(e) => iniciarArraste(e.touches[0].clientX)}
        onTouchMove={(e) => moverArraste(e.touches[0].clientX)}
        onTouchEnd={finalizarArraste}
      >
        <div
          ref={trilhaRef}
          className={`salao-trilha ${arrastando ? 'salao-arrastando' : ''}`}
        >
          {[...imagens, ...imagens].map((src, index) => (
            <img
              key={index}
              src={src}
              alt="Ambiente da barbearia"
              className="salao-imagem"
              draggable={false}
            />
          ))}
        </div>
      </div>

      <div className="salao-mapa-wrapper">
        <iframe
          className="salao-mapa"
          src="https://www.google.com/maps?q=Barbearia&output=embed"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Localização da barbearia"
        />
      </div>
    </section>
  )
}

export default Salao