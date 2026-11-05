import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Tema düğmesinden sarkan lamba ipi.
 *
 * İp fareye doğru mıknatıs gibi uzanır; basılı tutup aşağı çekince tema
 * değişir. Bu bir *ek* katman: altındaki gerçek `<button>` olduğu gibi
 * duruyor, klavyeyle Enter/Boşluk ve düz tıklama aynen çalışıyor. İp
 * yalnızca fareyle gelen için var; dokunmatikte ve dar ekranda hiç çıkmaz.
 *
 * Hareket azaltma tercihi açıkken ip kıpırdamaz.
 *
 * Üç ayrıntı ipi gerçek hissettiriyor:
 *   • direnç — çektikçe zorlaşır, sonsuz uzamaz (üstel doyma)
 *   • gerginlik — gerildikçe yanal sarkma azalır, ip düzleşir
 *   • geri tepme — bırakınca yay bir miktar aşarak oturur
 *
 * Fizik basit bir yay: ucun hızı hedefe olan uzaklıkla artar, her karede
 * sönümlenir. Kütüphane gerekmiyor.
 */

const DINLENME = 50 // ipin boştaki uzunluğu
const MIKNATIS = 150 // bu uzaklıktan sonra fareyi takip etmeye başlar
const EN_COK_YAN = 30 // yana sapabileceği en fazla
const EN_COK_CEK = 92 // aşağı uzayabileceği en fazla
const ESIK = 40 // temayı değiştirmek için gereken çekme

/** Üstel doyma: çektikçe zorlaşır, sınırı asla geçmez. */
function direncli(ham, sinir) {
  if (ham <= 0) return 0
  return sinir * (1 - Math.exp(-ham / (sinir * 0.62)))
}

