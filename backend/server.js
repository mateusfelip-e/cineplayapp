const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase Admin (para operações sem autenticação do usuário)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Supabase com autenticação do usuário
const getSupabaseUser = (token) => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { global: { headers: { Authorization: `Bearer ${token}` } } }
);

// Middleware para extrair token
const getToken = (req) => {
  const auth = req.headers.authorization
  return auth ? auth.replace('Bearer ', '') : null
}

// Configuração TMDB
const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
    'Content-Type': 'application/json'
  },
  params: { language: 'pt-BR' }
});

// ─── ROTA PING ─────────────────────────────────────────
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
});

// ─── ROTAS TMDB ───────────────────────────────────────

app.get('/api/buscar', async (req, res) => {
  try {
    const { query, tipo = 'multi', page = 1 } = req.query;
    const response = await tmdb.get(`/search/${tipo}`, { params: { query, page } });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar no TMDB' });
  }
});

app.get('/api/filmes/populares', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdb.get('/movie/popular', { params: { page } });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar filmes populares' });
  }
});

app.get('/api/series/populares', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdb.get('/tv/popular', { params: { page } });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar séries populares' });
  }
});

app.get('/api/filmes/lancamentos', async (req, res) => {
  try {
    const response = await tmdb.get('/movie/now_playing');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar lançamentos' });
  }
});

app.get('/api/filmes/lancamentos/:ano', async (req, res) => {
  try {
    const { ano } = req.params;
    const response = await tmdb.get('/discover/movie', {
      params: { primary_release_year: ano, sort_by: 'popularity.desc', page: 1 }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar lançamentos por ano' });
  }
});

app.get('/api/detalhes/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;
    const endpoint = tipo === 'filme' ? `/movie/${id}` : `/tv/${id}`;
    const response = await tmdb.get(endpoint, { params: { append_to_response: 'credits' } });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar detalhes' });
  }
});

// ─── ROTAS BIBLIOTECA ─────────────────────────────────

app.get('/api/biblioteca', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })
    const supabase = getSupabaseUser(token)
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

app.post('/api/biblioteca', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })
    const supabase = getSupabaseUser(token)

    // Pegar user_id do token
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return res.status(401).json({ erro: 'Usuário não encontrado' })

    const { tmdb_id, tipo, titulo, ano, poster_url, sinopse, status } = req.body;

    // Verificar duplicata para esse usuário
    const { data: existente } = await supabase
      .from('biblioteca')
      .select('id')
      .eq('tmdb_id', tmdb_id)
      .eq('user_id', user.id)
      .single();

    if (existente) {
      return res.status(409).json({ erro: 'Item já está na biblioteca', jaExiste: true });
    }

    const { data, error } = await supabase
      .from('biblioteca')
      .insert([{ tmdb_id, tipo, titulo, ano, poster_url, sinopse, status, user_id: user.id }])
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao adicionar à biblioteca' });
  }
});

app.put('/api/biblioteca/:id', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })
    const supabase = getSupabaseUser(token)
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

app.delete('/api/biblioteca/:id', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })
    const supabase = getSupabaseUser(token)
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

app.put('/api/biblioteca/:id/favorito', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })
    const supabase = getSupabaseUser(token)
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor CinePlay rodando na porta ${PORT}`);
});