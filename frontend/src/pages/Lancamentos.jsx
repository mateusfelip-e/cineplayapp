import { useState, useEffect } from 'react'
import { getLancamentos } from '../services/api'
import Card from '../components/Card'
import './Paginas.css'

function Lancamentos() {
  const [lancamentos, setLancamentos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await getLancamentos()
        setLancamentos(res.data.results || [])
      } catch (err) { console.error(err) }
      setCarregando(false)
    }
    carregar()
  }, [])

  if (carregando) return <div className="carregando">Carregando...</div>

  return (
    <div className="pagina">
      <div className="secao">
        <h2>🎬 Lançamentos</h2>
        <div className="lista-cards">
          {lancamentos.map(filme => (
            <Card key={filme.id} item={filme} tipo="movie" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Lancamentos