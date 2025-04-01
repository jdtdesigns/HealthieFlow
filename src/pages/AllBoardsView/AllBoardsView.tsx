import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useStore } from '../../store'
import './AllBoardsView.css'

import { DB } from '../../db'
import { Board } from '../types/Board'

import CreateBoardModal from './components/CreateBoardModal'
import AllBoardsHeader from './components/AllBoardsHeader'
import { AddIcon } from './assets/Icons'

function AllBoardsView() {
  const { state, setState } = useStore()!
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    DB.getAllBoards()
      .then(boards => {
        setBoards([...boards])
        setLoading(false)
      })
  }, []);

  const showCreateBoardModal = () =>
    setState(oldState => ({
      ...oldState,
      showCreateBoardModal: true
    }))

  return (
    <main className="boards">
      <AllBoardsHeader />

      <h1 className="boards-content-header text-center">Your Boards</h1>

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

            {boards.length < 6 && (
              [...Array(8 - boards.length)].map((_, index) => (
                <article onClick={showCreateBoardModal} key={index} className="placeholder column align-center">
                  <AddIcon />
                </article>
              ))
            )}
          </section>
        </>
      )}

      {state.showCreateBoardModal && <CreateBoardModal />}
    </main>
  )
}

export default AllBoardsView