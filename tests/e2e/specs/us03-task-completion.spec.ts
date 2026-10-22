import { test, expect } from '../fixtures';
import { fmt } from '../support/contract';
import { allTasks, completionMap, loadCourse, titleOf } from '../support/data';

const course = loadCourse('course.default.json');
const w1t3 = titleOf(course, 'w1-t3');
const w2t1 = titleOf(course, 'w2-t1');
const w2t2 = titleOf(course, 'w2-t2');

test.describe('US-03 Görevleri tamamlandı olarak işaretleme', () => {
  test('her görevin tamamlanma durumunu değiştiren bir kontrolü vardır',
    { tag: ['@US-03', '@AC-03.1', '@P1'] },
    async ({ dashboard }) => {
      await expect(dashboard.taskItems).toHaveCount(allTasks(course).length);
      await expect(dashboard.taskCheckboxes).toHaveCount(allTasks(course).length);
      for (const task of allTasks(course)) {
        await expect(dashboard.taskCheckbox(task.title)).toBeEnabled();
      }
    });

  test('kontrol işaretlenince görev tamamlandı durumuna geçer',
    { tag: ['@US-03', '@AC-03.2', '@P1'] },
    async ({ dashboard }) => {
      await expect(dashboard.taskCheckbox(w1t3)).not.toBeChecked();

      await dashboard.toggleTask(w1t3);

      await expect(dashboard.taskCheckbox(w1t3)).toBeChecked();
    });

  test('tamamlanan görev "Tamamlandı" rozetiyle diğerlerinden ayırt edilir',
    { tag: ['@US-03', '@AC-03.3', '@P1'] },
    async ({ dashboard }) => {
      await expect(dashboard.taskCheckbox(w1t3)).not.toBeChecked();
      await expect(dashboard.completedBadge(w1t3)).toBeHidden();

      await dashboard.toggleTask(w1t3);

      await expect(dashboard.completedBadge(w1t3)).toBeVisible();
      await expect(dashboard.completedBadge(w2t1)).toBeHidden();
    });

  test.describe('tamamlanmış görevle başlayınca', () => {
    test.use({ seededCompleted: ['w1-t3'] });

    test('işaret kaldırılınca görev yeniden tamamlanmamış duruma döner',
      { tag: ['@US-03', '@AC-03.4', '@P1'] },
      async ({ dashboard }) => {
        await expect(dashboard.taskCheckbox(w1t3)).toBeChecked();

        await dashboard.toggleTask(w1t3);

        await expect(dashboard.taskCheckbox(w1t3)).not.toBeChecked();
        await expect(dashboard.completedBadge(w1t3)).toBeHidden();
      });
  });

  test.describe('birden fazla görev tamamlanmışken', () => {
    test.use({ seededCompleted: ['w1-t1', 'w2-t2'] });

    test('bir görevin durumu değişince diğer görevlerin durumu değişmez',
      { tag: ['@US-03', '@AC-03.5', '@P1'] },
      async ({ dashboard }) => {
        await test.step('w1-t3 işaretlenir', async () => {
          await dashboard.toggleTask(w1t3);
          await expect(dashboard.taskCheckbox(w1t3)).toBeChecked();
          await expect.poll(() => dashboard.checkedStates()).toEqual(completionMap(course, ['w1-t1', 'w1-t3', 'w2-t2']));
        });

        await test.step('w2-t2 işareti kaldırılır', async () => {
          await dashboard.toggleTask(w2t2);
          await expect(dashboard.taskCheckbox(w2t2)).not.toBeChecked();
          await expect.poll(() => dashboard.checkedStates()).toEqual(completionMap(course, ['w1-t1', 'w1-t3']));
        });
      });
  });

  test('görev durumu değişince ilerleme göstergesi güncellenir',
    { tag: ['@US-03', '@AC-03.6', '@P1'] },
    async ({ dashboard }) => {
      await expect(dashboard.progressText).toHaveText(fmt.progressText(0, 10));

      await dashboard.toggleTask(w1t3);

      await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 10));
      await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(10));
    });
});
