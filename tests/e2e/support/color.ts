export function parseRgb(value: string): [number, number, number] {
  const match = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (!match) throw new Error(`Renk çözümlenemedi: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function relativeLuminance(value: string): number {
  const [r, g, b] = parseRgb(value).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string): number {
  const [light, dark] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}
