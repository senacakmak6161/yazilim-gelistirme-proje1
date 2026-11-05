import { useSayac } from '../hooks/useSayac.js'

/**
 * İlerleme sayıları ve çubuğu.
 *
 * Kendi bileşeninde duruyor çünkü sayaç animasyonu her karede yeni bir
 * render tetikliyor. App içinde kalsaydı patika geometrisi ve yüzlerce
 * görev satırı da her karede yeniden hesaplanırdı; 100 görevlik veriyle
 * ölçülen tepki süresi 300 ms bütçesini aşıyordu. Burada yalnızca bu üç
 * sayı yeniden çiziliyor.
 *
 * Metin, yüzde ve aria-valuenow aynı animasyonlu değerden besleniyor:
 * sözleşme gereği hepsi her an birbiriyle tutarlı olmalı.
 *
 * Sözleşme (TEST_CONTRACT.md §2):
 *   - data-testid="progress-text"    → "X / Y görev tamamlandı"
 *   - data-testid="progress-percent" → "%N"
 *   - role=progressbar, ad "Genel ilerleme", aria-valuenow = yüzde
 *   - data-testid="progress-fill"    → dolgu, genişliği yüzdeyle orantılı
 */
function ProgressBand({ tamamlanan, toplam, yuzde, children, basRef }) {
  const gosterilenTamam = useSayac(tamamlanan)
  const gosterilenYuzde = useSayac(yuzde)

  return (
    <>
      {/* Gözlemci bu satırı izler: ekrandan çıkan şey sayıların kendisi,
          patika paneli değil. Panel uzun olduğu için alt kenarı hâlâ
          görünürken sayılar çoktan yukarı kaymış oluyor. */}
      <div className="trail-head" ref={basRef}>
        {/* Panel başlığı dışarıdan geliyor; App'te üretildiği için sayaç
            her karede yenilenirken o öğeler yeniden çizilmiyor */}
        {children}

        <div className="trail-figures">
          <p className="progress-count" data-testid="progress-text">
            {gosterilenTamam} / {toplam} <span>görev tamamlandı</span>
          </p>
          <p className="percent-value" data-testid="progress-percent">
            %{gosterilenYuzde}
          </p>
        </div>
      </div>

      <div
        className="progress-track"
        role="progressbar"
        aria-label="Genel ilerleme"
        aria-valuenow={gosterilenYuzde}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Dolum genişlikle değil transform ile değişir: yeniden yerleşim
            tetiklemez. Yumuşatma sayaçtan geliyor, ayrıca CSS geçişi
            verilirse sayı ile çubuk birbirinden kopuyor. */}
        <div
          className="progress-fill"
          data-testid="progress-fill"
          style={{ transform: `scaleX(${gosterilenYuzde / 100})` }}
        />
      </div>
    </>
  )
}

export default ProgressBand
