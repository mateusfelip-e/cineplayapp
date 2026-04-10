import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { BibliotecaProvider } from './BibliotecaContext.jsx'
import { AuthProvider } from './AuthContext.jsx'
import './index.css'

const glow = document.createElement('div')
glow.id = 'mouse-glow'
document.body.appendChild(glow)

document.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px'
  glow.style.top = e.clientY + 'px'
})

const BACKEND_URL = 'https://cineplay-backend-sdlj.onrender.com'
const ping = () => fetch(`${BACKEND_URL}/api/ping`).catch(() => {})
ping()
setInterval(ping, 14 * 60 * 1000)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BibliotecaProvider>
          <App />
        </BibliotecaProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)