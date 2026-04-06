import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { BibliotecaProvider } from './BibliotecaContext.jsx'
import './index.css'

// Efeito de luz premium seguindo o mouse
const glow = document.createElement('div')
glow.id = 'mouse-glow'
document.body.appendChild(glow)

document.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px'
  glow.style.top = e.clientY + 'px'
})

// Manter backend acordado (ping a cada 14 minutos)
const BACKEND_URL = 'https://cineplay-backend-sdlj.onrender.com'
const ping = () => fetch(`${BACKEND_URL}/api/ping`).catch(() => {})
ping()
setInterval(ping, 14 * 60 * 1000)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BibliotecaProvider>
        <App />
      </BibliotecaProvider>
    </BrowserRouter>
  </React.StrictMode>
)