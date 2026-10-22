import { test, expect } from '../fixtures';

test.describe('Duman testi (uygulamanın kendi verisiyle)', () => {
  test.use({ mockCourseData: false });

  test('uygulama temiz kurulumdan sonra açılır ve kendi içeriğini yükler',
    {
      tag: ['@NFR-6', '@P1'],
      annotation: { type: 'karar', description: 'D5: CI temiz kurulum + @NFR-6 duman testi' },
    },
    async ({ dashboard }) => {
      await expect(dashboard.weekCards.first()).toBeVisible();
      await expect(dashboard.taskItems.first()).toBeVisible();
      await expect(dashboard.progressBar).toBeVisible();
      await expect(dashboard.searchBox).toBeVisible();
    });
});
