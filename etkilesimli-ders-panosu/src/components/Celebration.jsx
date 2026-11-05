import { useEffect, useMemo } from 'react'
import Icon from './Icon.jsx'

/**
 * Hafta ya da patika tamamlandığında ekranda beliren kutlama.
 *
 * Dökülen şeyler rastgele konfeti değil, sonbahar yaprakları: patikadaki
 * ağaçların renk dizisini kullanıyorlar. Ders 2026 Güz dönemi ve harita
 * boyunca yapraklar zaten yazdan sonbahara dönüyor; kutlama da aynı
 * sözlükten konuşsun diye böyle çizildi. Aralarına birkaç küçük yosun ve
 * okra parçacığı serpiştirildi.
 *
 * Katman tıklamaları geçirmez (`pointer-events: none`): altındaki görev
 * listesiyle çalışmaya devam edilebilsin. Kendi kendine kapanır, kapatma
 * düğmesi yok — iki saniyelik bir ödül anı, bir iletişim kutusu değil.
 *
 * Parçalar her kutlamada yeniden üretilir; hep aynı düşüş kalıbı tekrar
 * ederse hareket çabuk sıkıcı hâle geliyor.
 */

const YAPRAK_RENKLERI = [
  'var(--leaf-5)',
  'var(--leaf-4)',
  'var(--leaf-3)',
  'var(--leaf-2)',
  'var(--leaf-1)',
  'var(--leaf-0)',
]

const PARCA_RENKLERI = ['var(--moss)', 'var(--ochre)']

function parcalariUret(adet) {
  return Array.from({ length: adet }, (_, i) => {
    const yaprak = Math.random() > 0.32

    return {
      id: i,
      yaprak,
      sol: Math.random() * 100,
      gecikme: Math.random() * 520,
      sure: 1700 + Math.random() * 1400,
      donus: 220 + Math.random() * 560,
      kayma: -70 + Math.random() * 140,
      boy: yaprak ? 11 + Math.random() * 9 : 5 + Math.random() * 5,
      renk: yaprak
        ? YAPRAK_RENKLERI[Math.floor(Math.random() * YAPRAK_RENKLERI.length)]
        : PARCA_RENKLERI[i % PARCA_RENKLERI.length],
    }
  })
}

function Celebration({ tip, baslik, alt, onKapat }) {
  const buyuk = tip === 'patika'
  const parcalar = useMemo(() => parcalariUret(buyuk ? 78 : 46), [buyuk])

  // Escape ile de kapanır; fare kullanmayan için tek çıkış yolu düğme olmasın
  useEffect(() => {
    function tusa(olay) {
      if (olay.key === 'Escape') onKapat()
    }
    window.addEventListener('keydown', tusa)
    return () => window.removeEventListener('keydown', tusa)
  }, [onKapat])

  return (
    <div className={`celebration ${buyuk ? 'is-big' : ''}`}>
      <div className="fall">
        {parcalar.map((parca) => (
          <span
            key={parca.id}
            className="fall-piece"
            style={{
              left: `${parca.sol}%`,
              animationDelay: `${parca.gecikme}ms`,
              animationDuration: `${parca.sure}ms`,
              '--donus': `${parca.donus}deg`,
              '--kayma': `${parca.kayma}px`,
            }}
          >
            {parca.yaprak ? (
              <svg
                width={parca.boy * 0.72}
                height={parca.boy}
                viewBox="0 0 12 16"
                aria-hidden="true"
              >
                <path
                  d="M6 0C9.6 4.2 12 7.2 12 10a6 6 0 0 1-12 0C0 7.2 2.4 4.2 6 0Z"
                  fill={parca.renk}
                />
              </svg>
            ) : (
              <span
                className="fall-dot"
                style={{ width: parca.boy, height: parca.boy, background: parca.renk }}
              />
            )}
          </span>
        ))}
      </div>

      <div className="celebration-card" role="status">
        <span className="celebration-mark">
          <span className="mark-halo" aria-hidden="true" />
          <Icon name={buyuk ? 'bayrak' : 'onay'} size={buyuk ? 34 : 30} />
        </span>

        <p className="celebration-title">{baslik}</p>
        <p className="celebration-note">{alt}</p>

        {/* Tıklamayı yalnızca düğme yakalar; kartın geri kalanı geçirgen
            kalır ki altındaki listeyle çalışmaya devam edilebilsin. */}
        <button type="button" className="celebration-close" onClick={onKapat}>
          Teşekkürler
        </button>
      </div>
    </div>
  )
}

export default Celebration
