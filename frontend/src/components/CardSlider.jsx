import { useRef } from 'react'
import './CardSlider.css'

function CardSlider({ children }) {
  const sliderRef = useRef(null)

  const scrollPara = (direcao) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: direcao * 500, behavior: 'smooth' })
    }
  }

  return (
    <div className="slider-wrapper">
      <button className="slider-btn esquerda" onClick={() => scrollPara(-1)}>‹</button>
      <div className="slider-track" ref={sliderRef}>
        {children}
      </div>
      <button className="slider-btn direita" onClick={() => scrollPara(1)}>›</button>
    </div>
  )
}

export default CardSlider