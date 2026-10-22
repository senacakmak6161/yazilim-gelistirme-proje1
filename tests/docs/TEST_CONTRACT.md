# Test Sözleşmesi (UI Contract)

Kabul testlerinin uygulamayı bulabilmesi için gereken roller, erişilebilir adlar, `data-testid` değerleri, metinler ve veri biçimleri. Veri modeli ve localStorage anahtarları proje README'sindeki *Veri modeli* bölümüyle aynıdır. Testlerdeki tek kaynak: `e2e/support/contract.ts`.

Bir ad veya metin değişecekse önce test ekibiyle konuşulur; değişiklik yalnızca `contract.ts` ve bu dosyada yapılır.

## 1. Veri

| Konu | Sözleşme |
|---|---|
| İçerik dosyası | `src/data/courses.json`, uygulamaya `import` ile alınır. Testler Vite geliştirme sunucusunun bu dosya için yaptığı modül isteğini (`/src/data/courses.json?import`) yakalayıp kendi verisini döndürür; bu yüzden testler `npm run dev` ile açılan uygulamaya karşı çalışır. Dosya `fetch` ile okunursa (`…/data/courses.json`) istek JSON olarak yanıtlanır. |
| Şema | `{ course: { title, term }, weeks: [{ id, weekNumber, title, description, objectives[], tasks: [{ id, title, description, dueDate, tags[] }] }] }` |
| Kimlikler | Hafta `id` sayıdır, ekranda `weekNumber` gösterilir. Görev `id` biçimi `w{hafta}-t{sıra}` (ör. `w1-t1`). |
| Sıra | Haftalar, hedefler ve görevler verideki sırayla gösterilir. |

## 2. Ekran öğeleri

| Öğe | Bulunma yolu | Kurallar |
|---|---|---|
| Hafta kartı | `role=button`, `data-testid="week-card"` | Erişilebilir ad `Hafta N: <başlık>` ile başlar. Kart hafta numarası, başlık ve açıklamayı içerir. Seçili kartta `aria-pressed="true"`. |
| Hedef paneli | `data-testid="goals-panel"` | İçinde tek bir başlık (`heading`) ve hedefler için tek bir liste (`ul/ol > li`). Başlık: `Hafta N Öğrenme Hedefleri`. |
| Hafta filtresi | `role=combobox`, ad `Hafta` | Seçenekler: `Tüm haftalar`, ardından her hafta için `Hafta N – <başlık>` (uzun tire). |
| Durum filtresi | `fieldset/legend` veya `role=radiogroup`, ad `Görev durumu` | Sırasıyla `Tümü`, `Devam edenler`, `Tamamlanan` (veya `Tamamlananlar`) radyo düğmeleri. |
| Arama | `role=searchbox` (`input type="search"`), ad `Görev ara` | Yazdıkça sonuç güncellenir. |
| Görev satırı | `data-testid="task-item"`, `data-task-id="<id>"` | |
| Görev başlığı | `data-testid="task-title"` | Satırın içinde. |
| Görev kutusu | `role=checkbox` | Erişilebilir adı görev başlığının kendisidir (`<label for>`). |
| Tamamlandı rozeti | Görev satırında `Tamamlandı` metni | Yalnızca tamamlanan görevde görünür. |
| Boş liste mesajı | `data-testid="empty-state"` | Yalnızca görev listesinde kullanılır. Hedef panelindeki mesajlar düz metindir. |
| İlerleme metni | `data-testid="progress-text"` | `X / Y görev tamamlandı` |
| İlerleme yüzdesi | `data-testid="progress-percent"` | `%N` |
| İlerleme çubuğu | `role=progressbar`, ad `Genel ilerleme` | `aria-valuenow` yüzde ile aynı tam sayı. Dolgu öğesi `data-testid="progress-fill"`, genişliği yüzdeyle orantılı. |
| Tema düğmesi | `role=button`, ad `Karanlık tema` | Karanlık temada `aria-pressed="true"`. Tema rengi `html` veya `body` arka planına uygulanır. |

## 3. Mesajlar

| Kod | Nerede | Metin |
|---|---|---|
| M1 | Hedef paneli, hedefi olmayan hafta | Bu hafta için henüz içerik eklenmemiş. |
| M2 | Görev listesi, filtre/arama sonucu boş | Seçilen ölçütlere uygun görev bulunamadı. |
| M3 | Görev listesi, seçilen haftada görev yok | Bu haftaya ait görev bulunmuyor. |
| M4 | Görev listesi, derste hiç görev yok | Henüz görev bulunmuyor. |
| — | Hedef paneli, hafta seçilmemiş | Hedefleri görmek için bir hafta seçin. |

## 4. Kalıcı veri (localStorage)

| Anahtar | Değer |
|---|---|
| `ddp.taskStatus` | `{"w1-t1":true,"w2-t3":false}` — görev kimliği → tamamlanma durumu. Yalnızca `true` olanlar tamamlanmış sayılır. |
| `ddp.theme` | `"light"` veya `"dark"`. Testler JSON (`"dark"`) ve ham (`dark`) değeri okur; başlangıç değerini JSON olarak yazar. |
| `ddp.filters` | `{"status":"active","week":"all"}` — son kullanılan filtre tercihi; yenilemede geri yüklenir. |

Okunamayan veya beklenen biçimde olmayan değer uygulamayı hataya düşürmez; varsayılan değerlere dönülür. Veride olmayan görev kimliği yok sayılır.

## 5. Genel

- Sayfa yüklenirken ve kullanım sırasında konsolda hata (`console.error`, yakalanmamış istisna) oluşmaz. Testler bunu otomatik denetler.
- Etkileşimli öğeler klavyeyle (Tab, Enter, Boşluk, ok tuşları) kullanılabilir ve odaklandığında görünür bir odak göstergesi taşır. Tarayıcının varsayılan odak çizgisi kaldırılırsa yerine başka bir gösterge konur.
- Sayfada `<meta name="viewport" content="width=device-width, initial-scale=1">` bulunur; mobilde sayfa cihaz genişliğinde yerleşir.
- Görev yokken ilerleme `0 / 0 görev tamamlandı` ve `%0` gösterir.
- Uygulama `npm run dev` ile, varsayılan `http://localhost:5173` adresinde açılır. Farklıysa `APP_CMD` / `BASE_URL` ile bildirilir. Test verisi geliştirme sunucusunun modül isteğiyle verildiği için `npm run preview` (üretim derlemesi) ile çalıştırılmaz.
