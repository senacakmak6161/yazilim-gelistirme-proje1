import type { Locator } from '@playwright/test';

export type Box = { id: string; label: string; x: number; y: number; width: number; height: number };

export async function collectBoxes(groups: Record<string, Locator>): Promise<Box[]> {
  const boxes: Box[] = [];
  for (const [group, locator] of Object.entries(groups)) {
    const found = await locator.evaluateAll((elements, groupName) => {
      const registry = window as unknown as { __e2eIds?: WeakMap<Element, string>; __e2eNextId?: number };
      registry.__e2eIds ??= new WeakMap();
      registry.__e2eNextId ??= 0;
      return elements
        .filter((el) => {
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
        })
        .map((el) => {
          let id = registry.__e2eIds!.get(el);
          if (!id) {
            registry.__e2eNextId = (registry.__e2eNextId ?? 0) + 1;
            id = String(registry.__e2eNextId);
            registry.__e2eIds!.set(el, id);
          }
          const rect = el.getBoundingClientRect();
          return {
            id,
            label: `${groupName}: ${(el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 40)}`,
            x: rect.x + window.scrollX,
            y: rect.y + window.scrollY,
            width: rect.width,
            height: rect.height,
          };
        });
    }, group);
    boxes.push(...found);
  }
  return [...new Map(boxes.map((box) => [box.id, box])).values()];
}

const contains = (outer: Box, inner: Box, tolerance: number) =>
  inner.x >= outer.x - tolerance &&
  inner.y >= outer.y - tolerance &&
  inner.x + inner.width <= outer.x + outer.width + tolerance &&
  inner.y + inner.height <= outer.y + outer.height + tolerance;

export function findOverlaps(boxes: Box[], tolerance = 1): string[] {
  const overlaps: string[] = [];
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i];
      const b = boxes[j];
      const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (overlapX <= tolerance || overlapY <= tolerance) continue;
      if (contains(a, b, tolerance) || contains(b, a, tolerance)) continue;
      overlaps.push(`${a.label} ↔ ${b.label}`);
    }
  }
  return overlaps;
}
