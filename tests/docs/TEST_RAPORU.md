# Test Raporu — Kod Entegrasyonu ve İşlev Testleri

| | |
|---|---|
| Hazırlayan | Tarık Kılıç (Test) |
| Tarih | 02.11.2026 |
| İlgili görevler | #8 Kod Entegrasyonu ve Küçük İşlev Testleri, #17 Test Senaryoları, Hata Listesi ve Düzeltme Kaydı |
| Test edilen sürüm | `main` @ `e0214c7` (PR #9–#12) ve bu rapordaki düzeltmeler, `test` dalı |
| Referans | Tasarım ve arayüz taslağı (`docs/tasarim/`), proje README'si, [TEST_CONTRACT.md](TEST_CONTRACT.md), [DECISIONS.md](DECISIONS.md) |

## 1. Özet

- Ekibin geliştirdiği bileşenler ana uygulamayla uyumlu çalışıyor; lint ve derleme hatasız.
- Kodda bulunan özelliklerin kabul testlerinin tamamı 6 tarayıcı/cihaz profilinde geçiyor.
- 9 hata ve tasarım sapması bulundu, hepsi düzeltildi (bölüm 5).
- Başarısız testlerin tamamı henüz uygulanmayan arama, filtre ve tema özelliklerine ait (#14, #15).

## 2. Entegrasyon kontrolü

| Kontrol | Sonuç |
|---|---|
| `WeekList`, `WeekCard`, `TaskList`, `TaskItem`, `EmptyState`, `useLocalStorage` ile `App` | Uyumlu. Görev durumu tek kaynaktan yönetiliyor; kart, liste ve ilerleme aynı veriden hesaplanıyor |
| `src/data/courses.json` | Test sözleşmesindeki şemayla uyumlu |
| `npm run lint`, `npm run build` | Hatasız |
| CI (`.github/workflows/e2e.yml`) | Uygulama `etkilesimli-ders-panosu/` klasöründe olduğu için kabul testleri CI'da atlanıyordu; iş akışı bu klasöre bağlandı |

## 3. İşlev testleri

| #8 maddesi | Testler | Sonuç (6 profil) |
|---|---|---|
| Hafta/ders kartlarının görüntülenmesi | US-01 | 66 / 66 ✅ |
| Seçilen haftanın hedef ve görevleri | US-01, US-02 | 126 / 126 ✅ |
| Görev tamamlama ve geri alma | US-03, T1, T2, klavye | ✅ |
| Durum değişince arayüzün güncellenmesi | US-07, T5 | ✅ (filtre adımı içeren 1 test #15'i bekliyor) |
| Görev durumlarının saklanması | US-10, T6 | 54 / 54 ✅ |
| Örnek ders ve görev verisinin görüntülenmesi | Uygulamanın kendi verisiyle duman testi, ekran karşılaştırması | Haftalar, görevler ve ilerleme doğru. Duman testi arama kutusu adımında duruyor (#15) |
| Erişilebilirlik ve responsive | axe-core (WCAG 2.1 AA), US-08 | ✅ (arama/filtre adımı içeren testler #15'i bekliyor) |

Toplam koşu: 130 test × 6 profil = 780. **355 başarılı, 334 başarısız, 91 profil dışı atlandı.** Başarısızların tamamı #14 ve #15 kapsamındaki arama, durum/hafta filtresi, filtre kalıcılığı ve tema testleri.

## 4. Hata listesi ve düzeltme kaydı

| No | Hata | Beklenen | Gerçekleşen | Önem | Yakalayan |
|---|---|---|---|---|---|
| B1 | Veride 3. hafta yoksa uygulama açılmıyor | Uygulama açılır | Boş sayfa, `Cannot read properties of undefined (reading 'weekNumber')` | Yüksek | US-08 uzun metin |
| B2 | Bulunulan ve tamamlanan hafta sabit | Tasarım E0: kayıt yokken ilk hafta "Şimdi", hiçbir hafta tamamlanmış görünmez | Hafta 3 her zaman "Şimdi"; Hafta 1–2 görev yapılmadan tamamlanmış görünüyor | Orta | US-01, US-02 |
| B3 | Yardımcı metinlerde renk kontrastı yetersiz | En az 4.5:1 (WCAG AA) | 3.26:1 | Orta | axe-core |
| B4 | Hafta kartının erişilebilir adı görünen metinle uyuşmuyor | Ad görünen "Hafta 01" etiketini içerir (WCAG 2.5.3) | `Hafta 1: …` | Orta | axe-core |
| B5 | Tablet görünümünde 10 px yazı | En az 12 px | "Şimdi" rozeti 10 px | Düşük | US-08 (AC-08.2) |
| B6 | Dar ekranda hafta detayının yeri | Tasarım §11: detay patikada seçilen haftanın altında açılır | Detay tüm patikanın altında | Orta | Tasarım karşılaştırması |
| B7 | Yazı tipi ve renk paleti tasarımdan farklı | README: Outfit + Work Sans (`@fontsource`); tasarım paleti | Sistem yazı tipi, farklı palet | Düşük | Tasarım karşılaştırması |
| B8 | İlerleme bandı seçili haftayı gösteriyor | Bulunulan hafta | Kullanıcının baktığı hafta | Düşük | Kod incelemesi |
| B9 | Patika ayrıntıları tasarımdan farklı | Başlanmamış haftada "N görev", gelecek yolda kesikli çizgi, "kat edilen yol" küçük harf | "0 / N görev", düz/noktalı çizgi, büyük harf | Düşük | Tasarım karşılaştırması |

| Hata | Dosya | Düzeltme |
|---|---|---|
| B1, B2, B8 | `App.jsx`, `WeekList.jsx` | Sabit `currentWeekId = 3` kaldırıldı; bulunulan hafta tamamlanmamış ilk hafta olarak hesaplanıyor. Hafta, tüm görevleri bitince tamamlanmış sayılıyor. İlerleme bandı bulunulan haftayı gösteriyor |
| B3, B7 | `index.css`, `main.jsx`, `package.json` | Tasarım paleti (metin renkleri AA eşiğinde), Outfit ve Work Sans, `tabular-nums` |
| B4 | `WeekCard.jsx` | `aria-label` kaldırıldı; ad görünen metinden oluşuyor |
| B5 | `responsive.css` | 12 px okunabilirlik kuralı 1023 px ve altını kapsıyor |
| B6 | `App.jsx`, `WeekList.jsx`, `hooks/useMediaQuery.js`, `App.css` | 1023 px ve altında detay seçilen haftanın altında açılıyor |
| B9 | `App.jsx`, `App.css` | Hafta özeti, kesikli çizgi ve etiket biçimi tasarıma uyarlandı |

## 5. Açık konular

| Konu | İlgili |
|---|---|
| Arama, durum/hafta filtresi ve filtre tercihinin korunması kodda yok; testleri hazır | #15 |
| Tema düğmesi görünüyor ancak işlevsiz; tema testleri hazır | #14 |
| Hafta filtresi geldiğinde açılışta tüm görevler mi, bulunulan haftanın görevleri mi listelenecek (DECISIONS A1 ↔ D1) | #15 |

## 6. Görev #17 durumu

| Madde | Durum |
|---|---|
| Arama ve hafta/durum filtresi test senaryoları | Hazır (US-04, US-05, US-06, T3, T4, filtre kalıcılığı); özellik gelince koşulacak (#15) |
| Açık/koyu tema geçişi ve tercihin yenilemede korunması | Hazır (US-09, T8); özellik gelince koşulacak (#14) |
| Görev durumlarının değiştirilmesi ve localStorage | ✅ Geçti (US-10, T6) |
| İlerleme göstergesinin güncellenmesi | ✅ Geçti (US-07, T5) |
| Hata listesi ve düzeltme kaydı | Bölüm 4 |

## 7. Çalıştırma

```bash
cd tests
APP_DIR=../etkilesimli-ders-panosu npx playwright test                    # 6 profil
APP_DIR=../etkilesimli-ders-panosu npx playwright test --project=chromium # masaüstü Chromium
```
