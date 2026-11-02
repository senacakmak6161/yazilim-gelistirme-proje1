# Test Kararları

PDF'in ve proje README'sinin tanımlamadığı davranışlar için verilen kararlar. Testlerde `annotation` alanında kod ile anılır (ör. `K3`).

## Onaylanan kararlar

Onaylayan: Tarık Kılıç — 21.10.2026 (K9–K11: 22.10.2026)

| Kod | Konu | Karar | İlgili |
|---|---|---|---|
| K3 | Filtre, hafta ve arama birleşimi | VE mantığı: tüm ölçütleri sağlayan görevler listelenir | US-04, US-05, US-06 |
| K5 | Arama harf kuralı | tr-TR kurallı, büyük/küçük harfe duyarsız. I↔ı ve İ↔i eşleşir, I↔i eşleşmez. Baştaki/sondaki boşluk yok sayılır | US-06 |
| K7 | Yüzde yuvarlama | En yakın tam sayı (1/3 → %33, 2/3 → %67). Görev yoksa %0 | US-07 |
| K8 | İlerleme ve filtre ilişkisi | İlerleme her zaman tüm görevler üzerinden hesaplanır; filtre ve arama etkilemez | US-07 |
| D3 | Koşullu kriterler | Tema tercihi korunur; kalıcı saklama localStorage ile yapılır | AC-09.5, AC-10.5 |
| D4 | Hızlı tepki eşiği | 300 ms; yalnızca masaüstü Chromium'da ölçülür | NFR-4 |
| D5 | Temiz ortam kanıtı | CI'da temiz kurulum + `@NFR-6` duman testi | NFR-6 |
| D6 | "Okunabilir" ölçütü | Metin görünür ve kesilmemiş; renk kontrastı axe ile ölçülür | AC-02.4 |
| K9 | Durum filtresi adları | README kullanım bölümünde seçenek adı olarak yalnızca "Devam edenler" geçiyor (özellik tablosunda "tümü / devam eden / tamamlanan"). "Tümü" ve "Devam edenler" birebir, tamamlananlar seçeneği "Tamamlanan" veya "Tamamlananlar" olarak kabul edilir | US-04, T3 |
| K10 | `ddp.theme` değer biçimi | Testler kaydı JSON (`"dark"`) veya ham (`dark`) olarak okur; başlangıç teması JSON olarak yazılır | US-09 |
| K11 | Test verisinin verilmesi | `src/data/courses.json` için Vite modül isteği (`?import`) yakalanır; ekip kodunda değişiklik gerekmez. Testler `npm run dev` ile çalışır | Tümü |

## README ile doğrulananlar

Aşağıdaki maddeler proje README'siyle (Özellikler, Veri modeli) de doğrulandı. A2 ve A4 onay listesinden çıkarıldı.

| Kod | Konu | README karşılığı |
|---|---|---|
| K3 | Filtrelerin birlikte uygulanması | "iki filtre birlikte uygulanabilir" |
| A2 | Arama başlık ve açıklamada yapılır | "Görev başlıkları ve açıklamaları içinde anahtar kelime araması" |
| A4 | Okunamayan kayıt ve veride olmayan görev kimlikleri yok sayılır | Veri modeli → Dayanıklılık kuralı |

README veri modeliyle geçersiz kalanlar: A7 (yükleme hatası ve "Tekrar dene"; içerik `import` ile alındığı için ayrı bir yükleme adımı yok) ve A8 (sahipsiz görev; görevler haftanın içinde tutulduğu için oluşamaz). İlgili testler kaldırıldı.

## Tasarım ve uygulamayla netleşenler

Kaynak: tasarım ve arayüz taslağı (`docs/tasarim/`, ekran E0, E1, E8) ve `main` dalındaki uygulama. 02.11.2026'da güncellendi; uygulamanın tasarımdan ayrıldığı noktalar uygulamada düzeltildi.

| Kod | Konu | Davranış | İlgili |
|---|---|---|---|
| D1 | Başlangıç durumu | Açılışta bulunulan hafta seçilidir; hedef paneli o haftanın hedeflerini gösterir | US-02 |
| K13 | Bulunulan ve tamamlanan hafta | Tüm görevleri tamamlanan hafta tamamlanmış sayılır. Bulunulan hafta ("Şimdi") tamamlanmamış ilk haftadır; kayıt yokken ilk haftadır | US-01, US-07 |
| D2 | Hedeflerin yeri | Tek hedef paneli (`goals-panel`), seçilen haftaya göre dolar | US-01, US-02 |
| A5 | Görev listesi | Tek görev listesi; yalnızca seçili haftanın görevlerini gösterir. Testler bir göreve ulaşmak için önce haftasını seçer | US-01, US-03, US-07, US-10 |
| K12 | Hafta kartı içeriği | Kartta iki haneli hafta etiketi (`Hafta 01`), başlık ve görev sayacı bulunur; hafta açıklaması seçilince hafta detayında (`main`) gösterilir. Kartın erişilebilir adı görünen metninden oluşur | US-01, NFR-2 |
| K14 | Dar ekran yerleşimi | 1023 px ve altında hafta detayı patikada seçilen haftanın altında açılır; 1024 px ve üstünde sağ sütundadır (tasarım §11) | US-08 |

## Ekiple netleştirilecek

| Kod | Konu | Etkilenen testler |
|---|---|---|
| A1 ↔ D1 | Hafta filtresi eklendiğinde açılışta tüm görevler mi (A1), yoksa yalnızca bulunulan haftanın görevleri mi (D1) listelenecek | US-04, US-05, US-06, filtre kalıcılığı |

## Onay bekleyen varsayımlar

Testler bu varsayımlarla yazıldı. Ekip farklı karar verirse ilgili testler güncellenir.

| Kod | Varsayım | Etkilenen testler |
|---|---|---|
| D7 | Mobil okunabilirlik için en küçük yazı boyutu 12 px (Lighthouse "legible font sizes" ölçütü) | AC-08.2 |
| A1 | Kayıtlı filtre tercihi yokken açılışta tüm görevler listelenir; durum filtresi "Tümü", hafta filtresi "Tüm haftalar" seçilidir | US-03, US-04, US-05, US-06 |
| A3 | "Devam edenler" filtresindeyken tamamlanan görev listeden hemen çıkar | AC-04.3 |
| A6 | Karanlık temada tema düğmesi `aria-pressed="true"`; sayfa arka planı açık temadan koyudur | US-09, T8 |
| A9 | Durum seçenekleri Tümü → Devam edenler → Tamamlanan(lar) sırasıyla tek bir radyo grubundadır | AC-04.1, klavye |
| A10 | Görev yokken ilerleme "0 / 0 görev tamamlandı" gösterir (%0 README ile doğrulandı) | AC-07.6 |

## Geliştiriciye iletilecek maddeler

Ayrıntı: [TEST_CONTRACT.md](TEST_CONTRACT.md). Durum: iletilmedi.
