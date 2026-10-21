# Test Kararları

PDF'in tanımlamadığı davranışlar için verilen kararlar. Testlerde `annotation` alanında kod ile anılır (ör. `K3`).

## Onaylanan kararlar

Onaylayan: Tarık Kılıç — 21.10.2026

| Kod | Konu | Karar | İlgili |
|---|---|---|---|
| K3 | Filtre, hafta ve arama birleşimi | VE mantığı: tüm ölçütleri sağlayan görevler listelenir | US-04, US-05, US-06 |
| K5 | Arama harf kuralı | tr-TR kurallı, büyük/küçük harfe duyarsız. I↔ı ve İ↔i eşleşir, I↔i eşleşmez. Baştaki/sondaki boşluk yok sayılır | US-06 |
| K7 | Yüzde yuvarlama | En yakın tam sayı (1/3 → %33, 2/3 → %67). Görev yoksa %0 | US-07 |
| K8 | İlerleme ve filtre ilişkisi | İlerleme her zaman tüm görevler üzerinden hesaplanır; filtre ve arama etkilemez | US-07 |
| D1 | Başlangıç durumu | Hiçbir hafta seçili değil; hedef panelinde "Hedefleri görmek için bir hafta seçin." | US-02 |
| D2 | Hedeflerin yeri | Tek hedef paneli, seçilen haftaya göre dolar | US-01, US-02 |
| D3 | Koşullu kriterler | Tema tercihi korunur; kalıcı saklama localStorage ile yapılır | AC-09.5, AC-10.5 |
| D4 | Hızlı tepki eşiği | 300 ms; yalnızca masaüstü Chromium'da ölçülür | NFR-4 |
| D5 | Temiz ortam kanıtı | CI'da temiz kurulum + `@NFR-6` duman testi | NFR-6 |
| D6 | "Okunabilir" ölçütü | Metin görünür ve kesilmemiş; renk kontrastı axe ile ölçülür | AC-02.4 |

## Onay bekleyen varsayımlar

Testler bu varsayımlarla yazıldı. Ekip farklı karar verirse ilgili testler güncellenir.

| Kod | Varsayım | Etkilenen testler |
|---|---|---|
| D7 | Mobil okunabilirlik için en küçük yazı boyutu 12 px (Lighthouse "legible font sizes" ölçütü) | AC-08.2 |
| A1 | Açılışta tüm görevler listelenir; durum filtresi "Tümü", hafta filtresi "Tüm haftalar" seçilidir | US-03, US-04, US-05, US-06 |
| A2 | Arama görev başlığı ve açıklamasında yapılır | AC-06.2, AC-06.3, T4 |
| A3 | "Devam eden" filtresindeyken tamamlanan görev listeden hemen çıkar | AC-04.3 |
| A4 | Okunamayan kayıt ve veride olmayan görev kimlikleri hatasız yok sayılır | AC-10.5 |
| A5 | Hafta kartı seçimi görev listesini o haftaya süzer | AC-01.4, AC-01.5 |
| A6 | Karanlık temada tema düğmesi `aria-pressed="true"`; sayfa arka planı açık temadan koyudur | US-09, T8 |
| A7 | Veri yüklenemezse `role="alert"` mesajı ve "Tekrar dene" düğmesi gösterilir | AC-01.1 (dayanıklılık) |
| A8 | Var olmayan haftaya bağlı görev hiçbir hafta filtresinde görünmez | AC-05.2 (dayanıklılık) |
| A9 | Durum seçenekleri Tümü → Devam eden → Tamamlanan sırasıyla tek bir radyo grubundadır | AC-04.1, klavye |
| A10 | Görev yokken ilerleme "0 / 0 görev tamamlandı" ve %0 gösterir | AC-07.6 |

## Geliştiriciye iletilecek maddeler

Ayrıntı: [TEST_CONTRACT.md](TEST_CONTRACT.md). Durum: iletilmedi.
