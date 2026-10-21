import { test, expect } from '../fixtures';
import { LABELS, MESSAGES, STATUS, fmt } from '../support/contract';
import { loadCourse, tasksOfWeek, titlesOf, weekByNumber } from '../support/data';

const course = loadCourse('course.default.json');
const allTitles = course.tasks.map((t) => t.title);
const weekOption = (weekNo: number) => fmt.weekOption(weekNo, weekByNumber(course, weekNo).title);
const weeksWithTasks = course.weeks.filter((w) => tasksOfWeek(course, w.id).length > 0);

test.describe('US-05 Görevleri haftaya göre filtreleme', () => {
  test('hafta filtresi tüm haftalar ve her hafta için seçenek sunar',
    { tag: ['@US-05', '@AC-05.1', '@P2'] },
    async ({ dashboard }) => {
      await expect(dashboard.weekOptions).toHaveText([
        LABELS.allWeeks,
        ...course.weeks.map((w) => fmt.weekOption(w.number, w.title)),
      ]);
    });

  test('hafta seçilince o haftaya ait görevler görüntülenir',
    { tag: ['@US-05', '@AC-05.1', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.selectWeekFilter(weekOption(2));

      await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['t4', 't5', 't6']));
    });

  for (const week of weeksWithTasks) {
    test(`Hafta ${week.number} seçilince yalnızca o haftanın görevleri gösterilir`,
      { tag: ['@US-05', '@AC-05.2', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.selectWeekFilter(weekOption(week.number));

        await expect(dashboard.taskTitles).toHaveText(tasksOfWeek(course, week.id).map((t) => t.title));
      });
  }

  test('tüm haftalar seçilince haftaya bağlı filtre kaldırılır',
    { tag: ['@US-05', '@AC-05.3', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.selectWeekFilter(weekOption(2));
      await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['t4', 't5', 't6']));

      await dashboard.selectWeekFilter(LABELS.allWeeks);

      await expect(dashboard.taskTitles).toHaveText(allTitles);
    });

  test('görevi olmayan hafta seçilince boş durum mesajı gösterilir',
    { tag: ['@US-05', '@AC-05.4', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.selectWeekFilter(weekOption(4));

      await expect(dashboard.emptyState).toHaveText(MESSAGES.weekNoTasks);
      await expect(dashboard.taskItems).toHaveCount(0);
    });
});

test.describe('US-05 Hafta filtresi diğer ölçütlerle birlikte (karar K3)', () => {
  test.use({ seededCompleted: ['t4', 't9'] });

  test('hafta ve durum filtresi birlikte uygulanır',
    {
      tag: ['@US-05', '@AC-05.2', '@AC-04.3', '@P2'],
      annotation: { type: 'karar', description: 'K3: ölçütler VE ile birleşir' },
    },
    async ({ dashboard }) => {
      await dashboard.selectWeekFilter(weekOption(2));
      await dashboard.setStatusFilter(STATUS.pending);

      await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['t5', 't6']));
    });

  test('hafta filtresi ve arama birlikte uygulanır',
    {
      tag: ['@US-05', '@AC-05.2', '@AC-06.2', '@P2'],
      annotation: { type: 'karar', description: 'K3: ölçütler VE ile birleşir' },
    },
    async ({ dashboard }) => {
      await dashboard.selectWeekFilter(weekOption(3));
      await dashboard.search('kaydet');

      await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['t9']));
    });

  test('hafta filtresi ve arama birlikte hiçbir görevle eşleşmezse bilgilendirme gösterilir',
    {
      tag: ['@US-05', '@AC-06.4', '@P2'],
      annotation: { type: 'karar', description: 'K3: ölçütler VE ile birleşir' },
    },
    async ({ dashboard }) => {
      await dashboard.selectWeekFilter(weekOption(1));
      await dashboard.search('grid');

      await expect(dashboard.emptyState).toHaveText(MESSAGES.noMatch);
      await expect(dashboard.taskItems).toHaveCount(0);
    });
});
