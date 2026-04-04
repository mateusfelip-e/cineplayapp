import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { buscarConteudo, adicionarBiblioteca } from '../services/api'
import Modal from './Modal'
import './Navbar.css'

function Navbar() {
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleBusca = async (e) => {
    const valor = e.target.value
    setBusca(valor)
    if (valor.length < 2) { setResultados([]); return }
    try {
      const res = await buscarConteudo(valor)
      setResultados(res.data.results?.filter(i => i.media_type !== 'person').slice(0, 6) || [])
    } catch { setResultados([]) }
  }

const handleClicarResultado = (item) => {
  setResultados([])
  setBusca('')
  const tipo = item.media_type === 'movie' ? 'filme' : 'serie'
  navigate(`/detalhes/${tipo}/${item.id}`)
}

const handleAdicionarManual = async (dados) => {
  try {
    await adicionarBiblioteca(dados)
    setModalAberto(false)
    alert('Adicionado com sucesso!')
  } catch {
    alert('Erro ao adicionar!')
  }
}

  const isAtivo = (path) => location.pathname === path

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo">
            <span className="logo-cine">Cine</span>
            <span className="logo-play">Play</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className={isAtivo('/') ? 'ativo' : ''}>Início</Link>
            <Link to="/explorar" className={isAtivo('/explorar') ? 'ativo' : ''}>Explorar</Link>
            <Link to="/lancamentos" className={isAtivo('/lancamentos') ? 'ativo' : ''}>Lançamentos</Link>
            <Link to="/filmes" className={isAtivo('/filmes') ? 'ativo' : ''}>Filmes</Link>
            <Link to="/series" className={isAtivo('/series') ? 'ativo' : ''}>Séries</Link>
            <Link to="/favoritos" className={isAtivo('/favoritos') ? 'ativo' : ''}>♡ Favoritos</Link>
          </div>
        </div>
        <div className="navbar-right">
          <div className="busca-container">
            <input
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={handleBusca}
              className="busca-input"
            />
            {resultados.length > 0 && (
              <div className="busca-resultados">
                {resultados.map(item => (
                  <div
                    key={item.id}
                    className="busca-item"
                    onClick={() => handleClicarResultado(item)}
                  >
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
          </div>
          <button className="btn-adicionar" onClick={() => setModalAberto(true)}>
            + Adicionar
          </button>
        </div>
      </nav>

      {modalAberto && (
        <Modal
          onFechar={() => setModalAberto(false)}
          onSalvar={handleAdicionarManual}
        />
      )}
    </>
  )
}

export default Navbar