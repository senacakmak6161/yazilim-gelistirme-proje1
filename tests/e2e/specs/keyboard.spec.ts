import { test, expect } from '../fixtures';
import type { DashboardPage } from '../pages/DashboardPage';
import { STATUS, fmt } from '../support/contract';
import { loadCourse, titleOf } from '../support/data';

const course = loadCourse('course.default.json');

const focusTargets = [
  { name: 'hafta kartı', pick: (d: DashboardPage) => d.weekCard(1) },
  { name: 'hafta filtresi', pick: (d: DashboardPage) => d.weekSelect },
  { name: 'arama kutusu', pick: (d: DashboardPage) => d.searchBox },
  { name: 'tema düğmesi', pick: (d: DashboardPage) => d.themeToggle },
] as const;

test.describe('Klavye ile kullanım', () => {
  test.skip(({ isMobile }) => isMobile, 'Dokunmatik cihaz profillerinde fiziksel klavye varsayılmaz');

  test('hafta kartına Tab ile ulaşılır ve Enter ile seçilir',
    { tag: ['@NFR-3', '@US-01', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.tabTo(dashboard.weekCard(1));
      await expect(dashboard.weekCard(1)).toBeFocused();

      await dashboard.press('Enter');

      await expect(dashboard.weekCard(1)).toHaveAttribute('aria-pressed', 'true');
      await expect(dashboard.goalsHeading).toHaveText(fmt.goalsHeading(1));
    });

  test('hafta kartı Boşluk tuşuyla da seçilir',
    { tag: ['@NFR-3', '@US-01', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.tabTo(dashboard.weekCard(2));
      await expect(dashboard.weekCard(2)).toBeFocused();

      await dashboard.press('Space');

      await expect(dashboard.goalsHeading).toHaveText(fmt.goalsHeading(2));
    });

  test('görev kutusu Boşluk tuşuyla işaretlenir ve işareti kaldırılır',
    { tag: ['@NFR-3', '@US-03', '@P2'] },
    async ({ dashboard }) => {
      const checkbox = dashboard.taskCheckbox(titleOf(course, 'w1-t1'));
      await dashboard.tabTo(checkbox);
      await expect(checkbox).toBeFocused();

      await dashboard.press('Space');
      await expect(checkbox).toBeChecked();

      await dashboard.press('Space');
      await expect(checkbox).not.toBeChecked();
    });

  test('durum filtresi ok tuşlarıyla değiştirilir',
    { tag: ['@NFR-3', '@US-04', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.tabTo(dashboard.statusRadio(STATUS.all));
      await expect(dashboard.statusRadio(STATUS.all)).toBeFocused();

      await dashboard.press('ArrowDown');

      await expect(dashboard.statusRadio(STATUS.pending)).toBeChecked();
    });

  test('hafta filtresine Tab ile ulaşılır',
    { tag: ['@NFR-3', '@US-05', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.tabTo(dashboard.weekSelect);

      await expect(dashboard.weekSelect).toBeFocused();
    });

  test('arama kutusuna Tab ile ulaşılır ve klavyeyle yazılır',
    { tag: ['@NFR-3', '@US-06', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.tabTo(dashboard.searchBox);
      await expect(dashboard.searchBox).toBeFocused();

      await dashboard.typeText('grid');

      await expect(dashboard.taskTitles).toHaveText([titleOf(course, 'w2-t2')]);
    });

  test('tema düğmesine Tab ile ulaşılır ve Enter ile tema değişir',
    { tag: ['@NFR-3', '@US-09', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.tabTo(dashboard.themeToggle);
      await expect(dashboard.themeToggle).toBeFocused();

      await dashboard.press('Enter');

      await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'true');
    });

  for (const target of focusTargets) {
    test(`${target.name} klavyeyle odaklanınca odak göstergesi görünür`,
      { tag: ['@NFR-3', '@P2'] },
      async ({ dashboard }) => {
        const element = target.pick(dashboard);
        const unfocused = await dashboard.focusStyle(element);

        await dashboard.tabTo(element);
        await expect(element).toBeFocused();

        await expect.poll(() => dashboard.focusStyle(element)).not.toBe(unfocused);
      });
  }
});
