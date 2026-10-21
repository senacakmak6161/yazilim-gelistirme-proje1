# Test Planı — Etkileşimli Ders Deneyimi Panosu

| | |
|---|---|
| Sürüm | 1.0 |
| Hazırlayan | Tarık Kılıç (Test) |
| Tarih | 22.10.2026 |
| Kaynak | *Etkileşimli Ders Deneyimi Panosu — Kullanıcı İhtiyaç Analizi, Kullanıcı Hikâyeleri ve Kabul Kriterleri* (Ekim 2026) |

## 1. Amaç

Uygulamanın PDF'te tanımlanan 54 kabul kriterini, 8 kabul test senaryosunu ve işlevsel olmayan gereksinimleri karşıladığını otomatik ve izlenebilir biçimde doğrulamak. Testler uygulamadan önce, kabul kriterlerinden yazılır (ATDD); uygulama geldiğinde çalıştırılmaya hazırdır.

## 2. Kapsam

| Grup | Madde | Yöntem |
|---|---|---|
| US-01 … US-10 kabul kriterleri | 54 | Otomatik (Playwright) |
| T1 … T8 kabul senaryoları | 8 | Otomatik |
| NFR-1, 2, 3, 4, 6 | 5 | Otomatik |
| NFR-5 kod kalitesi | 1 | Kapsam dışı — kod incelemesi ve ESLint ile |
| DS-1 … DS-4 ders sorumlusu beklentileri | 4 | Elle kullanılabilirlik kontrolü |
| **Toplam** | **72** | |

Kapsam dışı: uygulamanın kaynak kodu, sunucu tarafı, gerçek cihaz testi, ekran okuyucu deneyimi.

## 3. Test tasarım teknikleri

| Teknik | Kullanıldığı yer |
|---|---|
| Denklik sınıfları | Hedef sayısına göre haftalar (2, 3, 0 hedef), tamamlanmış/tamamlanmamış görevler |
| Sınır değer analizi | %0, %100, 0 görev, 320 px ekran genişliği, 1/3 ve 2/3 yuvarlama |
| Durum geçişi | Hafta değişimi, işaretle/geri al, filtre → tümü, tema aç/kapa, yenileme |
| Karar tablosu | Filtre + hafta + arama birleşimi (K3) |
| Hata tahmini | Bayat içerik, sıraya göre eşleme, Türkçe I/İ, bozuk kayıt, veri yükleme hatası |

Beklenen değerler test içinde elle yazılır; arama, filtre, yüzde ve yuvarlama sonuçları testte yeniden hesaplanmaz.

## 4. Test ortamları

| Proje | Cihaz | Motor |
|---|---|---|
| chromium | Masaüstü 1280×720 | Chromium |
| firefox | Masaüstü 1280×720 | Firefox |
| webkit | Masaüstü 1280×720 | WebKit |
| mobile-chrome | Pixel 7 | Chromium |
| mobile-safari | iPhone 13 | WebKit |
| tablet | iPad (gen 7) | WebKit |

Yerel ayar `tr-TR`, saat dilimi `Europe/Istanbul`, renk şeması `light`. Erişilebilirlik ve performans testleri yalnızca masaüstü Chromium'da çalışır; mobil dokunma testleri yalnızca mobil profillerde.

## 5. Test türleri ve dosyalar

| Dosya | İçerik |
|---|---|
| `us01` … `us10` | Kullanıcı hikâyesi başına kabul kriterleri |
| `acceptance-scenarios` | PDF Tablo 3 (T1–T8), ön koşul → işlem → beklenen adımlarıyla |
| `accessibility` | WCAG 2.1 AA (axe-core) |
| `keyboard` | Klavye ile kullanım (NFR-3) |
| `performance` | 300 ms tepki bütçesi, 100 görevlik veri (NFR-4) |
| `resilience` | Veri yükleme hatası, sahipsiz görev, boş ders |
| `smoke` | Uygulamanın kendi verisiyle açılması (NFR-6) |

## 6. Giriş ölçütleri

