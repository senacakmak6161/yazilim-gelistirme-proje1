import { test, expect } from '../fixtures';
import { MESSAGES, STATUS, LABELS, fmt } from '../support/contract';
import { allTitles, loadCourse } from '../support/data';

const course = loadCourse('course.default.json');
const README_RULE = { type: 'kaynak', description: 'README Veri modeli: bozuk veya beklenmeyen localStorage içeriğinde varsayılan değerlere dönülür' };

test.describe('Dayanıklılık', () => {
  test.describe('derste hiç görev yoksa', () => {
    test.use({ courseData: loadCourse('course.zero-tasks.json') });

    test('görevsiz derste görev listesi yerine bilgilendirme gösterilir',
      { tag: ['@US-04', '@AC-04.5', '@P2'] },
      async ({ dashboard }) => {
        await expect(dashboard.emptyState).toHaveText(MESSAGES.noTasks);
        await expect(dashboard.taskItems).toHaveCount(0);
      });
  });

  test.describe('filtre kaydı okunamazsa', () => {
    test.use({ rawStorage: { filters: '{bozuk-json' } });

    test('uygulama hatasız ve varsayılan filtrelerle açılır',
      { tag: ['@US-04', '@US-05', '@VM-2', '@P2'], annotation: [README_RULE] },
      async ({ dashboard }) => {
        await expect(dashboard.statusRadio(STATUS.all)).toBeChecked();
        await expect.poll(() => dashboard.selectedWeekLabel()).toBe(LABELS.allWeeks);
        await expect(dashboard.taskTitles).toHaveText(allTitles(course));
        await expect(dashboard.progressText).toHaveText(fmt.progressText(0, 10));
      });
  });
});
