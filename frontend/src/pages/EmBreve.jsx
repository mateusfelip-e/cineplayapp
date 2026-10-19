import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { getEmBreve } from '../services/api'
import Loading from '../components/Loading'
import './EmBreve.css'

const parseData = (str) => {
  const [a, m, d] = str.split('-').map(Number)
  return new Date(a, m - 1, d)
}

const diasAte = (str) => {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.round((parseData(str) - hoje) / 86400000)
}

const rotulo = (dias) => {
  if (dias < 0) return 'Já lançado'
  if (dias === 0) return 'Hoje'
  if (dias === 1) return 'Amanhã'
  return `Em ${dias} dias`
}

const formatarData = (str) =>
  parseData(str).toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

const pad = (n) => String(n).padStart(2, '0')

function EmBreve() {
  const { user, carregando: carregandoAuth } = useAuth()
  const navigate = useNavigate()
  const [dados, setDados] = useState({ proximos: [], sem_data: [] })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    if (carregandoAuth) return
    if (!user) { setCarregando(false); return }
    const carregar = async () => {
      try {
        const res = await getEmBreve()
        setDados(res.data)
      } catch (err) {
        console.error(err)
        setErro(true)
      }
      setCarregando(false)
    }
    carregar()
  }, [user, carregandoAuth])

  if (carregando || carregandoAuth) return <Loading />

  if (!user) return (
    <div className="pagina">
      <div className="secao">
        <h2>📅 Em Breve</h2>
        <p className="sem-resultados">
          Faça <Link to="/login" className="embreve-link">login</Link> para ver os próximos episódios das suas séries.
        </p>
      </div>
    </div>
  )

  if (erro) return (
    <div className="pagina">
      <div className="secao">
        <h2>📅 Em Breve</h2>
        <p className="sem-resultados">Erro ao carregar os próximos episódios. Tente novamente.</p>
      </div>
    </div>
  )

  const proximos = filtro === 'todos'
    ? dados.proximos
    : dados.proximos.filter(s => s.status === filtro)

  const semData = filtro === 'todos'
    ? dados.sem_data
    : dados.sem_data.filter(s => s.status === filtro)

  return (
    <div className="pagina">
      <div className="secao">
        <div className="secao-header">
          <h2>📅 Em Breve</h2>
          <span className="contagem-total">
            {dados.proximos.length} {dados.proximos.length === 1 ? 'episódio' : 'episódios'}
          </span>
        </div>
        <p className="embreve-subtitulo">
          Baseado nas séries que você está assistindo ou já terminou.
        </p>

        <div className="filtros">
          {[
            { key: 'todos', label: 'Todas', cor: '' },
            { key: 'assistindo', label: '▶ Assistindo', cor: 'filtro-assistindo' },
            { key: 'assistido', label: '✓ Assistido', cor: 'filtro-assistido' },
          ].map(f => (
            <button
              key={f.key}
              className={`btn-filtro ${filtro === f.key ? `ativo ${f.cor}` : ''}`}
              onClick={() => setFiltro(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {proximos.length === 0 ? (
          <p className="sem-resultados">Nenhum episódio agendado no momento.</p>
        ) : (
          <div className="embreve-grid">
            {proximos.map(s => {
              const ep = s.proximo_episodio
              const dias = diasAte(ep.data)
              const img = s.backdrop_path
                ? `https://image.tmdb.org/t/p/w780${s.backdrop_path}`
                : s.poster_path
                  ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
                  : null
              return (
                <div
                  key={s.tmdb_id}
                  className="embreve-card"
                  onClick={() => navigate(`/detalhes/serie/${s.tmdb_id}`)}
                >
                  <div className="embreve-img-wrap">
                    {img && <img src={img} alt={s.titulo} className="embreve-img" />}
                    <span className={`embreve-badge ${dias <= 1 ? 'urgente' : ''}`}>
                      {rotulo(dias)}
                    </span>
                    <span className={`embreve-status status-${s.status}`}>
                      {s.status === 'assistindo' ? '▶ Assistindo' : '✓ Assistido'}
                    </span>
                  </div>
                  <h4 className="embreve-titulo">{s.titulo}</h4>
                  <p className="embreve-ep">
                    S{pad(ep.temporada)} E{pad(ep.numero)}
                    {ep.nome ? ` • ${ep.nome}` : ''}
                    {ep.numero === 1 ? ' • Estreia' : ''}
                    {ep.duracao ? ` • ${ep.duracao}m` : ''}
                  </p>
                  <p className="embreve-data">{formatarData(ep.data)}</p>
                </div>
              )
            })}
          </div>
        )}

        {semData.length > 0 && (
          <>
            <h3 className="subtitulo-secao embreve-sem-data-titulo">
              Sem episódio agendado
            </h3>
            <div className="embreve-chips">
              {semData.map(s => (
                <button
                  key={s.tmdb_id}
                  className="embreve-chip"
                  onClick={() => navigate(`/detalhes/serie/${s.tmdb_id}`)}
                >
                  {s.titulo}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default EmBreve