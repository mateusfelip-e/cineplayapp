import { useState, useEffect } from 'react'
import { getBiblioteca } from '../services/api'
import Card from '../components/Card'
import CardSlider from '../components/CardSlider'
import Loading from '../components/Loading'
import './Paginas.css'

function Favoritos() {
  const [filmes, setFilmes] = useState([])
  const [series, setSeries] = useState([])
  const [carregando, setCarregando] = useState(true)

  const carregar = async () => {
    try {
      const res = await getBiblioteca()
      const favs = res.data.filter(i => i.favorito)
      setFilmes(favs.filter(i => i.tipo === 'filme'))
      setSeries(favs.filter(i => i.tipo === 'serie'))
    } catch (err) { console.error(err) }
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  if (carregando) return <Loading />

  const vazio = filmes.length === 0 && series.length === 0
  const total = filmes.length + series.length

  return (
    <div className="pagina">
      <div className="secao">
        <div className="secao-header">
          <h2>♡ Favoritos</h2>
          {total > 0 && (
            <span className="contagem-total">{total} {total === 1 ? 'item' : 'itens'}</span>
          )}
        </div>

        {vazio && (
          <p className="sem-resultados">Nenhum favorito ainda. Marque filmes e séries como favorito na sua biblioteca!</p>
        )}

        {filmes.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div className="subtitulo-header">
              <h3 className="subtitulo-secao">🎬 Filmes Favoritos</h3>
              <span className="contagem-sub">{filmes.length} {filmes.length === 1 ? 'filme' : 'filmes'}</span>
            </div>
            <CardSlider>
              {filmes.map(item => (
                <Card key={item.id} item={item} daBiblioteca onAtualizar={carregar} />
              ))}
            </CardSlider>
          </div>
        )}

        {series.length > 0 && (
          <div>
            <div className="subtitulo-header">
              <h3 className="subtitulo-secao">📺 Séries Favoritas</h3>
              <span className="contagem-sub">{series.length} {series.length === 1 ? 'série' : 'séries'}</span>
            </div>
            <CardSlider>
              {series.map(item => (
                <Card key={item.id} item={item} daBiblioteca onAtualizar={carregar} />
              ))}
            </CardSlider>
          </div>
        )}
      </div>
    </div>
  )
}

export default Favoritos