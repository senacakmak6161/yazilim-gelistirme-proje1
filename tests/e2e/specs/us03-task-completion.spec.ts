import { test, expect } from '../fixtures';
import { fmt } from '../support/contract';
import { loadCourse, titleOf } from '../support/data';

const course = loadCourse('course.default.json');
const t3 = titleOf(course, 't3');
const t4 = titleOf(course, 't4');
const t5 = titleOf(course, 't5');

test.describe('US-03 Görevleri tamamlandı olarak işaretleme', () => {
  test('her görevin tamamlanma durumunu değiştiren bir kontrolü vardır',
    { tag: ['@US-03', '@AC-03.1', '@P1'] },
    async ({ dashboard }) => {
      await expect(dashboard.taskItems).toHaveCount(course.tasks.length);
      await expect(dashboard.taskCheckboxes).toHaveCount(course.tasks.length);
      for (const task of course.tasks) {
        await expect(dashboard.taskCheckbox(task.title)).toBeEnabled();
      }
    });

  test('kontrol işaretlenince görev tamamlandı durumuna geçer',
    { tag: ['@US-03', '@AC-03.2', '@P1'] },
    async ({ dashboard }) => {
      await expect(dashboard.taskCheckbox(t3)).not.toBeChecked();

      await dashboard.toggleTask(t3);

      await expect(dashboard.taskCheckbox(t3)).toBeChecked();
    });

  test('tamamlanan görev "Tamamlandı" rozetiyle diğerlerinden ayırt edilir',
    { tag: ['@US-03', '@AC-03.3', '@P1'] },
    async ({ dashboard }) => {
      await expect(dashboard.taskCheckbox(t3)).not.toBeChecked();
      await expect(dashboard.completedBadge(t3)).toBeHidden();

      await dashboard.toggleTask(t3);

      await expect(dashboard.completedBadge(t3)).toBeVisible();
      await expect(dashboard.completedBadge(t4)).toBeHidden();
    });

  test.describe('tamamlanmış görevle başlayınca', () => {
    test.use({ seededCompleted: ['t3'] });

    test('işaret kaldırılınca görev yeniden tamamlanmamış duruma döner',
      { tag: ['@US-03', '@AC-03.4', '@P1'] },
      async ({ dashboard }) => {
        await expect(dashboard.taskCheckbox(t3)).toBeChecked();

        await dashboard.toggleTask(t3);

        await expect(dashboard.taskCheckbox(t3)).not.toBeChecked();
        await expect(dashboard.completedBadge(t3)).toBeHidden();
      });
  });

  test.describe('birden fazla görev tamamlanmışken', () => {
    test.use({ seededCompleted: ['t1', 't5'] });

    test('bir görevin durumu değişince diğer görevlerin durumu değişmez',
      { tag: ['@US-03', '@AC-03.5', '@P1'] },
      async ({ dashboard }) => {
        await test.step('t3 işaretlenir', async () => {
          await dashboard.toggleTask(t3);
          await expect(dashboard.taskCheckbox(t3)).toBeChecked();
          await expect.poll(() => dashboard.checkedStates()).toEqual({
            t1: true, t2: false, t3: true, t4: false, t5: true,
            t6: false, t7: false, t8: false, t9: false, t10: false,
          });
        });

        await test.step('t5 işareti kaldırılır', async () => {
          await dashboard.toggleTask(t5);
          await expect(dashboard.taskCheckbox(t5)).not.toBeChecked();
          await expect.poll(() => dashboard.checkedStates()).toEqual({
            t1: true, t2: false, t3: true, t4: false, t5: false,
            t6: false, t7: false, t8: false, t9: false, t10: false,
          });
        });
      });
  });

  test('görev durumu değişince ilerleme göstergesi güncellenir',
    { tag: ['@US-03', '@AC-03.6', '@P1'] },
    async ({ dashboard }) => {
      await expect(dashboard.progressText).toHaveText(fmt.progressText(0, 10));

      await dashboard.toggleTask(t3);

      await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 10));
      await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(10));
    });
});
