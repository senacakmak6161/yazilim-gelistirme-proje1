import { test, expect } from '../fixtures';
import { fmt } from '../support/contract';
import { completionMap, loadCourse, titleOf } from '../support/data';

const course = loadCourse('course.default.json');
const w1t1 = titleOf(course, 'w1-t1');
const w1t3 = titleOf(course, 'w1-t3');
const w2t2 = titleOf(course, 'w2-t2');

test.describe('US-03 Görevleri tamamlandı olarak işaretleme', () => {
  test('her görevin tamamlanma durumunu değiştiren bir kontrolü vardır',
    { tag: ['@US-03', '@AC-03.1', '@P1'] },
    async ({ dashboard }) => {
      for (const week of course.weeks.filter((w) => w.tasks.length > 0)) {
        await test.step(`Hafta ${week.weekNumber}`, async () => {
          await dashboard.selectWeekCard(week.weekNumber);
          await expect(dashboard.taskItems).toHaveCount(week.tasks.length);
          await expect(dashboard.taskCheckboxes).toHaveCount(week.tasks.length);
          for (const task of week.tasks) {
            await expect(dashboard.taskCheckbox(task.title)).toBeEnabled();
          }
        });
      }
    });

  test('kontrol işaretlenince görev tamamlandı durumuna geçer',
    { tag: ['@US-03', '@AC-03.2', '@P1'] },
    async ({ dashboard }) => {
      await dashboard.openWeekOf(w1t3);
      await expect(dashboard.taskCheckbox(w1t3)).not.toBeChecked();

      await dashboard.toggleTask(w1t3);

      await expect(dashboard.taskCheckbox(w1t3)).toBeChecked();
    });

  test('tamamlanan görev "Tamamlandı" rozetiyle diğerlerinden ayırt edilir',
    { tag: ['@US-03', '@AC-03.3', '@P1'] },
    async ({ dashboard }) => {
      await dashboard.openWeekOf(w1t3);
      await expect(dashboard.taskCheckbox(w1t3)).not.toBeChecked();
      await expect(dashboard.completedBadge(w1t3)).toBeHidden();

      await dashboard.toggleTask(w1t3);

      await expect(dashboard.completedBadge(w1t3)).toBeVisible();
      await expect(dashboard.completedBadge(w1t1)).toBeHidden();
    });

  test.describe('tamamlanmış görevle başlayınca', () => {
    test.use({ seededCompleted: ['w1-t3'] });

    test('işaret kaldırılınca görev yeniden tamamlanmamış duruma döner',
      { tag: ['@US-03', '@AC-03.4', '@P1'] },
      async ({ dashboard }) => {
        await dashboard.openWeekOf(w1t3);
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
          await dashboard.openWeekOf(w1t3);
          await dashboard.toggleTask(w1t3);
          await expect(dashboard.taskCheckbox(w1t3)).toBeChecked();
          expect(await dashboard.allCheckedStates()).toEqual(completionMap(course, ['w1-t1', 'w1-t3', 'w2-t2']));
        });

        await test.step('w2-t2 işareti kaldırılır', async () => {
          await dashboard.openWeekOf(w2t2);
          await dashboard.toggleTask(w2t2);
          await expect(dashboard.taskCheckbox(w2t2)).not.toBeChecked();
          expect(await dashboard.allCheckedStates()).toEqual(completionMap(course, ['w1-t1', 'w1-t3']));
        });
      });
  });

  test('görev durumu değişince ilerleme göstergesi güncellenir',
    { tag: ['@US-03', '@AC-03.6', '@P1'] },
    async ({ dashboard }) => {
      await expect(dashboard.progressText).toHaveText(fmt.progressText(0, 10));

      await dashboard.openWeekOf(w1t3);
      await dashboard.toggleTask(w1t3);

      await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 10));
      await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(10));
    });
});