- Uygulama `npm run dev` ile açılıyor ve [TEST_CONTRACT.md](TEST_CONTRACT.md) uygulanmış.
- `npm run verify` (tip, lint, test listesi) temiz.
- Onay bekleyen varsayımlar ([DECISIONS.md](DECISIONS.md)) ekiple gözden geçirilmiş.

## 7. Çıkış ölçütleri

- İzlenebilirlik raporunda otomatik maddelerin tamamı **Başarılı** (`npm run traceability:strict` çıkış kodu 0).
- Kararsız (flaky) test sayısı 0 ya da kök nedeni kayıt altında.
- DS-1 … DS-4 için `traceability/manual-results.json` dolu.
- Açık P1 hata yok; P2 hatalar için karar verilmiş.

## 8. Riskler

| Risk | Etki | Önlem |
|---|---|---|
| Testler hiç gerçek uygulamaya karşı çalışmadı | Yanlış pozitif/negatif | İlk entegrasyonda her kritik test için beklenen değeri bozarak doğru sebeple düştüğü kontrol edilir |
| Sözleşme uygulanmazsa toplu kırmızı | Gürültülü ilk koşu | Sözleşme geliştiriciyle önceden paylaşılır |
| Onay bekleyen varsayımlar değişebilir | Test güncellemesi | Varsayımlar kodla etiketli (`annotation`), etkilenen testler listeli |
| Süre ölçümü makineye duyarlı | Kararsız NFR-4 | Tek motor, yumuşak doğrulama (`expect.soft`) |
| WebKit'te Tab davranışı platforma göre değişebilir | Klavye testi kararsızlığı | İlk koşuda gözlenir, gerekirse proje bazında ayarlanır |

## 9. Otomasyonun doğrulayamadıkları

- **NFR-5** (kodun anlaşılır ve tekrarsız olması): E2E testleri kodu görmez; kod incelemesi ve ESLint ile değerlendirilir.
- **DS-1 … DS-4**: "Anlaşılır" öznel bir ölçüttür. Kim, ne zaman, neye bakarak karar verdiği `manual-results.json`'a yazılır.
- Gerçek cihaz davranışı, ekran okuyucu deneyimi, uzun Türkçe başlıklarda taşma: her faz sonunda 15 dakikalık keşif testi (Ek B).

## 10. Raporlama

| Çıktı | Yer |
|---|---|
| HTML rapor | `playwright-report/` (`npm run report`) |
| JSON / JUnit | `test-results/results.json`, `test-results/junit.xml` (CI) |
| İzlenebilirlik | `docs/TRACEABILITY.md` (`npm run traceability`) |

Sonuç durumları PDF Bölüm 7 ile aynıdır: Başarılı, Başarısız, Test edilmedi.

## Ek A — Hata raporu şablonu

```
Başlık      : [US-xx] Kısa ve davranış odaklı açıklama
Kriter      : AC-xx.x / Tn
Önem        : P1 | P2 | P3
Ortam       : proje (ör. mobile-safari), tarayıcı sürümü, uygulama commit'i
Ön koşul    :
Adımlar     : 1. … 2. … 3. …
Beklenen    :
Gerçekleşen :
Kanıt       : trace.zip, ekran görüntüsü, video (test-results/)
Tekrar      : Her seferinde | Ara sıra (x/10)
```

## Ek B — Keşif testi kontrol listesi (15 dk)

- [ ] Gerçek telefonda (iOS ve Android) açılış, kaydırma, görev işaretleme
- [ ] Uzun Türkçe görev başlığı ve açıklamada satır kırılması, taşma
- [ ] Ekran okuyucu (VoiceOver/TalkBack) ile hafta seçimi ve görev işaretleme
- [ ] Yakınlaştırma %200'de yerleşim
- [ ] Koyu temada tüm durum mesajlarının okunabilirliği
- [ ] Ağ yavaşken (DevTools "Slow 3G") ilk yükleme ve hata mesajı
- [ ] Tarayıcı geri/ileri ve yenileme sonrası durum
- [ ] Bulgular Ek A şablonuyla kaydedildi
