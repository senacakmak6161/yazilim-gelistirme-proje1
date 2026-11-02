import { test, expect } from '../fixtures';
import { accessibilityViolations } from '../support/accessibility';

test.describe('Erişilebilirlik (WCAG 2.1 AA, axe-core)', () => {
  test.skip(
    ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
    'axe-core DOM ve CSS kurallarını denetler; sonuç tarayıcı motoruna göre değişmez, tek masaüstü motorunda çalıştırılır',
  );

  test('açılış ekranında erişilebilirlik ihlali yoktur',
    { tag: ['@NFR-2', '@P2'] },
    async ({ dashboard }) => {
      await expect(dashboard.taskItems.first()).toBeVisible();

      expect(await accessibilityViolations(dashboard.page)).toEqual([]);
    });

  test('hafta seçiliyken hedef ve görev listesinde erişilebilirlik ihlali yoktur',
    { tag: ['@NFR-2', '@US-02', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.selectWeekCard(3);
      await expect(dashboard.goalItems.first()).toBeVisible();

      expect(await accessibilityViolations(dashboard.page)).toEqual([]);
    });

  test('hedef metinleri yeterli renk kontrastıyla sunulur',
    {
      tag: ['@US-02', '@AC-02.4', '@P1'],
      annotation: { type: 'karar', description: 'D6: kontrast erişilebilirlik testinde ölçülür' },
    },
    async ({ dashboard }) => {
      await dashboard.selectWeekCard(3);
      await expect(dashboard.goalItems.first()).toBeVisible();

      expect(await accessibilityViolations(dashboard.page, ['color-contrast'])).toEqual([]);
    });

  test('her iki temada metin ve kontroller yeterli kontrasta sahiptir',
    { tag: ['@US-09', '@AC-09.3', '@NFR-2', '@P3'] },
    async ({ dashboard }) => {
      await test.step('açık tema', async () => {
        await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'false');
        expect(await accessibilityViolations(dashboard.page, ['color-contrast'])).toEqual([]);
      });

      await test.step('karanlık tema', async () => {
        await dashboard.toggleTheme();
        await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'true');
        expect(await accessibilityViolations(dashboard.page, ['color-contrast'])).toEqual([]);
      });
    });

  test('boş durum mesajı gösterilirken erişilebilirlik ihlali yoktur',
    { tag: ['@NFR-2', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.search('xyz123');
      await expect(dashboard.emptyState).toBeVisible();

      expect(await accessibilityViolations(dashboard.page)).toEqual([]);
    });
});
