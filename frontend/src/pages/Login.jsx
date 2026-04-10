import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import './Login.css'

function Login() {
  const [modo, setModo] = useState('login')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { login, cadastrar } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (modo === 'cadastro') {
      if (senha !== confirmarSenha) {
        setErro('As senhas não coincidem!')
        return
      }
      if (senha.length < 6) {
        setErro('A senha deve ter pelo menos 6 caracteres!')
        return
      }
    }

    setCarregando(true)
    try {
      if (modo === 'login') {
        await login(email, senha)
        navigate('/')
      } else {
        await cadastrar(email, senha, nome)
        setSucesso('Conta criada! Verifique seu email para confirmar o cadastro.')
        setModo('login')
      }
    } catch (err) {
      if (modo === 'login') {
        setErro('Email ou senha incorretos!')
      } else {
        setErro(err.message || 'Erro ao criar conta!')
      }
    }
    setCarregando(false)
  }

  return (
    <div className="login-pagina">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-cine">Cine</span>
          <span className="logo-play">Play</span>
        </div>
        <p className="login-subtitulo">
          {modo === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
        </p>

        <div className="login-tabs">
          <button
            className={modo === 'login' ? 'ativo' : ''}
            onClick={() => { setModo('login'); setErro(''); setSucesso('') }}
          >
            Entrar
          </button>
          <button
            className={modo === 'cadastro' ? 'ativo' : ''}
            onClick={() => { setModo('cadastro'); setErro(''); setSucesso('') }}
          >
            Cadastrar
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {modo === 'cadastro' && (
            <div className="login-campo">
              <label>Nome</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
              />
            </div>
          )}

          <div className="login-campo">
            <label>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-campo">
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
            />
          </div>

          {modo === 'cadastro' && (
            <div className="login-campo">
              <label>Confirmar Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                required
              />
            </div>
          )}

          {erro && <p className="login-erro">{erro}</p>}
          {sucesso && <p className="login-sucesso">{sucesso}</p>}

          <button type="submit" className="btn-login" disabled={carregando}>
            {carregando
              ? (modo === 'login' ? 'Entrando...' : 'Criando conta...')
              : (modo === 'login' ? 'Entrar' : 'Criar Conta')
            }
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login