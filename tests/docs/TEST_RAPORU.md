# Test Raporu — Kabul Testleri, Hata Listesi ve Düzeltme Kaydı

| | |
|---|---|
| Hazırlayan | Tarık Kılıç (Test) |
| Tarih | 06.11.2026 (ilk sürüm 02.11.2026) |
| İlgili görevler | #8 Kod Entegrasyonu ve Küçük İşlev Testleri, #17 Test Senaryoları, Hata Listesi ve Düzeltme Kaydı, #24 Kabul kriterlerini uçtan uca test edip kalan hataları giderme |
| Test edilen sürüm | `main` @ `87b52f9` (PR #20–#31 ve arama/filtre commit'i `2bb0cef`) ve bu rapordaki düzeltmeler, `test` dalı |
| Ortam | Playwright 1.64, 6 profil: masaüstü Chromium, Firefox, WebKit; Pixel 7, iPhone 13, iPad (gen 7). Node 24, Vite geliştirme sunucusu |
| Referans | Tasarım ve arayüz taslağı (`docs/tasarim/`), proje README'si, [TEST_CONTRACT.md](TEST_CONTRACT.md), [DECISIONS.md](DECISIONS.md), [TEST_PLAN.md](TEST_PLAN.md) |

## 1. Özet

- Proje kapsamındaki tüm özellikler kodda: hafta kartları, görev listesi ve durumları, ilerleme göstergesi, arama, hafta/durum filtresi, tema, localStorage kalıcılığı, mobil görünüm.
- Son koşu: 127 test × 6 profil = 762 koşu; **665 başarılı, 0 başarısız**, 97 profile özgü test bilinçli olarak atlandı. Yerelde yeniden deneme kapalı (`retries=0`), kararsız test yok.
- İzlenebilirlik kapısı (`npm run traceability:strict`): çıkış kodu 0. 71 otomatik maddenin 70'i Başarılı, NFR-5 (kod okunurluğu) E2E kapsamı dışında; elle yapılacak DS-1…DS-4 bekliyor.
- 06.11.2026 turunda 7 bulgu kaydedildi (B10–B16): 6'sı testlerden, 1'i uygulamadan kaynaklı; hepsi düzeltildi ve tekrar koşularıyla doğrulandı. Test takımı gözden geçirildi: birebir aynı işi yapan 10 test birleştirildi, README'de yazan ama test edilmeyen 7 davranış için kontrol eklendi (B14, B15). Önceki turdaki 9 bulgu (B1–B9) kapalı.
- Açık P1/P2 hata yok. Açık kalan konular bölüm 7'de: elle yapılacak kullanılabilirlik kontrolleri (DS-1…DS-4) ve yeni arayüze göre güncellenmesi gereken dokümanlar.

## 2. Entegrasyon kontrolü

| Kontrol | Sonuç |
|---|---|
| PR #20, #22 (tema), `2bb0cef` (arama ve filtre), #23 (ilerleme, kalıcılık), #29 (README), #30–#31 (arayüz yeniden tasarımı) | Test sözleşmesiyle uyumlu; sözleşme değişikliği gerekmedi. Yeniden tasarım sonrası tüm locator'lar ve metinler geçerli |
| `npm ci`, `npm run lint`, `npm run build` (temiz kurulum) | Hatasız |
| Testlerin doğrulaması (`npm run verify`: tip denetimi, lint, test listesi) | Hatasız, 127 test × 6 profil = 762 |
| CI (`.github/workflows/e2e.yml`) | README "her pull request'te lint ve derleme çalışır" diyordu, iş akışı uygulamayı yalnızca kuruyordu. Uygulamanın lint ve derleme adımları eklendi |

## 3. Kabul kriterlerine göre sonuçlar (#24)

| #24 maddesi | Gereksinimler | Sonuç (6 profil) |
|---|---|---|
| Hafta kartları ve görev listesi | US-01, US-02 | ✅ 126 / 126 (`us01`, `us02`) |
| Görev durumları ve ilerleme göstergesi | US-03, US-07 | ✅ 84 / 84 (`us03`, `us07`) |
| Arama, filtreleme ve tema | US-04, US-05, US-06, US-09 | ✅ 234 / 234 (`us04`, `us05`, `us06`, `us09`) |
| localStorage ile veri kalıcılığı | US-10, VM-1 (filtre tercihi), VM-3 (depolama kullanılamazken), bozuk/eksik kayıt dayanıklılığı | ✅ 78 / 78 (`us10`, `filter-persistence`, `resilience`) |
| Mobil görünüm | US-08, NFR-1: 3 mobil/tablet profili ve 320–1280 px arası 4 ekran boyutu, dokunarak kullanım, uzun Türkçe metin | ✅ 45 / 45 (`us08`; mobil profile özgü 9 test masaüstünde atlandı) |
| Kabul test senaryoları | T1–T8 (PDF Tablo 3) | ✅ 44 / 44 (`acceptance-scenarios`) |
| Erişilebilirlik, klavye, performans | NFR-2 (axe-core WCAG 2.1 AA, iki tema), klavye ile kullanım, NFR-4 (100 görevlik veride 300 ms) | ✅ erişilebilirlik 5 / 5, klavye 39 / 39, performans 4 / 4, duman testi (NFR-6) 6 / 6 |

Atlanan 97 koşu bilinçlidir: axe-core taraması (sonucu motordan bağımsız) ve süre ölçümü (karşılaştırılabilir olsun diye) yalnızca masaüstü Chromium'da; klavye testleri dokunmatik profillerde değil; mobil kriterler (AC-08.2, AC-08.3, T7) yalnızca mobil profillerde koşar.

## 4. Üçüncü hafta test senaryoları ve sonuçları (#17)

| Özellik | Senaryolar | Sonuç |
|---|---|---|
| Arama | Başlıkta ve açıklamada eşleşme; büyük/küçük harf farkı; Türkçe İ/i ve I/ı; baştaki/sondaki boşluk; harf harf yazarken daralma; eşleşme yokken M2 mesajı; temizleyince tüm görevlerin dönmesi; aramanın görev durumunu değiştirmemesi (US-06, T4) | ✅ |
| Hafta filtresi | Seçenek biçimi (`Hafta N – başlık`); seçilen haftanın görevleri; görevi olmayan haftada mesaj; patika ile hafta filtresinin iki yönlü bağı; durum filtresi ve aramayla ikili ve üçlü birlikte (VE) uygulanması (US-05) | ✅ |
| Durum filtresi | Tümü / Devam edenler / Tamamlanan; filtre açıkken tamamlanan görevin listeden çıkması; boş sonuçta mesaj (US-04, T3) | ✅ |
| Filtre tercihinin korunması | Son filtrenin yenilemede geri yüklenmesi; bozuk veya veride olmayan hafta kaydında varsayılana dönülmesi (VM-1) | ✅ |
| Açık/koyu tema | Geçiş, `aria-pressed`, arka planın koyulaşması, iki temada kontrast, tema değişince görev durumlarının korunması, tercihin yenilemede korunması, kayıtlı karanlık temayla açılış (US-09, T8) | ✅ |
| Görev durumu ve localStorage | İşaretleme ve geri alma kaydı, yenilemede geri yükleme, birden çok görevin ayrı ayrı korunması, bozuk kayıt, bilinmeyen görev kimliği, `false` değerli kayıt, depolamaya erişilemezken veya yazılamazken (gizli sekme) hatasız çalışma (US-10, T6, VM-3) | ✅ |
| İlerleme göstergesi | Sayı, yüzde ve çubuğun tutarlılığı; tamamlama ve geri almada yeniden hesaplama; %33/%67 yuvarlama; filtre ve aramadan etkilenmemesi; görev yokken `0 / 0` ve %0 (US-07, T5) | ✅ |

## 5. Hata listesi ve düzeltme kaydı

| No | Hata | Beklenen | Gerçekleşen | Önem | Kaynak | Yakalayan |
|---|---|---|---|---|---|---|
| B1 | Veride 3. hafta yoksa uygulama açılmıyor | Uygulama açılır | Boş sayfa, `Cannot read properties of undefined (reading 'weekNumber')` | Yüksek | Uygulama | US-08 uzun metin |
| B2 | Bulunulan ve tamamlanan hafta sabit | Tasarım E0: kayıt yokken ilk hafta "Şimdi", hiçbir hafta tamamlanmış görünmez | Hafta 3 her zaman "Şimdi"; Hafta 1–2 görev yapılmadan tamamlanmış görünüyor | Orta | Uygulama | US-01, US-02 |
| B3 | Yardımcı metinlerde renk kontrastı yetersiz | En az 4.5:1 (WCAG AA) | 3.26:1 | Orta | Uygulama | axe-core |
| B4 | Hafta kartının erişilebilir adı görünen metinle uyuşmuyor | Ad görünen "Hafta 01" etiketini içerir (WCAG 2.5.3) | `Hafta 1: …` | Orta | Uygulama | axe-core |
| B5 | Tablet görünümünde 10 px yazı | En az 12 px | "Şimdi" rozeti 10 px | Düşük | Uygulama | US-08 (AC-08.2) |
| B6 | Dar ekranda hafta detayının yeri | Tasarım §11: detay patikada seçilen haftanın altında açılır | Detay tüm patikanın altında | Orta | Uygulama | Tasarım karşılaştırması |
| B7 | Yazı tipi ve renk paleti tasarımdan farklı | README: Outfit + Work Sans (`@fontsource`); tasarım paleti | Sistem yazı tipi, farklı palet | Düşük | Uygulama | Tasarım karşılaştırması |
| B8 | İlerleme bandı seçili haftayı gösteriyor | Bulunulan hafta | Kullanıcının baktığı hafta | Düşük | Uygulama | Kod incelemesi |
| B9 | Patika ayrıntıları tasarımdan farklı | Başlanmamış haftada "N görev", gelecek yolda kesikli çizgi, "kat edilen yol" küçük harf | "0 / N görev", düz/noktalı çizgi, büyük harf | Düşük | Uygulama | Tasarım karşılaştırması |
| B10 | NFR-4: 100 görevlik veride durum filtresi 300 ms bütçesini aşıyor | Süre uygulamanın kullanıcı girdisine tepkisini ölçer | Tam koşuda 382 ms; ayrıca 5 tekrarda 2 kez (362 ve 413 ms). Ölçüm, Playwright'ın tıklama öncesi kaydırma ve kararlılık beklemesini de uygulama süresine ekliyordu; paralel yükte bu bekleme uzuyordu. Uygulamanın kendi tepkisi tek başına 43 ms | Orta | Test | performance (NFR-4) |
| B11 | WebKit'te "kartlar ve kontroller üst üste binmez" testi ara sıra düşüyor (3 tekrarda 1) | Gerçek yerleşim çakışması yoksa test geçer | `tema düğmesi ↔ ilerleme çubuğu` çakışması bildiriliyor. Yapışkan üst şerit kaydırmayla birlikte hareket ettiği için, motor hafta kartına tıklarken sayfayı daha çok kaydırdığında altından geçen ilerleme çubuğuyla çakışmış sayılıyordu | Düşük | Test | US-08 (AC-08.5) |
| B12 | İlerleme sayıları yapışkan üst şeridin arkasında kaldığında üst şeritteki küçük ilerleme göstergesi görünmüyor | Sayılar ekranda görünmediğinde küçük gösterge belirir | Yaklaşık 64 px'lik kaydırma aralığında ilerleme ekranın hiçbir yerinde görünmüyor (masaüstü, üç motorda) | Düşük | Uygulama | Keşif testi |
| B13 | Bir test hiçbir kabul kriterine bağlı değil | `tests/README.md`: her test doğruladığı kriterin etiketini taşır | "Şimdi etiketi sonraki haftaya geçer" testinde yalnızca hikâye etiketleri vardı; izlenebilirlik raporu "gereksinime bağlı olmayan test" uyarısı veriyordu | Düşük | Test | `npm run traceability` |
| B14 | Birebir aynı işi yapan testler | Her davranış tek testte doğrulanır; test birden çok kritere bağlanabilir | PDF aynı davranışı hem hikâye kriterlerinde hem T1–T8'de tanımladığı için 10 test, ilgili T senaryosuyla aynı veri, işlem ve kontrolü tekrarlıyordu (ör. AC-03.6, AC-07.3 ve T1) | Düşük | Test | Test takımı incelemesi |
| B15 | README'de tanımlı 7 davranış test edilmiyordu | README'deki her kullanıcı davranışının bir testi vardır | Başlığa tıklayarak işaretleme, üstü çizili başlık, arama + durum + hafta filtresinin üçü birlikte, patika ile hafta filtresinin bağı, hafta kutlaması, depolama kullanılamazken çalışma, özel çizilmiş görev kutusu ve durum filtresinde odak göstergesi | Orta | Test | README ile test eşleştirmesi |
| B16 | CI'da erişilebilirlik kontrast testi karanlık temaya geçişte düştü (PR #32, ikinci koşu) | Tarama ekranın son hâlini ölçer | axe, tema değişimindeki 620 ms'lik dairesel geçiş ve renk geçişleri sürerken çalışıyordu; geçişin ilk yarısında "Şimdi" kartı ve durum filtresi etiketleri ara renkleriyle ölçülüp kontrast ihlali sayılıyordu. Yerelde makine hızlı olduğu için görünmüyordu | Düşük | Test | CI |

| Hata | Dosya | Düzeltme | Doğrulama |
|---|---|---|---|
| B1, B2, B8 | `App.jsx`, `WeekList.jsx` | Sabit `currentWeekId = 3` kaldırıldı; bulunulan hafta tamamlanmamış ilk hafta olarak hesaplanıyor. Hafta, tüm görevleri bitince tamamlanmış sayılıyor. İlerleme bandı bulunulan haftayı gösteriyor | US-01, US-02, US-08 |
| B3, B7 | `index.css`, `main.jsx`, `package.json` | Tasarım paleti (metin renkleri AA eşiğinde), Outfit ve Work Sans, `tabular-nums` | axe-core |
| B4 | `WeekCard.jsx` | `aria-label` kaldırıldı; ad görünen metinden oluşuyor | axe-core |
| B5 | `responsive.css` | 12 px okunabilirlik kuralı 1023 px ve altını kapsıyor | AC-08.2 |
| B6 | `App.jsx`, `WeekList.jsx`, `hooks/useMediaQuery.js`, `App.css` | 1023 px ve altında detay seçilen haftanın altında açılıyordu. PR #30'daki yeniden tasarımla patika yatay şeride dönüştü ve bu davranış kaldırıldı; bkz. bölüm 7 | Tasarım karşılaştırması |
| B9 | `App.jsx`, `App.css` | Hafta özeti, kesikli çizgi ve etiket biçimi tasarıma uyarlandı | Tasarım karşılaştırması |
| B10 | `tests/e2e/pages/DashboardPage.ts` | Süre, eylemin sayfaya ulaşan ilk girdi olayının (pointerdown, keydown, input, change, click…) oluştuğu andan başlıyor; ana thread meşgulse olayın kuyrukta beklediği süre de ölçüme giriyor. Ondan önceki DOM değişiklikleri sayılmıyor. Eşik (300 ms) değişmedi | Tek başına 3–47 ms; 10 paralel tarayıcı yükünde medyan 13–114 ms, en kötü 248 ms. 4 ölçüm × 10 tekrar: 40/40 |
| B11 | `tests/e2e/support/layout.ts` | Kutular sayfa en üstteyken (yapışkan öğeler normal akıştaki yerindeyken) ölçülüyor, kaydırma konumu geri yükleniyor | 6 profil × 5 tekrar: 225/225. Bilerek oluşturulan çakışma 6 profilde yakalanıyor; ölçüm kaydırma konumunu değiştirmiyor |
| B12 | `App.jsx` | Kesişim gözlemcisi görünür alanın üstünden üst şerit yüksekliği kadar payı düşüyor. Mobilde küçük gösterge zaten gizli; başka davranış değişmedi | Chromium, Firefox, WebKit × 3 tekrar: sayfa başında gizli, sayılar kısmen görünürken gizli, şeridin arkasında ve aşağıda görünür. Düzeltme öncesi üç motorda da görünmüyordu |
| B13 | `tests/e2e/specs/us01-weekly-content.spec.ts` | Teste doğruladığı kriter olan `@AC-07.3` etiketi eklendi; testin adımları değişmedi | İzlenebilirlik uyarısı kalktı |
| B14 | `acceptance-scenarios`, `us03`, `us04`, `us06`, `us07`, `us09`, `us10` | 10 tekrar silindi; T1, T2, T3, T4, T5, T6, T8 silinenlerin kriter etiketlerini aldı. T6 silinenlerin tüm kontrollerini kapsıyor ve yenileme sonrası çubuğu da denetliyor; T8 tema değişince kayıtlı görev durumlarının korunduğunu da denetliyor | Silinen hiçbir testin kriteri karşılıksız kalmadı |
| B15 | `us01`, `us03`, `us05`, `resilience`, `keyboard`, `fixtures`, `DashboardPage.ts`, `contract.ts`, `requirements.json` | 7 yeni test, 2 testte ek kontrol (üstü çizili başlık, kutlama). Depolama durumu `storageAccess` fixture seçeneğiyle veriliyor (`blocked`, `read-only`); README §7 için gereksinim listesine VM-3 eklendi. Odak, özel çizilmiş kontrollerin çevresinde görüntü karşılaştırmasıyla denetleniyor. 130 test 127'ye indi | Yeni ve güçlendirilen her kontrol, tarayıcıya giden kod bilerek bozulduğunda düşüyor (14 mutasyonun 14'ü). Yeni testler 6 profilde 3–5 tekrarda kararsızlık göstermedi |
| B16 | `tests/e2e/support/accessibility.ts` | Her axe taramasından önce sonlu animasyonların bitmesi bekleniyor; sonsuz dekoratif ve kaydırmaya bağlı animasyonlar beklenmiyor. Uygulamanın son hâldeki renkleri değişmedi | Animasyonlar 10 kat yavaşlatılınca eski yöntem CI'daki ihlali aynı öğelerde üretiyor, yeni yöntem temiz. Erişilebilirlik 10 tekrar: 50 / 50. CI ayarlarıyla (2 işçi, chromium + mobile-chrome): 228 / 228, izlenebilirlik geçti |

