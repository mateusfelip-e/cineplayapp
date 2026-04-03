import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Efeito de luz premium seguindo o mouse
const glow = document.createElement('div')
glow.id = 'mouse-glow'
document.body.appendChild(glow)

document.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px'
  glow.style.top = e.clientY + 'px'
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)