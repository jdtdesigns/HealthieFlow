import { Routes, Route } from 'react-router-dom'

import Landing from './pages/Landing'
import AllBoardsView from './pages/AllBoardsView'
import SingleBoardView from './pages/SingleBoardView'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/boards" element={<AllBoardsView />} />
        <Route path="/board/:board_id" element={<SingleBoardView />} />
      </Routes>
    </>
  )
}

export default App
