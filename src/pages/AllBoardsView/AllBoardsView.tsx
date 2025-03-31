import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useStore } from '../../store'

import { DB } from '../../db'
import { Board } from '../types/Board'
import CreateBoardModal from './components/CreateBoardModal'
import './AllBoardsView.css'

function AllBoardsView() {
  const { state } = useStore()!
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    DB.getAllBoards()
      .then(boards => {
        setBoards([...boards])
        setLoading(false)
      })
  }, []);

  return (
    <main className="landing">
      <h1 className="landing-header text-center">Your Boards</h1>

      {loading ? <p className="loading">Loading...</p> : (
        <>
          {!boards.length && <p className="no-boards">You haven't created any boards yet.</p>}

          <section className="board-container">
            {boards.map(board => (
              <NavLink key={board.id} to={`/board/${board.id}`}>
                <article className="column align-center">
                  <h3>{board.name}</h3>
                  <p>Monitoring <span className={`count ${board.taskCount && !board.taskCount ? 'success' : ''}`}>{board.taskCount}</span> task{board.taskCount ? board.taskCount > 1 ? 's' : '' : 's'}</p>
                </article>
              </NavLink>
            ))}
          </section>
        </>
      )}

      {state.showCreateBoardModal && <CreateBoardModal />}
    </main>
  )
}

export default AllBoardsView