import { useState } from 'react'

function Paginacao({ pagina, total, onMudar }) {
  const [alvo, setAlvo] = useState('')

  if (total <= 1) return null

  const irPara = (p) => {
    const n = Math.max(1, Math.min(total, Number(p)))
    if (!n || n === pagina) return
    onMudar(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // janela de páginas ao redor da atual
  const inicio = Math.max(1, Math.min(pagina - 2, total - 4))
  const fim = Math.min(total, inicio + 4)
  const numeros = []
  for (let i = inicio; i <= fim; i++) numeros.push(i)

  return (
    <div className="paginacao-completa">
      <div className="paginacao">
        <button className="btn-pagina" disabled={pagina === 1} onClick={() => irPara(1)}>«</button>
        <button className="btn-pagina" disabled={pagina === 1} onClick={() => irPara(pagina - 1)}>‹</button>

        {inicio > 1 && <span className="paginacao-reticencias">…</span>}

        {numeros.map(p => (
          <button
            key={p}
            className={`btn-pagina ${p === pagina ? 'ativo' : ''}`}
            onClick={() => irPara(p)}
          >{p}</button>
        ))}

        {fim < total && <span className="paginacao-reticencias">…</span>}

        <button className="btn-pagina" disabled={pagina === total} onClick={() => irPara(pagina + 1)}>›</button>
        <button className="btn-pagina" disabled={pagina === total} onClick={() => irPara(total)}>»</button>
      </div>

      <form
        className="paginacao-pular"
        onSubmit={e => { e.preventDefault(); irPara(alvo); setAlvo('') }}
      >
        <span>Ir para a página</span>
        <input
          type="number"
          min="1"
          max={total}
          value={alvo}
          onChange={e => setAlvo(e.target.value)}
          placeholder={`1-${total}`}
        />
        <button type="submit" className="btn-pagina">Ir</button>
      </form>
    </div>
  )
}

export default Paginacao