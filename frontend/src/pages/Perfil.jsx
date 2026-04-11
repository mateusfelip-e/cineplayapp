import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { getPerfil, atualizarPerfil, getAtividades, getBiblioteca } from '../services/api'
import Loading from '../components/Loading'
import './Perfil.css'

function Perfil() {
  const { user, logout, atualizarNomePerfil } = useAuth()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [atividades, setAtividades] = useState([])
  const [stats, setStats] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [nome, setNome] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [fotoPreview, setFotoPreview] = useState('')
  const [bannerPreview, setBannerPreview] = useState('')

  const fotoRef = useRef()
  const bannerRef = useRef()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const carregar = async () => {
      try {
        const [resPerfil, resAtiv, resBib] = await Promise.all([
          getPerfil(),
          getAtividades(),
          getBiblioteca()
        ])
        setPerfil(resPerfil.data)
        setNome(resPerfil.data.nome || '')
        setFotoUrl(resPerfil.data.foto_url || '')
        setBannerUrl(resPerfil.data.banner_url || '')
        setAtividades(resAtiv.data)

        const bib = resBib.data
        setStats({
          totalFilmes: bib.filter(i => i.tipo === 'filme').length,
          totalSeries: bib.filter(i => i.tipo === 'serie').length,
          assistidos: bib.filter(i => i.status === 'assistido').length,
          assistindo: bib.filter(i => i.status === 'assistindo').length,
          querVer: bib.filter(i => i.status === 'quero_ver').length,
          favoritos: bib.filter(i => i.favorito).length,
        })
      } catch (err) { console.error(err) }
      setCarregando(false)
    }
    carregar()
  }, [user])

  const comprimirImagem = (file, maxWidth, maxHeight, qualidade = 0.92) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          if (width > maxWidth) { height = height * maxWidth / width; width = maxWidth }
          if (height > maxHeight) { width = width * maxHeight / height; height = maxHeight }
          canvas.width = width
          canvas.height = height
          canvas.getContext('2d').drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', qualidade))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const comprimida = await comprimirImagem(file, 300, 300, 0.92)
    setFotoPreview(comprimida)
    setFotoUrl(comprimida)
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const comprimida = await comprimirImagem(file, 1920, 600, 0.92)
    setBannerPreview(comprimida)
    setBannerUrl(comprimida)
  }

  const handleSalvar = async () => {
    setSalvando(true)
    try {
      const res = await atualizarPerfil({ nome, foto_url: fotoUrl, banner_url: bannerUrl })
      setPerfil(res.data)
      atualizarNomePerfil(nome)
      setEditando(false)
    } catch { alert('Erro ao salvar perfil!') }
    setSalvando(false)
  }

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  const iconeAtividade = (tipo) => {
    if (tipo === 'adicionado') return '➕'
    if (tipo === 'removido') return '🗑️'
    if (tipo === 'assistido') return '✅'
    return '📝'
  }

  if (carregando) return <Loading />

  const dataCriacao = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="perfil-pagina">
      <div
        className="perfil-banner"
        style={{ backgroundImage: perfil?.banner_url ? `url(${perfil.banner_url})` : 'none' }}
      >
        {!perfil?.banner_url && (
          <div className="perfil-banner-vazio">
            <span>Sem banner — clique em Editar para adicionar</span>
          </div>
        )}
        <div className="perfil-banner-overlay" />
      </div>

      <div className="perfil-info-wrapper">
        <div className="perfil-foto-wrapper">
          <img
            src={perfil?.foto_url || `https://api.dicebear.com/7.x/initials/svg?seed=${perfil?.nome || 'U'}&backgroundColor=FFE000&textColor=000000`}
            alt="Foto de perfil"
            className="perfil-foto"
          />
        </div>

        <div className="perfil-info">
          <h1 className="perfil-nome">{perfil?.nome || user?.email?.split('@')[0]}</h1>
          <p className="perfil-email">{user?.email}</p>
          <p className="perfil-desde">Membro desde {dataCriacao}</p>
        </div>

        <div className="perfil-acoes">
          <button className="btn-editar-perfil" onClick={() => setEditando(true)}>
            ✏️ Editar Perfil
          </button>
          <button className="btn-logout-perfil" onClick={logout}>
            🔓 Sair
          </button>
        </div>
      </div>

      <div className="perfil-stats">
        <div className="perfil-stat">
          <span className="perfil-stat-valor">{stats.totalFilmes}</span>
          <span className="perfil-stat-label">🎬 Filmes</span>
        </div>
        <div className="perfil-stat">
          <span className="perfil-stat-valor">{stats.totalSeries}</span>
          <span className="perfil-stat-label">📺 Séries</span>
        </div>
        <div className="perfil-stat">
          <span className="perfil-stat-valor">{stats.assistidos}</span>
          <span className="perfil-stat-label">✅ Assistidos</span>
        </div>
        <div className="perfil-stat">
          <span className="perfil-stat-valor">{stats.assistindo}</span>
          <span className="perfil-stat-label">▶ Assistindo</span>
        </div>
        <div className="perfil-stat">
          <span className="perfil-stat-valor">{stats.querVer}</span>
          <span className="perfil-stat-label">🔖 Quero Ver</span>
        </div>
        <div className="perfil-stat">
          <span className="perfil-stat-valor">{stats.favoritos}</span>
          <span className="perfil-stat-label">♡ Favoritos</span>
        </div>
      </div>

      <div className="perfil-secao">
        <h2>📋 Histórico de Atividades</h2>
        {atividades.length === 0 ? (
          <p className="sem-resultados">Nenhuma atividade ainda.</p>
        ) : (
          <div className="atividades-lista">
            {atividades.map(atv => (
              <div key={atv.id} className="atividade-item">
                {atv.poster_url && (
                  <img src={atv.poster_url} alt="" className="atividade-poster" />
                )}
                <div className="atividade-info">
                  <span className="atividade-icone">{iconeAtividade(atv.tipo)}</span>
                  <span className="atividade-descricao">{atv.descricao}</span>
                </div>
                <span className="atividade-data">{formatarData(atv.criado_em)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {editando && (
        <div className="perfil-modal-overlay" onClick={() => setEditando(false)}>
          <div className="perfil-modal" onClick={e => e.stopPropagation()}>
            <div className="perfil-modal-header">
              <h2>Editar Perfil</h2>
              <button onClick={() => setEditando(false)}>✕</button>
            </div>

            <div className="perfil-modal-body">
              <label>Nome de exibição</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Seu nome"
              />

              <label>Foto de Perfil</label>
              <div className="perfil-upload-group">
                <input
                  type="text"
                  value={fotoUrl}
                  onChange={e => setFotoUrl(e.target.value)}
                  placeholder="URL da foto ou faça upload"
                />
                <button onClick={() => fotoRef.current.click()}>📁 Upload</button>
                <input ref={fotoRef} type="file" accept="image/*" onChange={handleFotoUpload} hidden />
              </div>
              {(fotoPreview || fotoUrl) && (
                <img src={fotoPreview || fotoUrl} alt="Preview" className="perfil-preview-foto" />
              )}

              <label>Banner</label>
              <div className="perfil-upload-group">
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={e => setBannerUrl(e.target.value)}
                  placeholder="URL do banner ou faça upload"
                />
                <button onClick={() => bannerRef.current.click()}>📁 Upload</button>
                <input ref={bannerRef} type="file" accept="image/*" onChange={handleBannerUpload} hidden />
              </div>
              {(bannerPreview || bannerUrl) && (
                <img src={bannerPreview || bannerUrl} alt="Preview banner" className="perfil-preview-banner" />
              )}
            </div>

            <div className="perfil-modal-footer">
              <button className="btn-cancelar" onClick={() => setEditando(false)}>Cancelar</button>
              <button className="btn-salvar" onClick={handleSalvar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Perfil