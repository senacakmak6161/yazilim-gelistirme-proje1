# Proje İskeleti Kurulum Rehberi

**Kime:** Sena Çakmak (Lider) — görev P1-05 / YGP1-14 / YGP1-15
**Ne için:** Vite + React iskeletinin, belirlenmiş tasarım sistemine uygun biçimde kurulması
**Dayanak:** [`Tasarim-ve-Arayuz-Taslagi.pdf`](Tasarim-ve-Arayuz-Taslagi.pdf)

---

## 0. Bu rehber ne yapar, ne yapmaz

Bu adımda **hiçbir özellik geliştirilmeyecek.** Amaç, diğer üyelerin üstüne kod yazacağı
boş ama doğru kurulmuş bir iskelet bırakmak.

| Bu adımda yapılacak | Bu adımda YAPILMAYACAK |
|---|---|
| Vite + React projesi kurulumu | US-01…US-10 hikâyelerinin geliştirilmesi |
| Dizin yapısının açılması | Görev işaretleme, filtreleme, arama mantığı |
| Renk ve tipografi değişkenlerinin tanımlanması | Nihai görsel detaylar |
| Boş bileşen dosyalarının sözleşmeleriyle açılması | `courses.json` içeriğinin doldurulması *(Berkant'ta)* |
| `App.jsx` içinde state iskeletinin kurulması | Hesaplama fonksiyonlarının içinin yazılması |

> Bileşenlerin **içi boş kalacak**, yalnızca dosya + props sözleşmesi + "burayı kim dolduracak"
> yorumu bulunacak. Böylece dört kişi aynı anda, çakışmadan çalışmaya başlayabilir.

---

## 1. Kurulum komutları

```bash
# Repo kökünde (yazilim-gelistirme-proje1 klasörü içinde)
npm create vite@latest . -- --template react
npm install
npm install @fontsource/outfit @fontsource/work-sans
npm run dev
```

`npm create vite` mevcut klasöre kuracağı için "klasör boş değil" uyarısı verirse
**"Ignore files and continue"** seçeneğini seç — README, docs ve presentation klasörleri korunur.

**Doğrulama:** `npm run dev` çalışıyor ve tarayıcıda boş bir React sayfası açılıyor.

---

## 2. Dizin yapısı

Kurulum sonrası `src/` şu hâle getirilecek:

```
src/
├── components/
│   ├── Header.jsx
│   ├── ProgressBar.jsx
│   ├── Toolbar.jsx
│   ├── SearchBar.jsx
│   ├── FilterBar.jsx
│   ├── ThemeToggle.jsx
│   ├── TrailList.jsx
│   ├── TrailStop.jsx
│   ├── ObjectiveList.jsx
│   ├── TaskList.jsx
│   ├── TaskItem.jsx
│   └── EmptyState.jsx
├── hooks/
│   ├── useLocalStorage.js
│   └── useTheme.js
├── utils/
│   ├── filterTasks.js
│   └── calculateProgress.js
├── data/
│   └── courses.json
├── styles/
│   ├── variables.css
│   ├── global.css
│   └── responsive.css
├── App.jsx
└── main.jsx
```

Vite'ın getirdiği `App.css`, `index.css` ve `assets/react.svg` **silinecek.**

---

## 3. Zorunlu dosya içerikleri

Aşağıdaki üç dosya **birebir** bu şekilde oluşturulacak. Renk değerleri tasarım belgesinden
gelir; değiştirilmeyecek.

### `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages alt dizinde yayınlandığı için zorunlu.
  // Bu satır olmazsa yayınlanan sayfa bembeyaz açılır.
  base: '/yazilim-gelistirme-proje1/',
})
```

### `src/styles/variables.css`

```css
/* Ders Patikası — tasarım değişkenleri
   Renk değerleri tasarım belgesinden gelir, doğrudan değiştirilmez.
   Hiçbir bileşende renk sabit yazılmaz; yalnızca bu değişkenler kullanılır. */

