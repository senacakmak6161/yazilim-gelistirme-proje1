import { useSayac } from '../hooks/useSayac.js'

/**
 * Üst şeritteki küçük ilerleme göstergesi.
 *
 * Yalnızca asıl ilerleme bandı ekrandan çıkınca belirir. Liste uzun olduğu
 * için görev işaretlerken patika da sayaç da görünmüyordu; ne yaptığının
 * karşılığını göremeden tıklamak kör bir iş.
 *
 * Sözleşmedeki `data-testid` ve `role=progressbar` değerlerini taşımaz:
 * ekranda tek bir ilerleme göstergesi olmalı, bu onun yankısı. Bu yüzden
 * ekran okuyucudan da gizli.
 */
function ProgressMini({ tamamlanan, toplam, yuzde }) {
  const gosterilenTamam = useSayac(tamamlanan)
  const gosterilenYuzde = useSayac(yuzde)

  return (
    <div className="progress-mini" aria-hidden="true">
      <span className="mini-count">
        {gosterilenTamam} / {toplam}
      </span>
      <span className="mini-track">
        <span
          className="mini-fill"
          style={{ transform: `scaleX(${gosterilenYuzde / 100})` }}
        />
      </span>
      <span className="mini-percent">%{gosterilenYuzde}</span>
    </div>
  )
}

export default ProgressMini
