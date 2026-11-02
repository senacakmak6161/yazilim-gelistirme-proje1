import { test, expect } from '../fixtures';
import { LABELS, SAMPLE_FILTERS, STATUS, filterStorage, fmt } from '../support/contract';
import { loadCourse, titlesOf, weekByNumber } from '../support/data';

const course = loadCourse('course.default.json');
const weekOption = (weekNo: number) => fmt.weekOption(weekNo, weekByNumber(course, weekNo).title);
const README_FILTERS = { type: 'kaynak', description: 'README Veri modeli: ddp.filters son kullanılan filtre tercihini saklar' };

test.describe('Filtre tercihinin korunması (README veri modeli)', () => {
  test.describe('tamamlanmış görevler varken', () => {
    test.use({ seededCompleted: ['w1-t1', 'w2-t2', 'w3-t3'] });

    test('durum ve hafta filtresi sayfa yenilendiğinde korunur',
      { tag: ['@US-04', '@US-05', '@VM-1', '@P2'], annotation: [README_FILTERS] },
      async ({ dashboard }) => {
        await test.step('filtreler seçilir', async () => {
          await dashboard.selectWeekFilter(weekOption(2));
          await dashboard.setStatusFilter(STATUS.pending);
          await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['w2-t1', 'w2-t3']));
          await expect.poll(() => dashboard.readStoredFilters()).not.toBeNull();
        });

        await test.step('sayfa yenilenir', async () => {
          await dashboard.reload();
        });

        await test.step('filtre seçimi ve süzülmüş liste korunur', async () => {
          await expect(dashboard.statusRadio(STATUS.pending)).toBeChecked();
          await expect.poll(() => dashboard.selectedWeekLabel()).toBe(weekOption(2));
          await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['w2-t1', 'w2-t3']));
        });
      });
  });

  test.describe('kayıtlı filtre tercihi varken', () => {
    test.use({
      seededCompleted: ['w1-t1', 'w2-t2', 'w3-t3'],
      rawStorage: { filters: filterStorage.encode(SAMPLE_FILTERS) },
    });

    test('uygulama kayıtlı tercihle açılır ve liste bu tercihe göre süzülür',
      { tag: ['@US-04', '@VM-1', '@P2'], annotation: [README_FILTERS] },
      async ({ dashboard }) => {
        await expect(dashboard.statusRadio(STATUS.pending)).toBeChecked();
        await expect.poll(() => dashboard.selectedWeekLabel()).toBe(LABELS.allWeeks);
        await expect(dashboard.taskTitles).toHaveText(
          titlesOf(course, ['w1-t2', 'w1-t3', 'w2-t1', 'w2-t3', 'w3-t1', 'w3-t2', 'w3-t4']),
        );
        await expect(dashboard.progressText).toHaveText(fmt.progressText(3, 10));
      });
  });
});
