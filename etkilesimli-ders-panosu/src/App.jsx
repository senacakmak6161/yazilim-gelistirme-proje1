import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import WeekList from './components/WeekList.jsx'
import TaskList from './components/TaskList.jsx'
import TrailProfile from './components/TrailProfile.jsx'
import Logo from './components/Logo.jsx'
import Celebration from './components/Celebration.jsx'
import TemaIpi from './components/TemaIpi.jsx'
import Lamba from './components/Lamba.jsx'
import ProgressBand from './components/ProgressBand.jsx'
import ProgressMini from './components/ProgressMini.jsx'
import { haftaYuku, sureMetni } from './lib/ders.js'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import courses from './data/courses.json'
import './App.css'
import './responsive.css'

function resolveTheme(value) {
  return value === 'dark' ? 'dark' : 'light'
}

const GECERLI_DURUMLAR = ['all', 'active', 'completed']

/**
 * Kayıtlı filtre tercihini güvenli hâle getirir.
 * Sözleşme: okunamayan veya beklenmeyen değer uygulamayı düşürmez,
 * varsayılana dönülür.
 */
function resolveFilters(value, weeks) {
  const ham = value && typeof value === 'object' ? value : {}

  const status = GECERLI_DURUMLAR.includes(ham.status) ? ham.status : 'all'

  const haftaVar = weeks.some((week) => week.id === Number(ham.week))
  const week = haftaVar ? Number(ham.week) : 'all'

  return { status, week }
}

/**
 * Kaydırma durduğunda haber verir ve *durduğu anı* bildirir.
 *
 * Sabit bir gecikme yerine bu kullanılıyor: kaydırma mesafesi duruma göre
 * değişiyor ve sabit süre bazen kaydırma bitmeden doluyordu.
 *
 * Durduğunu anlamak altı kare sürüyor; bekleme o doğrulama anından
 * başlatılsaydı araya yüz milisaniyelik görünmez bir fazlalık giriyordu.
 * Bu yüzden konumun son değiştiği an da geri veriliyor.
 */
function kaydirmaBitince(geriCagir) {
  const baslangic = performance.now()
  let sonY = window.scrollY
  let sonHareket = baslangic
  let sabitKare = 0
  let kare = 0

  const bak = () => {
    const y = window.scrollY
    if (y === sonY) sabitKare += 1
    else {
      sabitKare = 0
      sonY = y
      sonHareket = performance.now()
    }

    // En az 180 ms beklenir: yumuşak kaydırma hemen başlamıyor, ilk birkaç
    // kare konum değişmeden geçiyor ve "durdu" sanılabiliyor.
    const yeterliSure = performance.now() - baslangic >= 180

    if (sabitKare >= 6 && yeterliSure) {
      geriCagir(sonHareket)
      return
    }
    kare = requestAnimationFrame(bak)
  }

  kare = requestAnimationFrame(bak)
  return () => cancelAnimationFrame(kare)
}

function isWeekComplete(week, taskStatus) {
  return week.tasks.length > 0 && week.tasks.every((task) => taskStatus[task.id])
}

function findCurrentWeek(weeks, taskStatus) {
  return weeks.find((week) => !isWeekComplete(week, taskStatus)) ?? weeks[weeks.length - 1]
}

