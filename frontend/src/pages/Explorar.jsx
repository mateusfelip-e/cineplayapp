import { useState } from 'react'
import axios from 'axios'
import { buscarConteudo } from '../services/api'
import Card from '../components/Card'
import ListaPaginada from '../components/ListaPaginada'
import './Paginas.css'

const api = axios.create({ baseURL: 'https://cineplay-backend-sdlj.onrender.com/api' })

function Explorar() {
  const [query, setQuery] = useState('')
  const [termo, setTermo] = useState('')

  const buscar = () => {
    if (!query.trim()) return
    setTermo(query.trim())
  }

  const limpar = () => {
    setQuery('')
    setTermo('')
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
            onKeyDown={e => e.key === 'Enter' && buscar()}
            className="busca-explorar-input"
          />
          <button onClick={buscar} className="btn-buscar">Buscar</button>
          {termo && <button onClick={limpar} className="btn-buscar">Limpar</button>}
        </div>

        {termo ? (
          <ListaPaginada
            chave={`busca:${termo}`}
            buscarPagina={(p) => buscarConteudo(termo, p).then(r => r.data)}
            filtrar={(i) => i.media_type !== 'person'}
            renderItem={(item, key) => (
              <Card key={key} item={item} tipo={item.media_type === 'movie' ? 'movie' : 'tv'} />
            )}
          />
        ) : (
          <>
            <h2 style={{ marginTop: 32 }}>🌟 Descobertas</h2>
            <div style={{ marginTop: 16 }}>
              <ListaPaginada
                chave="descobertas"
                buscarPagina={(p) => api.get(`/filmes/populares?page=${p}`).then(r => r.data)}
                renderItem={(item, key) => <Card key={key} item={item} tipo="movie" />}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Explorar