import { test, expect } from '../fixtures';
import { fmt, taskStorage } from '../support/contract';
import { loadCourse, titleOf } from '../support/data';

const course = loadCourse('course.default.json');
const noneCompleted = Object.fromEntries(course.tasks.map((t) => [t.id, false]));

test.describe('US-10 Görev durumlarını koruma', () => {
  test('tamamlandı olarak işaretlenen görev kaydedilir',
    { tag: ['@US-10', '@AC-10.1', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.toggleTask(titleOf(course, 't3'));
      await expect(dashboard.taskCheckbox(titleOf(course, 't3'))).toBeChecked();

      await expect.poll(() => dashboard.storedCompletedIds()).toEqual(['t3']);
    });

  test('sayfa yenilendiğinde kaydedilen görev durumu geri yüklenir',
    { tag: ['@US-10', '@AC-10.2', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.toggleTask(titleOf(course, 't3'));
      await expect.poll(() => dashboard.storedCompletedIds()).toEqual(['t3']);

      await dashboard.reload();

      await expect(dashboard.taskCheckbox(titleOf(course, 't3'))).toBeChecked();
    });

  test('birden fazla görevin işaretlemesi ayrı ayrı korunur',
    { tag: ['@US-10', '@AC-10.3', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.toggleTask(titleOf(course, 't2'));
      await dashboard.toggleTask(titleOf(course, 't7'));
      await expect.poll(async () => (await dashboard.storedCompletedIds()).sort()).toEqual(['t2', 't7']);

      await dashboard.reload();

      await expect(dashboard.taskCheckbox(titleOf(course, 't7'))).toBeChecked();
      await expect.poll(() => dashboard.checkedStates()).toEqual({ ...noneCompleted, t2: true, t7: true });
    });

  test.describe('önceden kaydedilmiş görevler varken', () => {
    test.use({ seededCompleted: ['t1', 't4'] });

    test('geri alınan işaretleme de yenilemede korunur',
      { tag: ['@US-10', '@AC-10.3', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.toggleTask(titleOf(course, 't1'));
        await expect.poll(() => dashboard.storedCompletedIds()).toEqual(['t4']);

        await dashboard.reload();

        await expect(dashboard.taskCheckbox(titleOf(course, 't4'))).toBeChecked();
        await expect.poll(() => dashboard.checkedStates()).toEqual({ ...noneCompleted, t4: true });
      });

    test('kaydedilmiş veriler okunur ve doğru biçimde geri yüklenir',
      { tag: ['@US-10', '@AC-10.5', '@P2'] },
      async ({ dashboard }) => {
        await expect(dashboard.taskCheckbox(titleOf(course, 't1'))).toBeChecked();
        await expect.poll(() => dashboard.checkedStates()).toEqual({ ...noneCompleted, t1: true, t4: true });
        await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
      });
  });

  test('sayfa yenilendiğinde ilerleme göstergesi kayıtlı durumla tutarlıdır',
    { tag: ['@US-10', '@AC-10.4', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.toggleTask(titleOf(course, 't2'));
      await dashboard.toggleTask(titleOf(course, 't7'));
      await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
      await expect.poll(async () => (await dashboard.storedCompletedIds()).length).toBe(2);

      await dashboard.reload();

      await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
      await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(20));
      await expect(dashboard.progressBar).toHaveAttribute('aria-valuenow', '20');
    });

  test.describe('kayıt bozuksa', () => {
    test.use({ rawTaskStorage: '{bozuk-json' });

    test('uygulama hatasız açılır ve hiçbir görev tamamlanmış sayılmaz',
      {
        tag: ['@US-10', '@AC-10.5', '@P2'],
        annotation: { type: 'varsayım', description: 'A4: okunamayan kayıt hatasız yok sayılır' },
      },
      async ({ dashboard }) => {
        await expect(dashboard.taskItems).toHaveCount(course.tasks.length);
        await expect(dashboard.progressText).toHaveText(fmt.progressText(0, 10));
        await expect.poll(() => dashboard.checkedStates()).toEqual(noneCompleted);
      });
  });

  test.describe('kayıtta artık var olmayan bir görev varsa', () => {
    test.use({ rawTaskStorage: taskStorage.encode(['t1', 't999']) });

    test('bilinmeyen görev yok sayılır, geçerli kayıt geri yüklenir',
      {
        tag: ['@US-10', '@AC-10.5', '@P2'],
        annotation: { type: 'varsayım', description: 'A4: veride olmayan görev kimlikleri yok sayılır' },
      },
      async ({ dashboard }) => {
        await expect(dashboard.taskCheckbox(titleOf(course, 't1'))).toBeChecked();
        await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 10));
      });
  });
});
