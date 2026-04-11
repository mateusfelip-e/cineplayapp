import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [nomePerfil, setNomePerfil] = useState('')
  const [carregando, setCarregando] = useState(true)

  const buscarNomePerfil = async (session) => {
    if (!session) return
    try {
      const { data } = await supabase
        .from('perfil')
        .select('nome')
        .eq('user_id', session.user.id)
        .single()
      if (data?.nome) setNomePerfil(data.nome)
      else setNomePerfil(session.user.email?.split('@')[0] || '')
    } catch {
      setNomePerfil(session.user.email?.split('@')[0] || '')
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      buscarNomePerfil(session)
      setCarregando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      buscarNomePerfil(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    })
    if (error) throw error
    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setNomePerfil('')
  }

  const atualizarNomePerfil = (novoNome) => {
    setNomePerfil(novoNome)
  }

  return (
    <AuthContext.Provider value={{ user, nomePerfil, carregando, login, logout, atualizarNomePerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}