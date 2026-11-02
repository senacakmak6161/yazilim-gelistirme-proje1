/**
 * Tek bir görev satırı.
 *
 * Sözleşme (TEST_CONTRACT.md §2):
 *   - satır: data-testid="task-item", data-task-id="<id>"
 *   - başlık: data-testid="task-title"
 *   - kutu: role=checkbox, erişilebilir adı görev başlığı (<label for>)
 *   - tamamlandığında satırda "Tamamlandı" metni görünür
 */
function TaskItem({ task, isDone, onToggle }) {
  const inputId = `task-${task.id}`

  return (
    <li
      className={`task-item ${isDone ? 'is-done' : ''}`}
      data-testid="task-item"
      data-task-id={task.id}
    >
      <input
        id={inputId}
        type="checkbox"
        className="task-check"
        checked={isDone}
        onChange={() => onToggle(task.id)}
      />

      <div className="task-body">
        <label className="task-title" data-testid="task-title" htmlFor={inputId}>
          {task.title}
        </label>

        <div className="task-meta">
          {task.tags?.map((tag) => (
            <span className="task-tag" key={tag}>
              {tag}
            </span>
          ))}
          {task.dueDate ? <span className="task-due">{task.dueDate}</span> : null}
          {isDone ? <span className="task-done">Tamamlandı</span> : null}
        </div>
      </div>
    </li>
  )
}

export default TaskItem
