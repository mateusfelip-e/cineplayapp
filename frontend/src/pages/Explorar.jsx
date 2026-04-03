import { useState, useEffect } from 'react'
import { buscarConteudo } from '../services/api'
import axios from 'axios'
import Card from '../components/Card'
import CardSlider from '../components/CardSlider'
import './Paginas.css'

const api = axios.create({ baseURL: 'http://localhost:3001/api' })

function Explorar() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [carregando, setCarregando] = useState(false)
  const [buscou, setBuscou] = useState(false)
  const [descoberta, setDescoberta] = useState([])
  const [paginaDesc, setPaginaDesc] = useState(1)
  const [totalDesc, setTotalDesc] = useState(1)

  const carregarDescoberta = async (p = 1) => {
    try {
      const res = await api.get(`/filmes/populares?page=${p}`)
      setDescoberta(res.data.results || [])
      setTotalDesc(Math.min(res.data.total_pages, 20))
      setPaginaDesc(p)
    } catch { }
  }

  useEffect(() => { carregarDescoberta(1) }, [])

  const handleBuscar = async (p = 1) => {
    if (!query.trim()) return
    setCarregando(true)
    setBuscou(true)
    try {
      const res = await buscarConteudo(query, p)
      setResultados(res.data.results?.filter(i => i.media_type !== 'person') || [])
      setTotalPaginas(Math.min(res.data.total_pages, 10))
      setPagina(p)
    } catch { }
    setCarregando(false)
  }

  return (
    <div className="pagina">
      <div className="secao">
        <h2>🔍 Explorar</h2>
        <div className="busca-explorar">
          <input
            type="text"
            placeholder="Buscar filmes e séries..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBuscar(1)}
            className="busca-explorar-input"
          />
          <button onClick={() => handleBuscar(1)} className="btn-buscar">Buscar</button>
        </div>

        {carregando && <div className="carregando">Buscando...</div>}

        {!carregando && buscou && resultados.length === 0 && (
          <p className="sem-resultados">Nenhum resultado encontrado.</p>
        )}

        {buscou && resultados.length > 0 && (
          <>
            <div className="lista-cards">
              {resultados.map(item => (
                <Card key={item.id} item={item} tipo={item.media_type === 'movie' ? 'movie' : 'tv'} />
              ))}
            </div>
            <div className="paginacao">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`btn-pagina ${p === pagina ? 'ativo' : ''}`}
                  onClick={() => handleBuscar(p)}
                >{p}</button>
              ))}
            </div>
          </>
        )}

        {!buscou && (
          <>
            <h2 style={{ marginTop: 32 }}>🌟 Descobertas</h2>
            <div className="lista-cards" style={{ marginTop: 16 }}>
              {descoberta.map(item => (
                <Card key={item.id} item={item} tipo="movie" />
              ))}
            </div>
            <div className="paginacao">
              {Array.from({ length: Math.min(totalDesc, 10) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`btn-pagina ${p === paginaDesc ? 'ativo' : ''}`}
                  onClick={() => carregarDescoberta(p)}
                >{p}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Explorar