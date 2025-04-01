import { Task as TaskData } from '../../../types/Task'
import './Task.css'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities';

function Task({
  id,
  title,
  character,
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
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={dragStyles}
      className={`task status-${status}`}>
      <div className="row align-center">
        <div className="image">
          <img src={character?.image} alt="Character Image" />
        </div>
        <div className="text">
          <h4>{title}</h4>
          <p className="assigned">{character?.name}</p>
          <p className="date">{createdOn}</p>
        </div>
      </div>
    </article>
  )
}

export default Task