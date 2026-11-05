/**
 * Görev satırı ile patikadaki adım izini eşleştirir.
 *
 * Doğrudan DOM üzerinden çalışıyor, React durumu üzerinden değil. Sebebi
 * sıklık: fare listede gezerken saniyede onlarca kez satır değiştiriyor ve
 * her biri için uygulamayı yeniden çizmek otuz görevlik listede gözle
 * görülür takılma yaratıyordu. Buradaki iş tek bir sınıf eklemek, o yüzden
 * React'i hiç uğraştırmıyoruz.
 */

let oncekiOge = null
let oncekiBolum = null

export function gorevVurgula(gorevId) {
  vurguyuKaldir()
  if (!gorevId) return

  const oge = document.querySelector(`.path-step[data-gorev="${CSS.escape(gorevId)}"]`)
  if (!oge) return

  oge.classList.add('is-vurgulu')
  oncekiOge = oge
}

export function vurguyuKaldir() {
  oncekiOge?.classList.remove('is-vurgulu')
  oncekiOge = null
}

/** Durak üstüne gelince o haftanın yol parçasını vurgular. */
export function haftaVurgula(haftaId) {
  haftaVurgusunuKaldir()
  if (haftaId === null || haftaId === undefined) return

  const oge = document.querySelector(`.path-bolum[data-hafta="${CSS.escape(String(haftaId))}"]`)
  if (!oge) return

  oge.classList.add('is-vurgulu')
  oncekiBolum = oge
}

export function haftaVurgusunuKaldir() {
  oncekiBolum?.classList.remove('is-vurgulu')
  oncekiBolum = null
}
