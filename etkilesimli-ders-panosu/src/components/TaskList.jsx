
import { useState } from 'react'
import TaskItem from './TaskItem.jsx'
import EmptyState from './EmptyState.jsx'

function TaskList({
  tasks,
  taskStatus,
  onToggle,
  emptyMessage,
  weeks,
  selectedWeekId,
  onWeekChange,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLocaleLowerCase('tr-TR')
      .includes(searchTerm.trim().toLocaleLowerCase('tr-TR'))

    const isDone = Boolean(taskStatus[task.id])

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && isDone) ||
      (statusFilter === 'pending' && !isDone)

    return matchesSearch && matchesStatus
  })

  const tamamlanan = filteredTasks.filter(
    (task) => taskStatus[task.id],
  ).length

  return (
    <section className="task-panel">
      <div className="task-head">
        <h2>Görevler</h2>

        {filteredTasks.length > 0 && (
          <span className="task-count">
            {tamamlanan} / {filteredTasks.length} tamamlandı
          </span>
        )}
      </div>

      <div className="task-filters">
        <div className="task-search">
          <label htmlFor="task-search">Görev ara</label>
          <input
            id="task-search"
            type="search"
            placeholder="Görev başlığı yaz..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="task-filter-row">
          <div className="task-filter">
            <label htmlFor="task-status">Görev durumu</label>
            <select
              id="task-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Tüm görevler</option>
              <option value="completed">Tamamlananlar</option>
              <option value="pending">Tamamlanmayanlar</option>
            </select>
          </div>

          <div className="task-filter">
            <label htmlFor="task-week">Hafta</label>
            <select
              id="task-week"
              value={selectedWeekId}
              onChange={(event) => onWeekChange(Number(event.target.value))}
            >
              {weeks.map((week) => (
                <option key={week.id} value={week.id}>
                  {week.weekNumber}. Hafta
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          message={
            tasks.length === 0
              ? emptyMessage
              : searchTerm.trim()
                ? 'Aramanızla eşleşen görev bulunamadı.'
                : 'Seçilen filtrelere uygun görev bulunamadı.'
          }
        />
      ) : (
        <ul className="task-list">
          {filteredTasks.map((task) => (
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
