import { test, expect } from '../fixtures';
import { LIMITS, MESSAGES, STATUS } from '../support/contract';
import { loadCourse, titleOf, weekByNumber } from '../support/data';

const course = loadCourse('course.default.json');
const longTextCourse = loadCourse('course.long-text.json');

const narrowPhone = { name: 'dar telefon', width: 320, height: 640 } as const;
const viewports = [
  { name: 'masaüstü', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'telefon', width: 375, height: 667 },
  narrowPhone,
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

  test('dar ekranda boş durum mesajı taşma yapmadan gösterilir',
    { tag: ['@US-08', '@AC-08.4', '@P3'] },
    async ({ dashboard }) => {
      await dashboard.resize(narrowPhone.width, narrowPhone.height);
      await dashboard.search('xyz123');

      await expect(dashboard.emptyState).toHaveText(MESSAGES.noMatch);
      await expect(dashboard.taskItems).toHaveCount(0);
      await expect.poll(() => dashboard.hasHorizontalOverflow()).toBe(false);
    });
});

test.describe('US-08 Uzun Türkçe metinler', () => {
  test.use({ courseData: longTextCourse });

  test('uzun başlık, açıklama ve hedefler dar ekranda taşmadan ve kesilmeden gösterilir',
    { tag: ['@US-08', '@AC-08.4', '@AC-08.5', '@P3'] },
    async ({ dashboard }) => {
      await dashboard.resize(narrowPhone.width, narrowPhone.height);
      await dashboard.selectWeekCard(1);

      await expect(dashboard.goalItems).toHaveText(weekByNumber(longTextCourse, 1).objectives);
      await expect.poll(() => dashboard.hasHorizontalOverflow()).toBe(false);
      await expect.poll(() => dashboard.overlappingElements()).toEqual([]);
      await expect.poll(() => dashboard.clippedGoalTexts()).toEqual([]);
    });
});

test.describe('US-08 Mobil cihaz profillerinde', () => {
  test.skip(({ isMobile }) => !isMobile, 'Bu kriterler yalnızca mobil cihaz profillerinde anlamlıdır');

  test('sayfa cihaz genişliğinde yerleşir, küçültülmüş masaüstü görünümü açılmaz',
    { tag: ['@US-08', '@AC-08.2', '@NFR-1', '@P3'] },
    async ({ dashboard }) => {
      await expect(dashboard.weekCards.first()).toBeVisible();

      await expect.poll(() => dashboard.layoutViewportWidth()).toBeLessThanOrEqual(dashboard.viewportWidth());
    });

  test('mobil ekranda yazılar okunabilir boyuttadır',
    {
      tag: ['@US-08', '@AC-08.2', '@P3'],
      annotation: { type: 'varsayım', description: 'D7: en küçük yazı boyutu 12 px (Lighthouse ölçütü)' },
    },
    async ({ dashboard }) => {
      await dashboard.selectWeekCard(3);
      await expect(dashboard.goalItems.first()).toBeVisible();

      await expect.poll(() => dashboard.smallestFontSizePx()).toBeGreaterThanOrEqual(LIMITS.minReadableFontPx);
    });

  test('görev işaretleme, arama ve filtreleme mobil cihazda dokunarak çalışır',
    { tag: ['@US-08', '@AC-08.3', '@P3'] },
    async ({ dashboard }) => {
      const w2t2 = titleOf(course, 'w2-t2');

      await test.step('görev dokunarak tamamlanır', async () => {
        await dashboard.tapTask(w2t2);
        await expect(dashboard.taskCheckbox(w2t2)).toBeChecked();
      });

      await test.step('arama yapılır', async () => {
        await dashboard.search('grid');
        await expect(dashboard.taskTitles).toHaveText([w2t2]);
        await dashboard.clearSearch();
      });

      await test.step('durum filtresi uygulanır', async () => {
        await dashboard.setStatusFilter(STATUS.completed);
        await expect(dashboard.taskTitles).toHaveText([w2t2]);
      });
    });
});