:root {
  /* Yüzeyler */
  --bg:          #f3f6f3;
  --surface:     #ffffff;
  --surface-2:   #e9efe9;

  /* Metin */
  --ink:         #15201a;
  --text:        #2c3a33;
  --text-soft:   #4e5d55;
  --muted:       #7a877f;

  /* Çizgiler */
  --border:      #d5ded7;
  --line:        #c6d1c8;

  /* Vurgu — bulunulan hafta, yol işareti */
  --accent:      #a2701f;
  --accent-ink:  #8a5e16;
  --accent-soft: #f6ecd8;
  --accent-line: #dcc08a;

  /* Tamamlandı */
  --done:        #35714f;
  --done-soft:   #e2efe7;

  /* Ölçek */
  --radius-sm: 4px;
  --radius:    8px;
  --radius-lg: 12px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;

  /* Tipografi */
  --font-display: 'Outfit', system-ui, sans-serif;
  --font-body:    'Work Sans', system-ui, sans-serif;

  /* Hareket */
  --t-fast: 180ms;
  --t-base: 240ms;
  --t-slow: 320ms;
  --ease:   cubic-bezier(.2, .8, .3, 1);
}

html[data-theme='dark'] {
  --bg:          #0e1411;
  --surface:     #151d18;
  --surface-2:   #1b241e;

  --ink:         #e9efe9;
  --text:        #d3ddd6;
  --text-soft:   #aebbb3;
  --muted:       #7f8d85;

  --border:      #26312b;
  --line:        #2f3b34;

  --accent:      #dfa948;
  --accent-ink:  #e8bb6b;
  --accent-soft: #261d0f;
  --accent-line: #5c4820;

  --done:        #6cba8c;
  --done-soft:   #14251b;
}
```

### `src/styles/global.css`

```css
@import '@fontsource/outfit/400.css';
@import '@fontsource/outfit/600.css';
@import '@fontsource/work-sans/400.css';
@import '@fontsource/work-sans/500.css';
@import './variables.css';

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  font-variant-numeric: tabular-nums;   /* rakamlar zıplamasın */
  -webkit-font-smoothing: antialiased;
  transition: background var(--t-base) var(--ease),
              color var(--t-base) var(--ease);
}

h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.015em;
}

button, input, select {
  font: inherit;
  color: inherit;
}

/* Klavye odağı her iki temada görünür olmalı — erişilebilirlik kriteri */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Hareket azaltma tercihi — erişilebilirlik kriteri */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### `src/styles/responsive.css`

```css
/* Kırılım noktaları — tasarım belgesi bölüm 11
   < 640px    tek sütun
   640-1023   tek sütun, filtreler yan yana
   >= 1024    iki sütun: patika (yapışkan) + detay           */

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 286px 1fr;
    gap: var(--space-7);
    align-items: start;
  }
  .trail-column { position: sticky; top: var(--space-5); }
}
```

### `src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import './styles/responsive.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### `.gitignore` — şu satırların bulunduğundan emin ol

```
node_modules
dist
.DS_Store
*.local
```

---

## 4. `App.jsx` — state iskeleti

Tek doğruluk kaynağı buradadır. Görev durumları **yalnızca** burada tutulur; alt bileşenler
kendi kopyasını saklamaz.

```jsx
import { useState } from 'react'
import courses from './data/courses.json'

export default function App() {
  // --- Tek doğruluk kaynağı ---
  const [taskStatus, setTaskStatus] = useState({})   // { "w1-t1": true }
  const [activeWeekId, setActiveWeekId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')  // all | active | done
  const [weekFilter, setWeekFilter] = useState('all')
  const [query, setQuery] = useState('')

  // --- Türetilmiş veri: HESAPLANIR, STATE'TE TUTULMAZ ---
  // const visibleTasks = filterTasks(...)      → Tarık dolduracak (US-04/05/06)
  // const progress     = calculateProgress(...) → Yunus Emre dolduracak (US-07)

  function toggleTask(taskId) {
    setTaskStatus(prev => ({ ...prev, [taskId]: !prev[taskId] }))
    // Kalıcılık useLocalStorage ile eklenecek → Yunus Emre (US-10)
  }

  return (
    <div className="page">
      {/* Header       → ThemeToggle içerir */}
      {/* ProgressBar  → progress prop'u alır */}
      {/* Toolbar      → SearchBar + FilterBar */}
      <main className="layout">
        {/* TrailList     → haftalar, aktif hafta seçimi */}
        {/* Detay sütunu  → ObjectiveList + TaskList */}
      </main>
    </div>
  )
}
```

