import { readFileSync } from 'node:fs';
import path from 'node:path';

export interface Task { id: string; title: string; description: string; dueDate: string | null; tags: string[] }
export interface Week { id: number; weekNumber: number; title: string; description: string; objectives: string[]; tasks: Task[] }
export interface Course { course: { title: string; term: string }; weeks: Week[] }

// Test verisi uygulamanın gerçek içeriğinden BAĞIMSIZDIR:
// arkadaşın gerçek ders içeriğini değiştirse bile testler kırılmaz.
export function loadCourse(file: string): Course {
  // __dirname = bu dosyanın klasörü (tests/e2e/support); veri bir üstteki data/ içinde.
  const fullPath = path.join(__dirname, '..', 'data', file);
  return JSON.parse(readFileSync(fullPath, 'utf-8')) as Course;
}

export function courseModuleSource(course: Course): string {
  const namedExports = Object.entries(course)
    .filter(([key]) => /^[A-Za-z_$][\w$]*$/.test(key))
    .map(([key, value]) => `export const ${key} = ${JSON.stringify(value)};`);
  return [...namedExports, `export default ${JSON.stringify(course)};`].join('\n');
}

// Basit eşleme sorguları. "Hafta 2'nin görevleri hangileri" gibi sorular
// veriden türetilebilir; çünkü bu, test ettiğimiz mantık değil, verinin kendisidir.
// UYARI: Arama/filtre/yüzde gibi TEST EDİLEN mantığın sonucunu burada hesaplama;
// onları testte elle yaz. Aksi hâlde uygulamayla aynı hatayı yapan bir test yazarsın.
export const allTasks = (course: Course): Task[] => course.weeks.flatMap((w) => w.tasks);

export const allTitles = (course: Course): string[] => allTasks(course).map((t) => t.title);

export function weekByNumber(course: Course, weekNo: number): Week {
  const week = course.weeks.find((w) => w.weekNumber === weekNo);
  if (!week) throw new Error(`Test verisinde Hafta ${weekNo} yok`);
  return week;
}

export const tasksOfWeek = (course: Course, weekNo: number): Task[] => weekByNumber(course, weekNo).tasks;

export function titlesOf(course: Course, ids: readonly string[]): string[] {
  const tasks = allTasks(course);
  return ids.map((id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Test verisinde ${id} görevi yok`);
    return task.title;
  });
}

export const titleOf = (course: Course, id: string) => titlesOf(course, [id])[0];

export function completionMap(course: Course, completedIds: readonly string[]): Record<string, boolean> {
  const tasks = allTasks(course);
  for (const id of completedIds) {
    if (!tasks.some((t) => t.id === id)) throw new Error(`Test verisinde ${id} görevi yok`);
  }
  return Object.fromEntries(tasks.map((t) => [t.id, completedIds.includes(t.id)]));
}
