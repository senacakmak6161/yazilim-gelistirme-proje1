import { test, expect } from '../fixtures';
import { MESSAGES, fmt } from '../support/contract';
import { loadCourse, tasksOfWeek, weekByNumber } from '../support/data';

test.describe('Dayanıklılık', () => {
  test.describe('ders verisi ilk denemede yüklenemezse', () => {
    test.use({ courseDataFailures: 1, allowPageErrors: true });

    test('hata bildirilir ve "Tekrar dene" ile haftalık kartlar görüntülenir',
      {
        tag: ['@US-01', '@AC-01.1', '@P1'],
        annotation: [
          { type: 'varsayım', description: 'A7: yükleme hatasında role=alert mesajı ve "Tekrar dene" düğmesi' },
          { type: 'izin', description: 'Sunucu 500 döndüğü için tarayıcının konsola yazdığı kaynak hatası beklenir' },
        ],
      },
      async ({ dashboard }) => {
        const course = loadCourse('course.default.json');
        await expect(dashboard.loadError).toContainText(MESSAGES.loadError);
        await expect(dashboard.weekCards).toHaveCount(0);

        await dashboard.retryButton.click();

        await expect(dashboard.weekCards).toHaveCount(course.weeks.length);
        await expect(dashboard.loadError).toBeHidden();
      });
  });

  test.describe('var olmayan haftaya bağlı görev varsa', () => {
    const orphanCourse = loadCourse('course.orphan.json');
    test.use({ courseData: orphanCourse });

    test('uygulama hatasız açılır ve sahipsiz görev hafta filtresinde gösterilmez',
      {
        tag: ['@US-05', '@AC-05.2', '@P2'],
        annotation: { type: 'varsayım', description: 'A8: sahipsiz görev hiçbir hafta filtresinde görünmez' },
      },
      async ({ dashboard }) => {
        await expect(dashboard.weekCards).toHaveCount(orphanCourse.weeks.length);

        await dashboard.selectWeekFilter(fmt.weekOption(1, weekByNumber(orphanCourse, 1).title));

        await expect(dashboard.taskTitles).toHaveText(tasksOfWeek(orphanCourse, 'w1').map((t) => t.title));
      });
  });

  test.describe('derste hiç görev yoksa', () => {
    const zeroTaskCourse = loadCourse('course.zero-tasks.json');
    test.use({ courseData: zeroTaskCourse });

    test('görev listesinde bilgilendirme mesajı gösterilir',
      { tag: ['@US-04', '@AC-04.5', '@P2'] },
      async ({ dashboard }) => {
        await expect(dashboard.emptyState).toHaveText(MESSAGES.noTasks);
        await expect(dashboard.taskItems).toHaveCount(0);
      });

    test('hafta seçildiğinde haftaya ait görev olmadığı bildirilir',
      { tag: ['@US-05', '@AC-05.4', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.selectWeekFilter(fmt.weekOption(1, weekByNumber(zeroTaskCourse, 1).title));

        await expect(dashboard.emptyState).toHaveText(MESSAGES.weekNoTasks);
        await expect(dashboard.taskItems).toHaveCount(0);
      });
  });
});
