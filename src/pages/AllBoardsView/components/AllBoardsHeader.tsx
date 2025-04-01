import { NavLink } from 'react-router-dom'
import { useStore } from '../../../store'

import { AddIcon } from '../assets/Icons'

function AllBoardsHeader() {
  const { setState } = useStore()!

  const showCreateBoardModal = () => {
    setState(oldState => ({
      ...oldState,
      showCreateBoardModal: true
    }))
  }

  return (
    <header className="all-boards-header row justify-between">
      <NavLink to="/">
        <h3>HealthieFlow</h3>
      </NavLink>

      <button onClick={showCreateBoardModal} className="row">
        <span >Create a Board</span>
        <AddIcon />
      </button>
    </header>
  )
}

export default AllBoardsHeader