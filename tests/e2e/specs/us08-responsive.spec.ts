import { test, expect } from '../fixtures';
import { LIMITS, MESSAGES, STATUS } from '../support/contract';
import { loadCourse, titleOf } from '../support/data';

const course = loadCourse('course.default.json');

const viewports = [
  { name: 'masaüstü', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'telefon', width: 375, height: 667 },
  { name: 'dar telefon', width: 320, height: 640 },
] as const;

test.describe('US-08 Mobil cihazlardan erişim', () => {
  test('temel bölümler her cihaz profilinde görüntülenir',
    { tag: ['@US-08', '@AC-08.1', '@NFR-1', '@P3'] },
    async ({ dashboard }) => {
      await expect(dashboard.weekCards.first()).toBeVisible();
      await expect(dashboard.goalsPanel).toBeVisible();
      await expect(dashboard.searchBox).toBeVisible();
      await expect(dashboard.weekSelect).toBeVisible();
      await expect(dashboard.statusRadios).toHaveCount(3);
      await expect(dashboard.taskItems.first()).toBeVisible();
      await expect(dashboard.progressBar).toBeVisible();
      await expect(dashboard.themeToggle).toBeVisible();
    });

  test('mobil ekranda yazılar okunabilir boyuttadır',
    {
      tag: ['@US-08', '@AC-08.2', '@P3'],
      annotation: { type: 'karar', description: 'D7: en küçük yazı boyutu 12px (Lighthouse ölçütü)' },
    },
    async ({ dashboard, isMobile }) => {
      test.skip(!isMobile, 'Okunabilirlik eşiği mobil cihaz profilleri için tanımlıdır');

      await dashboard.selectWeekCard(3);
      await expect(dashboard.goalItems.first()).toBeVisible();

      await expect.poll(() => dashboard.smallestFontSizePx()).toBeGreaterThanOrEqual(LIMITS.minReadableFontPx);
    });

  test('görev işaretleme, arama ve filtreleme mobil cihazda dokunarak çalışır',
    { tag: ['@US-08', '@AC-08.3', '@P3'] },
    async ({ dashboard, isMobile }) => {
      test.skip(!isMobile, 'Dokunma etkileşimi yalnızca mobil cihaz profillerinde anlamlıdır');
      const t5 = titleOf(course, 't5');

      await test.step('görev dokunarak tamamlanır', async () => {
        await dashboard.tapTask(t5);
        await expect(dashboard.taskCheckbox(t5)).toBeChecked();
      });

      await test.step('arama yapılır', async () => {
        await dashboard.search('grid');
        await expect(dashboard.taskTitles).toHaveText([t5]);
        await dashboard.clearSearch();
      });

      await test.step('durum filtresi uygulanır', async () => {
        await dashboard.setStatusFilter(STATUS.completed);
        await expect(dashboard.taskTitles).toHaveText([t5]);
      });
    });

  test('temel içeriğe erişmek için yatay kaydırma gerekmez',
    { tag: ['@US-08', '@AC-08.4', '@NFR-1', '@P3'] },
    async ({ dashboard }) => {
      await dashboard.selectWeekCard(3);
      await expect(dashboard.goalItems.first()).toBeVisible();

      await expect.poll(() => dashboard.hasHorizontalOverflow()).toBe(false);
    });

  test('kartlar, metinler ve kontroller birbirinin üzerine binmez',
    { tag: ['@US-08', '@AC-08.5', '@P3'] },
    async ({ dashboard }) => {
      await dashboard.selectWeekCard(3);
      await expect(dashboard.goalItems.first()).toBeVisible();

      await expect.poll(() => dashboard.overlappingElements()).toEqual([]);
    });

  test('ekran boyutu değiştiğinde arayüz kullanılabilir kalır',
    { tag: ['@US-08', '@AC-08.6', '@NFR-1', '@P3'] },
    async ({ dashboard }) => {
      for (const viewport of viewports) {
        await test.step(`${viewport.name} (${viewport.width}×${viewport.height})`, async () => {
          await dashboard.resize(viewport.width, viewport.height);
          await expect(dashboard.searchBox).toBeVisible();
          await expect(dashboard.taskItems.first()).toBeVisible();
          await expect.poll(() => dashboard.hasHorizontalOverflow()).toBe(false);
          await expect.poll(() => dashboard.overlappingElements()).toEqual([]);
        });
      }
    });

  test('dar ekranda boş durum mesajı da taşma yapmadan gösterilir',
    { tag: ['@US-08', '@AC-08.4', '@P3'] },
    async ({ dashboard }) => {
      await dashboard.resize(320, 640);
      await dashboard.search('xyz123');

      await expect(dashboard.emptyState).toHaveText(MESSAGES.noMatch);
      await expect(dashboard.taskItems).toHaveCount(0);
      await expect.poll(() => dashboard.hasHorizontalOverflow()).toBe(false);
    });
});
