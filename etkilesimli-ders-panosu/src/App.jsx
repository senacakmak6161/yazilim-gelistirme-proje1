import { useState } from 'react'
import WeekList from './components/WeekList.jsx'
import courses from './data/courses.json'
import './App.css'


// Bulunulan hafta: içeriğin tamamlanma durumuna değil, dersin takvimine bağlıdır.
// Şimdilik sabit; ileride tarihe göre hesaplanabilir.
const currentWeekId = 3

function App() {
  // Görev durumları tek kaynaktan yönetilir (sözleşme: ddp.taskStatus)
  // YGP1-39 kapsamında localStorage'a bağlanacak.
  const [taskStatus] = useState({})
  const [selectedWeekId, setSelectedWeekId] = useState(currentWeekId)

  // Haftalar courses.json'dan gelir; görev sayacı veriden hesaplanır
  const weeks = courses.weeks.map((week) => {
    const tamamlanan = week.tasks.filter((task) => taskStatus[task.id]).length
    return { ...week, summary: `${tamamlanan} / ${week.tasks.length} görev` }
  })

  const selectedWeek = weeks.find((week) => week.id === selectedWeekId)

  // Genel ilerleme — sabit değil, veriden türetilir
  const tumGorevler = courses.weeks.flatMap((week) => week.tasks)
  const tamamlananToplam = tumGorevler.filter((task) => taskStatus[task.id]).length
  const yuzde =
    tumGorevler.length === 0
      ? 0
      : Math.round((tamamlananToplam / tumGorevler.length) * 100)

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
        <button type="button" className="theme-button">
          Karanlık tema
        </button>
      </header>

      <section className="progress-band" aria-label="Öğrenme yolculuğu">
        <div className="progress-copy">
          <p className="eyebrow">Öğrenme yolculuğun</p>
          <p className="progress-count" data-testid="progress-text">
            {tamamlananToplam} / {tumGorevler.length} <span>görev tamamlandı</span>
          </p>
          <p className="progress-week">
            Hafta {selectedWeek.weekNumber} · {selectedWeek.title}
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
          <div
            className="progress-fill"
            data-testid="progress-fill"
            style={{ width: `${yuzde}%` }}
          />
        </div>
      </section>

      <div className="workspace">
        <WeekList
          weeks={weeks}
          selectedWeekId={selectedWeekId}
          currentWeekId={currentWeekId}
          onSelect={setSelectedWeekId}
        />

        <main className="week-detail">
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

          <p className="detail-placeholder">
            Görev listesi sonraki adımda bu alana gelecek.
          </p>
        </main>
      </div>
    </div>
  )
}

export default App
