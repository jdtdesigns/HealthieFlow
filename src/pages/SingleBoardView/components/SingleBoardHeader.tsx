import { NavLink } from 'react-router-dom'
import { SettingsIcon } from '../assets/Icons'

interface SingleBoardHeaderProps {
  setShowSideMenu: (show: boolean) => void;
}

function SingleBoardHeader({ setShowSideMenu }: SingleBoardHeaderProps) {

  const openSideMenu = () => {
    setShowSideMenu(true)
  }

  return (
    <header className="single-board-header row justify-between">
      <NavLink to="/">
        <h3>HealthieFlow</h3>
      </NavLink>

      <button onClick={openSideMenu}>
        <SettingsIcon />
      </button>


    </header>
  )
}

export default SingleBoardHeader