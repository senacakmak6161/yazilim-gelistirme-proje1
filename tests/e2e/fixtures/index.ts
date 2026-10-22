import { test as base, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { COURSE_DATA_URL, STORAGE_KEYS, taskStorage, themeStorage, type Theme } from '../support/contract';
import { courseModuleSource, loadCourse, type Course } from '../support/data';

type StorageKey = keyof typeof STORAGE_KEYS;

// Seçenekler: test.use({...}) ile describe veya dosya bazında değiştirilir.
// Sunumdaki "Ön koşul" sütunu birebir bu seçeneklere karşılık gelir.
type Options = {
  courseData: Course;                   // Uygulamaya verilecek içerik
  seededCompleted: string[];            // Test başında tamamlanmış sayılacak görev id'leri
  seededTheme: Theme | null;            // Test başında kayıtlı tema
  rawStorage: Partial<Record<StorageKey, string>>;
  allowPageErrors: boolean;             // Hata beklenen testlerde true
  allowConsoleErrors: boolean;
  mockCourseData: boolean;
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
  rawStorage: [{}, { option: true }],
  allowPageErrors: [false, { option: true }],
  allowConsoleErrors: [false, { option: true }],
  mockCourseData: [true, { option: true }],

  // OTOMATİK fixture: her testte kendiliğinden çalışır.
  // Ekranda her şey doğru görünse bile arka planda patlayan JS kodu bir hatadır.
  pageErrors: [
    async ({ page, allowPageErrors, allowConsoleErrors }, use) => {
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
        const unexpected = allowConsoleErrors ? errors.filter((e) => e.startsWith('pageerror:')) : errors;
        expect(unexpected, 'Sayfada beklenmeyen JavaScript hatası').toEqual([]);
      }
    },
    { auto: true },
  ],

  dashboard: async (
    { page, courseData, seededCompleted, seededTheme, rawStorage, mockCourseData },
    use,
  ) => {
    // 1) İçerik isteğini yakala ve test verisini döndür (gerçek dosyaya gidilmez).
    if (mockCourseData) {
      await page.route(COURSE_DATA_URL, async (route) => {
        const request = route.request();
        const isModule = request.resourceType() === 'script' || new URL(request.url()).searchParams.has('import');
        if (isModule) {
          await route.fulfill({ contentType: 'text/javascript; charset=utf-8', body: courseModuleSource(courseData) });
          return;
        }
        await route.fulfill({ json: courseData });
      });
    }

    // 2) localStorage'ı ön koşula göre hazırla.
    const initial: Record<string, string> = {};
    if (seededCompleted.length > 0) initial[STORAGE_KEYS.tasks] = taskStorage.encode(seededCompleted);
    if (seededTheme) initial[STORAGE_KEYS.theme] = themeStorage.encode(seededTheme);
    for (const [key, value] of Object.entries(rawStorage) as [StorageKey, string][]) {
      initial[STORAGE_KEYS[key]] = value;
    }

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
