import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { LIMITS } from './contract';

export async function accessibilityViolations(page: Page, rules?: string[]): Promise<string[]> {
  const builder = new AxeBuilder({ page });
  if (rules) builder.withRules(rules);
  else builder.withTags([...LIMITS.axeTags]);
  const { violations } = await builder.analyze();
  return violations.map(
    (v) => `${v.id} [${v.impact ?? '-'}] ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
}
