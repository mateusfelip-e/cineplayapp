import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import PageTransition from './components/PageTransition'
import Inicio from './pages/Inicio'
import Explorar from './pages/Explorar'
import Lancamentos from './pages/Lancamentos'
import Filmes from './pages/Filmes'
import Series from './pages/Series'
import Favoritos from './pages/Favoritos'
import Detalhes from './pages/Detalhes'

function App() {
  const location = useLocation()

  return (
    <>
      <Navbar />
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Inicio />} />
          <Route path="/explorar" element={<Explorar />} />
          <Route path="/lancamentos" element={<Lancamentos />} />
          <Route path="/filmes" element={<Filmes />} />
          <Route path="/series" element={<Series />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/detalhes/:tipo/:id" element={<Detalhes />} />
        </Routes>
      </PageTransition>
    </>
  )
}

export default App