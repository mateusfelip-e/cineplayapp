import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { buscarConteudo, adicionarBiblioteca } from '../services/api'
import { useAuth } from '../AuthContext'
import Modal from './Modal'
import './Navbar.css'

function Navbar() {
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const [buscaMobile, setBuscaMobile] = useState('')
  const [resultadosMobile, setResultadosMobile] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleBusca = async (e) => {
    const valor = e.target.value
    setBusca(valor)
    if (valor.length < 2) { setResultados([]); return }
    try {
      const res = await buscarConteudo(valor)
      setResultados(res.data.results?.filter(i => i.media_type !== 'person').slice(0, 6) || [])
    } catch { setResultados([]) }
  }

  const handleBuscaMobile = async (e) => {
    const valor = e.target.value
    setBuscaMobile(valor)
    if (valor.length < 2) { setResultadosMobile([]); return }
    try {
      const res = await buscarConteudo(valor)
      setResultadosMobile(res.data.results?.filter(i => i.media_type !== 'person').slice(0, 6) || [])
    } catch { setResultadosMobile([]) }
  }

  const handleClicarResultado = (item) => {
    setResultados([])
    setResultadosMobile([])
    setBusca('')
    setBuscaMobile('')
    setMenuAberto(false)
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
  const fecharMenu = () => setMenuAberto(false)

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo" onClick={fecharMenu}>
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
                  <div key={item.id} className="busca-item" onClick={() => handleClicarResultado(item)}>
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

          {user ? (
            <>
              <Link to="/perfil" className="user-nome">
                👤 {user.user_metadata?.nome || user.email?.split('@')[0]}
              </Link>
              <button className="btn-adicionar" onClick={() => setModalAberto(true)}>
                + Adicionar
              </button>
              <button className="btn-logout" onClick={logout} title="Sair">
                🔓
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-login-nav">
              🔐 Entrar
            </Link>
          )}
        </div>

        <button className="menu-hamburguer" onClick={() => setMenuAberto(!menuAberto)}>
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Menu Mobile */}
      <div className={`menu-mobile ${menuAberto ? 'aberto' : ''}`}>
        <Link to="/" className={isAtivo('/') ? 'ativo' : ''} onClick={fecharMenu}>Início</Link>
        <Link to="/explorar" className={isAtivo('/explorar') ? 'ativo' : ''} onClick={fecharMenu}>Explorar</Link>
        <Link to="/lancamentos" className={isAtivo('/lancamentos') ? 'ativo' : ''} onClick={fecharMenu}>Lançamentos</Link>
        <Link to="/filmes" className={isAtivo('/filmes') ? 'ativo' : ''} onClick={fecharMenu}>Filmes</Link>
        <Link to="/series" className={isAtivo('/series') ? 'ativo' : ''} onClick={fecharMenu}>Séries</Link>
        <Link to="/favoritos" className={isAtivo('/favoritos') ? 'ativo' : ''} onClick={fecharMenu}>♡ Favoritos</Link>
        <Link to="/perfil" className={isAtivo('/perfil') ? 'ativo' : ''} onClick={fecharMenu}>👤 Perfil</Link>

        <div className="busca-mobile">
          <input
            type="text"
            placeholder="Buscar filmes e séries..."
            value={buscaMobile}
            onChange={handleBuscaMobile}
          />
          <button>🔍</button>
        </div>

        {resultadosMobile.length > 0 && (
          <div className="busca-resultados-mobile">
            {resultadosMobile.map(item => (
              <div key={item.id} className="busca-item" onClick={() => handleClicarResultado(item)}>
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

        {user ? (
          <>
            <button className="btn-adicionar-mobile" onClick={() => { setModalAberto(true); fecharMenu() }}>
              + Adicionar à Biblioteca
            </button>
            <button
              className="btn-adicionar-mobile"
              style={{ background: '#1e1e1e', color: '#fff', marginTop: 8 }}
              onClick={() => { logout(); fecharMenu() }}
            >
              🔓 Sair
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-adicionar-mobile" onClick={fecharMenu}>
            🔐 Entrar
          </Link>
        )}
      </div>

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