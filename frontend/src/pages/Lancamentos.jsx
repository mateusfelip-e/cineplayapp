import { useState, useEffect } from 'react'
import axios from 'axios'
import Card from '../components/Card'
import CardSlider from '../components/CardSlider'
import './Paginas.css'

const api = axios.create({ baseURL: 'http://localhost:3001/api' })
const ANOS = [2026, 2025, 2024, 2023]

function Lancamentos() {
  const [lancamentosPorAno, setLancamentosPorAno] = useState({})
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      try {
        const resultados = await Promise.all(
          ANOS.map(ano => api.get(`/filmes/lancamentos/${ano}`))
        )
        const dados = {}
        ANOS.forEach((ano, i) => {
          dados[ano] = resultados[i].data.results || []
        })
        setLancamentosPorAno(dados)
      } catch (err) { console.error(err) }
      setCarregando(false)
    }
    carregar()
  }, [])

  if (carregando) return <div className="carregando">Carregando...</div>

  return (
    <div className="pagina">
      {ANOS.map(ano => (
        <div className="secao" key={ano}>
          <h2>
            {ano === 2026 ? '🔥 Em Cartaz —' : '📅'} {ano}
          </h2>
          <CardSlider>
            {(lancamentosPorAno[ano] || []).map(filme => (
              <Card key={filme.id} item={filme} tipo="movie" />
            ))}
          </CardSlider>
        </div>
      ))}
    </div>
  )
}

export default Lancamentos