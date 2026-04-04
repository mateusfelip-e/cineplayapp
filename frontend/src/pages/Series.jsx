import Loading from '../components/Loading'
import { useState, useEffect } from 'react'
import { getBiblioteca } from '../services/api'
import Card from '../components/Card'
import './Paginas.css'

function Series() {
  const [biblioteca, setBiblioteca] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('todos')

  const carregar = async () => {
    try {
      const res = await getBiblioteca()
      setBiblioteca(res.data.filter(i => i.tipo === 'serie'))
    } catch (err) { console.error(err) }
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  const filtrados = filtro === 'todos' ? biblioteca : biblioteca.filter(i => i.status === filtro)

  if (carregando) return <div className="carregando">Carregando...</div>

  return (
    <div className="pagina">
      <div className="secao">
        <h2>📺 Minhas Séries</h2>
        <div className="filtros">
          {['todos', 'quero_ver', 'assistindo', 'assistido'].map(f => (
            <button
              key={f}
              className={`btn-filtro ${filtro === f ? 'ativo' : ''}`}
              onClick={() => setFiltro(f)}
            >
              {f === 'todos' ? 'Todos' : f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
        {filtrados.length === 0 ? (
          <p className="sem-resultados">Nenhuma série aqui ainda. Explore e adicione séries à sua biblioteca!</p>
        ) : (
          <div className="lista-cards">
            {filtrados.map(item => (
              <Card key={item.id} item={item} tipo="serie" daBiblioteca onAtualizar={carregar} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Series