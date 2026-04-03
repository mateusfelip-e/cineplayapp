import { useState, useEffect } from 'react'
import { getBiblioteca } from '../services/api'
import Card from '../components/Card'
import CardSlider from '../components/CardSlider'
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

  if (carregando) return <div className="carregando">Carregando...</div>

  const vazio = filmes.length === 0 && series.length === 0

  return (
    <div className="pagina">
      <div className="secao">
        <h2>♡ Favoritos</h2>

        {vazio && (
          <p className="sem-resultados">Nenhum favorito ainda. Adicione filmes e séries à sua biblioteca e marque como favorito!</p>
        )}

        {filmes.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h3 className="subtitulo-secao">🎬 Filmes Favoritos</h3>
            <CardSlider>
              {filmes.map(item => (
                <Card key={item.id} item={item} daBiblioteca onAtualizar={carregar} />
              ))}
            </CardSlider>
          </div>
        )}

        {series.length > 0 && (
          <div>
            <h3 className="subtitulo-secao">📺 Séries Favoritas</h3>
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