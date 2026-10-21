import { test, expect } from '../fixtures';
import { LIMITS, STATUS, fmt } from '../support/contract';
import { relativeLuminance } from '../support/color';
import { loadCourse, titleOf, titlesOf } from '../support/data';

const course = loadCourse('course.default.json');
const noneCompleted = Object.fromEntries(course.tasks.map((t) => [t.id, false]));

test.describe('Kabul test senaryoları (PDF Tablo 3)', () => {
  test('T1 Görev tamamlama: görev tamamlandı gösterilir ve ilerleme güncellenir',
    { tag: ['@T1', '@US-03', '@P1'] },
    async ({ dashboard }) => {
      const title = titleOf(course, 't1');

      await test.step('Ön koşul: listede tamamlanmamış bir görev bulunur', async () => {
        await expect(dashboard.taskCheckbox(title)).not.toBeChecked();
      });

      await test.step('İşlem: kullanıcı görevin kutusunu işaretler', async () => {
        await dashboard.toggleTask(title);
      });

      await test.step('Beklenen: görev tamamlandı gösterilir, ilerleme güncellenir', async () => {
        await expect(dashboard.taskCheckbox(title)).toBeChecked();
        await expect(dashboard.completedBadge(title)).toBeVisible();
        await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 10));
        await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(10));
      });
    });

  test.describe('tamamlanmış bir görevle', () => {
    test.use({ seededCompleted: ['t1'] });

    test('T2 Görev durumunu geri alma: görev tamamlanmamış duruma döner ve ilerleme güncellenir',
      { tag: ['@T2', '@US-03', '@P1'] },
      async ({ dashboard }) => {
        const title = titleOf(course, 't1');

        await test.step('Ön koşul: tamamlanmış bir görev bulunur', async () => {
          await expect(dashboard.taskCheckbox(title)).toBeChecked();
          await expect(dashboard.progressText).toHaveText(fmt.progressText(1, 10));
        });

        await test.step('İşlem: kullanıcı işaretlemeyi kaldırır', async () => {
          await dashboard.toggleTask(title);
        });

        await test.step('Beklenen: görev tamamlanmamış duruma döner, ilerleme doğru güncellenir', async () => {
          await expect(dashboard.taskCheckbox(title)).not.toBeChecked();
          await expect(dashboard.completedBadge(title)).toBeHidden();
          await expect(dashboard.progressText).toHaveText(fmt.progressText(0, 10));
          await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(0));
        });
      });
  });

  test.describe('tamamlanmış ve tamamlanmamış görevlerle', () => {
    test.use({ seededCompleted: ['t1', 't5', 't9'] });

    test('T3 Görev filtreleme: devam eden filtresinde yalnızca tamamlanmamış görevler gösterilir',
      { tag: ['@T3', '@US-04', '@P2'] },
      async ({ dashboard }) => {
        await test.step('Ön koşul: tamamlanmış ve tamamlanmamış görevler bulunur', async () => {
          await expect(dashboard.taskItems).toHaveCount(10);
        });

        await test.step('İşlem: kullanıcı devam eden görevler filtresini seçer', async () => {
          await dashboard.setStatusFilter(STATUS.pending);
        });

        await test.step('Beklenen: yalnızca tamamlanmamış görevler gösterilir, yanlış sınıflandırma yoktur', async () => {
          await expect(dashboard.taskTitles).toHaveText(
            titlesOf(course, ['t2', 't3', 't4', 't6', 't7', 't8', 't10']),
          );
          await expect.poll(async () => Object.values(await dashboard.checkedStates())).not.toContain(true);
        });
      });
  });

  test('T4 Görev arama: eşleşen görevler görüntülenir, eşleşmeyenler sonuçlarda yer almaz',
    { tag: ['@T4', '@US-06', '@P2'] },
    async ({ dashboard }) => {
      await test.step('Ön koşul: farklı başlıklara sahip görevler bulunur', async () => {
        await expect(dashboard.taskItems).toHaveCount(10);
      });

      await test.step('İşlem: kullanıcı bir anahtar kelime girer', async () => {
        await dashboard.search('tema');
      });

      await test.step('Beklenen: eşleşen görevler görüntülenir, eşleşmeyenler yer almaz', async () => {
        await expect(dashboard.taskTitles).toHaveText(titlesOf(course, ['t6', 't9']));
        for (const id of ['t1', 't2', 't3', 't4', 't5', 't7', 't8', 't10']) {
          await expect(dashboard.taskCheckbox(titleOf(course, id))).toBeHidden();
        }
      });
    });

  test.describe('10 görevden 4\'ü tamamlanmışken', () => {
    test.use({ seededCompleted: ['t1', 't2', 't3', 't4'] });

    test('T5 İlerleme hesaplama: bir görev daha tamamlanınca 5 ve %50 gösterilir',
      { tag: ['@T5', '@US-07', '@P1'] },
      async ({ dashboard }) => {
        await test.step('Ön koşul: 10 görevden 4\'ü tamamlanmıştır', async () => {
          await expect(dashboard.progressText).toHaveText(fmt.progressText(4, 10));
        });

        await test.step('İşlem: kullanıcı bir görev daha tamamlar', async () => {
          await dashboard.toggleTask(titleOf(course, 't5'));
        });

        await test.step('Beklenen: tamamlanan 5 olur, ilerleme %50; sayı ve çubuk aynı ilerlemeyi gösterir', async () => {
          await expect(dashboard.progressText).toHaveText(fmt.progressText(5, 10));
          await expect(dashboard.progressPercent).toHaveText(fmt.progressPercent(50));
          await expect(dashboard.progressBar).toHaveAttribute('aria-valuenow', '50');
          await expect.poll(() => dashboard.progressFillRatio()).toBeCloseTo(0.5, 1);
        });
      });
  });

  test('T6 Sayfa yenileme: kaydedilen görev durumları korunur, liste ve ilerleme tutarlıdır',
    { tag: ['@T6', '@US-10', '@P2'] },
    async ({ dashboard }) => {
      await test.step('Ön koşul: bir veya daha fazla görev tamamlanmıştır', async () => {
        await dashboard.toggleTask(titleOf(course, 't2'));
        await dashboard.toggleTask(titleOf(course, 't7'));
        await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
        await expect.poll(async () => (await dashboard.storedCompletedIds()).length).toBe(2);
      });

      await test.step('İşlem: kullanıcı sayfayı yeniler', async () => {
        await dashboard.reload();
      });

      await test.step('Beklenen: görev durumları korunur, liste ve ilerleme kayıtlı durumla tutarlıdır', async () => {
        await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
        await expect.poll(() => dashboard.checkedStates()).toEqual({ ...noneCompleted, t2: true, t7: true });
      });
    });

  test.describe('dar ekranlı mobil cihazda', () => {
    test.skip(
      ({ isMobile, viewport }) => !isMobile || (viewport?.width ?? Number.POSITIVE_INFINITY) > LIMITS.phoneMaxWidthPx,
      'Senaryonun ön koşulu dar ekranlı mobil cihazdır; telefon profillerinde çalışır',
    );

    test('T7 Mobil görünüm: dar ekranda liste, arama ve görev tamamlama çalışır, içerik üst üste binmez',
      { tag: ['@T7', '@US-08', '@P3'] },
      async ({ dashboard }) => {
        const title = titleOf(course, 't5');

        await test.step('İşlem: kullanıcı listeyi açar', async () => {
          await expect(dashboard.taskItems).toHaveCount(10);
        });

        await test.step('İşlem: kullanıcı arama yapar', async () => {
          await dashboard.search('grid');
          await expect(dashboard.taskTitles).toHaveText([title]);
        });

        await test.step('İşlem: kullanıcı görev tamamlar', async () => {
          await dashboard.tapTask(title);
          await expect(dashboard.taskCheckbox(title)).toBeChecked();
        });

        await test.step('Beklenen: içerikler üst üste binmez, yatay kaydırma gerekmez', async () => {
          await dashboard.clearSearch();
          await expect(dashboard.taskItems).toHaveCount(10);
          await expect.poll(() => dashboard.overlappingElements()).toEqual([]);
          await expect.poll(() => dashboard.hasHorizontalOverflow()).toBe(false);
        });
      });
  });

  test.describe('tamamlanmış görevler varken', () => {
    test.use({ seededCompleted: ['t1', 't5'] });

    test('T8 Tema değiştirme: arayüz seçilen temaya geçer, görev durumları değişmez',
      { tag: ['@T8', '@US-09', '@P3'] },
      async ({ dashboard }) => {
        const before = await test.step('Ön koşul: uygulama varsayılan temada açıktır', async () => {
          await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'false');
          await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
          return { colors: await dashboard.pageColors(), states: await dashboard.checkedStates() };
        });

        await test.step('İşlem: kullanıcı diğer temayı seçer', async () => {
          await dashboard.toggleTheme();
        });

        await test.step('Beklenen: değişiklik görünür, görev durumları değişmez', async () => {
          await expect(dashboard.themeToggle).toHaveAttribute('aria-pressed', 'true');
          await expect
            .poll(async () => relativeLuminance((await dashboard.pageColors()).background))
            .toBeLessThan(relativeLuminance(before.colors.background));
          await expect.poll(() => dashboard.checkedStates()).toEqual(before.states);
          await expect(dashboard.progressText).toHaveText(fmt.progressText(2, 10));
        });
      });
  });
});
