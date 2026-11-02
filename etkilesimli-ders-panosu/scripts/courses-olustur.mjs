/**
 * lessons.js + tasks.js  ->  src/data/courses.json
 *
 * Berkant'ın hazırladığı iki ayrı veri dosyasını, test sözleşmesinde
 * (tests/docs/TEST_CONTRACT.md) tanımlanan tek dosyalık yapıya çevirir.
 * İçerik aynen korunur; yalnızca biçim değişir.
 *
 * İçerik güncellenirse tekrar çalıştır:
 *   node scripts/courses-olustur.mjs
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { lessons } from '../src/data/lessons.js'
import { initialTasks } from '../src/data/tasks.js'

const here = dirname(fileURLToPath(import.meta.url))
const cikti = resolve(here, '../src/data/courses.json')

const weeks = [...lessons]
  .sort((a, b) => a.week - b.week)
  .map((lesson) => {
    const dersGorevleri = initialTasks.filter((t) => t.lessonId === lesson.id)

    return {
      id: lesson.week,
      weekNumber: lesson.week,
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      durationMinutes: lesson.durationMinutes,
      objectives: lesson.objectives,
      tasks: dersGorevleri.map((task, i) => ({
        // Sözleşme gereği görev kimliği w{hafta}-t{sıra} biçiminde olmalı
        id: `w${lesson.week}-t${i + 1}`,
        title: task.title,
        description: task.description,
        dueDate: null,
        tags: [task.type],
        estimatedMinutes: task.estimatedMinutes,
      })),
    }
  })

const courses = {
  course: { title: 'Web Programlama', term: '2026 Güz' },
  weeks,
}

writeFileSync(cikti, JSON.stringify(courses, null, 2) + '\n', 'utf8')

const toplamGorev = weeks.reduce((n, w) => n + w.tasks.length, 0)
console.log(`courses.json yazildi: ${weeks.length} hafta, ${toplamGorev} gorev`)
