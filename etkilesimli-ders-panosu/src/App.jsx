
import { useLayoutEffect, useState } from 'react'
import WeekList from './components/WeekList.jsx'
import TaskList from './components/TaskList.jsx'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { useMediaQuery } from './hooks/useMediaQuery.js'
import courses from './data/courses.json'
import './App.css'
import './responsive.css'
function resolveTheme(value) {
  return value === 'dark' ? 'dark' : 'light'
}

const GECERLI_DURUMLAR = ['all', 'active', 'completed']

/**
 * Kayıtlı filtre tercihini güvenli hâle getirir.
 * Sözleşme: okunamayan veya beklenmeyen değer uygulamayı düşürmez,
 * varsayılana dönülür.
 */
function resolveFilters(value, weeks) {
  const ham = value && typeof value === 'object' ? value : {}

  const status = GECERLI_DURUMLAR.includes(ham.status) ? ham.status : 'all'

  const haftaVar = weeks.some((week) => week.id === Number(ham.week))
  const week = haftaVar ? Number(ham.week) : 'all'

  return { status, week }
}

function isWeekComplete(week, taskStatus) {
  return week.tasks.length > 0 && week.tasks.every((task) => taskStatus[task.id])
}

function findCurrentWeek(weeks, taskStatus) {
  return weeks.find((week) => !isWeekComplete(week, taskStatus)) ?? weeks[weeks.length - 1]
}

function App() {
  const [taskStatus, setTaskStatus] = useLocalStorage('ddp.taskStatus', {})
  const [storedTheme, setStoredTheme] = useLocalStorage('ddp.theme', 'light')
  const [storedFilters, setStoredFilters] = useLocalStorage('ddp.filters', {
    status: 'all',
    week: 'all',
  })

  const theme = resolveTheme(storedTheme)
  const filters = resolveFilters(storedFilters, courses.weeks)

  const [selectedWeekId, setSelectedWeekId] = useState(() =>
    filters.week === 'all'
      ? findCurrentWeek(courses.weeks, taskStatus).id
      : filters.week,
  )
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const currentWeek = findCurrentWeek(courses.weeks, taskStatus)
  const currentWeekId = currentWeek.id
  const isStacked = useMediaQuery('(max-width: 1023px)')

  function toggleTask(taskId) {
    setTaskStatus((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  function setStatusFilter(status) {
    setStoredFilters((prev) => ({ ...resolveFilters(prev, courses.weeks), status }))
  }

  /** Hafta filtresi ve hafta kartı aynı durumu paylaşır. */
  function setWeekFilter(value) {
    const week = value === 'all' ? 'all' : Number(value)
    setStoredFilters((prev) => ({ ...resolveFilters(prev, courses.weeks), week }))
    if (week !== 'all') setSelectedWeekId(week)
  }

  function selectWeek(weekId) {
    setSelectedWeekId(weekId)
    setWeekFilter(weekId)
  }

  const currentWeekIndex = courses.weeks.indexOf(currentWeek)

  const weeks = courses.weeks.map((week, index) => {
    const tamamlanan = week.tasks.filter((task) => taskStatus[task.id]).length
    const baslanmadi =
      week.tasks.length === 0 || (index > currentWeekIndex && tamamlanan === 0)

    return {
      ...week,
      isComplete: isWeekComplete(week, taskStatus),
      summary: baslanmadi
        ? `${week.tasks.length} görev`
        : `${tamamlanan} / ${week.tasks.length} görev`,
    }
  })

  const selectedWeek = weeks.find((week) => week.id === selectedWeekId) ?? weeks[0]

  // Hafta filtresi listeyi belirler: "Tüm haftalar" ise bütün görevler sırayla
  const listelenecekGorevler =
    filters.week === 'all'
      ? weeks.flatMap((week) => week.tasks)
      : (weeks.find((week) => week.id === filters.week)?.tasks ?? [])

  // K8: ilerleme her zaman tüm görevler üzerinden hesaplanır, filtreden etkilenmez
  const tumGorevler = courses.weeks.flatMap((week) => week.tasks)
  const tamamlananToplam = tumGorevler.filter((task) => taskStatus[task.id]).length

  const yuzde =
    tumGorevler.length === 0
      ? 0
      : Math.round((tamamlananToplam / tumGorevler.length) * 100)

  const DetailTag = isStacked ? 'section' : 'main'

  const weekDetail = (
    <DetailTag className="week-detail">
      <p className="detail-kicker">
        Hafta {String(selectedWeek.weekNumber).padStart(2, '0')}
        {selectedWeek.id === currentWeekId ? ' · Bu hafta' : ''}
      </p>

      <h1>{selectedWeek.title}</h1>
      <p className="detail-description">{selectedWeek.description}</p>

      <section className="goals-panel" data-testid="goals-panel">
        <h2>Hafta {selectedWeek.weekNumber} Öğrenme Hedefleri</h2>

        {selectedWeek.objectives.length > 0 ? (
          <ul>
            {selectedWeek.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        ) : (
          <p>Bu hafta için henüz içerik eklenmemiş.</p>
        )}
      </section>

      <TaskList
        tasks={listelenecekGorevler}
        taskStatus={taskStatus}
        onToggle={toggleTask}
        weeks={weeks}
        filters={filters}
        onStatusChange={setStatusFilter}
        onWeekChange={setWeekFilter}
        emptyMessage={
          tumGorevler.length === 0
            ? 'Henüz görev bulunmuyor.'
            : 'Bu haftaya ait görev bulunmuyor.'
        }
      />
    </DetailTag>
  )

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-left">
          <span className="brand-mark" aria-hidden="true">
            ↷
          </span>
          <strong className="brand">Ders Patikası</strong>
          <span className="course-name">Web Programlama · 2026 Güz</span>
        </div>

        <button
  type="button"
  className="theme-button"
  aria-pressed={theme === 'dark'}
  onClick={() => setStoredTheme(theme === 'dark' ? 'light' : 'dark')}
>
  Karanlık tema
</button>
      </header>

      <section className="progress-band" aria-label="Öğrenme yolculuğu">
        <div className="progress-copy">
          <p className="eyebrow">Öğrenme yolculuğun</p>

          <p className="progress-count" data-testid="progress-text">
            {tamamlananToplam} / {tumGorevler.length}{' '}
            <span>görev tamamlandı</span>
          </p>

          <p className="progress-week">
            Hafta {currentWeek.weekNumber} · {currentWeek.title}
          </p>
        </div>

        <div className="progress-percent">
          <p className="percent-value" data-testid="progress-percent">
            %{yuzde}
          </p>
          <p className="percent-label">kat edilen yol</p>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-label="Genel ilerleme"
          aria-valuenow={yuzde}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Dolum genişlikle değil transform ile değişir: daha akıcı,
              tarayıcıda yeniden yerleşim (reflow) tetiklemez */}
          <div
            className="progress-fill"
            data-testid="progress-fill"
            style={{ transform: `scaleX(${yuzde / 100})` }}
          />
        </div>
      </section>

      {isStacked ? (
        <main className="workspace">
          <WeekList
            weeks={weeks}
            selectedWeekId={selectedWeekId}
            currentWeekId={currentWeekId}
            onSelect={selectWeek}
            detail={weekDetail}
          />
        </main>
      ) : (
        <div className="workspace">
          <WeekList
            weeks={weeks}
            selectedWeekId={selectedWeekId}
            currentWeekId={currentWeekId}
            onSelect={selectWeek}
          />
          {weekDetail}
        </div>
      )}
    </div>
  )
}

export default App
