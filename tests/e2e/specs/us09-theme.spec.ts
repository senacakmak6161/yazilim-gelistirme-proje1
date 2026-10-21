import { test, expect } from '../fixtures';
import { LIMITS, THEMES, fmt } from '../support/contract';
import { contrastRatio, relativeLuminance } from '../support/color';

test.describe('US-09 Tema değiştirme', () => {
  test('kullanıcı açık ve karanlık tema arasında geçiş yapabilir',
    { tag: ['@US-09', '@AC-09.1', '@P3'] },
    async ({ dashboard }) => {
      await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'false');

      await dashboard.toggleTheme();
      await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'true');

      await dashboard.toggleTheme();
      await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'false');
    });

  test('karanlık temaya geçince arayüz renkleri koyulaşır',
    { tag: ['@US-09', '@AC-09.2', '@P3'] },
    async ({ dashboard }) => {
      const light = await dashboard.pageColors();

      await dashboard.toggleTheme();
      await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'true');

      await expect.poll(async () => (await dashboard.pageColors()).background).not.toBe(light.background);
      const dark = await dashboard.pageColors();
      expect(relativeLuminance(dark.background)).toBeLessThan(relativeLuminance(light.background));
    });

  test('metin ve arka plan kontrastı her iki temada da yeterlidir',
    { tag: ['@US-09', '@AC-09.3', '@NFR-2', '@P3'] },
    async ({ dashboard }) => {
      await test.step('açık tema', async () => {
        const colors = await dashboard.pageColors();
        expect(contrastRatio(colors.text, colors.background)).toBeGreaterThanOrEqual(LIMITS.minTextContrast);
      });

      await test.step('karanlık tema', async () => {
        await dashboard.toggleTheme();
        await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'true');
        await expect
          .poll(async () => {
            const colors = await dashboard.pageColors();
            return contrastRatio(colors.text, colors.background);
          })
          .toBeGreaterThanOrEqual(LIMITS.minTextContrast);
      });
    });

  test.describe('tamamlanmış görevler varken', () => {
    test.use({ seededCompleted: ['t1', 't5'] });

    test('tema değiştirmek görev durumlarını değiştirmez',
      { tag: ['@US-09', '@AC-09.4', '@P3'] },
      async ({ dashboard }) => {
        await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
        const before = await dashboard.checkedStates();

        await dashboard.toggleTheme();
        await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'true');

        await expect.poll(() => dashboard.checkedStates()).toEqual(before);
        await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
      });
  });

  test('seçilen tema sayfa yenilendiğinde korunur',
    {
      tag: ['@US-09', '@AC-09.5', '@P3'],
      annotation: { type: 'karar', description: 'D3: tema tercihi korunur' },
    },
    async ({ dashboard }) => {
      await dashboard.toggleTheme();
      await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'true');
      await expect.poll(() => dashboard.readStoredTheme()).toBe(THEMES.dark);

      await dashboard.reload();

      await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'true');
    });

  test.describe('karanlık tema kayıtlıyken', () => {
    test.use({ seededTheme: THEMES.dark });

    test('uygulama kayıtlı temayla açılır',
      {
        tag: ['@US-09', '@AC-09.5', '@P3'],
        annotation: { type: 'karar', description: 'D3: tema tercihi korunur' },
      },
      async ({ dashboard }) => {
        await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'true');
      });

    test('açık temaya dönülürse bu tercih de yenilemede korunur',
      {
        tag: ['@US-09', '@AC-09.5', '@P3'],
        annotation: { type: 'karar', description: 'D3: tema tercihi korunur' },
      },
      async ({ dashboard }) => {
        await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'true');
        await dashboard.toggleTheme();
        await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'false');
        await expect.poll(() => dashboard.readStoredTheme()).toBe(THEMES.light);

        await dashboard.reload();

        await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'false');
      });
  });
});
