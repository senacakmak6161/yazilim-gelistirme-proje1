import { test, expect } from '../fixtures';
import { MESSAGES, STATUS, fmt } from '../support/contract';
import { loadCourse, titleOf, titlesOf } from '../support/data';

const course = loadCourse('course.default.json');
const allTitles = course.tasks.map((t) => t.title);

const matchingCases = [
  { query: 'grid', ids: ['t5'], why: 'başlıkta büyük/küçük harf farkı' },
  { query: 'tema', ids: ['t6', 't9'], why: 'açıklamada eşleşme' },
  { query: 'IŞIK', ids: ['t6'], why: 'Türkçe büyük harf I/ı (K5)' },
  { query: 'ilk', ids: ['t1'], why: 'Türkçe büyük harf İ/i (K5)' },
  { query: '  grid  ', ids: ['t5'], why: 'baştaki ve sondaki boşluk (K5)' },
] as const;

const nonMatchingCases = [
  { query: 'Ilk', why: 'I küçük harfte ı olur, İlk ile eşleşmez (K5)' },
  { query: 'isik', why: 'ı/ş harfleri i/s ile eşleşmez (K5)' },
] as const;

test.describe('US-06 Görevlerde arama yapma', () => {
  test('görevleri aramak için bir metin alanı vardır',
    { tag: ['@US-06', '@AC-06.1', '@P2'] },
    async ({ dashboard }) => {
      await expect(dashboard.searchBox).toBeEditable();

      await dashboard.search('html');

      await expect(dashboard.searchBox).toHaveValue('html');
    });

  for (const c of matchingCases) {
    test(`"${c.query}" araması eşleşen görevleri gösterir (${c.why})`,
      {
        tag: ['@US-06', '@AC-06.2', '@P2'],
        annotation: { type: 'karar', description: 'K5: tr-TR kurallı, harfe duyarsız arama' },
      },
      async ({ dashboard }) => {
        await dashboard.search(c.query);

        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, c.ids));
      });
  }

  for (const c of nonMatchingCases) {
    test(`"${c.query}" araması hiçbir görevle eşleşmez (${c.why})`,
      {
        tag: ['@US-06', '@AC-06.2', '@P2'],
        annotation: { type: 'karar', description: 'K5: tr-TR kurallı, harfe duyarsız arama' },
      },
      async ({ dashboard }) => {
        await dashboard.search(c.query);

        await expect(dashboard.emptyState).toHaveText(MESSAGES.noMatch);
        await expect(dashboard.taskItems).toHaveCount(0);
      });
  }

  test('arama metni değiştikçe sonuçlar güncellenir',
    { tag: ['@US-06', '@AC-06.3', '@P2'] },
    async ({ dashboard }) => {
      await test.step('"tema" aranır', async () => {
        await dashboard.search('tema');
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['t6', 't9']));
      });

      await test.step('"grid" aranır', async () => {
        await dashboard.search('grid');
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['t5']));
      });
    });

  test('eşleşen görev yoksa anlaşılır bir mesaj gösterilir',
    { tag: ['@US-06', '@AC-06.4', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.search('xyz123');

      await expect(dashboard.emptyState).toHaveText(MESSAGES.noMatch);
      await expect(dashboard.taskItems).toHaveCount(0);
    });

  test('arama alanı temizlenince gizlenen görevler yeniden gösterilir',
    { tag: ['@US-06', '@AC-06.5', '@P2'] },
    async ({ dashboard }) => {
      await dashboard.search('grid');
      await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['t5']));

      await dashboard.clearSearch();

      await expect(dashboard.taskTitles).toHaveText(allTitles);
    });

  test.describe('tamamlanmış görev varken', () => {
    test.use({ seededCompleted: ['t5'] });

    test('arama yapmak görevlerin tamamlanma durumunu değiştirmez',
      { tag: ['@US-06', '@AC-06.6', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.search('grid');
        await expect(dashboard.taskCheckbox(titleOf(course, 't5'))).toBeChecked();

        await dashboard.clearSearch();
        await expect(dashboard.taskTitles).toHaveText(allTitles);

        await expect.poll(() => dashboard.checkedStates()).toEqual({
          t1: false, t2: false, t3: false, t4: false, t5: true,
          t6: false, t7: false, t8: false, t9: false, t10: false,
        });
        await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 10));
      });

    test('arama sırasında tamamlanan görev arama temizlenince de tamamlanmış kalır',
      { tag: ['@US-06', '@AC-06.6', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.search('tema');
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['t6', 't9']));
        await dashboard.toggleTask(titleOf(course, 't6'));
        await expect(dashboard.taskCheckbox(titleOf(course, 't6'))).toBeChecked();

        await dashboard.clearSearch();

        await expect(dashboard.taskTitles).toHaveText(allTitles);
        await expect(dashboard.taskCheckbox(titleOf(course, 't6'))).toBeChecked();
        await expect(dashboard.taskCheckbox(titleOf(course, 't9'))).not.toBeChecked();
        await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
      });

    test('arama ve durum filtresi birlikte uygulanır',
      {
        tag: ['@US-06', '@AC-06.2', '@AC-04.2', '@P2'],
        annotation: { type: 'karar', description: 'K3: ölçütler VE ile birleşir' },
      },
      async ({ dashboard }) => {
        await dashboard.setStatusFilter(STATUS.completed);
        await dashboard.search('grid');

        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['t5']));
      });
  });
});
