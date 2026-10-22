import { test, expect } from '../fixtures';
import { LIMITS, STATUS, fmt } from '../support/contract';
import { loadCourse, tasksOfWeek, weekByNumber } from '../support/data';

const course = loadCourse('course.many.json');
const budget = LIMITS.responseBudgetMs;

test.describe('Hızlı tepki (100 görevlik veriyle)', () => {
  test.use({ courseData: course, seededCompleted: ['w1-t1'] });
  test.skip(
    ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
    'Süre ölçümü makine ve motora duyarlıdır; karşılaştırılabilir sonuç için tek masaüstü motorunda ölçülür',
  );

  test(`görev işaretlendikten sonra ilerleme ${budget} ms içinde güncellenir`,
    {
      tag: ['@NFR-4', '@P2'],
      annotation: { type: 'karar', description: 'D4: eşik 300 ms, yalnızca chromium' },
    },
    async ({ dashboard }) => {
      const elapsed = await dashboard.measureUpdateMs(
        () => dashboard.toggleTask('Görev 5.5'),
        () => expect(dashboard.progressText).toHaveText(fmt.progressText(2, 100)),
      );

      expect.soft(elapsed, `ölçülen süre: ${Math.round(elapsed)} ms`).toBeLessThanOrEqual(budget);
    });

  test(`arama sonucu ${budget} ms içinde güncellenir`,
    {
      tag: ['@NFR-4', '@P2'],
      annotation: { type: 'karar', description: 'D4: eşik 300 ms, yalnızca chromium' },
    },
    async ({ dashboard }) => {
      const elapsed = await dashboard.measureUpdateMs(
        () => dashboard.search('Görev 7.3'),
        () => expect(dashboard.taskTitles).toHaveText(['Görev 7.3']),
      );

      expect.soft(elapsed, `ölçülen süre: ${Math.round(elapsed)} ms`).toBeLessThanOrEqual(budget);
    });

  test(`durum filtresi ${budget} ms içinde uygulanır`,
    {
      tag: ['@NFR-4', '@P2'],
      annotation: { type: 'karar', description: 'D4: eşik 300 ms, yalnızca chromium' },
    },
    async ({ dashboard }) => {
      const elapsed = await dashboard.measureUpdateMs(
        () => dashboard.setStatusFilter(STATUS.completed),
        () => expect(dashboard.taskTitles).toHaveText(['Görev 1.1']),
      );

      expect.soft(elapsed, `ölçülen süre: ${Math.round(elapsed)} ms`).toBeLessThanOrEqual(budget);
    });

  test(`hafta filtresi ${budget} ms içinde uygulanır`,
    {
      tag: ['@NFR-4', '@P2'],
      annotation: { type: 'karar', description: 'D4: eşik 300 ms, yalnızca chromium' },
    },
    async ({ dashboard }) => {
      const week4 = weekByNumber(course, 4);
      const elapsed = await dashboard.measureUpdateMs(
        () => dashboard.selectWeekFilter(fmt.weekOption(4, week4.title)),
        () => expect(dashboard.taskTitles).toHaveText(tasksOfWeek(course, 4).map((t) => t.title)),
      );

      expect.soft(elapsed, `ölçülen süre: ${Math.round(elapsed)} ms`).toBeLessThanOrEqual(budget);
    });
});
