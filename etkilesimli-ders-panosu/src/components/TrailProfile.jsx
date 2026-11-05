import { useEffect, useMemo, useRef, useState } from 'react'
import { haftaYuku } from '../lib/ders.js'

/**
 * Patika haritası — bu ekranın imza elemanı.
 *
 * Bir grafik değil, bir manzara: arkada tepeler, yol boyunca ağaçlar,
 * sonunda zirve bayrağı. Ama her şey veriden geliyor —
 *
 *   • durakların yüksekliği   → o haftanın çalışma yükü (160–205 dk)
 *   • yolun dolu kısmı        → tamamlanan görev oranı
 *   • yoldaki küçük noktalar  → tek tek görevler
 *   • ağaçların rengi         → dönem ilerledikçe gelen sonbahar
 *
 * Renk ayrımı bilinçli: manzara mevsimi taşıyor, yol ise veriyi. Yolun
 * kendisi iki renkten ibaret (yürünen yeşil, kalan gri) ki ilerleme
 * süslemenin içinde kaybolmasın.
 *
 * Çizim dışarıdan alınmadı, koddan üretiliyor: ders verisi değişince
 * harita da kendiliğinden değişsin diye.
 */

const G = 1000 // çizim ızgarası genişliği
const Y = 232 // çizim ızgarası yüksekliği
const TABAN = 150 // en hafif haftanın oturduğu çizgi
const TAVAN = 72 // en ağır haftanın ulaşabileceği çizgi (ağaçlara tepede yer kalsın)
const TABAN_PAYI = 0.25
const KIVRIM = 36 // kıvrımların derinliği (teğet sürekli olunca genlik büyüdü)
// Üç tepe katmanı: uzaktan yakına doğru koyulaşır, derinlik buradan gelir
const SOL = 34 // ilk durağın yeri
const SAG = G - 26 // zirvenin yeri
const UZAK_TEPE = -42 // arka tepe — küçük soluk ağaçlar burada
const ORTA_TEPE = -24 // orta tepe — büyük gövdeli ağaçlar burada
const YAKIN_TEPE = 40 // ön tepe — yolun önünde, boş ön plan

/** Kübik bezier üzerinde t anındaki nokta. */
function bezier(p0, c1, c2, p1, t) {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return {
    x: a * p0.x + b * c1.x + c * c2.x + d * p1.x,
    y: a * p0.y + b * c1.y + c * c2.y + d * p1.y,
  }
}

/** Her durağın eğim yönü; sırayla aşağı ve yukarı. */
function egim(index) {
  return index % 2 === 0 ? 1 : -1
}

/**
 * Bir bölümün denetim noktaları.
 *
 * Kritik nokta: bölümün bitiş denetim noktası, *bir sonraki* durağın eğimine
 * göre kuruluyor. Önceden her bölüm kendi yönünü kullanıyordu; bu, durakta
 * gelen ve giden teğetleri birbirinin aynası yapıyor ve yolda keskin bir
 * köşe bırakıyordu. Teğet iki bölüm arasında paylaşılınca viraj yumuşak
 * dönüyor — yol yine kıvrılıyor, sadece köşe kalmıyor.
 */
function denetim(p0, p1, egimBas, egimSon) {
  const dx = (p1.x - p0.x) / 2.2
  return [
    { x: p0.x + dx, y: p0.y + KIVRIM * egimBas },
    { x: p1.x - dx, y: p1.y - KIVRIM * egimSon },
  ]
}

/** Noktalar dizisini tek bir kıvrımlı yola çevirir. */
function egri(noktalar, offset = 0) {
  const ilk = noktalar[0]
  const parcalar = [`M${ilk.x.toFixed(1)} ${(ilk.y + offset).toFixed(1)}`]

  for (let i = 0; i < noktalar.length - 1; i++) {
    const p0 = { x: noktalar[i].x, y: noktalar[i].y + offset }
    const p1 = { x: noktalar[i + 1].x, y: noktalar[i + 1].y + offset }
    const [c1, c2] = denetim(p0, p1, egim(i), egim(i + 1))
    parcalar.push(
      `C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`,
    )
  }

  return parcalar.join(' ')
}

