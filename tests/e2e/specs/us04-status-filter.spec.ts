import { test, expect } from '../fixtures';
import { MESSAGES, STATUS, fmt } from '../support/contract';
import { allTasks, allTitles, completionMap, loadCourse, titleOf, titlesOf } from '../support/data';

const course = loadCourse('course.default.json');
const completedIds = ['w1-t1', 'w2-t2', 'w3-t3'];
const pendingIds = ['w1-t2', 'w1-t3', 'w2-t1', 'w2-t3', 'w3-t1', 'w3-t2', 'w3-t4'];

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

        await dashboard.toggleTask(titleOf(course, 'w1-t2'));

        await expect(dashboard.taskTitles).toHaveText(
          titlesOf(course, ['w1-t3', 'w2-t1', 'w2-t3', 'w3-t1', 'w3-t2', 'w3-t4']),
        );
      });

    test('tümü seçilince filtre nedeniyle gizlenen görevler yeniden gösterilir',
      { tag: ['@US-04', '@AC-04.4', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.setStatusFilter(STATUS.completed);
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, completedIds));

        await dashboard.setStatusFilter(STATUS.all);

        await expect(dashboard.taskTitles).toHaveText(allTitles(course));
      });

    test('filtre değiştirmek görevlerin gerçek tamamlanma durumunu değiştirmez',
      { tag: ['@US-04', '@AC-04.6', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.setStatusFilter(STATUS.pending);
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, pendingIds));
        await dashboard.setStatusFilter(STATUS.completed);
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, completedIds));
        await dashboard.setStatusFilter(STATUS.all);
        await expect(dashboard.taskTitles).toHaveText(allTitles(course));

        await expect.poll(() => dashboard.checkedStates()).toEqual(completionMap(course, ['w1-t1', 'w2-t2', 'w3-t3']));
        await expect(dashboard.progressText).toHaveText(fmt.progressText(3, 10));
        await expect.poll(async () => (await dashboard.storedCompletedIds()).sort()).toEqual(['w1-t1', 'w2-t2', 'w3-t3']);
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
    test.use({ seededCompleted: allTasks(course).map((t) => t.id) });

    test('tüm görevler tamamlanmışken devam eden filtresinde bilgilendirme gösterilir',
      { tag: ['@US-04', '@AC-04.5', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.setStatusFilter(STATUS.pending);

        await expect(dashboard.emptyState).toHaveText(MESSAGES.noMatch);
        await expect(dashboard.taskItems).toHaveCount(0);
      });
  });
});
