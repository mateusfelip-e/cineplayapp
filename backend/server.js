const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Configuração TMDB
const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
    'Content-Type': 'application/json'
  },
  params: {
    language: 'pt-BR'
  }
});

// ─── ROTAS TMDB ───────────────────────────────────────

// Buscar filmes/séries pelo nome
app.get('/api/buscar', async (req, res) => {
  try {
    const { query, tipo = 'multi' } = req.query;
    const response = await tmdb.get(`/search/${tipo}`, { params: { query } });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar no TMDB' });
  }
});

// Filmes populares
app.get('/api/filmes/populares', async (req, res) => {
  try {
    const response = await tmdb.get('/movie/popular');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar filmes populares' });
  }
});

// Séries populares
app.get('/api/series/populares', async (req, res) => {
  try {
    const response = await tmdb.get('/tv/popular');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar séries populares' });
  }
});

// Lançamentos de filmes
app.get('/api/filmes/lancamentos', async (req, res) => {
  try {
    const response = await tmdb.get('/movie/now_playing');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar lançamentos' });
  }
});

// Detalhes de um filme ou série
app.get('/api/detalhes/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;
    const endpoint = tipo === 'filme' ? `/movie/${id}` : `/tv/${id}`;
    const response = await tmdb.get(endpoint, {
      params: { append_to_response: 'credits' }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar detalhes' });
  }
});

// ─── ROTAS BIBLIOTECA (Supabase) ──────────────────────

// Listar toda a biblioteca
app.get('/api/biblioteca', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('biblioteca')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar biblioteca' });
  }
});

// Adicionar à biblioteca
app.post('/api/biblioteca', async (req, res) => {
  try {
    const { tmdb_id, tipo, titulo, ano, poster_url, sinopse, status } = req.body;
    const { data, error } = await supabase
      .from('biblioteca')
      .insert([{ tmdb_id, tipo, titulo, ano, poster_url, sinopse, status }])
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao adicionar à biblioteca' });
  }
});

// Atualizar item da biblioteca
app.put('/api/biblioteca/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, favorito } = req.body;
    const { data, error } = await supabase
      .from('biblioteca')
      .update({ status, favorito, atualizado_em: new Date() })
      .eq('id', id)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar item' });
  }
});

// Remover da biblioteca
app.delete('/api/biblioteca/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('biblioteca')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ mensagem: 'Item removido com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover item' });
  }
});

// Favoritar/desfavoritar
app.put('/api/biblioteca/:id/favorito', async (req, res) => {
  try {
    const { id } = req.params;
    const { favorito } = req.body;
    const { data, error } = await supabase
      .from('biblioteca')
      .update({ favorito, atualizado_em: new Date() })
      .eq('id', id)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao favoritar item' });
  }
});

// ─── INICIAR SERVIDOR ─────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor CinePlay rodando na porta ${PORT}`);
});