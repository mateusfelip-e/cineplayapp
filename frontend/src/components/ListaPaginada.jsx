import { useState, useEffect, useRef } from 'react'
import Paginacao from './Paginacao'

const POR_PAGINA = 50      // títulos por página
const INICIAL = 20         // quantos aparecem de início
const POR_LOTE = 10        // quantos aparecem a cada rolagem
const TMDB_POR_PAGINA = 20 // o TMDB entrega 20 por vez
const MAX_PAGINAS = 50

const chaveItem = (i) => `${i.media_type || 'x'}-${i.id}`

function ListaPaginada({ buscarPagina, renderItem, chave, filtrar, mensagemVazia }) {
  const [pagina, setPagina] = useState(1)
  const [visiveis, setVisiveis] = useState(INICIAL)
  const [cache, setCache] = useState({})
  const [totalTmdb, setTotalTmdb] = useState(null)

  const sentinela = useRef(null)
  const emAndamento = useRef(new Set())
  const buscarRef = useRef(buscarPagina)
  const chaveRef = useRef(chave)
  const primeiraVez = useRef(true)

  buscarRef.current = buscarPagina
  chaveRef.current = chave

  // nova busca/lista: volta tudo ao começo
  useEffect(() => {
    if (primeiraVez.current) { primeiraVez.current = false; return }
    setPagina(1)
    setVisiveis(INICIAL)
    setCache({})
    setTotalTmdb(null)
  }, [chave])

  // quais páginas do TMDB esta página nossa precisa
  const inicio = (pagina - 1) * POR_PAGINA
  const primeira = Math.floor(inicio / TMDB_POR_PAGINA) + 1
  const ultima = Math.ceil((inicio + visiveis) / TMDB_POR_PAGINA)

  // busca no TMDB o que ainda falta
  useEffect(() => {
    for (let tp = primeira; tp <= ultima; tp++) {
      if (totalTmdb !== null && tp > totalTmdb) break
      if (cache[tp]) continue
      const id = `${chave}:${tp}`
      if (emAndamento.current.has(id)) continue
      emAndamento.current.add(id)

      buscarRef.current(tp)
        .then(data => {
          if (chaveRef.current !== chave) return
          setCache(c => ({ ...c, [tp]: data.results || [] }))
          setTotalTmdb(t => t ?? Math.min(data.total_pages || 1, 500))
        })
        .catch(() => {
          if (chaveRef.current !== chave) return
          setCache(c => ({ ...c, [tp]: [] }))
          setTotalTmdb(t => t ?? 1)
        })
        .finally(() => emAndamento.current.delete(id))
    }
  }, [primeira, ultima, cache, totalTmdb, chave])

  // junta só as páginas já carregadas, em sequência
  let todos = []
  for (let tp = primeira; tp <= ultima; tp++) {
    if (!cache[tp]) break
    todos = todos.concat(cache[tp])
  }
  const offset = inicio - (primeira - 1) * TMDB_POR_PAGINA
  let itens = todos.slice(offset, offset + visiveis)
  if (filtrar) itens = itens.filter(filtrar)
  const vistos = new Set()
  itens = itens.filter(i => {
    const k = chaveItem(i)
    if (vistos.has(k)) return false
    vistos.add(k)
    return true
  })

  const faltando = !cache[ultima] && (totalTmdb === null || ultima <= totalTmdb)
  const carregouTudoQueDeu = !faltando && todos.slice(offset).length < visiveis
  const podeMais = visiveis < POR_PAGINA && !faltando && !carregouTudoQueDeu
  const mostrarPaginacao = !podeMais && !faltando

  const totalPaginas = totalTmdb
    ? Math.min(MAX_PAGINAS, Math.ceil((totalTmdb * TMDB_POR_PAGINA) / POR_PAGINA))
    : 1

  // rolou até o fim da lista: mostra mais um lote
  useEffect(() => {
    if (!podeMais || !sentinela.current) return
    const obs = new IntersectionObserver(
      (entradas) => {
        if (entradas[0].isIntersecting) {
          setVisiveis(v => Math.min(POR_PAGINA, v + POR_LOTE))
        }
      },
      { rootMargin: '400px' }
    )
    obs.observe(sentinela.current)
    return () => obs.disconnect()
  }, [podeMais, visiveis, itens.length])

  const irParaPagina = (n) => {
    setPagina(n)
    setVisiveis(INICIAL)
  }

  if (!faltando && itens.length === 0) {
    return <p className="sem-resultados">{mensagemVazia || 'Nenhum resultado encontrado.'}</p>
  }

  return (
    <>
      <div className="lista-cards">
        {itens.map(item => renderItem(item, chaveItem(item)))}
      </div>

      {faltando && <div className="carregando">Carregando...</div>}

      {podeMais && <div ref={sentinela} style={{ height: 1 }} />}

      {mostrarPaginacao && (
        <Paginacao pagina={pagina} total={totalPaginas} onMudar={irParaPagina} />
      )}
    </>
  )
}

export default ListaPaginada