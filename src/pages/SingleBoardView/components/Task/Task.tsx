import { Task as TaskData } from '../../../types/Task'
import './Task.css'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities';

function Task({
  id,
  title,
  body,
  createdOn,
  status,
  task_index,
  column_index }: TaskData) {

  const { attributes, listeners, setNodeRef, transition, transform } = useSortable({ id: `${column_index}-${task_index}-${id}` })

  const dragStyles = {
    transition,
    transform: CSS.Translate.toString(transform)
  }

  return (
    <article
      data-id={id}
      data-column-index={column_index}
      data-task-index={task_index}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={dragStyles}
      className={`task status-${status}`}>
      <h4>{title}</h4>
      <p>{body}</p>
      <p className="date">• Added On: {createdOn}</p>
    </article>
  )
}

export default Task