# Test Sözleşmesi (UI Contract)

Kabul testlerinin uygulamayı bulabilmesi için gereken roller, erişilebilir adlar, `data-testid` değerleri, metinler ve veri biçimleri. Testlerdeki tek kaynak: `e2e/support/contract.ts`.

Bir ad veya metin değişecekse önce test ekibiyle konuşulur; değişiklik yalnızca `contract.ts` ve bu dosyada yapılır.

## 1. Veri

| Konu | Sözleşme |
|---|---|
| İçerik adresi | Uygulama ders içeriğini `GET …/data/course.json` ile yükler. Testler bu isteği yakalayıp kendi verisini döndürür. |
| Şema | `{ course: { title }, weeks: [{ id, number, title, description, goals[] }], tasks: [{ id, weekId, title, description }] }` |
| Sıra | Haftalar, hedefler ve görevler verideki sırayla gösterilir. |

## 2. Ekran öğeleri

| Öğe | Bulunma yolu | Kurallar |
|---|---|---|
| Hafta kartı | `role=button`, `data-testid="week-card"` | Erişilebilir ad `Hafta N: <başlık>` ile başlar. Kart hafta numarası, başlık ve açıklamayı içerir. Seçili kartta `aria-pressed="true"`. |
| Hedef paneli | `data-testid="goals-panel"` | İçinde tek bir başlık (`heading`) ve hedefler için tek bir liste (`ul/ol > li`). Başlık: `Hafta N Öğrenme Hedefleri`. |
| Hafta filtresi | `role=combobox`, ad `Hafta` | Seçenekler: `Tüm haftalar`, ardından her hafta için `Hafta N – <başlık>` (uzun tire). |
| Durum filtresi | `fieldset/legend` veya `role=radiogroup`, ad `Görev durumu` | Sırasıyla `Tümü`, `Devam eden`, `Tamamlanan` radyo düğmeleri. |
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
| Yükleme hatası | `role=alert` | Metin içerir: `Ders içerikleri yüklenemedi.`; yanında `Tekrar dene` düğmesi. |

## 3. Mesajlar

| Kod | Nerede | Metin |
|---|---|---|
| M1 | Hedef paneli, hedefi olmayan hafta | Bu hafta için henüz içerik eklenmemiş. |
| M2 | Görev listesi, filtre/arama sonucu boş | Seçilen ölçütlere uygun görev bulunamadı. |
| M3 | Görev listesi, seçilen haftada görev yok | Bu haftaya ait görev bulunmuyor. |
| M4 | Görev listesi, derste hiç görev yok | Henüz görev bulunmuyor. |
| — | Hedef paneli, hafta seçilmemiş | Hedefleri görmek için bir hafta seçin. |
| — | Yükleme hatası | Ders içerikleri yüklenemedi. |

## 4. Kalıcı veri (localStorage)

| Anahtar | Değer |
|---|---|
| `edp.taskState.v1` | `{"version":1,"completed":["t1","t5"]}` — tamamlanan görev kimlikleri |
| `edp.theme.v1` | `light` veya `dark` |

Okunamayan değer veya veride olmayan görev kimliği uygulamayı hataya düşürmez; yok sayılır.

## 5. Genel

- Sayfa yüklenirken ve kullanım sırasında konsolda hata (`console.error`, yakalanmamış istisna) oluşmaz. Testler bunu otomatik denetler.
- Etkileşimli öğeler klavyeyle (Tab, Enter, Boşluk, ok tuşları) kullanılabilir ve odaklandığında görünür bir odak göstergesi taşır. Tarayıcının varsayılan odak çizgisi kaldırılırsa yerine başka bir gösterge konur.
- Sayfada `<meta name="viewport" content="width=device-width, initial-scale=1">` bulunur; mobilde sayfa cihaz genişliğinde yerleşir.
- Görev yokken ilerleme `0 / 0 görev tamamlandı` ve `%0` gösterir.
- Uygulama `npm run dev` ile, varsayılan `http://localhost:5173` adresinde açılır. Farklıysa `APP_CMD` / `BASE_URL` ile bildirilir.
