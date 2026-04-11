const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Supabase Admin
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware para extrair token
const getToken = (req) => {
  const auth = req.headers.authorization
  return auth ? auth.replace('Bearer ', '') : null
}

// Pegar usuário pelo token
const getUser = async (token) => {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null
  return user
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

// Listar biblioteca do usuário
app.get('/api/biblioteca', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })

    const user = await getUser(token)
    if (!user) return res.status(401).json({ erro: 'Usuário inválido' })

    const { data, error } = await supabaseAdmin
      .from('biblioteca')
      .select('*')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('GET biblioteca:', error)
    res.status(500).json({ erro: 'Erro ao buscar biblioteca' })
  }
});

// Adicionar à biblioteca
app.post('/api/biblioteca', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })

    const user = await getUser(token)
    if (!user) return res.status(401).json({ erro: 'Usuário inválido' })

    const { tmdb_id, tipo, titulo, ano, poster_url, sinopse, status } = req.body

    // Verificar duplicata
    const { data: existente } = await supabaseAdmin
      .from('biblioteca')
      .select('id')
      .eq('tmdb_id', tmdb_id)
      .eq('user_id', user.id)
      .single()

    if (existente) {
      return res.status(409).json({ erro: 'Item já está na biblioteca', jaExiste: true })
    }

    const { data, error } = await supabaseAdmin
      .from('biblioteca')
      .insert([{ tmdb_id, tipo, titulo, ano, poster_url, sinopse, status, user_id: user.id }])
      .select()

    if (error) throw error
    res.json(data[0])
  } catch (error) {
    console.error('POST biblioteca:', error)
    res.status(500).json({ erro: 'Erro ao adicionar à biblioteca' })
  }
});

// Atualizar item
app.put('/api/biblioteca/:id', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })

    const user = await getUser(token)
    if (!user) return res.status(401).json({ erro: 'Usuário inválido' })

    const { id } = req.params
    const { status, favorito } = req.body

    const { data, error } = await supabaseAdmin
      .from('biblioteca')
      .update({ status, favorito, atualizado_em: new Date() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()

    if (error) throw error
    res.json(data[0])
  } catch (error) {
    console.error('PUT biblioteca:', error)
    res.status(500).json({ erro: 'Erro ao atualizar item' })
  }
});

// Remover item
app.delete('/api/biblioteca/:id', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })

    const user = await getUser(token)
    if (!user) return res.status(401).json({ erro: 'Usuário inválido' })

    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('biblioteca')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    res.json({ mensagem: 'Item removido com sucesso' })
  } catch (error) {
    console.error('DELETE biblioteca:', error)
    res.status(500).json({ erro: 'Erro ao remover item' })
  }
});

// Favoritar item
app.put('/api/biblioteca/:id/favorito', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })

    const user = await getUser(token)
    if (!user) return res.status(401).json({ erro: 'Usuário inválido' })

    const { id } = req.params
    const { favorito } = req.body

    const { data, error } = await supabaseAdmin
      .from('biblioteca')
      .update({ favorito, atualizado_em: new Date() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()

    if (error) throw error
    res.json(data[0])
  } catch (error) {
    console.error('PUT favorito:', error)
    res.status(500).json({ erro: 'Erro ao favoritar item' })
  }
});

// Calcular tempo gasto assistindo
app.post('/api/tempo-assistido', async (req, res) => {
  try {
    const { itens } = req.body
    let totalMinutos = 0

    for (const item of itens) {
      try {
        if (item.tipo === 'filme') {
          const response = await tmdb.get(`/movie/${item.tmdb_id}`)
          totalMinutos += response.data.runtime || 90
        } else {
          const response = await tmdb.get(`/tv/${item.tmdb_id}`)
          const episodios = response.data.number_of_episodes || 0
          const duracao = response.data.episode_run_time?.[0] || 40
          totalMinutos += episodios * duracao
        }
      } catch {
        totalMinutos += item.tipo === 'filme' ? 90 : 600
      }
    }

    const minutos = totalMinutos % 60
    const horas = Math.floor(totalMinutos / 60) % 24
    const dias = Math.floor(totalMinutos / 60 / 24)

    res.json({ totalMinutos, minutos, horas, dias })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao calcular tempo' })
  }
})

// ─── ROTAS PERFIL ─────────────────────────────────────

// Buscar perfil
app.get('/api/perfil', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })
    const user = await getUser(token)
    if (!user) return res.status(401).json({ erro: 'Usuário inválido' })

    const { data, error } = await supabaseAdmin
      .from('perfil')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    // Se não tem perfil, cria um
    if (!data) {
      const { data: novo, error: errNovo } = await supabaseAdmin
        .from('perfil')
        .insert([{ user_id: user.id, nome: user.email?.split('@')[0] }])
        .select()
        .single()
      if (errNovo) throw errNovo
      return res.json(novo)
    }

    res.json(data)
  } catch (error) {
    console.error('GET perfil:', error)
    res.status(500).json({ erro: 'Erro ao buscar perfil' })
  }
})

// Atualizar perfil
app.put('/api/perfil', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })
    const user = await getUser(token)
    if (!user) return res.status(401).json({ erro: 'Usuário inválido' })

    const { nome, foto_url, banner_url } = req.body

    const { data, error } = await supabaseAdmin
      .from('perfil')
      .upsert({ user_id: user.id, nome, foto_url, banner_url, atualizado_em: new Date() })
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('PUT perfil:', error)
    res.status(500).json({ erro: 'Erro ao atualizar perfil' })
  }
})

// Buscar atividades
app.get('/api/atividades', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })
    const user = await getUser(token)
    if (!user) return res.status(401).json({ erro: 'Usuário inválido' })

    const { data, error } = await supabaseAdmin
      .from('atividades')
      .select('*')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(20)

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar atividades' })
  }
})

// Registrar atividade
app.post('/api/atividades', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ erro: 'Não autenticado' })
    const user = await getUser(token)
    if (!user) return res.status(401).json({ erro: 'Usuário inválido' })

    const { tipo, descricao, poster_url, tmdb_id } = req.body

    const { data, error } = await supabaseAdmin
      .from('atividades')
      .insert([{ user_id: user.id, tipo, descricao, poster_url, tmdb_id }])
      .select()

    if (error) throw error
    res.json(data[0])
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao registrar atividade' })
  }
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor CinePlay rodando na porta ${PORT}`);
});