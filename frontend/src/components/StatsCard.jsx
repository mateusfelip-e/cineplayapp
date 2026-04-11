import { useState, useEffect } from 'react'
import { calcularTempoAssistido } from '../services/api'
import './StatsCard.css'

function StatsCard({ biblioteca, tipo }) {
  const [tempo, setTempo] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const calcular = async () => {
      const assistidos = biblioteca.filter(i => i.status === 'assistido')
      if (assistidos.length === 0) {
        setTempo({ totalMinutos: 0, minutos: 0, horas: 0, dias: 0 })
        setCarregando(false)
        return
      }
      try {
        const res = await calcularTempoAssistido(assistidos)
        setTempo(res.data)
      } catch { }
      setCarregando(false)
    }
    if (biblioteca.length > 0) calcular()
    else { setCarregando(false); setTempo({ totalMinutos: 0, minutos: 0, horas: 0, dias: 0 }) }
  }, [biblioteca])

  const assistidos = biblioteca.filter(i => i.status === 'assistido').length
  const assistindo = biblioteca.filter(i => i.status === 'assistindo').length
  const querVer = biblioteca.filter(i => i.status === 'quero_ver').length

  const formatarTempo = () => {
    if (!tempo) return '0h'
    if (tempo.dias > 0) return `${tempo.dias}d ${tempo.horas}h ${tempo.minutos}m`
    if (tempo.horas > 0) return `${tempo.horas}h ${tempo.minutos}m`
    return `${tempo.minutos}m`
  }

  return (
    <div className="stats-container">
      <div className="stat-card stat-tempo">
        <div className="stat-icon">{tipo === 'filme' ? '🎬' : '📺'}</div>
        <div className="stat-info">
          <span className="stat-valor">
            {carregando ? <span className="stat-loading">...</span> : formatarTempo()}
          </span>
          <span className="stat-label">Tempo assistindo {tipo === 'filme' ? 'filmes' : 'séries'}</span>
        </div>
      </div>

      <div className="stat-card stat-assistido">
        <div className="stat-icon">✅</div>
        <div className="stat-info">
          <span className="stat-valor">{assistidos}</span>
          <span className="stat-label">{tipo === 'filme' ? 'Filmes' : 'Séries'} assistidos</span>
        </div>
      </div>

      <div className="stat-card stat-assistindo">
        <div className="stat-icon">▶️</div>
        <div className="stat-info">
          <span className="stat-valor">{assistindo}</span>
          <span className="stat-label">Assistindo agora</span>
        </div>
      </div>

      <div className="stat-card stat-quero-ver">
        <div className="stat-icon">🔖</div>
        <div className="stat-info">
          <span className="stat-valor">{querVer}</span>
          <span className="stat-label">Na lista</span>
        </div>
      </div>
    </div>
  )
}

export default StatsCard