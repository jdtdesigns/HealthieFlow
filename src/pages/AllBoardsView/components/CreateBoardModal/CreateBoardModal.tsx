import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BoardIcon } from '../../assets/Icons'

import { useStore } from '../../../../store'
import { DB } from '../../../../db'

function CreateBoardModal() {
  const navigate = useNavigate()
  const { state, setState } = useStore()!
  const [formData, setFormData] = useState({
    name: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const closeModal = (e?: React.FormEvent) => {
    e?.preventDefault()

    setState(oldState => ({
      ...oldState,
      showCreateBoardModal: false,
      modalError: ''
    }))
  }

  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      setState(oldState => ({
        ...oldState,
        modalError: 'You must supply a name'
      }))
      return
    }

    const board_id = await DB.createBoard(formData)

    setState(oldState => ({
      ...oldState,
      modalError: ''
    }))
    navigate('/board/' + board_id)

    closeModal()
  }

  return (
    <dialog onClick={e => e.stopPropagation()} className="modal board-modal row justify-center align-center">
      <div className="overlay" onClick={closeModal}></div>
      <div className="content">
        <form className="column">
          <div className="column align-center">
            <BoardIcon />
            <h4>Create New Task Board</h4>
          </div>
          {state.modalError && <p className="modal-error text-center">{state.modalError}</p>}
          <label htmlFor="board-name">Board Name</label>
          <input onChange={handleInputChange} type="text" name="name" placeholder="Type the board name" id="board-name" required autoFocus={true} />
          <button onClick={createBoard} className="submit row justify-center align-center">
            <span>Create Board</span>
          </button>
          <button className="cancel" onClick={closeModal}>Cancel</button>
        </form>
      </div>
    </dialog>
  )
}

export default CreateBoardModal