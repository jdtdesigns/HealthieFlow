import { useEffect, useState } from 'react'
import { Board } from '../../../types/Board'
import './SideMenu.css'

import { DB } from '../../../../db'
import { Column } from '../../../types/Column';

interface SideMenuProps {
  board: Board;
  setShowSideMenu: (show: boolean) => void;
  showSideMenu: boolean;
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  columns: Column[]
}

function SideMenu({
  board,
  setShowSideMenu,
  showSideMenu,
  setColumns,
  columns }: SideMenuProps) {
  const [column_names, setColumnNames] = useState<string[]>([])

  useEffect(() => {
    setColumnNames([...(board.column_names || [])])
  }, [])

  const closeMenu = () => {
    setShowSideMenu(false)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target?.value
    const index = parseInt(event.target.dataset.index || '0')

    const columns_copy = [...column_names]
    columns_copy[index] = value

    setColumnNames([...columns_copy])
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const board_data = { ...board, column_names }
    const column_copy = [...columns]
    column_names.forEach((name, index) => column_copy[index].column_title = name)

    setColumns([...column_copy])

    await DB.updateBoardColumnNames(board_data)

    setShowSideMenu(false);
  }

  return (
    <aside className={`side-menu column ${showSideMenu ? 'show' : ''}`}>
      <button className="close-btn" onClick={closeMenu}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg>
      </button>

      <form onSubmit={handleSave} className="column">
        <h2 className="text-center">Edit Column Titles</h2>

        {column_names.map((name, index) => (
          <div key={index} className="column">
            <label>{name} Column</label>
            <input onChange={handleInputChange} type="text" data-index={index} value={column_names[index]} />
          </div>
        ))}

        <button>Save</button>
      </form>
    </aside>
  )
}
export default SideMenu