---

## 5. Bileşen sözleşmeleri

Her dosya açılacak, içine **yalnızca** aşağıdaki iskelet ve sorumluluk yorumu yazılacak.
İçini ilgili kişi dolduracak.

| Bileşen | Props | Sorumlu | Hikâye |
|---|---|---|---|
| `Header` | `courseTitle`, `term` | Sena | — |
| `ThemeToggle` | `theme`, `onToggle` | Yunus Emre | US-09 |
| `ProgressBar` | `completed`, `total`, `percent` | Yunus Emre | US-07 |
| `Toolbar` | çocuk bileşenleri sarar | Sena | — |
| `SearchBar` | `value`, `onChange` | Tarık | US-06 |
| `FilterBar` | `status`, `week`, `onStatusChange`, `onWeekChange`, `weeks` | Tarık | US-04, US-05 |
| `TrailList` | `weeks`, `activeWeekId`, `taskStatus`, `onSelectWeek` | Berkant | US-01 |
| `TrailStop` | `week`, `state` (`done`/`now`/`future`), `onSelect` | Berkant | US-01 |
| `ObjectiveList` | `objectives` | Berkant | US-02 |
| `TaskList` | `tasks`, `taskStatus`, `onToggle` | Sena | US-03 |
| `TaskItem` | `task`, `isDone`, `onToggle` | Sena | US-03 |
| `EmptyState` | `title`, `message`, `actionLabel`, `onAction` | Tarık | US-04, US-06 |

**Boş bileşen şablonu:**

```jsx
// TrailStop — patikadaki tek bir hafta durağı
// Durumlar: done (dolu nokta + dolu çizgi) | now (vurgu rengi + "şimdi" etiketi)
//           future (boş nokta + kesikli çizgi)
// Sorumlu: Berkant Aydın · US-01
// Tasarım: Tasarim-ve-Arayuz-Taslagi.pdf, bölüm 05-06

export default function TrailStop({ week, state, onSelect }) {
  return null  // TODO
}
```

---

## 6. `courses.json` — şema

Berkant dolduracak; iskelette **tek haftalık örnek** bırakılacak ki uygulama çökmesin.

```json
{
  "course": { "title": "Yazılım Geliştirme", "term": "2026 Güz" },
  "weeks": [
    {
      "id": 1,
      "weekNumber": 1,
      "title": "Örnek Hafta",
      "description": "Bu veri Berkant tarafından değiştirilecek.",
      "objectives": ["Örnek öğrenme hedefi"],
      "tasks": [
        {
          "id": "w1-t1",
          "title": "Örnek görev",
          "description": "",
          "dueDate": null,
          "tags": ["örnek"]
        }
      ]
    }
  ]
}
```

Görev kimliği biçimi: `w{haftaNo}-t{sıraNo}` — benzersiz olmalı, `localStorage` anahtarı buna bağlı.

---

## 7. Kesin kurallar

Bunlar tasarım sisteminin bozulmaması için konuldu. İstisnası yok.

