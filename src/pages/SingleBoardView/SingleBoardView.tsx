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

interface BoardData {
  id: number;
  name: string;
}


function SingleBoardView() {
  const { board_id } = useParams()
  const navigate = useNavigate()
  const { state, setState } = useStore()!
  const [board, setBoard] = useState<BoardData | null>(null)
  const [columns, setColumns] = useState<ColumnData[] | []>([])
  const [column_index, setColumnIndex] = useState<number>(0)
  const [activeTask, setActiveTask] = useState<null | TaskData>(null)
  const previousHoveredTask = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (board_id) {
      const id = parseInt(board_id)

      DB.getBoardById(id)
        .then(boardData => {
          if (!boardData.board) return navigate('/')

          setBoard({ ...boardData.board })

          const column_data = state.column_names.map((name: string, index: number) => ({
            column_title: name,
            tasks: boardData.tasks[index]
          }))

          setColumns(column_data)
        });

    }
  }, [board_id])

  const showAddTaskModal = (col_index: number) => {
    setColumnIndex(col_index)
    setState(oldState => ({
      ...oldState,
      showAddTaskModal: true
    }))
  }

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


        previousHoveredTask.current = hovered_task as HTMLElement
      }
    } else {
      // If no task is hovered, clear the hover effects from the previous task
      if (previousHoveredTask.current) {
        previousHoveredTask.current.classList.remove('hover-top', 'hover-bottom')
      }
    }
  }

  const handleDragStart = async (event: DragStartEvent) => {
    const { active } = event

    const active_task_value = active.id as string
    const dragged_task = await DB.getTaskById(parseInt(active_task_value.split('-')[2]))


    setActiveTask({ ...dragged_task })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const dragged_value = active.id as string
    const over_value = over.id as string


    // Task dropped over another task
    if (!over_value.includes('c')) {
      const dragged_column_index = parseInt(dragged_value.split('-')[0])
      const dragged_task_index = parseInt(dragged_value.split('-')[1])
      const over_column_index = parseInt(over_value.split('-')[0])
      const over_task_index = parseInt(over_value.split('-')[1])

      // Task was dropped into the same column
      if (dragged_column_index === over_column_index) {
        const target_column = { ...columns[dragged_column_index] }
        // Place the task in the new position
        const reordered_tasks = arrayMove(target_column.tasks, dragged_task_index, over_task_index)

        const columns_copy = [...columns]
        columns_copy[dragged_column_index].tasks = reordered_tasks

        setColumns([...columns_copy])
      } else {
        // Task was dropped into another column over a task
        const old_column = { ...columns[dragged_column_index] }
        const target_column = { ...columns[over_column_index] }

        const [task] = old_column.tasks.splice(dragged_task_index, 1)
        target_column.tasks.push(task)

        const reordered_tasks = arrayMove(target_column.tasks, dragged_task_index, over_task_index)

        columns[dragged_column_index].tasks = reordered_tasks

        const columns_copy = [...columns]
        columns_copy[dragged_column_index] = old_column
        columns_copy[over_column_index] = target_column

        setColumns([...columns_copy])
      }
      return
    }

    // Task was dropped onto a column
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

    const columns_copy = [...columns]
    columns_copy[dragged_column_index] = old_column
    columns_copy[over_column_index] = target_column

    setColumns([...columns_copy])
  }

  return (
    <main>
      <NavLink to="/boards" className="back-link">Go Back</NavLink>

      <h1 className="text-center">{board?.name}</h1>

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
    </main>
  )
}

export default SingleBoardView