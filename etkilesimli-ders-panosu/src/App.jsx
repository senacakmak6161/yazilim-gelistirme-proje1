import { useState } from 'react'
import WeekList from './components/WeekList.jsx'
import './App.css'

const weeks = [
  {
    id: 1,
    weekNumber: 1,
    title: 'HTML Yapısı ve Semantik',
    summary: '5 / 5 görev',
    description:
      'Web sayfasının iskeletini semantik HTML ile kurmayı öğreniyoruz.',
  },
  {
    id: 2,
    weekNumber: 2,
    title: 'CSS Yerleşim: Flexbox ve Grid',
    summary: '7 / 7 görev',
    description:
      'Sayfa düzenini esnek kutular ve ızgara sistemiyle oluşturuyoruz.',
  },
  {
    id: 3,
    weekNumber: 3,
    title: 'Form Doğrulama ve Olay Yönetimi',
    summary: '2 / 5 görev',
    description:
      'Kullanıcıdan gelen veriyi tarayıcı tarafında denetlemeyi, olay dinleyicilerini düzenli biçimde kurmayı ve hata durumunu kullanıcıya anlaşılır şekilde bildirmeyi çalışıyoruz.',
  },
  {
    id: 4,
    weekNumber: 4,
    title: 'Modüler JavaScript',
    summary: '2 görev',
    description: 'Kodları dosyalara bölerek daha okunur hale getirmeyi öğreniyoruz.',
  },
  {
    id: 5,
    weekNumber: 5,
    title: 'Tarayıcı Depolama',
    summary: '2 görev',
    description: 'Tarayıcıda veri saklamanın temellerini inceliyoruz.',
  },
  {
    id: 6,
    weekNumber: 6,
    title: 'Erişilebilirlik ve Teslim',
    summary: '2 görev',
    description: 'Erişilebilir bir arayüz hazırlayıp projeyi teslim etmeye odaklanıyoruz.',
  },
]

const currentWeekId = 3

function App() {
  const [selectedWeekId, setSelectedWeekId] = useState(currentWeekId)

  const selectedWeek = weeks.find((week) => week.id === selectedWeekId)

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
          <p className="progress-count">
            14 / 23 <span>görev</span>
          </p>
          <p className="progress-week">
            Hafta {selectedWeek.weekNumber} · {selectedWeek.title}
          </p>
        </div>
        <div className="progress-percent">
          <p className="percent-value">%61</p>
          <p className="percent-label">kat edilen yol</p>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: '61%' }} />
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
          <p className="detail-placeholder">
            Öğrenme hedefleri ve görev listesi sonraki adımlarda bu alana
            gelecek.
          </p>
        </main>
      </div>
    </div>
  )
}

export default App
