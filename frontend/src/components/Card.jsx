import { useState } from 'react'
import { adicionarBiblioteca, removerItem, favoritarItem, atualizarItem } from '../services/api'
import Modal from './Modal'
import './Card.css'

function Card({ item, tipo, daBiblioteca = false, onAtualizar }) {
  const [hover, setHover] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)

  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
    : item.poster_url || '/sem-poster.jpg'

  const titulo = item.title || item.name || item.titulo
  const ano = (item.release_date || item.first_air_date || item.ano || '').toString().slice(0, 4)

  const handleAdicionar = async () => {
    setCarregando(true)
    try {
      await adicionarBiblioteca({
        tmdb_id: item.id || item.tmdb_id,
        tipo: tipo === 'movie' ? 'filme' : 'serie',
        titulo,
        ano: parseInt(ano),
        poster_url: `https://image.tmdb.org/t/p/w300${item.poster_path}`,
        sinopse: item.overview || item.sinopse || '',
        status: 'quero_ver'
      })
      if (onAtualizar) onAtualizar()
      alert('Adicionado à biblioteca!')
    } catch { alert('Erro ao adicionar!') }
    setCarregando(false)
  }

  const handleRemover = async () => {
    if (!confirm('Remover da biblioteca?')) return
    setCarregando(true)
    try {
      await removerItem(item.id)
      if (onAtualizar) onAtualizar()
    } catch { alert('Erro ao remover!') }
    setCarregando(false)
  }

  const handleFavoritar = async () => {
    try {
      await favoritarItem(item.id, !item.favorito)
      if (onAtualizar) onAtualizar()
    } catch { }
  }

  const handleSalvarEdicao = async (dados) => {
    try {
      await atualizarItem(item.id, { status: dados.status, favorito: dados.favorito })
      setModalEditar(false)
      if (onAtualizar) onAtualizar()
    } catch { alert('Erro ao editar!') }
  }

  return (
    <>
      <div
        className="card"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="card-img-wrapper">
          <img src={poster} alt={titulo} className="card-poster" />
          {daBiblioteca && (
            <button
              className={`btn-favorito ${item.favorito ? 'favoritado' : ''}`}
              onClick={handleFavoritar}
            >♡</button>
          )}
          {item.status && (
            <span className="card-status">{item.status.replace('_', ' ').toUpperCase()}</span>
          )}
          {hover && !daBiblioteca && (
            <div className="card-overlay">
              <button className="btn-overlay" onClick={handleAdicionar} disabled={carregando}>
                {carregando ? '...' : '+ Adicionar'}
              </button>
            </div>
          )}
        </div>
        <div className="card-info">
          <h4>{titulo}</h4>
          <span>{ano}</span>
        </div>
        {daBiblioteca && (
          <div className="card-acoes">
            <button className="btn-editar" onClick={() => setModalEditar(true)}>✏️ Editar</button>
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