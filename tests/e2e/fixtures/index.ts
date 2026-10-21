import { test as base, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { COURSE_DATA_URL, STORAGE_KEYS, taskStorage, type Theme } from '../support/contract';
import { loadCourse, type Course } from '../support/data';

// Seçenekler: test.use({...}) ile describe veya dosya bazında değiştirilir.
// Sunumdaki "Ön koşul" sütunu birebir bu seçeneklere karşılık gelir.
type Options = {
  courseData: Course;                   // Uygulamaya verilecek içerik
  seededCompleted: string[];            // Test başında tamamlanmış sayılacak görev id'leri
  seededTheme: Theme | null;            // Test başında kayıtlı tema
  rawTaskStorage: string | null;        // Bozuk/eski veri testleri için ham localStorage değeri
  allowPageErrors: boolean;             // Hata beklenen testlerde (ör. veri yüklenemedi) true
  mockCourseData: boolean;
  courseDataFailures: number;
};

type Fixtures = {
  pageErrors: string[];
  dashboard: DashboardPage;
};

// Her sayfada çıkan ve uygulamayla ilgisi olmayan gürültü (ör. eksik favicon).
const IGNORED_ERROR_URLS = [/favicon\.ico/];

export const test = base.extend<Options & Fixtures>({
  courseData: [loadCourse('course.default.json'), { option: true }],
  seededCompleted: [[], { option: true }],
  seededTheme: [null, { option: true }],
  rawTaskStorage: [null, { option: true }],
  allowPageErrors: [false, { option: true }],
  mockCourseData: [true, { option: true }],
  courseDataFailures: [0, { option: true }],

  // OTOMATİK fixture: her testte kendiliğinden çalışır.
  // Ekranda her şey doğru görünse bile arka planda patlayan JS kodu bir hatadır.
  pageErrors: [
    async ({ page, allowPageErrors }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        if (IGNORED_ERROR_URLS.some((re) => re.test(msg.location().url))) return;
        errors.push(`console.error: ${msg.text()}`);
      });

      await use(errors); // ← test burada çalışır

      // Test bittikten sonra kontrol: beklenmeyen hata varsa test başarısız olur.
      if (!allowPageErrors) {
        expect(errors, 'Sayfada beklenmeyen JavaScript hatası').toEqual([]);
      }
    },
    { auto: true },
  ],

  dashboard: async (
    { page, courseData, seededCompleted, seededTheme, rawTaskStorage, mockCourseData, courseDataFailures },
    use,
  ) => {
    // 1) İçerik isteğini yakala ve test verisini döndür (gerçek dosyaya gidilmez).
    if (mockCourseData) {
      let remainingFailures = courseDataFailures;
      await page.route(COURSE_DATA_URL, async (route) => {
        if (remainingFailures > 0) {
          remainingFailures -= 1;
          await route.fulfill({ status: 500, body: 'Internal Server Error' });
          return;
        }
        await route.fulfill({ json: courseData });
      });
    }

    // 2) localStorage'ı ön koşula göre hazırla.
    const initial: Record<string, string> = {};
    if (rawTaskStorage !== null) {
      initial[STORAGE_KEYS.tasks] = rawTaskStorage;
    } else if (seededCompleted.length > 0) {
      initial[STORAGE_KEYS.tasks] = taskStorage.encode(seededCompleted);
    }
    if (seededTheme) initial[STORAGE_KEYS.theme] = seededTheme;

    if (Object.keys(initial).length > 0) {
      // DİKKAT: addInitScript, reload DAHİL her sayfa yüklemesinde yeniden çalışır.
      // Anahtar zaten varsa üzerine yazmıyoruz; aksi hâlde "yenilemede korunur mu?"
      // testinde kayıtlı durumu biz ezer, sahte başarılı (yanlış pozitif) sonuç alırdık.
      await page.addInitScript((entries: Record<string, string>) => {
        const seededFlag = '__e2e_seeded__';
        if (sessionStorage.getItem(seededFlag) !== null) return;
        for (const [key, value] of Object.entries(entries)) {
          if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
        }
        sessionStorage.setItem(seededFlag, '1');
      }, initial);
    }

    // 3) Sayfayı aç ve testi çalıştır.
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await use(dashboard);
  },
});

export { expect };