function App() {
  const [taskStatus, setTaskStatus] = useLocalStorage('ddp.taskStatus', {})
  const [storedTheme, setStoredTheme] = useLocalStorage('ddp.theme', 'light')
  const [storedFilters, setStoredFilters] = useLocalStorage('ddp.filters', {
    status: 'all',
    week: 'all',
  })

  const theme = resolveTheme(storedTheme)
  const filters = resolveFilters(storedFilters, courses.weeks)

  const [selectedWeekId, setSelectedWeekId] = useState(() =>
    filters.week === 'all'
      ? findCurrentWeek(courses.weeks, taskStatus).id
      : filters.week,
  )

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  /**
   * İlk boyamadan sonra işaretlenen bayrak. Geri bildirim animasyonları
   * yalnızca buna bağlı; aksi hâlde kayıtlı görevlerle açılan sayfada otuz
   * onay işareti aynı anda çizilip giriş animasyonuna dönüşüyordu.
   */
  useEffect(() => {
    const kok = document.documentElement

    /**
     * Açılış animasyonu yalnızca bu işaret dururken geçerli; işaret kısa
     * süre sonra kaldırılıyor.
     *
     * Kalıcı bırakılamaz: sahne animasyonları da .trail-panel üzerinde
     * çalışıyor ve aynı `animation` özelliğini geçersiz kılıyor. Sahne
     * bitip sınıf kalkınca açılış animasyonu yeniden geçerli oluyor ve
     * baştan oynuyordu — patika tam kutlama kartı açılırken 16 piksel
     * zıplıyordu.
     */
    kok.setAttribute('data-entering', 'true')
    const kare = requestAnimationFrame(() => kok.setAttribute('data-ready', 'true'))
    const bitis = setTimeout(() => kok.removeAttribute('data-entering'), 760)

    return () => {
      cancelAnimationFrame(kare)
      clearTimeout(bitis)
    }
  }, [])

  /**
   * İlerleme sayıları ekranda mı? Değilse üst şeritte küçüğü belirir.
   * Kaydırma olayını dinlemek yerine kesişim gözlemcisi kullanıldı: her
   * kaydırma karesinde hesap yapmıyor.
   */
  const bandRef = useRef(null)
  const ustSeritRef = useRef(null)
  const [bandGorunur, setBandGorunur] = useState(true)

  useEffect(() => {
    const oge = bandRef.current
    if (!oge || typeof IntersectionObserver === 'undefined') return undefined

    const ustSeritYuksekligi = ustSeritRef.current?.offsetHeight ?? 0
    const gozlemci = new IntersectionObserver(
      ([giris]) => setBandGorunur(giris.isIntersecting),
      { threshold: 0, rootMargin: `-${ustSeritYuksekligi}px 0px 0px 0px` },
    )
    gozlemci.observe(oge)
    return () => gozlemci.disconnect()
  }, [])

  const currentWeek = findCurrentWeek(courses.weeks, taskStatus)
  const currentWeekId = currentWeek.id

  /**
   * Tema değişimi, düğmenin bulunduğu noktadan dışa doğru açılan bir
   * daireyle yapılır.
   *
   * Tarayıcının kendi View Transitions API'si kullanılıyor: eski ve yeni
   * görünümün anlık görüntüsünü alıp aralarında geçiş yapıyor. Kütüphane
   * gerekmiyor. Destekleyemeyen tarayıcıda ya da hareket azaltma tercihi
   * açıkken tema doğrudan değişiyor — işlev aynı, yalnızca gösteri yok.
   *
   * flushSync şart: React güncellemeyi geçişin içinde uygulamalı, yoksa
   * anlık görüntü eski temayla alınıyor.
   */
  function temayiUygula() {
    const yeni = theme === 'dark' ? 'light' : 'dark'
    const azHareket = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    if (azHareket || typeof document.startViewTransition !== 'function') {
      setStoredTheme(yeni)
      return
    }

    const kutu = temaDugmesiRef.current?.getBoundingClientRect()
    const x = kutu ? kutu.left + kutu.width / 2 : window.innerWidth / 2
    const y = kutu ? kutu.top + kutu.height / 2 : 0

    // Dairenin ekranın en uzak köşesine ulaşması için gereken yarıçap
    const yaricap = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const gecis = document.startViewTransition(() => {
      flushSync(() => setStoredTheme(yeni))
    })

    gecis.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${yaricap}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 620,
            easing: 'cubic-bezier(0.3, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
      .catch(() => {
        // Geçiş atlandıysa tema zaten değişmiş olur; yapacak bir şey yok
      })
  }

  /** Düğmeye tıklama. Tema ipi çekildiyse arkasından gelen tıklama yutulur. */
  function temayaTikla() {
    if (ipleCekildiRef.current) {
      ipleCekildiRef.current = false
      return
    }
    temayiUygula()
  }

  /** İp eşiği aşacak kadar çekildi. */
  function ipCekildi() {
    ipleCekildiRef.current = true
    temayiUygula()
  }

  function toggleTask(taskId) {
    setTaskStatus((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  function setStatusFilter(status) {
    setStoredFilters((prev) => ({ ...resolveFilters(prev, courses.weeks), status }))
  }

  /** Hafta filtresi ve hafta durağı aynı durumu paylaşır. */
  function setWeekFilter(value) {
    const week = value === 'all' ? 'all' : Number(value)
    setStoredFilters((prev) => ({ ...resolveFilters(prev, courses.weeks), week }))
    if (week !== 'all') setSelectedWeekId(week)
  }

  function selectWeek(weekId) {
    setSelectedWeekId(weekId)
    setWeekFilter(weekId)
  }

  const currentWeekIndex = courses.weeks.indexOf(currentWeek)

  const weeks = courses.weeks.map((week, index) => {
    const tamamlanan = week.tasks.filter((task) => taskStatus[task.id]).length
    const baslanmadi =
      week.tasks.length === 0 || (index > currentWeekIndex && tamamlanan === 0)

    return {
      ...week,
      isComplete: isWeekComplete(week, taskStatus),
      // Her görev için bir hücre. Kimlik de taşınıyor: patikadaki adım
      // izini listedeki satırla eşleştirebilmek için gerekli.
      cells: week.tasks.map((task) => ({
        id: task.id,
        tamam: Boolean(taskStatus[task.id]),
      })),
      summary: baslanmadi
        ? `${week.tasks.length} görev`
        : `${tamamlanan} / ${week.tasks.length} görev`,
      // Üstündeki tepenin yüksekliği bu sayıdan geliyor; yazılı olmazsa
      // çizim "neden yükseliyor" sorusunu cevapsız bırakıyor.
      // Süre tahmini girilmemişse hiç yazılmaz, "0 dk" yazılmaz.
      yuk: haftaYuku(week) > 0 ? sureMetni(haftaYuku(week)) : null,
    }
  })

  const selectedWeek = weeks.find((week) => week.id === selectedWeekId) ?? weeks[0]

  // Hafta filtresi listeyi belirler. "Tüm haftalar" ise liste hafta hafta
  // bölünerek gösterilir; tek hafta seçiliyse tek grup.
  const listeGruplari =
    filters.week === 'all' ? weeks : weeks.filter((week) => week.id === filters.week)

  // İlerleme her zaman tüm görevler üzerinden hesaplanır, filtreden etkilenmez
  const tumGorevler = courses.weeks.flatMap((week) => week.tasks)
  const tamamlananToplam = tumGorevler.filter((task) => taskStatus[task.id]).length

  const yuzde =
    tumGorevler.length === 0
      ? 0
      : Math.round((tamamlananToplam / tumGorevler.length) * 100)

  // Bulgu satırı: kalan yol, gerçek tahmini sürelerden toplanır
  const kalanDakika = tumGorevler
    .filter((task) => !taskStatus[task.id])
    .reduce((toplam, task) => toplam + (task.estimatedMinutes ?? 0), 0)

  const kalanGorev = tumGorevler.length - tamamlananToplam

  /**
   * Sayı zaten panelde duruyor; bu satır onu tekrarlamak yerine nerede
   * olduğunu ve ne kadar kaldığını söyler.
   *
   * Bitiş ölçütü kalan görev sayısıdır, kalan süre değil: her derste görev
   * süresi girilmiş olmayabilir ve süre sıfırken iş bitmiş sanılıyordu.
   */
  const bulgu =
    tumGorevler.length === 0
      ? 'Bu derse henüz görev eklenmemiş.'
      : kalanGorev === 0
        ? `Bütün patikayı yürüdün — ${weeks.length} durağın hepsi tamam.`
        : `Patikanın ${currentWeek.weekNumber}. durağındasın · ${
            kalanDakika > 0
              ? `yaklaşık ${sureMetni(kalanDakika)} yol kaldı`
              : `${kalanGorev} görev kaldı`
          }`

  /**
   * Kutlama tespiti. Yeni tamamlanan hafta varsa kısa bir kutlama açılır;
   * son hafta da bitmişse kutlama patika kutlamasına yükselir.
   *
   * İlk turda yalnızca mevcut durum kaydedilir: kayıtlı ilerlemeyle açılan
   * sayfada bitmiş bütün haftalar aynı anda kutlanırdı.
   */
  const tamamAnahtari = weeks
    .filter((week) => week.isComplete)
    .map((week) => week.id)
    .join(',')

  const oncekiTamamlar = useRef(null)
  const [kutlama, setKutlama] = useState(null)
  const temaDugmesiRef = useRef(null)
  const ipleCekildiRef = useRef(false)
  const [odakta, setOdakta] = useState(false)
  // Sahnenin ilk evresi: yol ve sayılar geride tutulur, patika titrer
  const [tutuluyor, setTutuluyor] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    const simdi = new Set(tamamAnahtari === '' ? [] : tamamAnahtari.split(',').map(Number))

    if (oncekiTamamlar.current === null) {
      oncekiTamamlar.current = simdi
      return undefined
    }

    const yeniId = [...simdi].find((id) => !oncekiTamamlar.current.has(id))
    oncekiTamamlar.current = simdi
    if (yeniId === undefined) return undefined

    const hepsiBitti = simdi.size === courses.weeks.length
    const hafta = courses.weeks.find((week) => week.id === yeniId)

    const sonuc = hepsiBitti
      ? {
          tip: 'patika',
          weekId: yeniId,
          baslik: 'Patikayı tamamladın!',
          alt: `${courses.weeks.length} durak · ${tumGorevler.length} görev · ${sureMetni(
            tumGorevler.reduce((t, task) => t + (task.estimatedMinutes ?? 0), 0),
          )} yol`,
        }
      : {
          tip: 'hafta',
          weekId: yeniId,
          baslik: `Hafta ${hafta.weekNumber} tamam`,
          alt: `${hafta.title} · ${hafta.tasks.length} görev bitti`,
        }

    const azHareket = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    if (azHareket) {
      setKutlama(sonuc)
      return undefined
    }

    /**
     * Sahne: önce patikaya dön, ilerlemeyi ağır çekimde doldur, sonra kartı
     * aç. Kart hemen açılırsa asıl olayı — yolun uzamasını ve sayının
     * yerine oturmasını — kimse görmüyor.
     */
    /**
     * Sahnenin zamanlaması.
     *
     * Kaydırma ile gerilim aynı anda başlarsa, sayfa hâlâ yukarı kayarken
     * patika titremeye başlıyor ve ikisi birbirine karışıyor. Önce kısa bir
     * nefes: kaydırma otursun, sonra gerilim başlasın.
     */
    const NEFES = 750 // kaydırma oturduktan sonraki bekleme
    const GERILIM = 560 // kalkış ve titreme
    const VURUS = 820 // çarpmadan kartın açılmasına

    // Yol ve sayı daha ilk andan itibaren geride tutulur; kayarken
    // ilerlemenin çoktan değişmiş olması sürprizi harcıyor.
    setTutuluyor(true)
    panelRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })

    const zamanlayicilar = []
    const iptal = kaydirmaBitince((durmaAni) => {
      // Bekleme kaydırmanın durduğu andan sayılır, doğrulandığı andan değil
      const kalan = Math.max(0, NEFES - (performance.now() - durmaAni))

      zamanlayicilar.push(setTimeout(() => setOdakta(true), kalan))
      zamanlayicilar.push(setTimeout(() => setTutuluyor(false), kalan + GERILIM))
      zamanlayicilar.push(
        setTimeout(() => {
          setOdakta(false)
          setKutlama(sonuc)
        }, kalan + GERILIM + VURUS),
      )
    })

    return () => {
      iptal()
      zamanlayicilar.forEach(clearTimeout)
    }
    // tumGorevler her render yeniden üretiliyor; tetikleyici anahtar yeterli
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tamamAnahtari])

  const haftaYukuDakika = haftaYuku(selectedWeek)

  /**
   * Seçili haftanın görev türü dağılımı. Yan sütun üç satırda bitip
   * uzun listenin yanında yüzlerce piksel boşluk bırakıyordu; bu döküm
   * uydurma bir dolgu değil, görevlerin kendi etiketlerinden geliyor.
   */
  const turDagilimi = ['okuma', 'uygulama', 'proje', 'quiz']
    .map((tur) => {
      const ait = selectedWeek.tasks.filter((task) => task.tags?.includes(tur))
      return {
        tur,
        toplam: ait.length,
        biten: ait.filter((task) => taskStatus[task.id]).length,
      }
    })
    .filter((satir) => satir.toplam > 0)

  // Profil ölçeğinin iki ucu; alt başlıkta yazıyla veriliyor
  const tumYukler = weeks.map(haftaYuku)
  const enHafifHafta = Math.min(...tumYukler)
  const enAgirHafta = Math.max(...tumYukler)
  const sureVar = enAgirHafta > 0

  return (
    <div className="page">
      {kutlama ? (
        <Celebration
          key={kutlama.baslik}
          tip={kutlama.tip}
          baslik={kutlama.baslik}
          alt={kutlama.alt}
          onKapat={() => setKutlama(null)}
        />
      ) : null}

      <div className="topbar-wrap" ref={ustSeritRef}>
        <header className={`topbar ${bandGorunur ? '' : 'is-compact'}`}>
          <div className="brand">
            <Logo />
            <strong className="brand-name">Ders Patikası</strong>
          </div>

          {/* Asıl band ekrandan çıkınca ilerleme buraya taşınır */}
          {bandGorunur ? null : (
            <ProgressMini
              tamamlanan={tamamlananToplam}
              toplam={tumGorevler.length}
              yuzde={yuzde}
            />
          )}

          <button
            type="button"
            className="theme-button"
            ref={temaDugmesiRef}
            aria-pressed={theme === 'dark'}
            onClick={temayaTikla}
          >
            <Lamba yanik={theme !== 'dark'} />
            <span className="theme-label">Karanlık tema</span>

            {/* Fareyle gelenlere ek bir yol; düğmenin kendisi değişmiyor */}
            <TemaIpi karanlik={theme === 'dark'} onCek={ipCekildi} />
          </button>
        </header>
      </div>

      <div className="canvas">
        <div className="title-row">
          <h1>{courses.course.title}</h1>
          <p className="finding">{bulgu}</p>
        </div>

        {/* Patika: dersin yükselti profili, altında haftalar */}
        <section
          className={`trail-panel ${odakta ? 'is-odakta' : ''} ${tutuluyor ? 'is-geriliyor' : ''}`}
          aria-label="Öğrenme yolculuğu"
          ref={panelRef}
        >
          <ProgressBand
            tamamlanan={tutuluyor ? Math.max(0, tamamlananToplam - 1) : tamamlananToplam}
            toplam={tumGorevler.length}
            yuzde={
              tutuluyor && tumGorevler.length > 0
                ? Math.round(((tamamlananToplam - 1) / tumGorevler.length) * 100)
                : yuzde
            }
            basRef={bandRef}
            yavas={odakta}
          >
            <div>
              <p className="panel-title">Patika</p>
              {/* Ölçeğin iki ucu yazıyla veriliyor: çizim yakınlaştırılmış
                  bir aralık gösteriyor, sıfır tabanlı değil. Derste süre
                  tahmini yoksa sayı uydurmak yerine cümle sadeleşiyor. */}
              <p className="panel-note">
                {sureVar
                  ? `Her durak bir hafta · yol ${sureMetni(enHafifHafta)}'dan ${sureMetni(enAgirHafta)}'ya tırmanıyor`
                  : 'Her durak bir hafta; dolu kısım kat ettiğin yol'}
              </p>
            </div>
          </ProgressBand>

          <div className="trail-figure">
            <TrailProfile
              weeks={weeks}
              yuzde={yuzde}
              selectedIndex={weeks.findIndex((week) => week.id === selectedWeek.id)}
              kutlanan={kutlama?.weekId ?? null}
              geriTut={tutuluyor}
            />
            <WeekList
              weeks={weeks}
              selectedWeekId={selectedWeekId}
              currentWeekId={currentWeekId}
              onSelect={selectWeek}
            />
          </div>
        </section>

        <div className="workspace">
          <main className="week-detail">
            {/* key haftayla değişiyor: React başlığı yeniden kuruyor, o da
                geçiş animasyonunu baştan başlatıyor. Eskiden içerik anında
                takla atıyordu. */}
            <div className="detail-head" key={selectedWeek.id}>
              <h2>{selectedWeek.title}</h2>
              <p className="detail-description">{selectedWeek.description}</p>
            </div>

            <TaskList
              gruplar={listeGruplari}
              taskStatus={taskStatus}
              onToggle={toggleTask}
              weeks={weeks}
              filters={filters}
              onStatusChange={setStatusFilter}
              onWeekChange={setWeekFilter}
              emptyMessage={
                tumGorevler.length === 0
                  ? 'Henüz görev bulunmuyor.'
                  : 'Bu haftaya ait görev bulunmuyor.'
              }
            />
          </main>

          <aside className="week-aside">
            <section className="goals-panel" data-testid="goals-panel">
              <h3>Hafta {selectedWeek.weekNumber} Öğrenme Hedefleri</h3>

              {selectedWeek.objectives.length > 0 ? (
                <ul>
                  {selectedWeek.objectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
              ) : (
                <p className="aside-empty">Bu hafta için henüz içerik eklenmemiş.</p>
              )}
            </section>

            {turDagilimi.length > 0 ? (
              <section className="facts-panel">
                <h3>Görev türleri</h3>
                <ul className="types">
                  {turDagilimi.map((satir) => (
                    <li key={satir.tur} className={`tur-${satir.tur}`}>
                      <span className="type-dot" aria-hidden="true" />
                      <span className="type-name">{satir.tur}</span>
                      <span className="type-count">
                        {satir.biten} / {satir.toplam}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="facts-panel">
              <h3>Bu durak</h3>
              <dl className="facts">
                {haftaYukuDakika > 0 ? (
                  <div>
                    <dt>Çalışma yükü</dt>
                    <dd>{sureMetni(haftaYukuDakika)}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Görev</dt>
                  <dd>{selectedWeek.summary}</dd>
                </div>
                <div>
                  <dt>Patikadaki yeri</dt>
                  <dd>
                    {selectedWeek.weekNumber} / {weeks.length}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default App
