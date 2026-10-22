import { test, expect } from '../fixtures';
import { fmt, taskStorage } from '../support/contract';
import { allTasks, completionMap, loadCourse, titleOf } from '../support/data';

const course = loadCourse('course.default.json');

test.describe('US-10 Görev durumlarını koruma', () => {
  test('tamamlandı olarak işaretlenen görev kaydedilir',
    { tag: ['@US-10', '@AC-10.1', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.toggleTask(titleOf(course, 'w1-t3'));
      await expect(dashboard.taskCheckbox(titleOf(course, 'w1-t3'))).toBeChecked();

      await expect.poll(() => dashboard.storedCompletedIds()).toEqual(['w1-t3']);
    });

  test('sayfa yenilendiğinde kaydedilen görev durumu geri yüklenir',
    { tag: ['@US-10', '@AC-10.2', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.toggleTask(titleOf(course, 'w1-t3'));
      await expect.poll(() => dashboard.storedCompletedIds()).toEqual(['w1-t3']);

      await dashboard.reload();

      await expect(dashboard.taskCheckbox(titleOf(course, 'w1-t3'))).toBeChecked();
    });

  test('birden fazla görevin işaretlemesi ayrı ayrı korunur',
    { tag: ['@US-10', '@AC-10.3', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.toggleTask(titleOf(course, 'w1-t2'));
      await dashboard.toggleTask(titleOf(course, 'w3-t1'));
      await expect.poll(async () => (await dashboard.storedCompletedIds()).sort()).toEqual(['w1-t2', 'w3-t1']);

      await dashboard.reload();

      await expect(dashboard.taskCheckbox(titleOf(course, 'w3-t1'))).toBeChecked();
      await expect.poll(() => dashboard.checkedStates()).toEqual(completionMap(course, ['w1-t2', 'w3-t1']));
    });

  test.describe('önceden kaydedilmiş görevler varken', () => {
    test.use({ seededCompleted: ['w1-t1', 'w2-t1'] });

    test('geri alınan işaretleme de yenilemede korunur',
      { tag: ['@US-10', '@AC-10.3', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.toggleTask(titleOf(course, 'w1-t1'));
        await expect.poll(() => dashboard.storedCompletedIds()).toEqual(['w2-t1']);

        await dashboard.reload();

        await expect(dashboard.taskCheckbox(titleOf(course, 'w2-t1'))).toBeChecked();
        await expect.poll(() => dashboard.checkedStates()).toEqual(completionMap(course, ['w2-t1']));
      });

    test('kaydedilmiş veriler okunur ve doğru biçimde geri yüklenir',
      { tag: ['@US-10', '@AC-10.5', '@P2'] },
      async ({ dashboard }) => {
        await expect(dashboard.taskCheckbox(titleOf(course, 'w1-t1'))).toBeChecked();
        await expect.poll(() => dashboard.checkedStates()).toEqual(completionMap(course, ['w1-t1', 'w2-t1']));
        await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
      });
  });

  test('sayfa yenilendiğinde ilerleme göstergesi kayıtlı durumla tutarlıdır',
    { tag: ['@US-10', '@AC-10.4', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.toggleTask(titleOf(course, 'w1-t2'));
      await dashboard.toggleTask(titleOf(course, 'w3-t1'));
      await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
      await expect.poll(async () => (await dashboard.storedCompletedIds()).length).toBe(2);

      await dashboard.reload();

      await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
      await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(20));
      await expect(dashboard.progressBar).toHaveAttribute('aria-valuenow', '20');
    });

  test.describe('kayıt bozuksa', () => {
    test.use({ rawStorage: { tasks: '{bozuk-json' } });

    test('kayıt bozuksa uygulama hatasız açılır ve hiçbir görev tamamlanmış sayılmaz',
      {
        tag: ['@US-10', '@AC-10.5', '@P2'],
        annotation: { type: 'kaynak', description: 'A4 (README): okunamayan kayıt hatasız yok sayılır' },
      },
      async ({ dashboard }) => {
        await expect(dashboard.taskItems).toHaveCount(allTasks(course).length);
        await expect(dashboard.progressText).toHaveText(fmt.progressText(0, 10));
        await expect.poll(() => dashboard.checkedStates()).toEqual(completionMap(course, []));
      });
  });

  test.describe('kayıtta artık var olmayan bir görev varsa', () => {
    test.use({ rawStorage: { tasks: taskStorage.encode(['w1-t1', 'w9-t9']) } });

    test('kayıttaki bilinmeyen görev yok sayılır, geçerli kayıt geri yüklenir',
      {
        tag: ['@US-10', '@AC-10.5', '@P2'],
        annotation: { type: 'kaynak', description: 'A4 (README): veride olmayan görev kimlikleri yok sayılır' },
      },
      async ({ dashboard }) => {
        await expect(dashboard.taskCheckbox(titleOf(course, 'w1-t1'))).toBeChecked();
        await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 10));
      });
  });

  test.describe('kayıtta false değerli görevler varsa', () => {
    test.use({ rawStorage: { tasks: JSON.stringify({ 'w1-t1': true, 'w2-t3': false }) } });

    test('yalnızca true değerli görevler tamamlanmış gösterilir',
      {
        tag: ['@US-10', '@AC-10.5', '@P2'],
        annotation: { type: 'kaynak', description: 'README Veri modeli: ddp.taskStatus görev kimliği → tamamlanma durumu' },
      },
      async ({ dashboard }) => {
        await expect(dashboard.taskCheckbox(titleOf(course, 'w1-t1'))).toBeChecked();
        await expect(dashboard.taskCheckbox(titleOf(course, 'w2-t3'))).not.toBeChecked();
        await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 10));
      });
  });
});
