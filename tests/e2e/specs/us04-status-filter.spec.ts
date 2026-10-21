import { test, expect } from '../fixtures';
import { MESSAGES, STATUS, fmt } from '../support/contract';
import { loadCourse, titleOf, titlesOf } from '../support/data';

const course = loadCourse('course.default.json');
const allTitles = course.tasks.map((t) => t.title);
const completedIds = ['t1', 't5', 't9'];
const pendingIds = ['t2', 't3', 't4', 't6', 't7', 't8', 't10'];

test.describe('US-04 Görevleri durumlarına göre filtreleme', () => {
  test('tüm, tamamlanan ve devam eden görev seçenekleri seçilebilir',
    { tag: ['@US-04', '@AC-04.1', '@P2'] },
    async ({ dashboard }) => {
      await expect(dashboard.statusRadios).toHaveCount(3);
      await expect(dashboard.statusRadio(STATUS.all)).toBeChecked();

      for (const label of [STATUS.pending, STATUS.completed, STATUS.all]) {
        await dashboard.statusRadio(label).click();
        await expect(dashboard.statusRadio(label)).toBeChecked();
      }
    });

  test.describe('tamamlanmış ve devam eden görevler varken', () => {
    test.use({ seededCompleted: completedIds });

    test('tamamlanan filtresinde yalnızca tamamlanmış görevler görünür',
      { tag: ['@US-04', '@AC-04.2', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.setStatusFilter(STATUS.completed);

        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, completedIds));
      });

    test('devam eden filtresinde yalnızca tamamlanmamış görevler görünür',
      { tag: ['@US-04', '@AC-04.3', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.setStatusFilter(STATUS.pending);

        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, pendingIds));
      });

    test('devam eden filtresindeyken tamamlanan görev listeden çıkar',
      { tag: ['@US-04', '@AC-04.3', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.setStatusFilter(STATUS.pending);
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, pendingIds));

        await dashboard.toggleTask(titleOf(course, 't2'));

        await expect(dashboard.taskTitles).toHaveText(
          titlesOf(course, ['t3', 't4', 't6', 't7', 't8', 't10']),
        );
      });

    test('tümü seçilince filtre nedeniyle gizlenen görevler yeniden gösterilir',
      { tag: ['@US-04', '@AC-04.4', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.setStatusFilter(STATUS.completed);
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, completedIds));

        await dashboard.setStatusFilter(STATUS.all);

        await expect(dashboard.taskTitles).toHaveText(allTitles);
      });

    test('filtre değiştirmek görevlerin gerçek tamamlanma durumunu değiştirmez',
      { tag: ['@US-04', '@AC-04.6', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.setStatusFilter(STATUS.pending);
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, pendingIds));
        await dashboard.setStatusFilter(STATUS.completed);
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, completedIds));
        await dashboard.setStatusFilter(STATUS.all);
        await expect(dashboard.taskTitles).toHaveText(allTitles);

        await expect.poll(() => dashboard.checkedStates()).toEqual({
          t1: true, t2: false, t3: false, t4: false, t5: true,
          t6: false, t7: false, t8: false, t9: true, t10: false,
        });
        await expect(dashboard.progressText).toHaveText(fmt.progressText(3, 10));
        await expect.poll(async () => (await dashboard.storedCompletedIds()).sort()).toEqual(['t1', 't5', 't9']);
      });
  });

  test('tamamlanmış görev yokken tamamlanan filtresinde bilgilendirme gösterilir',
    { tag: ['@US-04', '@AC-04.5', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.setStatusFilter(STATUS.completed);

      await expect(dashboard.emptyState).toHaveText(MESSAGES.noMatch);
      await expect(dashboard.taskItems).toHaveCount(0);
    });

  test.describe('tüm görevler tamamlanmışken', () => {
    test.use({ seededCompleted: course.tasks.map((t) => t.id) });

    test('tüm görevler tamamlanmışken devam eden filtresinde bilgilendirme gösterilir',
      { tag: ['@US-04', '@AC-04.5', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.setStatusFilter(STATUS.pending);

        await expect(dashboard.emptyState).toHaveText(MESSAGES.noMatch);
        await expect(dashboard.taskItems).toHaveCount(0);
      });
  });
});
