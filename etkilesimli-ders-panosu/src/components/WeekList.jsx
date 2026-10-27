import WeekCard from './WeekCard.jsx'

function WeekList({ weeks, selectedWeekId, currentWeekId, onSelect }) {
  return (
    <aside className="week-rail" aria-label="Hafta listesi">
      {weeks.map((week) => (
        <WeekCard
          key={week.id}
          week={week}
          isSelected={week.id === selectedWeekId}
          isCurrent={week.id === currentWeekId}
          isComplete={week.id < currentWeekId}
          onSelect={onSelect}
        />
      ))}
    </aside>
  )
}

export default WeekList
