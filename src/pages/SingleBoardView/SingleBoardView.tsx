import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, NavLink } from 'react-router-dom'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  rectIntersection
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

import { useStore } from '../../store'
import { Column as ColumnData } from '../types/Column'
import { DB } from '../../db'
import './SingleBoardView.css'

import AddTaskModal from './components/AddTaskModal'
import Column from './components/Column'
import { Task as TaskData } from '../types/Task'
import Task from './components/Task'
import SingleBoardHeader from './components/SingleBoardHeader'
import SideMenu from './components/SideMenu'
import Confetti from './components/Confetti/'

interface BoardData {
  id: number;
  name: string;
}


/**
 * Shows a single Board.
 * It handles the display of the drag/drop columns
 * for reordering and moving tasks between columns.
 *
 */
function SingleBoardView() {
  const { board_id } = useParams()
  const navigate = useNavigate()
  const { state, setState } = useStore()!
  const [board, setBoard] = useState<BoardData | null>(null)
  const [columns, setColumns] = useState<ColumnData[] | []>([])
  const [column_index, setColumnIndex] = useState<number>(0)
  const [activeTask, setActiveTask] = useState<null | TaskData>(null)
  const previousHoveredTask = useRef<HTMLElement | null>(null)
  const [showSideMenu, setShowSideMenu] = useState<boolean>(false)
  const [showConfetti, setShowConfetti] = useState<boolean>(false)

  useEffect(() => {
    if (board_id) {
      const id = parseInt(board_id)

      DB.getBoardById(id)
        .then(boardData => {
          if (!boardData.board) return navigate('/')

          // Store basic board data
          setBoard({ ...boardData.board })

          // Generate the column data using the column names stored in the DB
          const column_data = boardData.board.column_names.map((name: string, index: number) => ({
            column_title: name,
            // Use the index to grab the corresponding tasks for the column
            tasks: boardData.tasks[index]
          }))

          setColumns(column_data)
        })

    }
  }, [board_id])

  const showAddTaskModal = (col_index: number) => {
    setColumnIndex(col_index)
    setState(oldState => ({
      ...oldState,
      showAddTaskModal: true
    }))
  }

  // Basic function to show conffetti that times out
  const launchConfetti = () => {
    setShowConfetti(true)

    setTimeout(() => {
      setShowConfetti(false)
    }, 15 * 1000)
  }

  /**
   * Handles the dragging of elements over a task or column
   * It generates the border effects on hovered over tasks 
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event

    const id = over?.id as string

    // The active task is hovering over another task
    if (id && !id.includes('c')) {
      const task_id = id.split('-')[2]
      const hovered_task = document.querySelector(`.task[data-id="${task_id}"]`)

      if (hovered_task) {

        // Clear any previously hovered task's border effects
        if (previousHoveredTask.current && previousHoveredTask.current !== hovered_task) {
          previousHoveredTask.current.classList.remove('hover-top', 'hover-bottom')
        }

        // Determine if the active task is above or below a hovered over task to create a hover border effect
        const hovered_task_bounds = hovered_task.getBoundingClientRect()
        const dragged_task_bounds = active.rect.current.translated


        if (dragged_task_bounds) {
          // Add some space around the dragged task
          const box_padding = hovered_task_bounds.height * 0.4

          // Calculate the top and bottom hover zones, based on the extra padding
          const top_hover_end = hovered_task_bounds.top + box_padding
          const bottom_hover_start = hovered_task_bounds.bottom - box_padding

          // Determine if the top or bottom edge of the dragged task is in the top or bottom hover zone
          const is_in_top_zone =
            dragged_task_bounds.top < top_hover_end && dragged_task_bounds.bottom > hovered_task_bounds.top
          const is_in_bottom_zone =
            dragged_task_bounds.bottom > bottom_hover_start && dragged_task_bounds.top < hovered_task_bounds.bottom

          // Add/Remove drag/drop borders for the hovered over tasks
          if (is_in_top_zone) {
            hovered_task.classList.add('hover-top')
            hovered_task.classList.remove('hover-bottom')
          } else if (is_in_bottom_zone) {
            hovered_task.classList.add('hover-bottom')
            hovered_task.classList.remove('hover-top')
          } else {
            // If neither edge is in a hover zone, remove hover borders
            hovered_task.classList.remove('hover-top', 'hover-bottom')
          }
        }

        // Track the previously hovered element
        previousHoveredTask.current = hovered_task as HTMLElement
      }
    } else {
      // If no task is hovered over, clear the hover effects from the previous task

      if (previousHoveredTask.current) {
        previousHoveredTask.current.classList.remove('hover-top', 'hover-bottom')
      }
    }
  }

  /**
   * Handles the logic for when a user picks up a tasks.
   * It generates a 'virtual' task that can be moved around
   */
  const handleDragStart = async (event: DragStartEvent) => {
    const { active } = event

    const active_task_value = active.id as string
    const dragged_task = await DB.getTaskById(parseInt(active_task_value.split('-')[2]))

    setActiveTask({ ...dragged_task })
  }

  /**
   * Handles the logic for sorting tasks and for dropping tasks into other columns 
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const dragged_value = active.id as string
    const over_value = over.id as string
    const dragged_task_id = parseInt(dragged_value.split('-')[2])


    // Task dropped over another task
    if (!over_value.includes('c')) {
      const dragged_data = dragged_value.split('-')
      const over_data = over_value.split('-')
      const dragged_column_index = parseInt(dragged_data[0])
      const dragged_task_index = parseInt(dragged_data[1])
      const over_column_index = parseInt(over_data[0])
      const over_task_index = parseInt(over_data[1])
      const over_task_id = parseInt(over_data[2])

      // Task was dropped into the same column
      if (dragged_column_index === over_column_index) {
        const target_column = { ...columns[dragged_column_index] }
        // Place the task in the new position
        const reordered_tasks = arrayMove(target_column.tasks, dragged_task_index, over_task_index)

        const columns_copy = [...columns]
        columns_copy[dragged_column_index].tasks = reordered_tasks

        const task_el = document.querySelector(`.task[data-id="${dragged_task_id}"]`)
        if (task_el) {
          task_el.setAttribute('class', `task status-${over_column_index + 1}`)
        }

        // Update the both task's orders in the database
        const dragged_task = target_column.tasks.find(task => task.id === dragged_task_id)
        const over_task = target_column.tasks.find(task => task.id === over_task_id)

        if (dragged_task) {
          dragged_task.order = over_task_index
          await DB.updateTaskOrder(dragged_task_id, over_task_index)
        }
        ``
        if (over_task) {
          over_task.order = dragged_task_index
          await DB.updateTaskOrder(over_task_id, dragged_task_index)
        }

        setColumns([...columns_copy])
      } else {
        // Task was dropped into another column over a task
        const old_column = { ...columns[dragged_column_index] }
        const target_column = { ...columns[over_column_index] }

        const [task] = old_column.tasks.splice(dragged_task_index, 1)
        task.status = over_column_index + 1
        target_column.tasks.push(task)

        const reordered_tasks = arrayMove(target_column.tasks, dragged_task_index, over_task_index)
        const new_index = reordered_tasks.findIndex((task: TaskData) => task.id === dragged_task_id)

        columns[dragged_column_index].tasks = reordered_tasks

        // Update the task's order and status in the database
        await DB.updateTaskStatus(dragged_task_id, over_column_index + 1)
        await DB.updateTaskOrder(dragged_task_id, new_index)

        const columns_copy = [...columns]
        columns_copy[dragged_column_index] = old_column
        columns_copy[over_column_index] = target_column

        if (over_column_index === 2) {
          launchConfetti()
        }

        setColumns([...columns_copy])
      }
      return
    }

    /* Handle dropping task into column */
    const dragged_column_index = parseInt(dragged_value.split('-')[0])
    const dragged_task_index = parseInt(dragged_value.split('-')[1])
    const over_column_index = parseInt(over_value[1])

    // Task was dropped into the same column so we exit
    if (dragged_column_index === over_column_index) return

    // Task was droppped into another column
    const old_column = { ...columns[dragged_column_index] }
    const target_column = { ...columns[over_column_index] }

    // Add the task to the bottom of the column
    const [task] = old_column.tasks.splice(dragged_task_index, 1)
    target_column.tasks.push(task)

    const new_task_index = target_column.tasks.length - 1
    // Update the task's order and status in the database
    await DB.updateTaskOrder(dragged_task_id, new_task_index)
    await DB.updateTaskStatus(dragged_task_id, over_column_index + 1)

    task.status = over_column_index + 1
    task.order = new_task_index

    const columns_copy = [...columns]
    columns_copy[dragged_column_index] = old_column
    columns_copy[over_column_index] = target_column

    // If a task is dropped on the Done column show confetti
    if (over_column_index === 2) {
      launchConfetti()
    }

    setColumns([...columns_copy])
  }

  return (
    <main className="single-board">
      <SingleBoardHeader setShowSideMenu={setShowSideMenu} />

      {showConfetti && <Confetti />}

      <h1 className="text-center single-header-text">
        <NavLink to="/boards" className="back-link">Go Back</NavLink>
        <span>{board?.name}</span>
      </h1>

      <div className="column-container">
        <DndContext
          collisionDetection={rectIntersection}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}>
          {columns.map((column_data, index) => (
            <Column
              key={index}
              index={index}
              column_data={column_data}
              showAddTaskModal={showAddTaskModal} />
          ))}

          <DragOverlay>
            {activeTask ? (
              <div className="active-task">
                <Task {...activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {state.showAddTaskModal &&
        <AddTaskModal
          board_id={parseInt(board_id!)}
          column_index={column_index}
          columns={columns}
          setColumns={setColumns} />}

      {board &&
        <SideMenu
          setColumns={setColumns}
          columns={columns}
          board={board}
          showSideMenu={showSideMenu}
          setShowSideMenu={setShowSideMenu} />}
    </main>
  )
}

export default SingleBoardView