import { useState, useEffect } from 'react'
import { getBiblioteca } from '../services/api'
import Card from '../components/Card'
import Loading from '../components/Loading'
import './Paginas.css'

function Series() {
  const [biblioteca, setBiblioteca] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [ordenacao, setOrdenacao] = useState('recente')

  const carregar = async () => {
    try {
      const res = await getBiblioteca()
      setBiblioteca(res.data.filter(i => i.tipo === 'serie'))
    } catch (err) { console.error(err) }
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  const filtrados = filtro === 'todos'
    ? biblioteca
    : biblioteca.filter(i => i.status === filtro)

  const ordenados = [...filtrados].sort((a, b) => {
    if (ordenacao === 'recente') return new Date(b.criado_em) - new Date(a.criado_em)
    if (ordenacao === 'antigo') return new Date(a.criado_em) - new Date(b.criado_em)
    if (ordenacao === 'az') return (a.titulo || '').localeCompare(b.titulo || '')
    if (ordenacao === 'za') return (b.titulo || '').localeCompare(a.titulo || '')
    if (ordenacao === 'ano') return (b.ano || 0) - (a.ano || 0)
    return 0
  })

  const contagem = {
    todos: biblioteca.length,
    quero_ver: biblioteca.filter(i => i.status === 'quero_ver').length,
    assistindo: biblioteca.filter(i => i.status === 'assistindo').length,
    assistido: biblioteca.filter(i => i.status === 'assistido').length,
  }

  if (carregando) return <Loading />

  return (
    <div className="pagina">
      <div className="secao">
        <div className="secao-header">
          <h2>📺 Minhas Séries</h2>
          <span className="contagem-total">{biblioteca.length} {biblioteca.length === 1 ? 'série' : 'séries'}</span>
        </div>

        <div className="controles-biblioteca">
          <div className="filtros">
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'quero_ver', label: '🔖 Quero Ver' },
              { key: 'assistindo', label: '▶ Assistindo' },
              { key: 'assistido', label: '✓ Assistido' },
            ].map(f => (
              <button
                key={f.key}
                className={`btn-filtro ${filtro === f.key ? 'ativo' : ''} ${f.key !== 'todos' ? `filtro-${f.key.replace('_', '-')}` : ''}`}
                onClick={() => setFiltro(f.key)}
              >
                {f.label}
                <span className="filtro-contagem">{contagem[f.key]}</span>
              </button>
            ))}
          </div>

          <div className="ordenacao">
            <span>Ordenar:</span>
            <select value={ordenacao} onChange={e => setOrdenacao(e.target.value)}>
              <option value="recente">Mais Recente</option>
              <option value="antigo">Mais Antigo</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
              <option value="ano">Ano</option>
            </select>
          </div>
        </div>

        {ordenados.length === 0 ? (
          <p className="sem-resultados">Nenhuma série aqui ainda. Explore e adicione séries à sua biblioteca!</p>
        ) : (
          <div className="lista-cards">
            {ordenados.map(item => (
              <Card key={item.id} item={item} tipo="serie" daBiblioteca onAtualizar={carregar} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Series