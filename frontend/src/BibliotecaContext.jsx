import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getBiblioteca } from './services/api'

const BibliotecaContext = createContext()

export function BibliotecaProvider({ children }) {
  const [biblioteca, setBiblioteca] = useState([])

  const recarregar = useCallback(async () => {
    try {
      const res = await getBiblioteca()
      setBiblioteca(res.data || [])
    } catch { }
  }, [])

  useEffect(() => { recarregar() }, [])

  const jaAdicionado = (tmdbId) => {
    return biblioteca.some(i => i.tmdb_id === Number(tmdbId))
  }

  return (
    <BibliotecaContext.Provider value={{ biblioteca, recarregar, jaAdicionado }}>
      {children}
    </BibliotecaContext.Provider>
  )
}

export function useBiblioteca() {
  return useContext(BibliotecaContext)
}