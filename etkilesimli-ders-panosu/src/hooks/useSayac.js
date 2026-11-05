import { useEffect, useRef, useState } from 'react'

/**
 * Bir sayıyı hedefine sayarak götürür: 97'den 100'e sıçramak yerine
 * 97, 98, 99, 100 diye hızlıca ilerler.
 *
 * İlk render'da animasyon yok — değer doğrudan hedefiyle başlar, aksi hâlde
 * kayıtlı ilerlemeyle açılan sayfa sıfırdan sayarak açılırdı.
 *
 * Hareket azaltma tercihi açıkken ilk karede hedefe oturur.
 */
export function useSayac(hedef, sure = 520) {
  const [deger, setDeger] = useState(hedef)

  // En son gösterilen değer. Yalnızca animasyon karesi içinde yazılır;
  // render sırasında ref'e yazmak React'in beklemediği bir şey.
  const sonRef = useRef(hedef)

  useEffect(() => {
    const bas = sonRef.current
    if (bas === hedef) return undefined

    const azHareket = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const fark = hedef - bas

    /**
     * Süre mesafeyle orantılı. Tek bir görev işaretlendiğinde yarım saniye
     * saymanın anlamı yok; üstelik kalabalık bir listede kareler yavaşladığı
     * için sayı hedefe yedinci karede ancak varıyor ve tepki ölçülebilir
     * biçimde gecikiyordu. Uzun atlayışlarda tavan yine aynı.
     */
    const gercekSure = azHareket ? 0 : Math.min(sure, 120 + Math.abs(fark) * 45)
    const baslangic = performance.now()
    let kare = 0

    const adim = (simdi) => {
      const oran = gercekSure === 0 ? 1 : Math.min(1, (simdi - baslangic) / gercekSure)
      // Sona doğru yavaşlar; hızlı başlayıp oturması okumayı kolaylaştırıyor
      const yumusak = 1 - (1 - oran) ** 3
      const yeni = oran === 1 ? hedef : Math.round(bas + fark * yumusak)

      sonRef.current = yeni
      setDeger(yeni)

      if (oran < 1) kare = requestAnimationFrame(adim)
    }

    kare = requestAnimationFrame(adim)
    return () => cancelAnimationFrame(kare)
  }, [hedef, sure])

  return deger
}
