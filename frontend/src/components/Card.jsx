import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adicionarBiblioteca, removerItem, favoritarItem, atualizarItem, registrarAtividade } from '../services/api'
import { useBiblioteca } from '../BibliotecaContext'
import { useAuth } from '../AuthContext'
import Modal from './Modal'
import './Card.css'

function Card({ item, tipo, daBiblioteca = false, onAtualizar }) {
  const [hover, setHover] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [animacao, setAnimacao] = useState(null)
  const { jaAdicionado, recarregar } = useBiblioteca()
  const { user } = useAuth()
  const navigate = useNavigate()

  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
    : item.poster_url || '/sem-poster.jpg'

  const titulo = item.title || item.name || item.titulo
  const ano = (item.release_date || item.first_air_date || item.ano || '').toString().slice(0, 4)
  const tmdbId = item.id || item.tmdb_id
  const estaAdicionado = !daBiblioteca && jaAdicionado(tmdbId)

  const handleClicarPoster = () => {
    const tipoRota = tipo === 'movie' || item.tipo === 'filme' ? 'filme' : 'serie'
    const id = item.tmdb_id || item.id
    navigate(`/detalhes/${tipoRota}/${id}`)
  }

const handleAdicionar = async (e) => {
  e.stopPropagation()
  if (estaAdicionado || carregando || !user) return
  setAnimacao('adicionando')
  setCarregando(true)
  try {
    await adicionarBiblioteca({
      tmdb_id: tmdbId,
      tipo: tipo === 'movie' ? 'filme' : 'serie',
      titulo,
      ano: parseInt(ano),
      poster_url: `https://image.tmdb.org/t/p/w300${item.poster_path}`,
      sinopse: item.overview || item.sinopse || '',
      status: 'quero_ver'
    })
    try {
      await registrarAtividade({
        tipo: 'adicionado',
        descricao: `Adicionou "${titulo}" à biblioteca`,
        poster_url: item.poster_path
          ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
          : null,
        tmdb_id: tmdbId
      })
    } catch { }
    await recarregar()
    if (onAtualizar) onAtualizar()
  } catch { alert('Erro ao adicionar!') }
  setTimeout(() => setAnimacao(null), 800)
  setCarregando(false)
}

const handleRemover = async (e) => {
  e.stopPropagation()
  if (!user) return
  setCarregando(true)
  try {
    await removerItem(item.id)
    try {
      await registrarAtividade({
        tipo: 'removido',
        descricao: `Removeu "${titulo}" da biblioteca`,
        poster_url: item.poster_path
          ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
          : null,
        tmdb_id: item.tmdb_id || 0
      })
    } catch { }
    await recarregar()
    if (onAtualizar) onAtualizar()
  } catch { alert('Erro ao remover!') }
  setCarregando(false)
}

  const handleFavoritar = async (e) => {
    e.stopPropagation()
    if (!user) return
    try {
      await favoritarItem(item.id, !item.favorito)
      await recarregar()
      if (onAtualizar) onAtualizar()
    } catch { }
  }

  const handleSalvarEdicao = async (dados) => {
    if (!user) return
    try {
      await atualizarItem(item.id, { status: dados.status, favorito: dados.favorito })
      setModalEditar(false)
      await recarregar()
      if (onAtualizar) onAtualizar()
    } catch { alert('Erro ao editar!') }
  }

  return (
    <>
      <div
        className={`card ${estaAdicionado ? 'card-ja-adicionado' : ''} ${animacao === 'adicionando' ? 'card-anim-adicionar' : ''}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="card-img-wrapper" onClick={handleClicarPoster} style={{ cursor: 'pointer' }}>
          <img src={poster} alt={titulo} className="card-poster" />

          {animacao === 'adicionando' && (
            <div className="card-anim-overlay adicionar">
              <div className="particulas">
                {[...Array(12)].map((_, i) => <span key={i} className="particula" />)}
              </div>
              <span className="anim-texto">✓</span>
            </div>
          )}

          {estaAdicionado && animacao !== 'adicionando' && (
            <div className="card-badge-adicionado">
              <span>✓ Na Biblioteca</span>
            </div>
          )}

          {daBiblioteca && user && (
            <button
              key={item.favorito ? 'fav' : 'nao-fav'}
              className={`btn-favorito ${item.favorito ? 'favoritado' : ''}`}
              onClick={handleFavoritar}
            >♡</button>
          )}

          {item.status && (
            <span className={`card-status status-${item.status.replace('_', '-')}`}>
              {item.status === 'quero_ver' ? '🔖 Quero Ver' : item.status === 'assistindo' ? '▶ Assistindo' : '✓ Assistido'}
            </span>
          )}

          {hover && !daBiblioteca && !estaAdicionado && user && (
            <div className="card-overlay">
              <button className="btn-overlay" onClick={handleAdicionar} disabled={carregando}>
                {carregando ? '...' : '+ Adicionar'}
              </button>
            </div>
          )}
        </div>

        <div className="card-info" onClick={handleClicarPoster} style={{ cursor: 'pointer' }}>
          <h4>{titulo}</h4>
          <div className="card-info-bottom">
            <span>{ano}</span>
            {estaAdicionado && (
              <span className="card-tag-biblioteca">✓ Biblioteca</span>
            )}
          </div>
        </div>

        {daBiblioteca && user && (
          <div className="card-acoes">
            <button className="btn-editar" onClick={(e) => { e.stopPropagation(); setModalEditar(true) }}>✏️ Editar</button>
            <button className="btn-remover" onClick={handleRemover} disabled={carregando}>🗑</button>
          </div>
        )}
      </div>

      {modalEditar && (
        <Modal
          itemEditar={item}
          onFechar={() => setModalEditar(false)}
          onSalvar={handleSalvarEdicao}
        />
      )}
    </>
  )
}

export default Card