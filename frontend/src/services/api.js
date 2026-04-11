import axios from 'axios';
import { supabase } from '../supabaseClient';

const BASE_URL = 'https://cineplay-backend-sdlj.onrender.com/api'

const getApi = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token || ''
  return axios.create({
    baseURL: BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
}

const api = axios.create({ baseURL: BASE_URL })

// TMDB (público)
export const buscarConteudo = (query, page = 1) => api.get(`/buscar?query=${query}&page=${page}`)
export const getFilmesPopulares = (page = 1) => api.get(`/filmes/populares?page=${page}`)
export const getSeriesPopulares = (page = 1) => api.get(`/series/populares?page=${page}`)
export const getLancamentos = () => api.get('/filmes/lancamentos')
export const getLancamentosPorAno = (ano) => api.get(`/filmes/lancamentos/${ano}`)
export const getDetalhes = (tipo, id) => api.get(`/detalhes/${tipo}/${id}`)

// Biblioteca (autenticado)
export const getBiblioteca = async () => { const a = await getApi(); return a.get('/biblioteca') }
export const adicionarBiblioteca = async (item) => { const a = await getApi(); return a.post('/biblioteca', item) }
export const atualizarItem = async (id, dados) => { const a = await getApi(); return a.put(`/biblioteca/${id}`, dados) }
export const removerItem = async (id) => { const a = await getApi(); return a.delete(`/biblioteca/${id}`) }
export const favoritarItem = async (id, favorito) => { const a = await getApi(); return a.put(`/biblioteca/${id}/favorito`, { favorito }) }

export const calcularTempoAssistido = async (itens) => {
  const a = await getApi()
  return a.post('/tempo-assistido', { itens })
}