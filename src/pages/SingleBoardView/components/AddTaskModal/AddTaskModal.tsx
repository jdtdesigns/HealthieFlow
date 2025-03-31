import { useStore } from '../../../../store'
import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'

import { DB } from '../../../../db'
import { Column } from '../../../types/Column'
import './AddTaskModal.css'

interface TaskModalProps {
  board_id: number;
  column_index: number | null;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>
}

function TaskModal({
  board_id,
  column_index,
  columns,
  setColumns }: TaskModalProps) {

  // const navigate = useNavigate()
  const { state, setState } = useStore()!
  const [formData, setFormData] = useState({
    title: '',
    body: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const closeModal = (event?: React.FormEvent) => {
    event?.preventDefault()

    setState(oldState => ({
      ...oldState,
      showTaskModal: false
    }))
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()

    const task = await DB.addTask(board_id, {
      ...formData,
      status: column_index! + 1
    })
    const column_data = [...columns]

    column_data[column_index!].tasks.push(task)

    setColumns([...column_data])
    // navigate('/board/' + board_id)

    closeModal()
  }

  return (
    <dialog onClick={e => e.stopPropagation()} className="modal row justify-center align-center">
      <div className="overlay" onClick={closeModal}></div>
      <div className={`content type-${column_index! + 1}`}>
        <form className="column">
          <div className="column align-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg>
            <h4 className="text-center">Add {state.column_names[column_index!]} Task</h4>
          </div>
          <label htmlFor="task-title">Task Title</label>
          <input onChange={handleInputChange} type="text" name="title" placeholder="Type the task title" id="task-title" autoFocus={true} required />
          <label htmlFor="task-body">Task Notes</label>
          <textarea onChange={handleInputChange} name="body" id="task-body" placeholder="Type notes for the task"></textarea>
          <button onClick={addTask} className="submit row justify-center align-center">
            <span>Add Task</span>
          </button>
          <button className="cancel" onClick={closeModal}>Cancel</button>
        </form>
      </div>
    </dialog>
  )
}

export default TaskModal