/**
 * Bir tepe siluetinin nokta dizisi: yolun kendi noktaları, dikeyde kaydırılmış.
 *
 * Kritik nokta — tepeler yolla *tamamen aynı* nokta dizisinden üretilmeli.
 * Önceden tepelere kenar noktaları eklenmişti; bu, kıvrımların alternatif
 * sırasını kaydırıyor ve tepeyi yola paralel olmaktan çıkarıyordu. Sonuçta
 * tepe yer yer yolun altına iniyor, üstündeki ağaçlar yola biniyordu.
 * Aynı diziyi sabit bir kaymayla kullanınca tepe yolu asla kesmiyor.
 */
function tepeNoktalari(noktalar, offset) {
  return noktalar.map((p) => ({ x: p.x, y: p.y + offset }))
}

/**
 * Tepe siluetinin dolgu yolu.
 * Uçlar eğri uzatılarak değil, düz çizgiyle kenara taşınır — eğriye nokta
 * eklemek kıvrım sırasını bozardı.
 */
function tepeAlani(noktalar, offset) {
  const ofsetli = tepeNoktalari(noktalar, offset)
  const ilk = ofsetli[0]
  const son = ofsetli[ofsetli.length - 1]
  const govde = egri(ofsetli).replace(/^M[^C]*/, '')

  return [
    `M0 ${ilk.y.toFixed(1)}`,
    `L${ilk.x.toFixed(1)} ${ilk.y.toFixed(1)}`,
    govde,
    `L${G} ${son.y.toFixed(1)}`,
    `L${G} ${Y} L0 ${Y} Z`,
  ].join(' ')
}

/**
 * Durakların konumu: x eşit aralıklı, y o haftanın yükünden.
 *
 * Duraklar ile zirve arasındaki altı aralık birebir eşit. Önceden duraklar
 * sütun ortalarına konuyor, zirve ise hemen son durağın yanına düşüyordu;
 * son haftanın görevleri diğerlerinin üçte biri genişlikte bir alana
 * sıkışıyordu.
 */
function duraklar(weeks) {
  const yukler = weeks.map(haftaYuku)
  const enAz = Math.min(...yukler)
  const enCok = Math.max(...yukler)
  const aralik = enCok - enAz
  const adim = (SAG - SOL) / weeks.length

  return weeks.map((week, index) => {
    const ham = aralik === 0 ? 1 : (yukler[index] - enAz) / aralik
    const oran = TABAN_PAYI + (1 - TABAN_PAYI) * ham
    return {
      x: SOL + index * adim,
      y: TABAN - oran * (TABAN - TAVAN),
    }
  })
}

/** Aynı girdi hep aynı manzarayı versin diye sabit bir dağıtıcı. */
function serpme(tohum) {
  const x = Math.sin(tohum * 127.1) * 43758.5453
  return x - Math.floor(x)
}

/** Eğriyi x boyunca örnekler; ağaçları tepeye tam oturtmak için gerekli. */
function orneklem(noktalar) {
  const ornekler = []
  for (let i = 0; i < noktalar.length - 1; i++) {
    const p0 = noktalar[i]
    const p1 = noktalar[i + 1]
    const [c1, c2] = denetim(p0, p1, egim(i), egim(i + 1))
    for (let k = 0; k < 40; k++) ornekler.push(bezier(p0, c1, c2, p1, k / 40))
  }
  ornekler.push(noktalar[noktalar.length - 1])
  return ornekler
}

/** Örneklenmiş eğride verilen x'e en yakın örneğin sırası. */
function enYakinSira(ornekler, x) {
  let sira = 0
  let enKucukFark = Infinity
  for (let i = 0; i < ornekler.length; i++) {
    const fark = Math.abs(ornekler[i].x - x)
    if (fark < enKucukFark) {
      enKucukFark = fark
      sira = i
    }
  }
  return sira
}

/** Örneklenmiş eğride verilen x'e en yakın y. */
function yDegeri(ornekler, x) {
  return ornekler[enYakinSira(ornekler, x)].y
}

