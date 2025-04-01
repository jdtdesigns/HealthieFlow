import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Footer from './components/Footer'

import Landing from './pages/Landing'
import AllBoardsView from './pages/AllBoardsView'
import SingleBoardView from './pages/SingleBoardView'

const titles = {
  '/': 'Home',
  '/boards': 'Boards'
}

function App() {
  const location = useLocation()

  useEffect(() => {
    const baseTitle = 'HealthieFlow - '
    const path = location.pathname
    const title = baseTitle + (path.includes('/board/') ? 'Board View' : titles[path as keyof typeof titles])

    document.title = title
  }, [location]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/boards" element={<AllBoardsView />} />
        <Route path="/board/:board_id" element={<SingleBoardView />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App
