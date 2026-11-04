import { useState } from 'react'
import TaskItem from './TaskItem.jsx'
import EmptyState from './EmptyState.jsx'

/**
 * Görev listesi, arama ve filtreler.
 *
 * Sözleşme (tests/docs/TEST_CONTRACT.md §2):
 *   - durum filtresi: fieldset/legend "Görev durumu", sırayla
 *     Tümü / Devam edenler / Tamamlanan radyo düğmeleri
 *   - hafta filtresi: combobox "Hafta", ilk seçenek "Tüm haftalar",
 *     ardından "Hafta N – <başlık>" (uzun tire)
 *   - arama: role=searchbox, ad "Görev ara"
 *
 * Kararlar: K3 (ölçütler VE ile birleşir), K5 (tr-TR arama),
 * A2 (arama başlık ve açıklamada yapılır).
 */

const STATUS_SECENEKLERI = [
  { value: 'all', label: 'Tümü' },
  { value: 'active', label: 'Devam edenler' },
  { value: 'completed', label: 'Tamamlanan' },
]

function kucult(text) {
  return String(text ?? '').toLocaleLowerCase('tr-TR')
}

function TaskList({
  tasks,
  taskStatus,
  onToggle,
  emptyMessage,
  weeks,
  filters,
  onStatusChange,
  onWeekChange,
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const aranan = kucult(searchTerm.trim())

  const filteredTasks = tasks.filter((task) => {
    // A2: arama hem başlıkta hem açıklamada
    const matchesSearch =
      aranan === '' ||
      kucult(task.title).includes(aranan) ||
      kucult(task.description).includes(aranan)

    const isDone = Boolean(taskStatus[task.id])

    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'completed' && isDone) ||
      (filters.status === 'active' && !isDone)

    // K3: tüm ölçütler birlikte (VE) uygulanır
    return matchesSearch && matchesStatus
  })

  const tamamlanan = tasks.filter((task) => taskStatus[task.id]).length

  return (
    <section className="task-panel">
      <div className="task-head">
        <h2>Görevler</h2>

        {tasks.length > 0 && (
          <span className="task-count">
            {tamamlanan} / {tasks.length} tamamlandı
          </span>
        )}
      </div>

      <div className="task-filters">
        <div className="task-search">
          <label htmlFor="task-search">Görev ara</label>
          <input
            id="task-search"
            type="search"
            placeholder="Görev başlığı veya açıklaması yaz..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="task-filter-row">
          <fieldset className="task-status">
            <legend>Görev durumu</legend>

            <div className="task-status-options">
              {STATUS_SECENEKLERI.map((secenek) => (
                <div className="task-status-option" key={secenek.value}>
                  <input
                    type="radio"
                    id={`status-${secenek.value}`}
                    name="task-status"
                    value={secenek.value}
                    checked={filters.status === secenek.value}
                    onChange={() => onStatusChange(secenek.value)}
                  />
                  <label htmlFor={`status-${secenek.value}`}>{secenek.label}</label>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="task-filter">
            <label htmlFor="task-week">Hafta</label>
            <select
              id="task-week"
              value={filters.week === 'all' ? 'all' : String(filters.week)}
              onChange={(event) => onWeekChange(event.target.value)}
            >
              <option value="all">Tüm haftalar</option>
              {weeks.map((week) => (
                <option key={week.id} value={String(week.id)}>
                  {`Hafta ${week.weekNumber} – ${week.title}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          message={
            // M3 / M4: listelenecek görev hiç yok
            // M2: görev var ama ölçütlere uyan yok
            tasks.length === 0 ? emptyMessage : 'Seçilen ölçütlere uygun görev bulunamadı.'
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
