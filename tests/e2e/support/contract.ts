// TEST SÖZLEŞMESİ: geliştiriciyle üzerinde anlaşılan adlar ve metinler.
// Arkadaşın bir metni veya adı değiştirirse YALNIZCA bu dosya güncellenir;
// testlerin geri kalanı aynı kalır ("tek değişiklik noktası" ilkesi).

// localStorage anahtarları (docs/TEST_CONTRACT.md)
export const STORAGE_KEYS = {
  tasks: 'ddp.taskStatus',
  theme: 'ddp.theme',
  filters: 'ddp.filters',
} as const;

// Uygulamanın içerik verisini yüklediği adres (src/data/courses.json).
// page.route bu desenle eşleşen isteği yakalayıp test verisini döndürür.
export const COURSE_DATA_URL = /\/data\/courses\.json(?:\?.*)?$/;

// Kullanıcıya gösterilen mesajlar (docs/TEST_CONTRACT.md) — birebir eşleşmeli.
export const MESSAGES = {
  weekNoContent: 'Bu hafta için henüz içerik eklenmemiş.', // M1 (hedef paneli)
  noMatch: 'Seçilen ölçütlere uygun görev bulunamadı.',    // M2
  weekNoTasks: 'Bu haftaya ait görev bulunmuyor.',         // M3
  noTasks: 'Henüz görev bulunmuyor.',                      // M4
  selectWeekHint: 'Hedefleri görmek için bir hafta seçin.',
} as const;

// Erişilebilir adlar: getByRole(..., { name }) bunlarla eşleşir.
export const LABELS = {
  themeToggle: 'Karanlık tema',
  progressBar: 'Genel ilerleme',
  search: 'Görev ara',
  weekSelect: 'Hafta',
  allWeeks: 'Tüm haftalar',
  statusGroup: 'Görev durumu',
  completedBadge: 'Tamamlandı',
} as const;

export const STATUS = { all: 'Tümü', pending: 'Devam edenler', completed: /^Tamamlanan(lar)?$/ } as const;
export type StatusLabel = (typeof STATUS)[keyof typeof STATUS];

// Biçim kuralları. Testler beklenen metni buradan üretir;
// böylece "6 / 10" mu "6/10" mu tartışması tek yerde çözülür.
// Not: hafta seçeneğindeki ayraç uzun tire (–), kısa tire (-) değil.
export const fmt = {
  progressText: (done: number, total: number) => `${done} / ${total} görev tamamlandı`,
  progressPercent: (percent: number) => `%${percent}`,
  resultCount: (n: number) => `${n} görev gösteriliyor`,
  goalsHeading: (weekNo: number) => `Hafta ${weekNo} Öğrenme Hedefleri`,
  weekOption: (weekNo: number, title: string) => `Hafta ${weekNo} – ${title}`,
  weekTag: (weekNo: number) => `Hafta ${weekNo}`,
};

export const THEMES = { light: 'light', dark: 'dark' } as const;
export type Theme = (typeof THEMES)[keyof typeof THEMES];

export const taskStorage = {
  encode: (completedIds: readonly string[]) =>
    JSON.stringify(Object.fromEntries(completedIds.map((id) => [id, true]))),
  decode: (raw: string | null): string[] => {
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error(`Beklenmeyen görev kaydı biçimi: ${raw}`);
    }
    return Object.entries(parsed)
      .filter(([, done]) => done === true)
      .map(([id]) => id);
  },
};

export const themeStorage = {
  encode: (theme: Theme) => JSON.stringify(theme),
  decode: (raw: string | null): string | null => {
    if (raw === null) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return typeof parsed === 'string' ? parsed : raw;
    } catch {
      return raw;
    }
  },
};

export const SAMPLE_FILTERS = { status: 'active', week: 'all' } as const;

export const filterStorage = {
  encode: (filters: Record<string, string | number>) => JSON.stringify(filters),
};

export const LIMITS = {
  responseBudgetMs: 300,
  minReadableFontPx: 12,
  minTextContrast: 4.5,
  phoneMaxWidthPx: 480,
  axeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
} as const;
