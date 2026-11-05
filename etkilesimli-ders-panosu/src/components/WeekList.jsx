import WeekCard from './WeekCard.jsx'

/**
 * Patikanın durak sırası.
 *
 * Eskiden sol kenarda dikey bir şeritti; yatağa çevrildi çünkü dikey şerit
 * masaüstünde sağda 500 px ölü alan bırakıyordu ve haftalar arasındaki
 * tırmanış görünmüyordu. Yatay dizilim, üstündeki yükselti profiliyle aynı
 * ızgarayı paylaşır: her durak kendi tepesinin altında durur.
 */
function WeekList({ weeks, selectedWeekId, currentWeekId, onSelect }) {
  return (
    <div className="week-rail" role="group" aria-label="Hafta listesi">
      {weeks.map((week) => (
        <WeekCard
          key={week.id}
          week={week}
          isSelected={week.id === selectedWeekId}
          isCurrent={week.id === currentWeekId}
          isComplete={week.isComplete}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default WeekList
