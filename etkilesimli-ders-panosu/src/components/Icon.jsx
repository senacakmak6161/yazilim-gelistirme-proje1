/**
 * Tek bir çizgi ikon ailesi.
 *
 * Kurallar: 16 px kutu, 1.6 px çizgi kalınlığı, dolgu yok, renk metinden miras.
 * Hepsi aynı ızgarada çizildi ki yan yana geldiklerinde optik ağırlıkları eşit olsun.
 * Dış bir ikon paketi kurmadık; CSP ve çevrimdışı çalışma için satır içi SVG daha güvenli.
 */

const YOLLAR = {
  // Arama
  ara: <path d="M7.2 2.6a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2ZM10.6 10.6 14 14" />,

  // Tamamlandı onayı
  onay: <path d="M3 8.6 6.3 12 13 4.6" />,

  // Açık tema (güneş)
  gunes: (
    <>
      <circle cx="8" cy="8" r="3.1" />
      <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1" />
    </>
  ),

  // Karanlık tema (hilal)
  hilal: <path d="M13.4 9.6A5.8 5.8 0 0 1 6.4 2.6a5.8 5.8 0 1 0 7 7Z" />,

  // Görev türü: okuma
  okuma: (
    <>
      <path d="M8 4.1C6.6 3 4.9 2.7 2.6 2.9v8.6c2.3-.2 4 .1 5.4 1.2 1.4-1.1 3.1-1.4 5.4-1.2V2.9c-2.3-.2-4 .1-5.4 1.2Z" />
      <path d="M8 4.1v9.6" />
    </>
  ),

  // Görev türü: uygulama
  uygulama: <path d="M5.6 4.4 2 8l3.6 3.6M10.4 4.4 14 8l-3.6 3.6" />,

  // Görev türü: proje
  proje: (
    <>
      <path d="M8 1.8 14.4 5 8 8.2 1.6 5 8 1.8Z" />
      <path d="m1.6 11 6.4 3.2L14.4 11" />
    </>
  ),

  // Görev türü: quiz
  quiz: (
    <>
      <path d="M6 6a2 2 0 1 1 2.7 1.9c-.5.2-.7.6-.7 1.1v.5" />
      <path d="M8 12.2v.1" />
      <circle cx="8" cy="8" r="6.3" />
    </>
  ),

  // Listede yön işareti
  ok: <path d="M6 3.4 10.6 8 6 12.6" />,

  // Zirve bayrağı
  bayrak: (
    <>
      <path d="M4 14.4V2.2" />
      <path d="M4 3h8.2l-1.8 2.7 1.8 2.7H4" />
    </>
  ),

  // Boş durum
  bos: (
    <>
      <path d="M2.4 5.6h11.2v7.2a.8.8 0 0 1-.8.8H3.2a.8.8 0 0 1-.8-.8V5.6Z" />
      <path d="M2.4 5.6 4 2.4h8l1.6 3.2" />
    </>
  ),
}

function Icon({ name, size = 16, className = '' }) {
  const yol = YOLLAR[name]
  if (!yol) return null

  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {yol}
    </svg>
  )
}

export default Icon
