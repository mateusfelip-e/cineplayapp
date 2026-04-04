import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

// TMDB
export const buscarConteudo = (query, page = 1) => api.get(`/buscar?query=${query}&page=${page}`);
export const getFilmesPopulares = () => api.get('/filmes/populares');
export const getSeriesPopulares = () => api.get('/series/populares');
export const getLancamentos = () => api.get('/filmes/lancamentos');
export const getDetalhes = (tipo, id) => api.get(`/detalhes/${tipo}/${id}`);

// Biblioteca
export const getBiblioteca = () => api.get('/biblioteca');
export const adicionarBiblioteca = (item) => api.post('/biblioteca', item);
export const atualizarItem = (id, dados) => api.put(`/biblioteca/${id}`, dados);
export const removerItem = (id) => api.delete(`/biblioteca/${id}`);
export const favoritarItem = (id, favorito) => api.put(`/biblioteca/${id}/favorito`, { favorito });