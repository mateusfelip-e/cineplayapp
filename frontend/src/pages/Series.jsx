import { useState, useEffect, useRef } from 'react'
import { getBiblioteca } from '../services/api'
import Card from '../components/Card'
import Loading from '../components/Loading'
import StatsCard from '../components/StatsCard'
import { useAnimacaoSecao, useAnimacaoStats, useAnimacaoCards } from '../useAnimacoes'
import './Paginas.css'

function Series() {
  const paginaRef = useRef(null)
  const [biblioteca, setBiblioteca] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [ordenacao, setOrdenacao] = useState('recente')

  useAnimacaoSecao(paginaRef)
  useAnimacaoStats(paginaRef)
  useAnimacaoCards(paginaRef)

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

  if (carregando) return <Loading />

  return (
    <div className="pagina" ref={paginaRef}>
      <div className="secao">
        <div className="secao-header">
          <h2>📺 Minhas Séries</h2>
          <span className="contagem-total">
            {biblioteca.length} {biblioteca.length === 1 ? 'série' : 'séries'}
          </span>
        </div>

        <StatsCard biblioteca={biblioteca} tipo="serie" />

        <div className="controles-biblioteca">
          <div className="filtros">
            {[
              { key: 'todos', label: 'Todos', cor: '' },
              { key: 'quero_ver', label: '🔖 Quero Ver', cor: 'filtro-quero-ver' },
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
          <p className="sem-resultados">
            {filtro === 'todos'
              ? 'Nenhuma série ainda. Explore e adicione séries à sua biblioteca!'
              : `Nenhuma série com status "${filtro.replace('_', ' ')}" ainda.`
            }
          </p>
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