/** Örneklerin birikimli yay uzunluğu. */
function birikimliUzunluk(ornekler) {
  const birikim = [0]
  for (let i = 1; i < ornekler.length; i++) {
    birikim.push(
      birikim[i - 1] + Math.hypot(ornekler[i].x - ornekler[i - 1].x, ornekler[i].y - ornekler[i - 1].y),
    )
  }
  return birikim
}

/**
 * Verilen x'in yol boyunca hangi orana denk geldiği.
 *
 * Yüzdeyi doğrudan kesik uzunluğuna sürmek yanlış sonuç veriyordu: görev
 * sayısı yoldaki uzunlukla orantılı değil (yolun iki ucunda durak olmayan
 * giriş ve zirve parçaları var). Bu yüzden dolum, tamamlanan görevin
 * noktasının gerçek yay uzunluğundan hesaplanıyor.
 */
function uzunlukOrani(ornekler, birikim, x) {
  const toplam = birikim[birikim.length - 1]
  if (!toplam) return 0
  return birikim[enYakinSira(ornekler, x)] / toplam
}

/**
 * Bir ağaç kuşağı üretir.
 *
 * Konumlar eşit aralıklı bir ızgaraya oturup sabit bir sapmayla kaydırılıyor:
 * tamamen rastgele dağıtınca ağaçlar yer yer üst üste biniyor, yer yer
 * boşluk bırakıyordu. Durakların yakınına ağaç konmuyor ki hafta numaraları
 * okunur kalsın.
 */
function agacKusagi(ornekler, duraklarX, ayar) {
  const { adim, sapma, yKayma, boyAlt, boyUst, tohum, detayli, kacin } = ayar
  const kusak = []

  for (let i = 0; i * adim + adim * 0.5 < G - 12; i++) {
    const t = tohum + i * 3
    const x = i * adim + adim * 0.5 + (serpme(t) - 0.5) * sapma
    if (x < 8 || x > G - 12) continue
    if (duraklarX.some((sx) => Math.abs(sx - x) < kacin)) continue

    const boy = boyAlt + serpme(t + 11) * (boyUst - boyAlt)
    kusak.push({
      key: `${tohum}-${i}`,
      x,
      y: yDegeri(ornekler, x) + yKayma,
      boy,
      tip: tipSec(serpme(t + 23)),
      mevsim: Math.min(5, Math.floor((x / G) * 6)),
      detayli,
    })
  }

  // Alttakiler sonra çizilsin: önde duranlar arkadakilerin üstüne binsin
  return kusak.sort((a, b) => a.y - b.y)
}

/**
 * Üç ağaç biçimi, hepsi iğne yapraklı.
 *
 * Yuvarlak taçlı geniş yapraklı tür kaldırıldı: bu ölçekte sapın ucundaki
 * bir elips gibi duruyor ve manzarayı çocuksulaştırıyordu. Çeşitlilik artık
 * biçimden değil orandan geliyor — geniş, ince ve uzun olmak üzere üç siluet.
 *
 * Her katın tabanı, tepesi ve yarı genişliği boyun oranı cinsinden verilir.
 */
const AGAC_BICIMLERI = [
  // Geniş, üç katlı
  [
    { taban: 0.16, tepe: 0.52, yari: 0.42 },
    { taban: 0.39, tepe: 0.76, yari: 0.33 },
    { taban: 0.62, tepe: 1.0, yari: 0.24 },
  ],
  // İnce, iki katlı
  [
    { taban: 0.18, tepe: 0.62, yari: 0.3 },
    { taban: 0.52, tepe: 1.0, yari: 0.21 },
  ],
  // Uzun köknar, dört katlı
  [
    { taban: 0.12, tepe: 0.4, yari: 0.38 },
    { taban: 0.3, tepe: 0.6, yari: 0.31 },
    { taban: 0.5, tepe: 0.8, yari: 0.24 },
    { taban: 0.7, tepe: 1.0, yari: 0.17 },
  ],
]

function tipSec(deger) {
  if (deger < 0.44) return 0
  if (deger < 0.76) return 1
  return 2
}

