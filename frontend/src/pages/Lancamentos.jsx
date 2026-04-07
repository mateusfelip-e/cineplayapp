import { useState, useEffect } from 'react'
import axios from 'axios'
import Card from '../components/Card'
import CardSlider from '../components/CardSlider'
import Loading from '../components/Loading'
import './Paginas.css'

const BACKEND = 'https://cineplay-backend-sdlj.onrender.com/api'
const ANOS = [2026, 2025, 2024, 2023]

function Lancamentos() {
  const [lancamentosPorAno, setLancamentosPorAno] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    const carregar = async () => {
      try {
        const resultados = await Promise.all(
          ANOS.map(ano =>
            axios.get(`${BACKEND}/filmes/lancamentos/${ano}`)
              .then(res => ({ ano, filmes: res.data.results || [] }))
              .catch(() => ({ ano, filmes: [] }))
          )
        )
        const dados = {}
        resultados.forEach(({ ano, filmes }) => {
          dados[ano] = filmes
        })
        setLancamentosPorAno(dados)
      } catch (err) {
        console.error(err)
        setErro(true)
      }
      setCarregando(false)
    }
    carregar()
  }, [])

  if (carregando) return <Loading />

  if (erro) return (
    <div className="pagina">
      <div className="secao">
        <p className="sem-resultados">Erro ao carregar lançamentos. Tente novamente mais tarde.</p>
      </div>
    </div>
  )

  return (
    <div className="pagina">
      {ANOS.map(ano => (
        <div className="secao" key={ano}>
          <h2>{ano === 2026 ? '🔥 Em Cartaz —' : '📅'} {ano}</h2>
          {lancamentosPorAno[ano]?.length > 0 ? (
            <CardSlider>
              {lancamentosPorAno[ano].map(filme => (
                <Card key={filme.id} item={filme} tipo="movie" />
              ))}
            </CardSlider>
          ) : (
            <p className="sem-resultados">Nenhum filme encontrado para {ano}.</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default Lancamentos