## 6. Keşif testi (TEST_PLAN Ek B)

| Kontrol | Sonuç |
|---|---|
| Gerçek veriyle demo akışı: hafta seçimi, görev tamamlama, hafta kutlaması, ilerleme, arama, filtre, tema | ✅ Hafta 1 tamamlanınca kutlama açılıyor, "Şimdi" Hafta 2'ye geçiyor, ilerleme 5 / 30, %17 |
| Kutlama kartı açıkken erişilebilirlik | ✅ axe-core ihlal yok (Chromium, iPhone 13); Escape ile kapanıyor, ilerleme doğru kalıyor |
| Koyu temada durum mesajlarının okunabilirliği | ✅ axe-core iki temada da ihlal bulmadı |
| `<`, `>`, `&` içeren başlıklar | ✅ Uygulamada `innerHTML` kullanımı yok; React metni kaçışlıyor |
| Uzun Türkçe metin, yenileme sonrası durum | ✅ US-08 uzun metin, US-09/US-10 ve filtre kalıcılığı testleri |
| Gerçek telefon, ekran okuyucu, yavaş ağ | Yapılmadı; cihaz profilleriyle sınırlı kalındı |

## 7. Açık konular

| Konu | Öneri | Sorumlu |
|---|---|---|
| DS-1…DS-4 (anlaşılırlık) elle kontrol sonuçları `traceability/manual-results.json`'a girilmedi | Demo provasında 2–3 kişilik kısa kullanım denemesi; kontrol eden, tarih ve gözlem yazılır | Test, #28 |
| Dar ekranda hafta detayı seçilen haftanın değil, patikanın altında açılıyor (DECISIONS K14, tasarım §11) | Yeni yerleşim onaylanırsa tasarım dokümanı ve sözleşme güncellenir | Ekip lideri |
| README kullanıcı rehberi eski dikey yerleşimi anlatıyor: "soldaki patika", "sağda detay", "haftalar yukarıdan aşağıya", "patika sayfayla kaymaz" (satır 163, 665, 682–689, 747, 856) | Yeni yatay patikaya göre güncellenir | README sorumlusu, #28 |
| Depo düzeni: `src/assets/` altında kullanılmayan Vite şablon dosyaları (`react.svg`, `vite.svg`, `hero.png`), uygulama klasöründeki README Vite şablonu, main'e birleşmiş 9 uzak dal | Teslim öncesi temizlik | Ekip lideri, #27 |

