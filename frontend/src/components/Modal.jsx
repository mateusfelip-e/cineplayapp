import { useState } from 'react'
import { buscarConteudo } from '../services/api'
import './Modal.css'

function Modal({ onFechar, onSalvar, itemEditar }) {
  const [aba, setAba] = useState(itemEditar ? 'manual' : 'buscar')
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [selecionado, setSelecionado] = useState(null)
  const [status, setStatus] = useState(itemEditar?.status || 'quero_ver')
  const [favorito, setFavorito] = useState(itemEditar?.favorito || false)

  // Manual
  const [titulo, setTitulo] = useState(itemEditar?.titulo || '')
  const [ano, setAno] = useState(itemEditar?.ano || '')
  const [tipo, setTipo] = useState(itemEditar?.tipo || 'filme')
  const [sinopse, setSinopse] = useState(itemEditar?.sinopse || '')

  const handleBuscar = async () => {
    if (!query.trim()) return
    try {
      const res = await buscarConteudo(query)
      setResultados(res.data.results?.filter(i => i.media_type !== 'person').slice(0, 8) || [])
    } catch { }
  }

  const handleSelecionarResultado = (item) => {
    setSelecionado(item)
    setResultados([])
    setQuery(item.title || item.name)
  }

  const handleSalvar = () => {
    if (aba === 'buscar' && selecionado) {
      onSalvar({
        tmdb_id: selecionado.id,
        tipo: selecionado.media_type === 'movie' ? 'filme' : 'serie',
        titulo: selecionado.title || selecionado.name,
        ano: parseInt((selecionado.release_date || selecionado.first_air_date || '0').slice(0, 4)),
        poster_url: selecionado.poster_path ? `https://image.tmdb.org/t/p/w300${selecionado.poster_path}` : '',
        sinopse: selecionado.overview || '',
        status,
        favorito
      })
    } else if (aba === 'manual') {
      if (!titulo.trim()) { alert('Digite o título!'); return }
      onSalvar({
        tmdb_id: itemEditar?.tmdb_id || 0,
        tipo,
        titulo,
        ano: parseInt(ano) || null,
        poster_url: itemEditar?.poster_url || '',
        sinopse,
        status,
        favorito,
        id: itemEditar?.id
      })
    }
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{itemEditar ? 'Editar Item' : 'Adicionar à Biblioteca'}</h2>
          <button className="modal-fechar" onClick={onFechar}>✕</button>
        </div>

        {!itemEditar && (
          <div className="modal-abas">
            <button className={aba === 'buscar' ? 'ativo' : ''} onClick={() => setAba('buscar')}>
              🔍 Buscar
            </button>
            <button className={aba === 'manual' ? 'ativo' : ''} onClick={() => setAba('manual')}>
              ✏️ Manual
            </button>
          </div>
        )}

        {aba === 'buscar' && !itemEditar && (
          <div className="modal-busca">
            <div className="modal-busca-row">
              <input
                type="text"
                placeholder="Buscar filme ou série..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleBuscar()}
              />
              <button onClick={handleBuscar}>Buscar</button>
            </div>
            {resultados.length > 0 && (
              <div className="modal-resultados">
                {resultados.map(item => (
                  <div key={item.id} className="modal-resultado-item" onClick={() => handleSelecionarResultado(item)}>
                    {item.poster_path && (
                      <img src={`https://image.tmdb.org/t/p/w45${item.poster_path}`} alt="" />
                    )}
                    <div>
                      <span>{item.title || item.name}</span>
                      <small>{item.media_type === 'movie' ? 'Filme' : 'Série'} • {(item.release_date || item.first_air_date || '').slice(0, 4)}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selecionado && (
              <div className="modal-selecionado">
                ✅ <strong>{selecionado.title || selecionado.name}</strong> selecionado
              </div>
            )}
          </div>
        )}

        {(aba === 'manual' || itemEditar) && (
          <div className="modal-form">
            <label>Título *</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Inception" />

            <label>Tipo</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="filme">Filme</option>
              <option value="serie">Série</option>
            </select>

            <label>Ano</label>
            <input type="number" value={ano} onChange={e => setAno(e.target.value)} placeholder="Ex: 2024" />

            <label>Sinopse</label>
            <textarea value={sinopse} onChange={e => setSinopse(e.target.value)} placeholder="Descrição..." rows={3} />
          </div>
        )}

        <div className="modal-form">
          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="quero_ver">Quero Ver</option>
            <option value="assistindo">Assistindo</option>
            <option value="assistido">Assistido</option>
          </select>

          <label className="modal-favorito">
            <input type="checkbox" checked={favorito} onChange={e => setFavorito(e.target.checked)} />
            ♡ Marcar como favorito
          </label>
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onFechar}>Cancelar</button>
          <button className="btn-salvar" onClick={handleSalvar}>
            {itemEditar ? 'Salvar alterações' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal