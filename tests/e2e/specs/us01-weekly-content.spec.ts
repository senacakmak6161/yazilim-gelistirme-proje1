import { test, expect } from '../fixtures';
import { MESSAGES, fmt } from '../support/contract';
import { loadCourse, tasksOfWeek, weekByNumber } from '../support/data';

// Beklenen değerler, fixture'ın uygulamaya verdiği veriyle aynı dosyadan okunur.
const course = loadCourse('course.default.json');

test.describe('US-01 Haftalık ders içeriklerini görüntüleme', () => {
  test('uygulama açılınca tüm hafta kartları görüntülenir',
    { tag: ['@US-01', '@AC-01.1', '@P1'] },
    async ({ dashboard }) => {
      await expect(dashboard.weekCards).toHaveCount(course.weeks.length);
    });

  // VERİ GÜDÜMLÜ TEST: her hafta için ayrı bir test üretilir.
  // Biri düşerse rapordaki başlıktan hangi hafta olduğu hemen anlaşılır.
  for (const week of course.weeks) {
    test(`Hafta ${week.number} kartında numara, başlık ve açıklama bulunur`,
      { tag: ['@US-01', '@AC-01.2', '@P1'] },
      async ({ dashboard }) => {
        const card = dashboard.weekCard(week.number);
        await expect(card).toBeVisible();
        await expect(card).toContainText(fmt.weekTag(week.number));
        await expect(card).toContainText(week.title);
        await expect(card).toContainText(week.description);
      });
  }

  test('hafta seçilince o haftanın hedefleri ve görevleri doğru gösterilir',
    { tag: ['@US-01', '@AC-01.3', '@AC-01.4', '@P1'] },
    async ({ dashboard }) => {
      const week2 = weekByNumber(course, 2);

      await dashboard.selectWeekCard(2);

      // Seçim görsel ve erişilebilir olarak belirtilmeli
      await expect(dashboard.weekCard(2)).toHaveAttribute('aria-pressed', 'true');
      await expect(dashboard.goalsHeading).toHaveText(fmt.goalsHeading(2));

      // toHaveText(dizi): hem SAYIYI hem SIRAYI hem METNİ tek seferde doğrular
      await expect(dashboard.goalItems).toHaveText(week2.goals);
      await expect(dashboard.taskTitles).toHaveText(tasksOfWeek(course, 'w2').map((t) => t.title));
    });

  test('seçilen haftanın altında başka haftaların içeriği gösterilmez',
    { tag: ['@US-01', '@AC-01.5', '@P1'] },
    async ({ dashboard }) => {
      await dashboard.selectWeekCard(2);
      // Senkronizasyon noktası: önce seçimin uygulandığından emin ol
      await expect(dashboard.goalsHeading).toHaveText(fmt.goalsHeading(2));
      await expect(dashboard.taskTitles).toHaveText(tasksOfWeek(course, 'w2').map((t) => t.title));

      const otherTasks = course.tasks.filter((t) => t.weekId !== 'w2');
      const otherGoals = course.weeks.filter((w) => w.id !== 'w2').flatMap((w) => w.goals);

      // toBeHidden: eleman DOM'da hiç yoksa da, gizliyse de geçer
      for (const t of otherTasks) {
        await expect(dashboard.taskCheckbox(t.title), `"${t.title}" görünmemeli`).toBeHidden();
      }
      for (const g of otherGoals) {
        await expect(dashboard.goalsPanel).not.toContainText(g);
      }
    });

  test('içerik bulunmayan hafta için bilgilendirme gösterilir',
    { tag: ['@US-01', '@AC-01.6', '@P1'] },
    async ({ dashboard }) => {
      await dashboard.selectWeekCard(4); // Test verisinde Hafta 4 bilerek boş
      await expect(dashboard.goalsPanel).toContainText(MESSAGES.weekNoContent);
      await expect(dashboard.goalItems).toHaveCount(0);
    });
});

test.describe('US-01 Çok haftalı derste hafta seçimi', () => {
  const manyWeeks = loadCourse('course.many.json');
  test.use({ courseData: manyWeeks });

  test('Hafta 1 ile Hafta 10 seçimleri birbirine karışmaz',
    { tag: ['@US-01', '@AC-01.5', '@AC-01.3', '@P1'] },
    async ({ dashboard }) => {
      await test.step('Hafta 1 seçilir', async () => {
        await dashboard.selectWeekCard(1);
        await expect(dashboard.goalsHeading).toHaveText(fmt.goalsHeading(1));
        await expect(dashboard.goalItems).toHaveText(weekByNumber(manyWeeks, 1).goals);
        await expect(dashboard.taskTitles).toHaveText(tasksOfWeek(manyWeeks, 'w1').map((t) => t.title));
      });

      await test.step('Hafta 10 seçilir', async () => {
        await dashboard.selectWeekCard(10);
        await expect(dashboard.goalsHeading).toHaveText(fmt.goalsHeading(10));
        await expect(dashboard.goalItems).toHaveText(weekByNumber(manyWeeks, 10).goals);
        await expect(dashboard.taskTitles).toHaveText(tasksOfWeek(manyWeeks, 'w10').map((t) => t.title));
      });
    });
});
