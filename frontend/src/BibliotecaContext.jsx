import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getBiblioteca } from './services/api'
import { supabase } from './supabaseClient'

const BibliotecaContext = createContext()

export function BibliotecaProvider({ children }) {
  const [biblioteca, setBiblioteca] = useState([])

const recarregar = useCallback(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setBiblioteca([])
      return
    }
    const res = await getBiblioteca()
    setBiblioteca(res.data || [])
  } catch {
    setBiblioteca([])
  }
}, [])

  useEffect(() => {
    recarregar()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      recarregar()
    })
    return () => subscription.unsubscribe()
  }, [recarregar])

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