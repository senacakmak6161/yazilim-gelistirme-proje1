import { useState } from 'react'
import TaskItem from './TaskItem.jsx'
import EmptyState from './EmptyState.jsx'
import Icon from './Icon.jsx'

/**
 * Görev listesi, arama ve filtreler.
 *
 * Birden fazla haftanın görevleri listelendiğinde liste hafta hafta
 * bölünür. Otuz görev ayrımsız alt alta aktığında hangi haftanın nerede
 * başladığı görünmüyor ve liste 3800 piksel boyunca tekdüze uzuyordu.
 *
 * Kontroller tek satırda toplandı; etiketleri görsel olarak gizli ama ekran
 * okuyucuda duruyor — her kontrolün biçimi ne olduğunu zaten söylüyor.
 *
 * Sözleşme (tests/docs/TEST_CONTRACT.md §2):
 *   - durum filtresi: fieldset/legend "Görev durumu", sırayla
 *     Tümü / Devam edenler / Tamamlanan
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
  gruplar,
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

  function uyuyorMu(task) {
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
  }

  const suzulmus = gruplar
    .map((week) => ({ week, tasks: week.tasks.filter(uyuyorMu) }))
    .filter((grup) => grup.tasks.length > 0)

  const tumGorevler = gruplar.flatMap((week) => week.tasks)
  const gosterilen = suzulmus.reduce((toplam, grup) => toplam + grup.tasks.length, 0)
  const tamamlanan = tumGorevler.filter((task) => taskStatus[task.id]).length
  const suzuldu = gosterilen !== tumGorevler.length

  // Hafta başlığı yalnızca birden fazla hafta listeleniyorsa anlamlı
  const basliklarGerekli = gruplar.length > 1

  return (
    <section className="task-panel">
      <div className="task-head">
        <h3>Görevler</h3>

        {tumGorevler.length > 0 &&
          (() => {
            const metin = suzuldu
              ? `${gosterilen} / ${tumGorevler.length} gösteriliyor`
              : `${tamamlanan} / ${tumGorevler.length} tamamlandı`
            // Anahtar metinle birlikte değişir: React öğeyi yeniden kurar,
            // böylece sayaç her güncellemede kısa bir geçişle belirir
            return (
              <span className="task-count" key={metin}>
                {metin}
              </span>
            )
          })()}
      </div>

      <div className="task-controls">
        <div className="control search-control">
          <label className="sr-only" htmlFor="task-search">
            Görev ara
          </label>
          <Icon name="ara" className="search-icon" />
          <input
            id="task-search"
            type="search"
            placeholder="Görev ara"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <fieldset className="task-status">
          <legend className="sr-only">Görev durumu</legend>

          <div className="segmented">
            {STATUS_SECENEKLERI.map((secenek) => (
              <div className="segment" key={secenek.value}>
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

        <div className="control select-control">
          <label className="sr-only" htmlFor="task-week">
            Hafta
          </label>
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

      {gosterilen === 0 ? (
        <EmptyState
          message={
            // Listelenecek görev hiç yok / ölçütlere uyan yok
            tumGorevler.length === 0
              ? emptyMessage
              : 'Seçilen ölçütlere uygun görev bulunamadı.'
          }
        />
      ) : (
        suzulmus.map((grup) => (
          <div className="task-group" key={grup.week.id}>
            {basliklarGerekli ? (
              <p className="task-group-head">
                <span className="task-group-week">
                  Hafta {String(grup.week.weekNumber).padStart(2, '0')}
                </span>
                <span className="task-group-title">{grup.week.title}</span>
              </p>
            ) : null}

            <ul className="task-list">
              {grup.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isDone={Boolean(taskStatus[task.id])}
                  onToggle={onToggle}
                  zorlaAcik={aranan !== ''}
                />
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  )
}

export default TaskList
