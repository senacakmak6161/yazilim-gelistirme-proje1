import TaskItem from './TaskItem.jsx'
import EmptyState from './EmptyState.jsx'

/**
 * Seçili haftanın görev listesi ve sayacı.
 * Görev durumu burada tutulmaz; App'ten prop olarak gelir ve
 * değişiklik onToggle ile yukarı iletilir (tek doğruluk kaynağı).
 */
function TaskList({ tasks, taskStatus, onToggle, emptyMessage }) {
  const tamamlanan = tasks.filter((task) => taskStatus[task.id]).length

  return (
    <section className="task-panel">
      <div className="task-head">
        <h2>Görevler</h2>
        {tasks.length > 0 ? (
          <span className="task-count">
            {tamamlanan} / {tasks.length} tamamlandı
          </span>
        ) : null}
      </div>

      {tasks.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isDone={Boolean(taskStatus[task.id])}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export default TaskList
