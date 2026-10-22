import { expect, type Locator, type Page } from '@playwright/test';
import { LABELS, STORAGE_KEYS, taskStorage, themeStorage, type StatusLabel } from '../support/contract';
import { collectBoxes, findOverlaps } from '../support/layout';

// PAGE OBJECT: sayfanın "nasıl" kullanıldığını bilir.
// Testler yalnızca "ne" yapıldığını yazar: dashboard.selectWeekCard(2).
// Bir locator değişirse yalnızca bu dosya güncellenir.
export class DashboardPage {
  readonly page: Page;

  // Haftalar ve hedefler
  readonly weekCards: Locator;
  readonly goalsPanel: Locator;
  readonly goalsHeading: Locator;
  readonly goalsList: Locator;
  readonly goalItems: Locator;

  // Filtreler ve arama
  readonly weekSelect: Locator;
  readonly weekOptions: Locator;
  readonly searchBox: Locator;
  readonly statusGroup: Locator;
  readonly statusRadios: Locator;

  // Görev listesi
  readonly taskItems: Locator;
  readonly taskTitles: Locator;
  readonly taskCheckboxes: Locator;
  readonly resultCount: Locator;
  readonly emptyState: Locator; // Sözleşme: YALNIZCA görev listesindeki boş durum

  // İlerleme
  readonly progressText: Locator;
  readonly progressPercent: Locator;
  readonly progressBar: Locator;
  readonly progressFill: Locator;

  // Diğer
  readonly themeToggle: Locator;

  constructor(page: Page) {
    this.page = page;

    this.weekCards = page.getByTestId('week-card');
    this.goalsPanel = page.getByTestId('goals-panel');
    this.goalsHeading = this.goalsPanel.getByRole('heading');
    this.goalsList = this.goalsPanel.getByRole('list');
    this.goalItems = this.goalsPanel.getByRole('listitem');

    // Öncelik getByRole: elemanı ekran okuyucunun gördüğü gibi bulur.
    // Bulamıyorsa bu zaten bir erişilebilirlik hatasıdır.
    this.weekSelect = page.getByRole('combobox', { name: LABELS.weekSelect });
    this.weekOptions = this.weekSelect.getByRole('option');
    this.searchBox = page.getByRole('searchbox', { name: LABELS.search });
    this.statusGroup = page
      .getByRole('radiogroup', { name: LABELS.statusGroup })
      .or(page.getByRole('group', { name: LABELS.statusGroup }));
    this.statusRadios = this.statusGroup.getByRole('radio');

    this.taskItems = page.getByTestId('task-item');
    this.taskTitles = this.taskItems.getByTestId('task-title');
    this.taskCheckboxes = this.taskItems.getByRole('checkbox');
    this.resultCount = page.getByTestId('result-count');
    this.emptyState = page.getByTestId('empty-state');

    this.progressText = page.getByTestId('progress-text');
    this.progressPercent = page.getByTestId('progress-percent');
    this.progressBar = page.getByRole('progressbar', { name: LABELS.progressBar });
    this.progressFill = page.getByTestId('progress-fill');

    this.themeToggle = page.getByRole('button', { name: LABELS.themeToggle });
  }

  /** Sayfayı açar; hafta kartları görünene kadar bekler. */
  async goto() {
    await this.page.goto('/');
    await expect(this.weekCards.first()).toBeVisible();
  }

  async reload() {
    await this.page.reload();
    await expect(this.weekCards.first()).toBeVisible();
  }

  // ---------- Haftalar ----------

