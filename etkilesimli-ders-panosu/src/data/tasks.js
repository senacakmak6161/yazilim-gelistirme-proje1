
export const initialTasks = [
  // HAFTA 1 — HTML TEMELLERİ
  {
    id: "task-1-1",
    lessonId: "lesson-1",
    title: "HTML Belgesinin Yapısını Öğren",
    description:
      "HTML'in ne işe yaradığını öğren. DOCTYPE, html, head, title ve body etiketlerinin görevlerini incele ve boş bir HTML belgesi oluştur.",
    type: "okuma",
    estimatedMinutes: 30,
    completed: false
  },
  {
    id: "task-1-2",
    lessonId: "lesson-1",
    title: "Başlık ve Paragraf Etiketlerini Kullan",
    description:
      "h1-h6 başlık etiketlerini ve p paragraf etiketini öğren. Kişisel tanıtımını içeren başlıklar ve paragraflar oluştur.",
    type: "uygulama",
    estimatedMinutes: 35,
    completed: false
  },
  {
    id: "task-1-3",
    lessonId: "lesson-1",
    title: "Bağlantı ve Görsel Ekle",
    description:
      "a ve img etiketlerinin kullanımını öğren. Sayfana bir bağlantı ve açıklayıcı alternatif metne sahip bir görsel ekle.",
    type: "uygulama",
    estimatedMinutes: 35,
    completed: false
  },
  {
    id: "task-1-4",
    lessonId: "lesson-1",
    title: "İlk Web Sayfanı Oluştur",
    description:
      "Öğrendiğin etiketleri birleştirerek adını, ilgi alanlarını, bir görseli ve bir bağlantıyı içeren kişisel tanıtım sayfası hazırla.",
    type: "proje",
    estimatedMinutes: 45,
    completed: false
  },
  {
    id: "task-1-5",
    lessonId: "lesson-1",
    title: "HTML Temelleri Testi",
    description:
      "HTML belgesinin yapısı ve temel etiketlerle ilgili kısa testi çöz. Yanlış cevaplarının nedenlerini tekrar incele.",
    type: "quiz",
    estimatedMinutes: 15,
    completed: false
  },

  // HAFTA 2 — HTML FORMLARI VE SEMANTİK YAPI
  {
    id: "task-2-1",
    lessonId: "lesson-2",
    title: "Semantik HTML Etiketlerini Öğren",
    description:
      "header, nav, main, section, article ve footer etiketlerinin amaçlarını öğren. Bunların sayfanın anlamlı bölümlere ayrılmasını nasıl sağladığını incele.",
    type: "okuma",
    estimatedMinutes: 30,
    completed: false
  },
  {
    id: "task-2-2",
    lessonId: "lesson-2",
    title: "Liste ve Tablo Oluştur",
    description:
      "ul, ol, li, table, tr, th ve td etiketlerini öğren. İlgi alanlarını listele ve örnek bir haftalık program tablosu oluştur.",
    type: "uygulama",
    estimatedMinutes: 35,
    completed: false
  },
  {
    id: "task-2-3",
    lessonId: "lesson-2",
    title: "Form Elemanlarını Tanı",
    description:
      "form, label, input, select ve textarea elemanlarını öğren. Metin, e-posta ve seçim alanlarının nasıl kullanıldığını örneklerle incele.",
    type: "okuma",
    estimatedMinutes: 35,
    completed: false
  },
  {
    id: "task-2-4",
    lessonId: "lesson-2",
    title: "Kayıt Formu Hazırla",
    description:
      "Ad, e-posta, ilgi alanı ve açıklama alanları içeren bir form oluştur. Her alan için uygun label kullan ve gerekli alanları belirt.",
    type: "proje",
    estimatedMinutes: 45,
    completed: false
  },
  {
    id: "task-2-5",
    lessonId: "lesson-2",
    title: "HTML Yapıları Testi",
    description:
      "Semantik etiketler, listeler, tablolar ve form elemanları hakkındaki bilgini kısa bir testle kontrol et.",
    type: "quiz",
    estimatedMinutes: 15,
    completed: false
  },

  // HAFTA 3 — CSS TEMELLERİ
  {
    id: "task-3-1",
    lessonId: "lesson-3",
    title: "CSS'i HTML'e Bağla",
    description:
      "Inline, internal ve external CSS arasındaki farkları öğren. Ayrı bir CSS dosyası oluştur ve HTML belgene bağla.",
    type: "okuma",
    estimatedMinutes: 30,
    completed: false
  },
  {
    id: "task-3-2",
    lessonId: "lesson-3",
    title: "Seçiciler ve Renkleri Kullan",
    description:
      "Element, class ve id seçicilerini öğren. Arka plan, metin rengi ve yazı tipi özellikleriyle sayfanın görünümünü değiştir.",
    type: "uygulama",
    estimatedMinutes: 35,
    completed: false
  },
  {
    id: "task-3-3",
    lessonId: "lesson-3",
    title: "Kutu Modelini Öğren",
    description:
      "Content, padding, border ve margin kavramlarını örneklerle incele. Elemanların boyut ve boşluklarının yerleşimi nasıl etkilediğini gözlemle.",
    type: "okuma",
    estimatedMinutes: 35,
    completed: false
  },
  {
    id: "task-3-4",
    lessonId: "lesson-3",
    title: "Tanıtım Sayfanı Tasarla",
    description:
      "İlk haftada oluşturduğun sayfaya renk paleti, tipografi, kenarlıklar ve boşluklar ekle. İçeriği okunabilir ve tutarlı hâle getir.",
    type: "proje",
    estimatedMinutes: 50,
    completed: false
  },
  {
    id: "task-3-5",
    lessonId: "lesson-3",
    title: "CSS Temelleri Testi",
    description:
      "CSS seçicileri, renkler, yazı tipleri ve kutu modeli hakkındaki bilgini test et. Yanlış cevaplarını örneklerle tekrar çalış.",
    type: "quiz",
    estimatedMinutes: 15,
    completed: false
  },

  // HAFTA 4 — FLEXBOX VE RESPONSIVE TASARIM
  {
    id: "task-4-1",
    lessonId: "lesson-4",
    title: "Flexbox Mantığını Öğren",
    description:
      "Flex container, flex item, justify-content, align-items ve gap özelliklerini öğren. Elemanların nasıl hizalandığını küçük örneklerle incele.",
    type: "okuma",
    estimatedMinutes: 35,
    completed: false
  },
  {
    id: "task-4-2",
    lessonId: "lesson-4",
    title: "Kart Düzeni Oluştur",
    description:
      "Flexbox kullanarak yan yana duran içerik kartları oluştur. Ekran genişliği değiştiğinde elemanların yerleşimini gözlemle.",
    type: "uygulama",
    estimatedMinutes: 40,
    completed: false
  },
  {
    id: "task-4-3",
    lessonId: "lesson-4",
    title: "Responsive Tasarımı Öğren",
    description:
      "Yüzde, esnek genişlikler ve media query kavramlarını öğren. Mobil ve masaüstü görünüm arasındaki farkları incele.",
    type: "okuma",
    estimatedMinutes: 35,
    completed: false
  },
  {
    id: "task-4-4",
    lessonId: "lesson-4",
    title: "Mobil Uyumlu Sayfa Hazırla",
    description:
      "Kişisel sayfanı telefon ve masaüstü ekranlarında kullanılabilecek şekilde düzenle. İçeriğin taşmadığını ve metinlerin okunabildiğini kontrol et.",
    type: "proje",
    estimatedMinutes: 50,
    completed: false
  },
  {
    id: "task-4-5",
    lessonId: "lesson-4",
    title: "Responsive Tasarım Testi",
    description:
      "Flexbox, hizalama ve medya sorguları hakkındaki bilgini kısa testle değerlendir.",
    type: "quiz",
    estimatedMinutes: 15,
    completed: false
  },

  // HAFTA 5 — JAVASCRIPT VE ETKİLEŞİM
  {
    id: "task-5-1",
    lessonId: "lesson-5",
    title: "JavaScript Temellerini Öğren",
    description:
      "Değişkenler, veri türleri, karşılaştırmalar ve koşul ifadelerini öğren. Basit örneklerde değerlerin nasıl değiştiğini incele.",
    type: "okuma",
    estimatedMinutes: 40,
    completed: false
  },
  {
    id: "task-5-2",
    lessonId: "lesson-5",
    title: "Fonksiyonlar ve Olayları Öğren",
    description:
      "Fonksiyonların ne işe yaradığını ve click gibi kullanıcı olaylarının nasıl yakalandığını öğren. Küçük kod örneklerini incele.",
    type: "okuma",
    estimatedMinutes: 40,
    completed: false
  },
  {
    id: "task-5-3",
    lessonId: "lesson-5",
    title: "DOM ile Sayfayı Değiştir",
    description:
      "getElementById ve querySelector gibi yöntemlerle HTML elemanlarını seç. Bir butona basıldığında sayfadaki metni değiştiren bir örnek yap.",
    type: "uygulama",
    estimatedMinutes: 45,
    completed: false
  },
  {
    id: "task-5-4",
    lessonId: "lesson-5",
    title: "Etkileşimli Form Geliştir",
    description:
      "Form gönderimini kontrol et. Boş bırakılan alanlar için kullanıcıya uyarı göster ve başarılı girişte bilgilendirme mesajı sun.",
    type: "proje",
    estimatedMinutes: 50,
    completed: false
  },
  {
    id: "task-5-5",
    lessonId: "lesson-5",
    title: "JavaScript Temelleri Testi",
    description:
      "Değişkenler, koşullar, fonksiyonlar, DOM ve olaylar hakkındaki bilgini kısa bir testle kontrol et.",
    type: "quiz",
    estimatedMinutes: 20,
    completed: false
  },

  // HAFTA 6 — MİNİ PROJE
  {
    id: "task-6-1",
    lessonId: "lesson-6",
    title: "Mini Projenin Planını Hazırla",
    description:
      "Kişisel portfolyo sayfanda bulunacak bölümleri belirle: tanıtım, beceriler, projeler ve iletişim. İçerik yapısını kâğıt üzerinde veya basit bir taslakta planla.",
    type: "uygulama",
    estimatedMinutes: 30,
    completed: false
  },
  {
    id: "task-6-2",
    lessonId: "lesson-6",
    title: "Portfolyonun HTML Yapısını Oluştur",
    description:
      "Planladığın bölümleri semantik HTML etiketleriyle oluştur. Başlıkları, bağlantıları ve içerik alanlarını uygun biçimde düzenle.",
    type: "uygulama",
    estimatedMinutes: 45,
    completed: false
  },
  {
    id: "task-6-3",
    lessonId: "lesson-6",
    title: "Portfolyoya CSS ve Mobil Uyum Ekle",
    description:
      "Renk, tipografi, kart ve Flexbox düzenlerini uygula. Sayfanın dar ve geniş ekranlarda kullanılabilir olmasını sağla.",
    type: "uygulama",
    estimatedMinutes: 50,
    completed: false
  },
  {
    id: "task-6-4",
    lessonId: "lesson-6",
    title: "Portfolyoya JavaScript Etkileşimi Ekle",
    description:
      "Bir butona işlev kazandır veya form için temel doğrulama ekle. Etkileşimin doğru çalıştığını farklı girişlerle test et.",
    type: "proje",
    estimatedMinutes: 50,
    completed: false
  },
  {
    id: "task-6-5",
    lessonId: "lesson-6",
    title: "Projeyi Test Et ve Değerlendir",
    description:
      "Bağlantıları, formu, butonları ve mobil görünümü kontrol et. Bulduğun hataları düzelt ve öğrendiğin konularla ilgili son değerlendirme testini tamamla.",
    type: "quiz",
    estimatedMinutes: 30,
    completed: false
  }
];
