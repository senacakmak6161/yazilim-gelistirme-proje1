/**
 * Ders verisinden türeyen küçük yardımcılar.
 *
 * Bileşen dosyalarından ayrı tutuluyor: React dosyaları yalnızca bileşen
 * dışa aktarırsa geliştirme sırasında sıcak yenileme düzgün çalışır.
 */

/** Bir haftanın toplam çalışma yükü (dakika). */
export function haftaYuku(week) {
  return week.tasks.reduce((toplam, task) => toplam + (task.estimatedMinutes ?? 0), 0)
}

/** 1060 → "17 sa 40 dk". Dakika sıfırsa yalnızca saat yazılır. */
export function sureMetni(dakika) {
  const saat = Math.floor(dakika / 60)
  const kalan = dakika % 60
  if (saat === 0) return `${kalan} dk`
  if (kalan === 0) return `${saat} sa`
  return `${saat} sa ${kalan} dk`
}

/** Görev etiketlerinin ikon karşılığı; bilinmeyen etiket ikonsuz kalır. */
export const ETIKET_IKONU = {
  okuma: 'okuma',
  uygulama: 'uygulama',
  proje: 'proje',
  quiz: 'quiz',
}
