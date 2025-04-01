import { useStore } from '../../../../store'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'

import { DB } from '../../../../db'
import { Column } from '../../../types/Column'
import './AddTaskModal.css'

import { GET_CHARACTERS } from '../../../../graphql/queries'

interface TaskModalProps {
  board_id: number;
  column_index: number | null;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>
}

function AddTaskModal({
  board_id,
  column_index,
  columns,
  setColumns }: TaskModalProps) {

  const navigate = useNavigate()
  const { state, setState } = useStore()!
  const { data: characterData } = useQuery(GET_CHARACTERS)
  const [formData, setFormData] = useState({
    title: '',
    character: characterData?.characters?.results[0] || null
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const name = e.target.name

    console.log('value', e.target.value)
    console.log('result', characterData.characters.results[e.target.value])

    setFormData({
      ...formData,
      [name]: name === 'character' ? characterData.characters.results[e.target.value] : e.target.value
    })
  }

  const closeModal = (event?: React.FormEvent) => {
    event?.preventDefault()

    setState(oldState => ({
      ...oldState,
      showAddTaskModal: false,
      modalError: ''
    }))
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      setState(oldState => ({
        ...oldState,
        modalError: 'You must supply a title'
      }))
      return
    }

    const task = await DB.addTask(board_id, {
      ...formData,
      status: column_index! + 1
    })
    const column_data = [...columns]

    column_data[column_index!].tasks.push(task)

    setColumns([...column_data])
    navigate('/board/' + board_id)

    setState(oldState => ({
      ...oldState,
      modalError: ''
    }))
    closeModal()
  }

  return (
    <dialog onClick={e => e.stopPropagation()} className="modal row justify-center align-center">
      <div className="overlay" onClick={closeModal}></div>
      <div className={`content type-${column_index! + 1}`}>
        <form className="column">
          <div className="column align-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg>
            <h4 className="text-center">Add {columns[column_index!].column_title} Task</h4>
          </div>
          {state.modalError && <p className="modal-error text-center">{state.modalError}</p>}
          <label htmlFor="task-title">Task Title</label>
          <input onChange={handleInputChange} type="text" name="title" placeholder="Type the task title" id="task-title" autoFocus={true} />
          <label htmlFor="task-title">Assign a Character</label>

          <select onChange={handleInputChange} name="character">
            {characterData && characterData.characters.results.map((char: any, index: number) => (
              <option key={index} value={index}>{char.name}</option>
            ))}
          </select>
          <button onClick={addTask} className="submit row justify-center align-center">
            <span>Add Task</span>
          </button>
          <button className="cancel" onClick={closeModal}>Cancel</button>
        </form>
      </div>
    </dialog>
  )
}

export default AddTaskModal