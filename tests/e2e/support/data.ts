import { readFileSync } from 'node:fs';
import path from 'node:path';

export interface Week { id: string; number: number; title: string; description: string; goals: string[] }
export interface Task { id: string; weekId: string; title: string; description: string }
export interface Course { course: { title: string }; weeks: Week[]; tasks: Task[] }

// Test verisi uygulamanın gerçek içeriğinden BAĞIMSIZDIR:
// arkadaşın gerçek ders içeriğini değiştirse bile testler kırılmaz.
export function loadCourse(file: string): Course {
  // __dirname = bu dosyanın klasörü (tests/e2e/support); veri bir üstteki data/ içinde.
  const fullPath = path.join(__dirname, '..', 'data', file);
  return JSON.parse(readFileSync(fullPath, 'utf-8')) as Course;
}

// Basit eşleme sorguları. "Hafta 2'nin görevleri hangileri" gibi sorular
// veriden türetilebilir; çünkü bu, test ettiğimiz mantık değil, verinin kendisidir.
// UYARI: Arama/filtre/yüzde gibi TEST EDİLEN mantığın sonucunu burada hesaplama;
// onları testte elle yaz. Aksi hâlde uygulamayla aynı hatayı yapan bir test yazarsın.
export const tasksOfWeek = (course: Course, weekId: string) =>
  course.tasks.filter((t) => t.weekId === weekId);

export function weekByNumber(course: Course, weekNo: number): Week {
  const week = course.weeks.find((w) => w.number === weekNo);
  if (!week) throw new Error(`Test verisinde Hafta ${weekNo} yok`);
  return week;
}

export function titlesOf(course: Course, ids: readonly string[]): string[] {
  return ids.map((id) => {
    const task = course.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Test verisinde ${id} görevi yok`);
    return task.title;
  });
}

export const titleOf = (course: Course, id: string) => titlesOf(course, [id])[0];
