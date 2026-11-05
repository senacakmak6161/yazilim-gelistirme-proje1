/**
 * Ders Patikası markası.
 *
 * Dolu bir karo içinde kıvrılan bir patika ve ucunda bulunulan durak.
 * Önceki hâli serbest duran ince bir çizgiydi ve 26 pikselde leke gibi
 * görünüyordu; bu boyutta okunan şey dolu, net biçimlerdir. Karo markaya
 * zeminden bağımsız bir gövde veriyor, patika da uygulamanın içindeki
 * yolun küçültülmüş hâli.
 */
function Logo({ size = 28 }) {
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="0" y="0" width="28" height="28" rx="8.5" fill="var(--moss)" />

      {/* Kıvrılarak yükselen yol */}
      <path
        d="M6.5 21.5c4 0 3.2-5.2 7-5.2s2.6-3.6 4.4-4.7"
        stroke="var(--surface)"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Yolun ucundaki durak. Yolla arasında bilerek boşluk var:
          bitişikken ikisi tek bir leke hâline geliyordu. */}
      <circle cx="21.3" cy="9.6" r="3" fill="var(--now-bg)" />
    </svg>
  )
}

export default Logo
