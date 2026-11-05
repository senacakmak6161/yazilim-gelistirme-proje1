/**
 * Patikadaki bir durak.
 *
 * Duraklar profil çiziminin altında, onunla aynı ızgarada durur: bir haftanın
 * üstündeki tepe o haftanın yükü, altındaki beş hücre o haftanın beş görevi.
 *
 * Sözleşme (TEST_CONTRACT.md §2): data-testid="week-card", role=button,
 * seçiliyken aria-pressed="true", erişilebilir ad görünen metinden oluşur ve
 * "Hafta 01" etiketiyle başlar.
 */
function WeekCard({ week, isSelected, isCurrent, isComplete, onSelect }) {
  const statusClass = isComplete
    ? 'is-complete'
    : isCurrent
      ? 'is-current'
      : 'is-upcoming'

  return (
    <button
      type="button"
      data-testid="week-card"
      aria-pressed={isSelected}
      className={`week-item ${statusClass} ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onSelect(week.id)}
    >
      <span className="week-head">
        <span className="week-label">
          Hafta {String(week.weekNumber).padStart(2, '0')}
        </span>
        {isCurrent ? <span className="now-badge">Şimdi</span> : null}
      </span>

      <span className="week-title">{week.title}</span>

      {/* Haftanın görevleri, birer hücre. Durum yalnızca renkle değil,
          dolu/boş biçimiyle de ayırt edilir. */}
      <span className="week-cells" aria-hidden="true">
        {week.cells.map((tamam, index) => (
          <span key={index} className={`week-cell ${tamam ? 'is-done' : ''}`} />
        ))}
      </span>

      <span className="week-summary">
        {week.summary}
        {week.yuk ? <span className="week-load">{week.yuk}</span> : null}
      </span>
    </button>
  )
}

export default WeekCard
