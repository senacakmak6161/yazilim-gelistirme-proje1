import { test, expect } from '../fixtures';
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

  test('görev başlığına tıklamak da görevi işaretler ve işareti kaldırır',
    {
      tag: ['@US-03', '@AC-03.2', '@AC-03.4', '@P1'],
      annotation: { type: 'kaynak', description: 'README Kullanıcı rehberi §3: görev başlığına tıklamak da kutuyu işaretler' },
    },
    async ({ dashboard }) => {
      await dashboard.openWeekOf(w1t3);
      await expect(dashboard.taskCheckbox(w1t3)).not.toBeChecked();

      await dashboard.clickTaskTitle(w1t3);
      await expect(dashboard.taskCheckbox(w1t3)).toBeChecked();
      await expect(dashboard.completedBadge(w1t3)).toBeVisible();

      await dashboard.clickTaskTitle(w1t3);
      await expect(dashboard.taskCheckbox(w1t3)).not.toBeChecked();
      await expect(dashboard.completedBadge(w1t3)).toBeHidden();
    });

  test('tamamlanan görev "Tamamlandı" rozeti ve üstü çizili başlıkla diğerlerinden ayırt edilir',
    {
      tag: ['@US-03', '@AC-03.3', '@P1'],
      annotation: { type: 'kaynak', description: 'README Kullanıcı rehberi §3: tamamlanan görevin başlığının üstü çizilir' },
    },
    async ({ dashboard }) => {
      await dashboard.openWeekOf(w1t3);
      await expect(dashboard.taskCheckbox(w1t3)).not.toBeChecked();
      await expect(dashboard.completedBadge(w1t3)).toBeHidden();
      expect(await dashboard.titleDecoration(w1t3)).not.toContain('line-through');

      await dashboard.toggleTask(w1t3);

      await expect(dashboard.completedBadge(w1t3)).toBeVisible();
      await expect.poll(() => dashboard.titleDecoration(w1t3)).toContain('line-through');
      await expect(dashboard.completedBadge(w1t1)).toBeHidden();
      expect(await dashboard.titleDecoration(w1t1)).not.toContain('line-through');
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
});
