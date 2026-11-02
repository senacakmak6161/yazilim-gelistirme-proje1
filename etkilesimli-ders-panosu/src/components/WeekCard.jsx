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
      aria-label={`Hafta ${week.weekNumber}: ${week.title}`}
      className={`week-item ${statusClass} ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onSelect(week.id)}
    >
      <span className="week-dot" aria-hidden="true" />
      <span className="week-copy">
        <span className="week-label">
          Hafta {String(week.weekNumber).padStart(2, '0')}
        </span>
        <span className="week-title">{week.title}</span>
        {isCurrent ? <span className="now-badge">Şimdi</span> : null}
        <span className="week-summary">{week.summary}</span>
      </span>
    </button>
  )
}

export default WeekCard
