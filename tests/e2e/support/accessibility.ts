import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { LIMITS } from './contract';

export async function waitForFiniteAnimations(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const timing = animation.effect?.getComputedTiming();
      return animation.playState !== 'running' || typeof timing?.duration !== 'number' || !Number.isFinite(timing.iterations ?? 1);
    }),
  );
}

export async function accessibilityViolations(page: Page, rules?: string[]): Promise<string[]> {
  await waitForFiniteAnimations(page);
  const builder = new AxeBuilder({ page });
  if (rules) builder.withRules(rules);
  else builder.withTags([...LIMITS.axeTags]);
  const { violations } = await builder.analyze();
  return violations.map(
    (v) => `${v.id} [${v.impact ?? '-'}] ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
}
