import './Time.css'
import { useEffect, useRef, useState } from 'react'

function useRevelar(threshold = 0.15) {
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

function MembroTime({ nome, lado }) {
  const [ref, visivel] = useRevelar()

  return (
    <div ref={ref} className={`time-membro time-membro-${lado}`}>
<img
  src={`${import.meta.env.BASE_URL}barbeiro1.jpg`}
  alt="Barbeiro cortando cabelo de cliente"
  className={`time-retangulo ${visivel ? 'time-revelado' : ''}`}
/>
      <div className="time-info-row">
        <h3 className="time-nome">{nome}</h3>
        <span className="time-cargo">Barbeiro</span>
      </div>
    </div>
  )
}

function FraseTime({ children }) {
  const [ref, visivel] = useRevelar()

  return (
    <p ref={ref} className={`time-frase ${visivel ? 'time-frase-revelada' : ''}`}>
      {children}
    </p>
  )
}

function Time() {
  return (
    <section className="time" id="Time">
      <h2 className="time-titulo">Conheça nosso time</h2>

      <div className="time-retangulos">
        <MembroTime nome="João Silva" lado="esquerda" />

        <FraseTime>Cada corte conta uma história</FraseTime>

        <MembroTime nome="Pedro Alves" lado="direita" />

        <FraseTime>Tradição e estilo em cada detalhe</FraseTime>

        <MembroTime nome="Lucas Souza" lado="esquerda" />

        <FraseTime>Paixão pelo que fazemos</FraseTime>

        <MembroTime nome="Rafael Costa" lado="direita" />
      </div>
    </section>
  )
}

export default Time