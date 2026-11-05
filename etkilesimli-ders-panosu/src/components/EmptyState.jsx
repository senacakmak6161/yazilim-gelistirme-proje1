import Icon from './Icon.jsx'

/**
 * Görev listesinin boş olduğu durumlarda gösterilen bilgilendirme.
 *
 * Önce tek satırlık kesik çizgili bir kutuydu; ekranın geri kalanı doluyken
 * orası yarım kalmış gibi duruyordu. Şimdi listenin yerini dolduran, patika
 * dilinde bir durak işareti var: boş bir halka, yani henüz basılmamış bir iz.
 *
 * Sözleşme (TEST_CONTRACT.md §2): data-testid="empty-state" ve o öğenin metni
 * YALNIZCA mesajın kendisi. İpucu cümlesi bilerek dışarıda, kardeş öğede.
 * Ekran hiçbir zaman boş bırakılmaz.
 */
function EmptyState({ message }) {
  return (
    <div className="empty-box">
      <span className="empty-mark" aria-hidden="true">
        <Icon name="bos" size={20} />
      </span>

      <p className="empty-state" data-testid="empty-state">
        {message}
      </p>

      <p className="empty-hint">
        Filtreleri değiştirerek patikanın diğer duraklarına bakabilirsin.
      </p>
    </div>
  )
}

export default EmptyState
