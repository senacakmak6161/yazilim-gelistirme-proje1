import { Fragment } from 'react'
import WeekCard from './WeekCard.jsx'

function WeekList({ weeks, selectedWeekId, currentWeekId, onSelect, detail }) {
  const Rail = detail ? 'div' : 'aside'

  return (
    <Rail className="week-rail" role={detail ? 'group' : undefined} aria-label="Hafta listesi">
      {weeks.map((week) => (
        <Fragment key={week.id}>
          <WeekCard
            week={week}
            isSelected={week.id === selectedWeekId}
            isCurrent={week.id === currentWeekId}
            isComplete={week.isComplete}
            onSelect={onSelect}
          />
          {detail && week.id === selectedWeekId ? (
            <div className={`week-inline ${week.isComplete ? 'is-complete' : ''}`}>
              {detail}
            </div>
          ) : null}
        </Fragment>
      ))}
    </Rail>
  )
}

export default WeekList
