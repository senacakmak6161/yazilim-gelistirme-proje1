import { test, expect } from '../fixtures';
import { LABELS, STATUS, fmt } from '../support/contract';
import { loadCourse, titleOf, weekByNumber } from '../support/data';

const course = loadCourse('course.default.json');
const threeTaskCourse = { ...course, tasks: course.tasks.slice(0, 3) };

test.describe('US-07 Genel ilerlemeyi görüntüleme', () => {
  test('hiç görev tamamlanmamışken tamamlanan ve toplam görev sayısı gösterilir',
    { tag: ['@US-07', '@AC-07.1', '@P1'] },
    async ({ dashboard }) => {
      await expect(dashboard.progressText).toHaveText(fmt.progressText(0, 10));
      await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(0));
    });

  test.describe('üç görev tamamlanmışken', () => {
    test.use({ seededCompleted: ['t1', 't2', 't3'] });

    test('tamamlanan ve toplam görev sayısı gösterilir',
      { tag: ['@US-07', '@AC-07.1', '@P1'] },
      async ({ dashboard }) => {
        await expect(dashboard.progressText).toHaveText(fmt.progressText(3, 10));
      });
  });

  test.describe('10 görevden 6\'sı tamamlanmışken (PDF örneği)', () => {
    test.use({ seededCompleted: ['t1', 't2', 't3', 't4', 't5', 't6'] });

    test('ilerleme yüzdesi %60 olarak hesaplanır',
      { tag: ['@US-07', '@AC-07.2', '@P1'] },
      async ({ dashboard }) => {
        await expect(dashboard.progressText).toHaveText(fmt.progressText(6, 10));
        await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(60));
      });

    test('sayısal gösterge ile ilerleme çubuğu aynı değeri gösterir',
      { tag: ['@US-07', '@AC-07.5', '@P1'] },
      async ({ dashboard }) => {
        await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(60));
        await expect(dashboard.progressBar).toHaveAttribute('aria-valuenow', '60');
        await expect.poll(() => dashboard.progressFillRatio()).toBeCloseTo(0.6, 1);
      });

    test('görev tamamlanınca çubuk sayısal göstergeyle birlikte güncellenir',
      { tag: ['@US-07', '@AC-07.5', '@P1'] },
      async ({ dashboard }) => {
        await dashboard.toggleTask(titleOf(course, 't7'));

        await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(70));
        await expect(dashboard.progressBar).toHaveAttribute('aria-valuenow', '70');
        await expect.poll(() => dashboard.progressFillRatio()).toBeCloseTo(0.7, 1);
      });
  });

  test.describe('tüm görevler tamamlanmışken', () => {
    test.use({ seededCompleted: course.tasks.map((t) => t.id) });

    test('ilerleme %100 gösterilir',
      { tag: ['@US-07', '@AC-07.2', '@P1'] },
      async ({ dashboard }) => {
        await expect(dashboard.progressText).toHaveText(fmt.progressText(10, 10));
        await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(100));
      });
  });

  test.describe('yuvarlama (karar K7)', () => {
    test.use({ courseData: threeTaskCourse });

    test.describe('3 görevden 1\'i tamamlanmışken', () => {
      test.use({ seededCompleted: ['t1'] });

      test('1/3 ilerleme %33 olarak gösterilir',
        {
          tag: ['@US-07', '@AC-07.2', '@P1'],
          annotation: { type: 'karar', description: 'K7: en yakın tam sayıya yuvarlanır' },
        },
        async ({ dashboard }) => {
          await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 3));
          await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(33));
        });
    });

    test.describe('3 görevden 2\'si tamamlanmışken', () => {
      test.use({ seededCompleted: ['t1', 't2'] });

      test('2/3 ilerleme %67 olarak gösterilir',
        {
          tag: ['@US-07', '@AC-07.2', '@P1'],
          annotation: { type: 'karar', description: 'K7: en yakın tam sayıya yuvarlanır' },
        },
        async ({ dashboard }) => {
          await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 3));
          await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(67));
        });
    });
  });

  test('yeni görev tamamlanınca ilerleme göstergesi güncellenir',
    { tag: ['@US-07', '@AC-07.3', '@P1'] },
    async ({ dashboard }) => {
      await expect(dashboard.progressText).toHaveText(fmt.progressText(0, 10));

      await dashboard.toggleTask(titleOf(course, 't1'));

      await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 10));
      await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(10));
    });

  test.describe('iki görev tamamlanmışken', () => {
    test.use({ seededCompleted: ['t1', 't2'] });

    test('tamamlanan görev geri alınınca ilerleme yeniden hesaplanır',
      { tag: ['@US-07', '@AC-07.4', '@P1'] },
      async ({ dashboard }) => {
        await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));

        await dashboard.toggleTask(titleOf(course, 't2'));

        await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 10));
        await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(10));
      });

    test('ilerleme filtre ve aramadan etkilenmez',
      {
        tag: ['@US-07', '@AC-07.1', '@P1'],
        annotation: { type: 'karar', description: 'K8: ilerleme her zaman tüm görevler üzerinden hesaplanır' },
      },
      async ({ dashboard }) => {
        await test.step('tamamlanan filtresi', async () => {
          await dashboard.setStatusFilter(STATUS.completed);
          await expect(dashboard.taskItems).toHaveCount(2);
          await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
          await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(20));
        });

        await test.step('hafta filtresi', async () => {
          await dashboard.setStatusFilter(STATUS.all);
          await dashboard.selectWeekFilter(fmt.weekOption(3, weekByNumber(course, 3).title));
          await expect(dashboard.taskItems).toHaveCount(4);
          await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
        });

        await test.step('eşleşmeyen arama', async () => {
          await dashboard.selectWeekFilter(LABELS.allWeeks);
          await dashboard.search('xyz123');
          await expect(dashboard.taskItems).toHaveCount(0);
          await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
        });
      });
  });

  test.describe('hiç görev yokken', () => {
    test.use({ courseData: loadCourse('course.zero-tasks.json') });

    test('toplam görev sıfırken hesaplama hatası oluşmaz',
      { tag: ['@US-07', '@AC-07.6', '@P1'] },
      async ({ dashboard }) => {
        await expect(dashboard.progressText).toHaveText(fmt.progressText(0, 0));
        await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(0));
        await expect(dashboard.progressBar).toHaveAttribute('aria-valuenow', '0');
        await expect(dashboard.progressText).not.toContainText(/NaN|Infinity|undefined/);
      });
  });
});
