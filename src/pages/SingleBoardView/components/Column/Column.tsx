import { useDroppable } from '@dnd-kit/core'
import { Column as ColumnData } from '../../../types/Column'
import Task from '../Task'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import './Column.css'

interface ColumnProps {
  index: number;
  column_data: ColumnData;
  showAddTaskModal: (col_index: number) => void;
}

function Column({
  index,
  column_data,
  showAddTaskModal }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: `c${index}`
  })

  return (
    <section className={`column board-column type-${index + 1}`}>
      <h3 className="text-center">{column_data.column_title}</h3>
      <div ref={setNodeRef} className="task-container column">
        {!column_data.tasks.length && <p className="no-tasks">No Tasks Have Been Added</p>}

        <SortableContext items={column_data.tasks.map(task => task.id!)} strategy={verticalListSortingStrategy}>
          {column_data.tasks.map((task, task_index) => (
            <Task key={task.id} task_index={task_index} column_index={index} {...task} />
          ))}
        </SortableContext>

        <div className="spacer row justify-center align-center">
          <p>Drag and Drop Tasks</p>
        </div>
      </div>

      <button className="row align-center justify-center add-task-btn" onClick={() => showAddTaskModal(index)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg>
        <span>Add Task</span>
      </button>
    </section>
  )
}

export default Column