  /**
   * Numaraya göre hafta kartı. Erişilebilir ad "Hafta N: Başlık" ile başlar.
   * Düz metin filtresi kullanmıyoruz; çünkü "Hafta 1" metni "Hafta 10"un içinde de geçer.
   */
  weekCard(weekNo: number): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^Hafta ${weekNo}:`) });
  }

  async selectWeekCard(weekNo: number) {
    await this.weekCard(weekNo).click();
  }

  goal(text: string): Locator {
    return this.goalsPanel.getByText(text, { exact: true });
  }

  async clippedGoalTexts(): Promise<string[]> {
    return this.goalItems.evaluateAll((items) =>
      items
        .filter((el) => el.scrollWidth - el.clientWidth > 1 || el.scrollHeight - el.clientHeight > 1)
        .map((el) => el.textContent?.trim() ?? ''),
    );
  }

  // ---------- Görevler ----------

  /** exact: true → benzer başlıklı başka bir görevle karışmaz. */
  taskCheckbox(title: string): Locator {
    return this.page.getByRole('checkbox', { name: title, exact: true });
  }

  /** Başlığa göre görev satırı (rozet ve durum kontrolleri için). */
  task(title: string): Locator {
    return this.taskItems.filter({ has: this.taskCheckbox(title) });
  }

  completedBadge(title: string): Locator {
    return this.task(title).getByText(LABELS.completedBadge, { exact: true });
  }

  /** Durumu tersine çevirir (tıklama). */
  async toggleTask(title: string) {
    await this.taskCheckbox(title).click();
  }

  /** check/uncheck: işlem sonunda durumun gerçekten değiştiğini de doğrular. */
  async completeTask(title: string) {
    await this.taskCheckbox(title).check();
  }

  async uncompleteTask(title: string) {
    await this.taskCheckbox(title).uncheck();
  }

  async tapTask(title: string) {
    await this.taskCheckbox(title).tap();
  }

  /**
   * Görünen görevlerin { id: işaretli mi } haritası.
   * "Bir görev değişince diğerleri değişmemeli" (AC-03.5) gibi kontrollerde
   * önce/sonra karşılaştırması için kullanılır.
   */
  async checkedStates(): Promise<Record<string, boolean>> {
    return this.taskItems.evaluateAll((items) =>
      Object.fromEntries(
        items.map((li) => [
          li.getAttribute('data-task-id') ?? '?',
          (li.querySelector('input[type="checkbox"]') as HTMLInputElement | null)?.checked ??
            li.querySelector('[role="checkbox"]')?.getAttribute('aria-checked') === 'true',
        ]),
      ),
    );
  }

  // ---------- Filtreler ve arama ----------

  statusRadio(label: StatusLabel): Locator {
    return this.statusGroup.getByRole('radio', { name: label, exact: true });
  }

  async setStatusFilter(label: StatusLabel) {
    await this.statusRadio(label).check();
  }

  async selectWeekFilter(optionLabel: string) {
    await this.weekSelect.selectOption({ label: optionLabel });
  }

  async selectedWeekLabel(): Promise<string> {
    return this.weekSelect.evaluate((el) => (el as HTMLSelectElement).selectedOptions[0]?.textContent?.trim() ?? '');
  }

  async search(text: string) {
    await this.searchBox.fill(text);
  }

  async clearSearch() {
    await this.searchBox.fill('');
  }

  async typeInSearch(text: string) {
    await this.searchBox.pressSequentially(text);
  }

  // ---------- İlerleme ----------

  async progressFillRatio(): Promise<number> {
    const bar = await this.progressBar.boundingBox();
    const fill = await this.progressFill.boundingBox();
    if (!bar || !fill || bar.width === 0) return Number.NaN;
    return fill.width / bar.width;
  }

  // ---------- Tema ----------

  async toggleTheme() {
    await this.themeToggle.click();
  }

  async pageColors(): Promise<{ background: string; text: string }> {
    return this.taskTitles.first().evaluate((sample) => {
      const transparent = (value: string) => value === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(value);
      let background = '';
      for (let node: Element | null = sample; node && !background; node = node.parentElement) {
        const color = getComputedStyle(node).backgroundColor;
        if (!transparent(color)) background = color;
      }
      return { background: background || 'rgb(255, 255, 255)', text: getComputedStyle(sample).color };
    });
  }

  // ---------- Yerleşim ----------

  async resize(width: number, height: number) {
    await this.page.setViewportSize({ width, height });
  }

  async layoutViewportWidth(): Promise<number> {
    return this.page.evaluate(() => document.documentElement.clientWidth);
  }

  viewportWidth(): number {
    return this.page.viewportSize()?.width ?? 0;
  }

  async hasHorizontalOverflow(): Promise<boolean> {
    return this.page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
  }

  async overlappingElements(): Promise<string[]> {
    const boxes = await collectBoxes({
      'hafta kartı': this.weekCards,
      görev: this.taskItems,
      arama: this.searchBox,
      'hafta filtresi': this.weekSelect,
      'durum filtresi': this.statusRadios,
      'tema düğmesi': this.themeToggle,
      'ilerleme çubuğu': this.progressBar,
    });
    return findOverlaps(boxes);
  }

  async smallestFontSizePx(): Promise<number> {
    const sizes: number[] = [];
    for (const root of [this.weekCards, this.goalsPanel, this.taskItems, this.progressText]) {
      sizes.push(
        ...(await root.evaluateAll((elements) => {
          const found: number[] = [];
          for (const element of elements) {
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
              const parent = node.parentElement;
              if (!parent || !node.textContent?.trim()) continue;
              const style = getComputedStyle(parent);
              const rect = parent.getBoundingClientRect();
              if (style.display === 'none' || style.visibility === 'hidden' || rect.width <= 1 || rect.height <= 1) continue;
              found.push(parseFloat(style.fontSize));
            }
          }
          return found;
        })),
      );
    }
    return sizes.length === 0 ? Number.NaN : Math.min(...sizes);
  }

  // ---------- Klavye ----------

  async press(key: string) {
    await this.page.keyboard.press(key);
  }

  async typeText(text: string) {
    await this.page.keyboard.type(text);
  }

  async tabTo(target: Locator, maxPresses = 60) {
    await target.waitFor();
    const engine = this.page.context().browser()?.browserType().name();
    const tabKey = engine === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
    for (let i = 0; i < maxPresses; i += 1) {
      await this.page.keyboard.press(tabKey);
      if (await target.evaluate((el) => el === document.activeElement)) return;
    }
  }

  async focusStyle(target: Locator): Promise<string> {
    return target.evaluate((el) => {
      const style = getComputedStyle(el);
      return [
        style.outlineStyle,
        style.outlineWidth,
        style.outlineColor,
        style.boxShadow,
        style.borderColor,
        style.backgroundColor,
      ].join(' | ');
    });
  }

  // ---------- Performans ----------

  async measureUpdateMs(action: () => Promise<void>, settled: () => Promise<void>): Promise<number> {
    await this.page.evaluate(() => {
      const w = window as unknown as { __e2ePerf?: { start: number; last: number } };
      const perf = { start: 0, last: 0 };
      w.__e2ePerf = perf;
      new MutationObserver(() => {
        perf.last = performance.now();
      }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true });
      perf.start = performance.now();
    });
    await action();
    await settled();
    return this.page.evaluate(() => {
      const perf = (window as unknown as { __e2ePerf: { start: number; last: number } }).__e2ePerf;
      return perf.last === 0 ? Number.POSITIVE_INFINITY : perf.last - perf.start;
    });
  }

  // ---------- localStorage ----------

  /** Uygulamanın kaydettiği ham görev durumu (US-10 kontrolleri için). */
  async readStoredTaskState(): Promise<string | null> {
    return this.page.evaluate((key) => localStorage.getItem(key), STORAGE_KEYS.tasks);
  }

  async storedCompletedIds(): Promise<string[]> {
    return taskStorage.decode(await this.readStoredTaskState());
  }

  async readStoredTheme(): Promise<string | null> {
    return themeStorage.decode(await this.page.evaluate((key) => localStorage.getItem(key), STORAGE_KEYS.theme));
  }

  async readStoredFilters(): Promise<string | null> {
    return this.page.evaluate((key) => localStorage.getItem(key), STORAGE_KEYS.filters);
  }
}