## 8. Görev durumu

| #17 maddesi | Durum |
|---|---|
| Arama ve hafta/durum filtresi test senaryoları | ✅ Hazırlandı ve koşuldu (bölüm 4) |
| Açık ve koyu tema geçişleri | ✅ Geçti (US-09, T8) |
| Tema tercihinin yenilemede korunması | ✅ Geçti (AC-09.5) |
| Görev durumlarının değiştirilmesi ve localStorage | ✅ Geçti (US-10, T6) |
| İlerleme göstergesinin güncellenmesi | ✅ Geçti (US-07, T5) |
| Hata listesi, düzeltmeler ve test sonuçları | ✅ Bölüm 3–5 |

| #24 maddesi | Durum |
|---|---|
| Hafta kartları ve görev listesi | ✅ |
| Görev durumları ve ilerleme göstergesi | ✅ |
| Arama, filtreleme ve tema | ✅ |
| localStorage ile veri kalıcılığı | ✅ |
| Mobil görünüm | ✅ |
| Tespit edilen hataların giderilmesi | ✅ B10–B16 düzeltildi; dokümantasyon konuları bölüm 7'de |

## 9. Çalıştırma

```bash
cd tests
APP_DIR=../etkilesimli-ders-panosu npx playwright test                    # 6 profil
APP_DIR=../etkilesimli-ders-panosu npx playwright test --project=chromium # masaüstü Chromium
APP_DIR=../etkilesimli-ders-panosu npm run test:headed                    # tarayıcı görünür, yavaş çekim
npm run traceability:strict                                               # izlenebilirlik kapısı
```
