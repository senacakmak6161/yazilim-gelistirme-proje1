import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import WeekList from './components/WeekList.jsx'
import TaskList from './components/TaskList.jsx'
import TrailProfile from './components/TrailProfile.jsx'
import Logo from './components/Logo.jsx'
import Icon from './components/Icon.jsx'
import Celebration from './components/Celebration.jsx'
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
    const kare = requestAnimationFrame(() => {
      document.documentElement.setAttribute('data-ready', 'true')
    })
    return () => cancelAnimationFrame(kare)
  }, [])

  /**
   * İlerleme sayıları ekranda mı? Değilse üst şeritte küçüğü belirir.
   * Kaydırma olayını dinlemek yerine kesişim gözlemcisi kullanıldı: her
   * kaydırma karesinde hesap yapmıyor.
   */
  const bandRef = useRef(null)
  const [bandGorunur, setBandGorunur] = useState(true)

  useEffect(() => {
    const oge = bandRef.current
    if (!oge || typeof IntersectionObserver === 'undefined') return undefined

    const gozlemci = new IntersectionObserver(
      ([giris]) => setBandGorunur(giris.isIntersecting),
      { threshold: 0 },
    )
    gozlemci.observe(oge)
    return () => gozlemci.disconnect()
  }, [])

  const currentWeek = findCurrentWeek(courses.weeks, taskStatus)
  const currentWeekId = currentWeek.id

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
      // Profil çiziminin altındaki hücreler: her görev için bir hücre
      cells: week.tasks.map((task) => Boolean(taskStatus[task.id])),
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

    setKutlama(
      hepsiBitti
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
          },
    )

    return undefined
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

      <div className="topbar-wrap">
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
            aria-pressed={theme === 'dark'}
            onClick={() => setStoredTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Icon name={theme === 'dark' ? 'gunes' : 'hilal'} />
            <span className="theme-label">Karanlık tema</span>
          </button>
        </header>
      </div>

      <div className="canvas">
        <div className="title-row">
          <h1>{courses.course.title}</h1>
          <p className="finding">{bulgu}</p>
        </div>

        {/* Patika: dersin yükselti profili, altında haftalar */}
        <section className="trail-panel" aria-label="Öğrenme yolculuğu">
          <ProgressBand
            tamamlanan={tamamlananToplam}
            toplam={tumGorevler.length}
            yuzde={yuzde}
            basRef={bandRef}
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
            <h2>{selectedWeek.title}</h2>
            <p className="detail-description">{selectedWeek.description}</p>

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