/** Işık sol üstten gelir, gölge hep sağ yarıdadır. */
function Agac({ boy, tip, detayli }) {
  const katlar = AGAC_BICIMLERI[tip].map((k) => ({
    taban: -boy * k.taban,
    tepe: -boy * k.tepe,
    yari: boy * k.yari,
  }))

  const tac = katlar
    .map(
      (k) =>
        `M${(-k.yari).toFixed(1)} ${k.taban.toFixed(1)} L0 ${k.tepe.toFixed(1)} L${k.yari.toFixed(1)} ${k.taban.toFixed(1)} Z`,
    )
    .join(' ')

  const golge = katlar
    .map(
      (k) =>
        `M0 ${k.tepe.toFixed(1)} L${k.yari.toFixed(1)} ${k.taban.toFixed(1)} L0 ${k.taban.toFixed(1)} Z`,
    )
    .join(' ')

  return (
    <>
      <line className="tree-trunk" x1="0" y1="0" x2="0" y2={(-boy * 0.18).toFixed(1)} />
      <path className="tree-crown" d={tac} />
      {detayli ? <path className="tree-shade" d={golge} /> : null}
    </>
  )
}

/**
 * Haritanın bütün geometrisi. Bileşenden ayrı tutuluyor: React kancaları
 * koşulsuz çalışmak zorunda, bu yüzden "hafta yoksa çık" kontrolü
 * kancalardan sonraya kalmalı.
 */
function haritaVerisi(weeks) {
  const pts = duraklar(weeks)

  /**
   * Yol, duraklardan önce ve sonra yarımşar sütun uzar. Önceden bitiş ucu
   * yalnızca 16 birim ötedeydi; son haftanın görevleri diğerlerinin üçte
   * biri genişlikte bir alana sıkışıyordu. Artık iki uç simetrik.
   */
  const zirve = { x: SAG, y: pts[pts.length - 1].y - 18 }
  const yolNoktalari = [...pts, zirve]

  // Yolun ölçülen kısmı ilk durakta başlar; bu kuyruk yalnızca yolun
  // çerçevenin dışından geldiğini anlatan bir süs.
  const kuyrukBas = { x: 0, y: pts[0].y + 16 }
  // Kuyruğun bitiş teğeti ilk durağınkiyle aynı olsun ki orada da köşe olmasın
  const [kc1, kc2] = denetim(kuyrukBas, pts[0], -egim(0), egim(0))
  const kuyruk = `M${kuyrukBas.x} ${kuyrukBas.y.toFixed(1)} C${kc1.x.toFixed(1)} ${kc1.y.toFixed(1)} ${kc2.x.toFixed(1)} ${kc2.y.toFixed(1)} ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`

  const d = egri(yolNoktalari)

  const yolOrnekleri = orneklem(yolNoktalari)
  const birikim = birikimliUzunluk(yolOrnekleri)

  /**
   * Her görev yolun üstünde bir adım izi. Hafta i'nin görevleri, i. durak
   * ile bir sonraki nokta arasındaki bölüme eşit aralıklarla dizilir;
   * bölümlerin hepsi aynı uzunlukta olduğu için ritim her haftada aynı.
   */
  const haftaAdimlari = weeks.map((week, haftaIndex) => {
    const gorevler = week.cells ?? []
    const p0 = yolNoktalari[haftaIndex]
    const p1 = yolNoktalari[haftaIndex + 1]
    const [c1, c2] = denetim(p0, p1, egim(haftaIndex), egim(haftaIndex + 1))

    return gorevler.map((tamam, gorevIndex) => {
      const t = (gorevIndex + 1) / (gorevler.length + 1)
      const nokta = bezier(p0, c1, c2, p1, t)
      return { ...nokta, tamam, key: `${haftaIndex}-${gorevIndex}` }
    })
  })

  const adimlar = haftaAdimlari.flat()

  /**
   * Yolun nereye kadar yürünmüş sayılacağı.
   *
   * Tamamlanan görev sayısı adım adım harcanır: bir haftanın bütün görevleri
   * bitmişse o hafta tümüyle geçilmiş sayılır ve bir sonraki durağa varılır.
   * Önceden yalnızca "n'inci noktaya kadar" yürünüyordu; haftanın son
   * görevini bitirmek seni son noktada bırakıyor, durağa ulaştırmıyordu.
   *
   * Hangi görevin işaretlendiği değil, kaç tanesinin işaretlendiği önemli —
   * böylece yol her zaman üstteki "n / 30" sayısıyla tutarlı kalıyor.
   */
  const tamamlananAdim = adimlar.filter((a) => a.tamam).length

  let kalan = tamamlananAdim
  let hedef = yolNoktalari[yolNoktalari.length - 1] // hepsi bitmişse zirve

  for (let i = 0; i < haftaAdimlari.length; i++) {
    if (kalan >= haftaAdimlari[i].length) {
      kalan -= haftaAdimlari[i].length
      continue
    }
    // Bu haftanın içindeyiz: ya durakta ya da kalan'ıncı adım izinde
    hedef = kalan === 0 ? yolNoktalari[i] : haftaAdimlari[i][kalan - 1]
    break
  }

  const yurunen = uzunlukOrani(yolOrnekleri, birikim, hedef.x)

  /**
   * Ağaçlar iki kuşakta durur: uzaktakiler küçük, soluk ve sade; yakındakiler
   * büyük, gölgeli ve gövdeli. Derinlik duygusu buradan geliyor — tek kuşak
   * hâlindeyken manzara düz bir kâğıt gibi duruyordu.
   *
   * Renkleri hafta sırasına göre yazdan sonbahara döner: ders 2026 Güz
   * dönemi, yani patika gerçekten mevsim değiştirerek ilerliyor.
   */
  const duraklarX = pts.map((p) => p.x)

  // Her kuşak kendi tepesinin çizilen eğrisinden örneklenir
  const uzakAgaclar = agacKusagi(orneklem(tepeNoktalari(yolNoktalari, UZAK_TEPE)), duraklarX, {
    adim: 33,
    sapma: 14,
    yKayma: 3,
    boyAlt: 10,
    boyUst: 16,
    tohum: 101,
    detayli: false,
    kacin: 16,
  })

  const yakinAgaclar = agacKusagi(orneklem(tepeNoktalari(yolNoktalari, ORTA_TEPE)), duraklarX, {
    adim: 54,
    sapma: 22,
    yKayma: 3,
    boyAlt: 21,
    boyUst: 30,
    tohum: 307,
    detayli: true,
    kacin: 30,
  })

  const hepsiTamam = weeks.every((week) => week.isComplete)

  return { pts, yolNoktalari, d, kuyruk, adimlar, yurunen, uzakAgaclar, yakinAgaclar, zirve, hepsiTamam }
}

