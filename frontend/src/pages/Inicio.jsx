import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getLancamentos,
  getFilmesPopulares,
  getSeriesTendencias,
  getEpisodiosRecentes,
  adicionarBiblioteca,
  getBiblioteca
} from '../services/api'
import Card from '../components/Card'
import CardSlider from '../components/CardSlider'
import Loading from '../components/Loading'
import './Paginas.css'

function Inicio() {
  const [lancamentos, setLancamentos] = useState([])
  const [filmes, setFilmes] = useState([])
  const [tendencias, setTendencias] = useState([])
  const [episodiosRecentes, setEpisodiosRecentes] = useState([])
  const [ultimosAdicionados, setUltimosAdicionados] = useState([])
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [adicionado, setAdicionado] = useState(false)
  const navigate = useNavigate()
  const intervalRef = useRef(null)

  useEffect(() => {
    const carregar = async () => {
      try {
        const hoje = new Date().toISOString().slice(0, 10)
        const cacheKey = `lancamentos_${hoje}`
        const cached = localStorage.getItem(cacheKey)

        let lancamentosData
        if (cached) {
          lancamentosData = JSON.parse(cached)
        } else {
          localStorage.clear()
          const resLanc = await getLancamentos()
          lancamentosData = resLanc.data.results || []
          localStorage.setItem(cacheKey, JSON.stringify(lancamentosData))
        }

        const [resFilmes, resTendencias, resEpisodios] = await Promise.all([
          getFilmesPopulares(),
          getSeriesTendencias(),
          getEpisodiosRecentes()
        ])

        setLancamentos(lancamentosData.slice(0, 8))
        setFilmes(resFilmes.data.results || [])
        setTendencias(resTendencias.data.results || [])
        setEpisodiosRecentes(resEpisodios.data.results || [])

        try {
          const resBib = await getBiblioteca()
          setUltimosAdicionados(resBib.data.slice(0, 10))
        } catch {
          setUltimosAdicionados([])
        }

      } catch (err) { console.error(err) }
      setCarregando(false)
    }
    carregar()
  }, [])

  useEffect(() => {
    if (lancamentos.length === 0) return
    intervalRef.current = setInterval(() => {
      setIndiceAtual(i => (i + 1) % lancamentos.length)
      setAdicionado(false)
    }, 6000)
    return () => clearInterval(intervalRef.current)
  }, [lancamentos])

  const handleAdicionar = async () => {
    const destaque = lancamentos[indiceAtual]
    if (!destaque) return
    try {
      await adicionarBiblioteca({
        tmdb_id: destaque.id,
        tipo: 'filme',
        titulo: destaque.title || destaque.name,
        ano: parseInt((destaque.release_date || '').slice(0, 4)),
        poster_url: `https://image.tmdb.org/t/p/w300${destaque.poster_path}`,
        sinopse: destaque.overview || '',
        status: 'quero_ver'
      })
      setAdicionado(true)
    } catch { alert('Erro ao adicionar!') }
  }

  if (carregando) return <Loading />

  const destaque = lancamentos[indiceAtual]

  return (
    <div className="pagina">
      {destaque && destaque.backdrop_path && (
        <div
          className="hero"
          style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${destaque.backdrop_path})` }}
        >
          <div className="hero-overlay">
            <div className="hero-conteudo">
              <div className="hero-badge">🎬 Em Cartaz</div>
              <h1>{destaque.title || destaque.name}</h1>
              <p className="hero-ano">{(destaque.release_date || '').slice(0, 4)}</p>
              <p className="hero-sinopse">{destaque.overview?.slice(0, 200)}...</p>
              <div className="hero-acoes">
                <button
                  className={`btn-hero ${adicionado ? 'adicionado' : ''}`}
                  onClick={handleAdicionar}
                  disabled={adicionado}
                >
                  {adicionado ? '✅ Adicionado' : '+ Adicionar à Biblioteca'}
                </button>
                <button
                  className="btn-hero-detalhes"
                  onClick={() => navigate(`/detalhes/filme/${destaque.id}`)}
                >
                  Ver Detalhes
                </button>
              </div>
              <div className="hero-indicadores">
                {lancamentos.map((_, i) => (
                  <button
                    key={i}
                    className={`indicador ${i === indiceAtual ? 'ativo' : ''}`}
                    onClick={() => { setIndiceAtual(i); setAdicionado(false) }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {ultimosAdicionados.length > 0 && (
        <div className="secao">
          <h2>🕐 Últimos Adicionados</h2>
          <CardSlider>
            {ultimosAdicionados.map(item => (
              <Card key={item.id} item={item} daBiblioteca onAtualizar={() => {}} />
            ))}
          </CardSlider>
        </div>
      )}

<div className="secao">
  <div className="secao-titulo-wrapper">
    <h2>📺 Últimos Episódios da Semana</h2>
    <span className="secao-badge">Séries</span>
  </div>
  <CardSlider>
    {episodiosRecentes.map(serie => (
      <Card key={serie.id} item={serie} tipo="tv" />
    ))}
  </CardSlider>
</div>

      <div className="secao">
        <div className="secao-titulo-wrapper">
          <h2>🔥 Tendências da Semana</h2>
          <span className="secao-badge">Séries</span>
        </div>
        <CardSlider>
          {tendencias.map(serie => (
            <Card key={serie.id} item={serie} tipo="tv" />
          ))}
        </CardSlider>
      </div>

      <div className="secao">
        <div className="secao-titulo-wrapper">
          <h2>🎬 Filmes Populares</h2>
          <span className="secao-badge">Filmes</span>
        </div>
        <CardSlider>
          {filmes.map(filme => (
            <Card key={filme.id} item={filme} tipo="movie" />
          ))}
        </CardSlider>
      </div>
    </div>
  )
}

export default Inicio