| # | Kural | Neden |
|:---:|---|---|
| 1 | **Renk sabit yazılmaz.** `#fff`, `red`, `rgb(...)` yasak — yalnızca `var(--...)` | Tema değişimi tek noktadan çalışsın |
| 2 | **Inline style kullanılmaz.** Stiller CSS dosyalarında durur | Dosya sahipliği ve çakışma kontrolü |
| 3 | **Hazır UI kütüphanesi kurulmaz** (Bootstrap, MUI, Tailwind, shadcn…) | Teknik doküman kendi tasarım kararlarımızı savunmamızı istiyor |
| 4 | **Emoji ikon olarak kullanılmaz.** İkonlar satır içi SVG | Ölçeklenebilirlik ve tutarlılık |
| 5 | **Kart kutusu kullanılmaz.** Gruplama ince ayraç çizgisi ve boşlukla yapılır | Tasarımın temel kararı; patikanın dikey çizgisi tek yapısal unsur |
| 6 | **Görev durumu `App.jsx` dışında tutulmaz** | İlerleme göstergesiyle liste tutarsızlaşmasın |
| 7 | **Filtrelenmiş liste ve ilerleme state'te saklanmaz,** her render'da hesaplanır | Senkronizasyon hatası oluşmasın |
| 8 | **Yalnızca `transform` ve `opacity` animasyonlanır** | Performans; `width`/`height` animasyonu takılma yapar |
| 9 | **Durum yalnızca renkle anlatılmaz** — ikon, metin veya çizgi biçimi de değişir | Erişilebilirlik; renk körü kullanıcı ayırt edebilmeli |
| 10 | **`node_modules` commit'lenmez** | Repo kullanılamaz hâle gelir |

---

## 8. Tamamlanma kontrol listesi

- [ ] `npm run dev` çalışıyor, sayfa hatasız açılıyor
- [ ] `src/` yapısı bölüm 2'deki gibi, Vite'ın örnek dosyaları silinmiş
- [ ] `variables.css` birebir girilmiş, iki tema da tanımlı
- [ ] `global.css` ve `responsive.css` `main.jsx` içinde import edilmiş
- [ ] `vite.config.js` içinde `base` satırı var
- [ ] Outfit ve Work Sans yüklü, sayfada uygulanıyor
- [ ] `data-theme="dark"` elle eklendiğinde renkler değişiyor *(DevTools'tan `<html>` üzerinde dene)*
- [ ] 12 bileşen dosyası açılmış, her birinde sorumlu ve hikâye kodu yazılı
- [ ] `courses.json` örnek veriyle duruyor, uygulama çökmüyor
- [ ] `node_modules` `.gitignore` içinde
- [ ] Commit atıldı: `git commit -m "YGP1-14 Vite ve React iskeletini kurdum"`

---

## 9. AI'a verilecek hazır istem

Bu rehberi bir yapay zekâ aracına verecekseniz, aşağıdaki metni başa ekleyin:

> Aşağıdaki rehbere **birebir uyarak** bir Vite + React proje iskeleti kur.
>
> Kurallar:
> - Rehberdeki dosya içeriklerini **aynen** kullan; renk değerlerini, değişken adlarını ve
>   dosya yollarını değiştirme.
> - Bileşenlerin **içini doldurma.** Her bileşen `return null` döndürsün, üstünde sorumluluk
>   yorumu bulunsun. Özellik geliştirme bu adımın kapsamı dışında.
> - Bölüm 7'deki 10 kuralın hiçbirini ihlal etme. Özellikle: renk sabit yazma, inline style
>   kullanma, hazır UI kütüphanesi kurma, emoji kullanma.
> - Rehberde olmayan bir paket kurma, rehberde olmayan bir dosya oluşturma.
> - Bir şey belirsizse tahmin etme, sor.
>
> Çıktı olarak oluşturulan/değiştirilen her dosyanın tam içeriğini ver.
>
> --- REHBER ---
> *(bu dosyanın tamamını buraya yapıştır)*

---

**Takıldığın yerde Yunus Emre'ye yaz** — tasarım sistemiyle ilgili her karar
[`Tasarim-ve-Arayuz-Taslagi.pdf`](Tasarim-ve-Arayuz-Taslagi.pdf) içinde gerekçesiyle var.