function TrailProfile({ weeks, yuzde, selectedIndex, kutlanan }) {
  const yolRef = useRef(null)
  const [yuruyen, setYuruyen] = useState(null)

  /**
   * Geometri önbelleğe alınır. App başka bir sebeple yeniden çizildiğinde
   * (üst şeritteki gösterge, kutlama, seçim) tüm harita baştan
   * hesaplanıyordu; 100 görevlik veriyle bu ölçülebilir bir gecikme.
   * Anahtar yalnızca görev durumları değişince değişir.
   */
  const anahtar = weeks
    .map((week) => `${week.id}:${(week.cells ?? []).map((t) => (t ? 1 : 0)).join('')}`)
    .join('|')

  // Anahtar weeks'in çizimi etkileyen bütün alanlarını kapsıyor
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const veri = useMemo(() => (weeks.length === 0 ? null : haritaVerisi(weeks)), [anahtar])
  const yurunen = veri ? veri.yurunen : 0

  // Yürüyen işaretin yeri, yolun kendi uzunluğundan ölçülüyor
  useEffect(() => {
    const yol = yolRef.current
    if (!yol) return
    const uzunluk = yol.getTotalLength()
    if (!uzunluk) return
    const nokta = yol.getPointAtLength(uzunluk * yurunen)
    setYuruyen({ x: nokta.x, y: nokta.y })
  }, [yurunen, weeks])

  if (!veri) return null

  const { pts, yolNoktalari, d, kuyruk, adimlar, uzakAgaclar, yakinAgaclar, zirve, hepsiTamam } = veri

  return (
    <svg
      className="trail-map"
      viewBox={`0 0 ${G} ${Y}`}
      role="img"
      aria-label={`Patika haritası: ${weeks.length} durak, yüzde ${yuzde} tamamlandı`}
    >
      {/* Arka tepe */}
      <path className="hill-far" d={tepeAlani(yolNoktalari, UZAK_TEPE)} />

      {/* Uzak ağaç kuşağı: küçük ve soluk */}
      {uzakAgaclar.map((agac) => (
        <g
          key={`u-${agac.key}`}
          className={`tree is-far sezon-${agac.mevsim}`}
          style={{ transform: `translate(${agac.x.toFixed(1)}px, ${agac.y.toFixed(1)}px)` }}
        >
          <Agac boy={agac.boy} tip={agac.tip} detayli={false} />
        </g>
      ))}

      {/* Orta tepe — uzak ağaçların tabanını örter, ikinci derinlik kademesi */}
      <path className="hill-mid" d={tepeAlani(yolNoktalari, ORTA_TEPE)} />

      {/* Yakın ağaç kuşağı: gövdeli ve gölgeli */}
      {yakinAgaclar.map((agac) => (
        <g
          key={`y-${agac.key}`}
          className={`tree sezon-${agac.mevsim}`}
          style={{ transform: `translate(${agac.x.toFixed(1)}px, ${agac.y.toFixed(1)}px)` }}
        >
          <Agac boy={agac.boy} tip={agac.tip} detayli />
        </g>
      ))}

      {/* Ön tepe — ağaçların tabanını örter, derinlik verir */}
      <path className="hill-near" d={tepeAlani(yolNoktalari, YAKIN_TEPE)} />

      {/* Yol */}
      <path className="path-tail" d={kuyruk} />
      <path ref={yolRef} className="path-rest" d={d} />
      <path
        className="path-done"
        d={d}
        pathLength="100"
        strokeDasharray="100 100"
        strokeDashoffset={(100 - yurunen * 100).toFixed(2)}
      />

      {/* Adım izleri: her görev bir nokta */}
      {adimlar.map((adim) => (
        <circle
          key={adim.key}
          className={`path-step ${adim.tamam ? 'is-done' : ''}`}
          cx={adim.x.toFixed(1)}
          cy={adim.y.toFixed(1)}
          r="3.4"
        />
      ))}

      {/* Duraklar */}
      {pts.map((p, index) => {
        const week = weeks[index]
        const durum = week.isComplete
          ? 'is-complete'
          : index === selectedIndex
            ? 'is-selected'
            : ''
        return (
          <g key={week.id} className={`path-stop ${durum}`}>
            {week.id === kutlanan ? (
              <circle
                className="stop-celebrate"
                cx={p.x.toFixed(1)}
                cy={p.y.toFixed(1)}
                r="9.5"
              />
            ) : null}
            <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="9.5" />
            <text x={p.x.toFixed(1)} y={(p.y + 3.6).toFixed(1)}>
              {week.weekNumber}
            </text>
          </g>
        )
      })}

      {/* Zirve bayrağı: patikanın sonu */}
      <g
        className={`summit ${hepsiTamam ? 'is-reached' : ''}`}
        style={{ transform: `translate(${zirve.x.toFixed(1)}px, ${zirve.y.toFixed(1)}px)` }}
      >
        <line className="summit-pole" x1="0" y1="-2" x2="0" y2="-26" />
        <path className="summit-flag" d="M0 -26 L15 -21 L0 -16 Z" />
      </g>

      {/* Bulunduğun nokta. Durak numarasını örtmesin diye ince bir sapla
          yukarı taşındı — haritalardaki iğne gibi. Patika bitince çizilmiyor:
          zirvede iğne ile bayrak tam üst üste geliyor, varışı bayrak anlatsın. */}
      {yuruyen && !hepsiTamam ? (
        <g
          className="path-walker"
          style={{ transform: `translate(${yuruyen.x.toFixed(1)}px, ${yuruyen.y.toFixed(1)}px)` }}
        >
          <line className="walker-stem" x1="0" y1="-4" x2="0" y2="-16" />
          <circle className="walker-halo" cy="-22" r="11" />
          <circle className="walker-dot" cy="-22" r="6" />
        </g>
      ) : null}
    </svg>
  )
}

export default TrailProfile
