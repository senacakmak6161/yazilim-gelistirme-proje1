# Kabul Testleri (Playwright)

Etkileşimli Ders Deneyimi Panosu'nun uçtan uca kabul testleri. Testler PDF'teki kabul kriterlerinden yazılmıştır; her test bir gereksinime etiketle bağlıdır ve sonuçlar izlenebilirlik raporunda gereksinim bazında görülür.

Test planı: [docs/TEST_PLAN.md](docs/TEST_PLAN.md) · UI sözleşmesi: [docs/TEST_CONTRACT.md](docs/TEST_CONTRACT.md) · Kararlar: [docs/DECISIONS.md](docs/DECISIONS.md)

## Gereksinimler

- Node.js 22 veya üstü
- Uygulamanın `npm run dev` ile açılabilmesi (repo kökünde)

## Kurulum

```bash
cd tests
npm ci
npx playwright install --with-deps
```

## Uygulamayı bağlama

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `APP_DIR` | — | Uygulamanın klasörü. Verilirse Playwright uygulamayı başlatır ve testler bitince kapatır. Bu repoda `..` |
| `APP_CMD` | `npm run dev` | Uygulamayı başlatan komut |
| `BASE_URL` | `http://localhost:5173` | Uygulamanın adresi |

```bash
APP_DIR=.. npx playwright test                   # uygulamayı Playwright başlatır
BASE_URL=http://localhost:3000 npx playwright test   # uygulama zaten açıksa
```

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run verify` | Tip denetimi, lint ve test listesi (uygulama gerektirmez) |
| `npm test` | Tüm testler, 6 projede |
| `npm run test:chromium` | Yalnızca masaüstü Chromium |
| `npm run test:ui` | Playwright UI modu |
| `npm run report` | Son koşunun HTML raporu |
| `npm run traceability` | `docs/TRACEABILITY.md` üretir |
| `npm run traceability:strict` | Karşılanmayan otomatik madde varsa çıkış kodu 1 (CI kapısı) |

Seçerek çalıştırma:

```bash
npx playwright test --grep @US-06           # bir kullanıcı hikâyesi
npx playwright test --grep @AC-07.2         # tek kabul kriteri
npx playwright test --grep @T5              # tek kabul senaryosu
npx playwright test --grep @P1              # öncelik
npx playwright test --project=mobile-safari # tek cihaz profili
npx playwright test --last-failed
npx playwright test --repeat-each=10 --grep @US-03   # kararsızlık kontrolü
```

## Etiket kuralları

Her test en az şu etiketleri taşır:

- `@US-xx` — kullanıcı hikâyesi (NFR testlerinde ilgili olduğunda)
- `@AC-xx.x`, `@Tn`, `@NFR-n` — doğruladığı gereksinim
- `@P1` / `@P2` / `@P3` — öncelik (PDF Tablo 4)

PDF dışı bir karara dayanan testler `annotation: { type: 'karar', description: 'K3: …' }` taşır. Gereksinim listesinde olmayan etiket raporda uyarı olarak görünür.

## Klasör yapısı

```
tests/
├── e2e/
│   ├── specs/        Test dosyaları (hikâye, senaryo ve NFR bazında)
│   ├── pages/        Page Object (locator'lar yalnızca burada)
│   ├── fixtures/     dashboard fixture'ı ve test seçenekleri
│   ├── support/      Sözleşme, veri yükleyici, yerleşim/renk/erişilebilirlik yardımcıları
│   └── data/         Test verisi (uygulama verisinden bağımsız)
├── traceability/     Gereksinim listesi (72 madde) ve elle kontrol kayıtları
├── scripts/          İzlenebilirlik raporu
├── docs/             Test planı, sözleşme, kararlar
└── playwright.config.ts
```

## Test seçenekleri

Ön koşullar `test.use({...})` ile verilir:

| Seçenek | Açıklama |
|---|---|
| `courseData` | Uygulamaya verilecek ders içeriği |
| `seededCompleted` | Başlangıçta tamamlanmış görev kimlikleri |
| `seededTheme` | Başlangıçta kayıtlı tema |
| `rawTaskStorage` | Ham localStorage değeri (bozuk kayıt testleri) |
| `courseDataFailures` | İçerik isteğinin ilk kaç kez 500 döneceği |
| `mockCourseData` | `false` ise uygulamanın kendi verisi kullanılır |
| `allowPageErrors` | Konsol hatası beklenen testlerde `true` (gerekçe `annotation` ile yazılır) |

## Elle kontroller

DS-1 … DS-4 maddelerinin sonucu `traceability/manual-results.json` dosyasına kontrol eden kişi, tarih ve gözlemle birlikte yazılır.
