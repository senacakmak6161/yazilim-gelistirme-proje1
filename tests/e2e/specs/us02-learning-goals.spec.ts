import { test, expect } from '../fixtures';
import { MESSAGES, fmt } from '../support/contract';
import { loadCourse, weekByNumber } from '../support/data';

const course = loadCourse('course.default.json');
const weeksWithGoals = course.weeks.filter((w) => w.objectives.length > 0);

test.describe('US-02 Öğrenme hedeflerini inceleme', () => {
  test('hafta seçilmeden önce hedef panelinde seçim ipucu gösterilir',
    {
      tag: ['@US-02', '@AC-02.2', '@P1'],
      annotation: { type: 'karar', description: 'D1: başlangıçta hiçbir hafta seçili değil' },
    },
    async ({ dashboard }) => {
      await expect(dashboard.goalsPanel).toContainText(MESSAGES.selectWeekHint);
      await expect(dashboard.goalItems).toHaveCount(0);
    });

  for (const week of weeksWithGoals) {
    test(`Hafta ${week.weekNumber} açılınca o haftanın hedefleri gösterilir`,
      { tag: ['@US-02', '@AC-02.2', '@P1'] },
      async ({ dashboard }) => {
        await dashboard.selectWeekCard(week.weekNumber);

        await expect(dashboard.goalsHeading).toHaveText(fmt.goalsHeading(week.weekNumber));
        await expect(dashboard.goalItems).toHaveText(week.objectives);
      });
  }

  test('hedefler başlıklı ve maddeli bir liste olarak sunulur',
    { tag: ['@US-02', '@AC-02.1', '@P1'] },
    async ({ dashboard }) => {
      const week3 = weekByNumber(course, 3);

      await dashboard.selectWeekCard(3);

      await expect(dashboard.goalsHeading).toHaveText(fmt.goalsHeading(3));
      await expect(dashboard.goalsList).toHaveCount(1);
      await expect(dashboard.goalItems).toHaveCount(week3.objectives.length);
    });

  test('hafta değiştirilince önceki haftanın hedefleri panelde kalmaz',
    { tag: ['@US-02', '@AC-02.3', '@P1'] },
    async ({ dashboard }) => {
      const week1 = weekByNumber(course, 1);
      const week3 = weekByNumber(course, 3);

      await test.step('Hafta 1 seçilir', async () => {
        await dashboard.selectWeekCard(1);
        await expect(dashboard.goalItems).toHaveText(week1.objectives);
      });

      await test.step('Hafta 3 seçilir', async () => {
        await dashboard.selectWeekCard(3);
        await expect(dashboard.goalsHeading).toHaveText(fmt.goalsHeading(3));
        await expect(dashboard.goalItems).toHaveText(week3.objectives);
        for (const goal of week1.objectives) {
          await expect(dashboard.goalsPanel).not.toContainText(goal);
        }
      });
    });

  test('hedefi olan haftadan boş haftaya geçilince panel temizlenir',
    { tag: ['@US-02', '@AC-02.3', '@P1'] },
    async ({ dashboard }) => {
      const week2 = weekByNumber(course, 2);

      await test.step('Hafta 2 seçilir', async () => {
        await dashboard.selectWeekCard(2);
        await expect(dashboard.goalItems).toHaveText(week2.objectives);
      });

      await test.step('Hafta 4 seçilir', async () => {
        await dashboard.selectWeekCard(4);
        await expect(dashboard.goalsPanel).toContainText(MESSAGES.weekNoContent);
        await expect(dashboard.goalItems).toHaveCount(0);
        for (const goal of week2.objectives) {
          await expect(dashboard.goalsPanel).not.toContainText(goal);
        }
      });
    });

  test('hedef metinleri tam, görünür ve kesilmeden gösterilir',
    {
      tag: ['@US-02', '@AC-02.4', '@P1'],
      annotation: { type: 'karar', description: 'D6: görünür + kesilmemiş; kontrast erişilebilirlik fazında' },
    },
    async ({ dashboard }) => {
      const week3 = weekByNumber(course, 3);

      await dashboard.selectWeekCard(3);

      await expect(dashboard.goalItems).toHaveText(week3.objectives);
      for (const goal of week3.objectives) {
        await expect(dashboard.goal(goal)).toBeVisible();
      }
      await expect.poll(() => dashboard.clippedGoalTexts()).toEqual([]);
    });
});

test.describe('US-02 Hedef-hafta eşlemesi veri sırasından bağımsızdır', () => {
  test.use({ courseData: { ...course, weeks: [...course.weeks].reverse() } });

  test('haftalar veride ters sırada gelse de hedefler doğru haftayla eşleşir',
    { tag: ['@US-02', '@AC-02.3', '@P1'] },
    async ({ dashboard }) => {
      const week1 = weekByNumber(course, 1);

      await dashboard.selectWeekCard(1);

      await expect(dashboard.goalsHeading).toHaveText(fmt.goalsHeading(1));
      await expect(dashboard.goalItems).toHaveText(week1.objectives);
    });
});
