import { test, expect } from '../fixtures';
import { MESSAGES, STATUS, fmt } from '../support/contract';
import { allTitles, completionMap, loadCourse, titleOf, titlesOf } from '../support/data';

const course = loadCourse('course.default.json');

const K5 = { type: 'karar', description: 'K5: tr-TR kurallı, harfe duyarsız arama' };
const A2 = { type: 'kaynak', description: 'A2 (README): arama başlık ve açıklamada yapılır' };

const matchingCases = [
  { query: 'grid', ids: ['w2-t2'], why: 'başlıkta büyük/küçük harf farkı', basis: [K5] },
  { query: 'tema', ids: ['w2-t3', 'w3-t3'], why: 'açıklamada eşleşme', basis: [A2] },
  { query: 'IŞIK', ids: ['w2-t3'], why: 'Türkçe büyük harf I/ı', basis: [K5] },
  { query: 'ilk', ids: ['w1-t1'], why: 'Türkçe büyük harf İ/i', basis: [K5] },
  { query: '  grid  ', ids: ['w2-t2'], why: 'baştaki ve sondaki boşluk', basis: [K5] },
];

const nonMatchingCases = [
  { query: 'Ilk', why: 'I küçük harfte ı olur, İlk ile eşleşmez' },
  { query: 'isik', why: 'ı/ş harfleri i/s ile eşleşmez' },
];

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
      { tag: ['@US-06', '@AC-06.2', '@P2'], annotation: c.basis },
      async ({ dashboard }) => {
        await dashboard.search(c.query);

        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, c.ids));
      });
  }

  for (const c of nonMatchingCases) {
    test(`"${c.query}" araması hiçbir görevle eşleşmez (${c.why})`,
      { tag: ['@US-06', '@AC-06.2', '@P2'], annotation: [K5] },
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
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['w2-t3', 'w3-t3']));
      });

      await test.step('"grid" aranır', async () => {
        await dashboard.search('grid');
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['w2-t2']));
      });
    });

  test('harf harf yazarken sonuçlar her tuşta daralır',
    {
      tag: ['@US-06', '@AC-06.3', '@P2'],
      annotation: [A2],
    },
    async ({ dashboard }) => {
      await test.step('"gr" yazılır', async () => {
        await dashboard.typeInSearch('gr');
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['w1-t1', 'w2-t2']));
      });

      await test.step('"id" eklenir', async () => {
        await dashboard.typeInSearch('id');
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['w2-t2']));
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
      await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['w2-t2']));

      await dashboard.clearSearch();

      await expect(dashboard.taskTitles).toHaveText(allTitles(course));
    });

  test.describe('tamamlanmış görev varken', () => {
    test.use({ seededCompleted: ['w2-t2'] });

    test('arama yapmak görevlerin tamamlanma durumunu değiştirmez',
      { tag: ['@US-06', '@AC-06.6', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.search('grid');
        await expect(dashboard.taskCheckbox(titleOf(course, 'w2-t2'))).toBeChecked();

        await dashboard.clearSearch();
        await expect(dashboard.taskTitles).toHaveText(allTitles(course));

        await expect.poll(() => dashboard.checkedStates()).toEqual(completionMap(course, ['w2-t2']));
        await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 10));
      });

    test('arama sırasında tamamlanan görev arama temizlenince de tamamlanmış kalır',
      { tag: ['@US-06', '@AC-06.6', '@P2'] },
      async ({ dashboard }) => {
        await dashboard.search('tema');
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['w2-t3', 'w3-t3']));
        await dashboard.toggleTask(titleOf(course, 'w2-t3'));
        await expect(dashboard.taskCheckbox(titleOf(course, 'w2-t3'))).toBeChecked();

        await dashboard.clearSearch();

        await expect(dashboard.taskTitles).toHaveText(allTitles(course));
        await expect(dashboard.taskCheckbox(titleOf(course, 'w2-t3'))).toBeChecked();
        await expect(dashboard.taskCheckbox(titleOf(course, 'w3-t3'))).not.toBeChecked();
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

        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['w2-t2']));
      });
  });
});
