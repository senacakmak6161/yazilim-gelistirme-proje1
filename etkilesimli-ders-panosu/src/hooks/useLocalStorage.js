import { useEffect, useState } from 'react'

/**
 * Bir değeri localStorage'da saklar ve sayfa yenilendiğinde geri yükler.
 *
 * Sözleşme gereği (tests/docs/TEST_CONTRACT.md §4): okunamayan veya beklenen
 * biçimde olmayan değer uygulamayı hataya düşürmez, varsayılana dönülür.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return initialValue

      const parsed = JSON.parse(raw)
      if (parsed === null || parsed === undefined) return initialValue

      // Beklenen tip tutmuyorsa varsayılana dön
      if (typeof parsed !== typeof initialValue) return initialValue

      return parsed
    } catch {
      // Bozuk JSON, gizli sekme, erişim engeli — hiçbiri uygulamayı düşürmemeli
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Kota dolu veya yazma izni yok: sessizce geç, uygulama çalışmaya devam etsin
    }
  }, [key, value])

  return [value, setValue]
}
