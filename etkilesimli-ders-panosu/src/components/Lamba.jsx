/**
 * Tavandan sarkan lamba.
 *
 * Tema düğmesinin görünen hâli. Kutu, kenarlık ve etiket kaldırıldı —
 * sarkan bir ipi olan bir lamba zaten ne yapacağını anlatıyor. Düğmenin
 * erişilebilir adı görünmeyen bir etikette duruyor, yani klavye ve ekran
 * okuyucu için hiçbir şey değişmedi.
 *
 * Açık/kapalı durumu abajurun *iç ağzından* okunuyor: yanıkken içerisi
 * sıcak, sönükken nötr koyu. Önce dışarıya turuncu bir hale veriliyordu;
 * yapay duruyordu ve kaldırıldı.
 *
 * Çizim dili uygulamanın geri kalanıyla aynı: düz dolgu, ışık sol üstten,
 * gölge sağ yarıda — tıpkı patikadaki ağaçlar gibi.
 */
function Lamba({ yanik }) {
  return (
    <svg
      className={`lamba ${yanik ? 'is-yanik' : ''}`}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      {/* Tavan kancası ve asma çubuğu */}
      <rect className="lamba-tavan" x="26" y="0" width="12" height="3" rx="1.5" />
      <line className="lamba-cubuk" x1="32" y1="2" x2="32" y2="13" />

      {/* Abajurun iç ağzı; gövdenin altından yarısı görünür */}
      <ellipse className="lamba-ic" cx="32" cy="33.5" rx="22" ry="5" />

      {/* Gövde — kenarları hafif içbükey, aşağı doğru açılan */}
      <path
        className="lamba-govde"
        d="M23.5 12 H40.5 C42.5 20 47 28 54 33.5 H10 C17 28 21.5 20 23.5 12 Z"
      />

      {/* Işık sol üstten gelir; sağ yarı koyu kalır */}
      <path className="lamba-golge" d="M32 12 H40.5 C42.5 20 47 28 54 33.5 H32 Z" />

      {/* Alt kenar çıtası */}
      <path className="lamba-cita" d="M10.5 33.5 H53.5" />
    </svg>
  )
}

export default Lamba
