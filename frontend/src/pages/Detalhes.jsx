import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDetalhes, adicionarBiblioteca } from '../services/api'
import './Detalhes.css'

function Detalhes() {
  const { tipo, id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [adicionado, setAdicionado] = useState(false)

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await getDetalhes(tipo, id)
        setItem(res.data)
      } catch (err) { console.error(err) }
      setCarregando(false)
    }
    carregar()
  }, [tipo, id])

  const handleAdicionar = async () => {
    try {
      await adicionarBiblioteca({
        tmdb_id: item.id,
        tipo: tipo === 'filme' ? 'filme' : 'serie',
        titulo: item.title || item.name,
        ano: parseInt((item.release_date || item.first_air_date || '0').slice(0, 4)),
        poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : '',
        sinopse: item.overview || '',
        status: 'quero_ver'
      })
      setAdicionado(true)
    } catch { alert('Erro ao adicionar!') }
  }

  if (carregando) return <div className="carregando">Carregando...</div>
  if (!item) return <div className="carregando">Item não encontrado.</div>

  const titulo = item.title || item.name
  const ano = (item.release_date || item.first_air_date || '').slice(0, 4)
  const nota = item.vote_average?.toFixed(1)
  const generos = item.genres?.map(g => g.name).join(', ')
  const duracao = item.runtime ? `${item.runtime} min` : item.number_of_seasons ? `${item.number_of_seasons} temporada(s)` : ''

  return (
    <div className="detalhes-pagina">
      <div
        className="detalhes-hero"
        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${item.backdrop_path})` }}
      >
        <div className="detalhes-overlay">
          <button className="btn-voltar" onClick={() => navigate(-1)}>← Voltar</button>
        </div>
      </div>

      <div className="detalhes-conteudo">
        <div className="detalhes-poster-wrap">
          <img
            src={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : '/sem-poster.jpg'}
            alt={titulo}
            className="detalhes-poster"
          />
        </div>

        <div className="detalhes-info">
          <h1>{titulo}</h1>
          <div className="detalhes-meta">
            {ano && <span>📅 {ano}</span>}
            {nota && <span>⭐ {nota}/10</span>}
            {duracao && <span>🕐 {duracao}</span>}
            {generos && <span>🎭 {generos}</span>}
          </div>

          {item.overview && (
            <div className="detalhes-sinopse">
              <h3>Sinopse</h3>
              <p>{item.overview}</p>
            </div>
          )}

          {item.tagline && (
            <p className="detalhes-tagline">"{item.tagline}"</p>
          )}

          <button
            className={`btn-adicionar-detalhe ${adicionado ? 'adicionado' : ''}`}
            onClick={handleAdicionar}
            disabled={adicionado}
          >
            {adicionado ? '✅ Adicionado à Biblioteca' : '+ Adicionar à Biblioteca'}
          </button>
        </div>
      </div>

      {item.credits?.cast?.length > 0 && (
        <div className="detalhes-elenco">
          <h3>Elenco Principal</h3>
          <div className="elenco-lista">
            {item.credits.cast.slice(0, 8).map(ator => (
              <div key={ator.id} className="ator-card">
                <img
                  src={ator.profile_path ? `https://image.tmdb.org/t/p/w185${ator.profile_path}` : '/sem-foto.jpg'}
                  alt={ator.name}
                />
                <span>{ator.name}</span>
                <small>{ator.character}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Detalhes