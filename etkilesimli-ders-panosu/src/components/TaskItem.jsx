import { useState } from 'react'
import Icon from './Icon.jsx'
import { ETIKET_IKONU } from '../lib/ders.js'
import { gorevVurgula, vurguyuKaldir } from '../lib/vurgu.js'

/**
 * Tek bir görev satırı.
 *
 * Açıklama varsayılan olarak katlı duruyor. Otuz görevin açıklaması birden
 * açıkken liste dört bin pikseli aşıyor ve taranamaz hâle geliyordu.
 * Arama yapılırken hepsi kendiliğinden açılır: arama açıklamalarda da
 * eşleştiği için, eşleşmenin gizli kalması kullanıcıyı yanıltırdı.
 *
 * Satırın solundaki onay kutusu özel çizildi: tarayıcının kendi kutusu her
 * işletim sisteminde farklı görünüyor ve tasarımın geri kalanına oturmuyordu.
 * Altında gerçek bir <input type="checkbox"> duruyor, yalnızca görünümü bizim.
 *
 * Sözleşme (TEST_CONTRACT.md §2):
 *   - satır: data-testid="task-item", data-task-id="<id>"
 *   - başlık: data-testid="task-title"
 *   - kutu: role=checkbox, erişilebilir adı görev başlığı (<label for>)
 *   - tamamlandığında satırda "Tamamlandı" metni görünür
 */
function TaskItem({ task, isDone, onToggle, zorlaAcik }) {
  const [acik, setAcik] = useState(false)
  const inputId = `task-${task.id}`
  const aciklamaId = `task-desc-${task.id}`

  const gorunur = zorlaAcik || acik
  const aciklamaVar = Boolean(task.description)

  return (
    <li
      className={`task-item ${isDone ? 'is-done' : ''} ${gorunur ? 'is-open' : ''}`}
      data-testid="task-item"
      data-task-id={task.id}
      // Satıra gelince bu görevin patikadaki adım izi parlar
      onMouseEnter={() => gorevVurgula(task.id)}
      onMouseLeave={vurguyuKaldir}
    >
      <span className="check-slot">
        <input
          id={inputId}
          type="checkbox"
          className="task-check"
          checked={isDone}
          onChange={() => onToggle(task.id)}
        />
        <span className="check-face" aria-hidden="true">
          <Icon name="onay" size={12} />
        </span>
      </span>

      <div className="task-body">
        <div className="task-line">
          <label className="task-title" data-testid="task-title" htmlFor={inputId}>
            {task.title}
          </label>

          {aciklamaVar && !zorlaAcik ? (
            <button
              type="button"
              className="task-disclose"
              aria-expanded={acik}
              aria-controls={aciklamaId}
              onClick={() => setAcik((onceki) => !onceki)}
            >
              <span className="sr-only">
                {acik ? 'Açıklamayı gizle' : 'Açıklamayı göster'}
              </span>
              <Icon name="ok" size={14} />
            </button>
          ) : null}
        </div>

        {aciklamaVar && gorunur ? (
          <p className="task-description" id={aciklamaId}>
            {task.description}
          </p>
        ) : null}

        <div className="task-meta">
          {task.tags?.map((tag) => (
            <span className={`task-tag ${tag}`} key={tag}>
              <Icon name={ETIKET_IKONU[tag]} size={13} />
              {tag}
            </span>
          ))}

          {task.estimatedMinutes ? (
            <span className="task-time">{task.estimatedMinutes} dk</span>
          ) : null}

          {isDone ? <span className="task-done">Tamamlandı</span> : null}
        </div>
      </div>
    </li>
  )
}

export default TaskItem