function TemaIpi({ karanlik, onCek }) {
  const tutamacRef = useRef(null)
  const [uc, setUc] = useState({ x: 0, y: DINLENME })
  const [basili, setBasili] = useState(false)

  const hedefRef = useRef({ x: 0, y: DINLENME })
  const ucRef = useRef({ x: 0, y: DINLENME })
  const hizRef = useRef({ x: 0, y: 0 })
  const kareRef = useRef(0)
  const basiliRef = useRef(false)
  const baslangicRef = useRef({ x: 0, y: 0 })

  /** Yay döngüsü; uç hedefine oturunca kendini durdurur. */
  const yayiCalistir = useCallback(() => {
    if (kareRef.current) return

    const adim = () => {
      const hedef = hedefRef.current
      const u = ucRef.current
      const h = hizRef.current

      // Yumuşak ama tembel olmayan bir yay
      h.x = (h.x + (hedef.x - u.x) * 0.2) * 0.78
      h.y = (h.y + (hedef.y - u.y) * 0.2) * 0.78
      u.x += h.x
      u.y += h.y

      setUc({ x: u.x, y: u.y })

      const durgun =
        Math.abs(h.x) < 0.04 &&
        Math.abs(h.y) < 0.04 &&
        Math.abs(hedef.x - u.x) < 0.25 &&
        Math.abs(hedef.y - u.y) < 0.25

      if (durgun) {
        kareRef.current = 0
        return
      }
      kareRef.current = requestAnimationFrame(adim)
    }

    kareRef.current = requestAnimationFrame(adim)
  }, [])

  useEffect(() => {
    const azHareket = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (azHareket) return undefined

    function hareket(olay) {
      const tutamac = tutamacRef.current
      if (!tutamac) return

      if (basiliRef.current) {
        // Sürüklerken: basma noktasından olan fark, dirençten geçirilir
        const dx = olay.clientX - baslangicRef.current.x
        const dy = olay.clientY - baslangicRef.current.y

        hedefRef.current = {
          x: Math.sign(dx) * direncli(Math.abs(dx), EN_COK_YAN * 1.6),
          y: DINLENME + direncli(dy, EN_COK_CEK),
        }
        yayiCalistir()
        return
      }

      const kutu = tutamac.getBoundingClientRect()
      const dx = olay.clientX - (kutu.left + kutu.width / 2)
      const dy = olay.clientY - (kutu.top + kutu.height / 2)
      const uzaklik = Math.hypot(dx, dy)

      if (uzaklik > MIKNATIS) {
        hedefRef.current = { x: 0, y: DINLENME }
      } else {
        // Yakınlaştıkça daha çok uzanır
        const guc = 1 - uzaklik / MIKNATIS
        hedefRef.current = {
          x: Math.max(-EN_COK_YAN, Math.min(EN_COK_YAN, dx * guc * 0.5)),
          y: DINLENME + Math.max(-6, Math.min(22, dy * guc * 0.38)),
        }
      }
      yayiCalistir()
    }

    window.addEventListener('pointermove', hareket)
    return () => window.removeEventListener('pointermove', hareket)
  }, [yayiCalistir])

  useEffect(
    () => () => {
      cancelAnimationFrame(kareRef.current)
      document.documentElement.classList.remove('ip-cekiliyor')
    },
    [],
  )

  function basildi(olay) {
    if (olay.pointerType === 'touch') return
    olay.preventDefault()
    olay.stopPropagation()

    basiliRef.current = true
    baslangicRef.current = { x: olay.clientX, y: olay.clientY }
    setBasili(true)
    // Sürüklerken sayfadaki metin seçilmesin
    document.documentElement.classList.add('ip-cekiliyor')
    olay.currentTarget.setPointerCapture?.(olay.pointerId)
  }

  function birakildi(olay) {
    if (!basiliRef.current) return
    olay.stopPropagation()

    basiliRef.current = false
    setBasili(false)
    document.documentElement.classList.remove('ip-cekiliyor')
    olay.currentTarget.releasePointerCapture?.(olay.pointerId)

    const cekildi = ucRef.current.y - DINLENME

    hedefRef.current = { x: 0, y: DINLENME }
    // Bırakınca ip yukarı fırlayıp salınarak otursun
    hizRef.current.y -= 3.4
    hizRef.current.x += (Math.random() - 0.5) * 1.2
    yayiCalistir()

    if (cekildi >= ESIK) onCek()
  }

  // Gerginlik: gerildikçe yanal sarkma azalır, ip düzleşir ve incelir
  const boy = Math.hypot(uc.x, uc.y)
  const gerginlik = Math.max(0, Math.min(1, (boy - DINLENME) / EN_COK_CEK))
  const yanKatsayi = 0.3 + 0.2 * gerginlik
  const dikKatsayi = 0.64 - 0.14 * gerginlik

  const egri = `M0 0 Q ${(uc.x * yanKatsayi).toFixed(1)} ${(uc.y * dikKatsayi).toFixed(1)} ${uc.x.toFixed(1)} ${uc.y.toFixed(1)}`

  return (
    <span
      className={`tema-ipi ${basili ? 'is-basili' : ''}`}
      style={{ '--gerginlik': gerginlik.toFixed(3) }}
      aria-hidden="true"
    >
      <svg width="150" height="180" viewBox="-75 0 150 180" className="ip-cizim">
        {/* İpin tutunduğu nokta */}
        <circle className="ip-kanca" cx="0" cy="0" r="1.8" />
        <path className="ip-hat" d={egri} />
        <circle
          className="ip-tutamac"
          ref={tutamacRef}
          cx={uc.x.toFixed(1)}
          cy={uc.y.toFixed(1)}
          r="5.8"
          onPointerDown={basildi}
          onPointerUp={birakildi}
          onPointerCancel={birakildi}
        />
      </svg>

      <span className="ip-ipucu" style={{ transform: `translate(${uc.x.toFixed(1)}px, ${uc.y.toFixed(1)}px)` }}>
        {karanlik ? 'çek: aydınlat' : 'çek: karart'}
      </span>
    </span>
  )
}

export default TemaIpi
