/**
 * Görev listesinin boş olduğu durumlarda gösterilen bilgilendirme.
 * Sözleşme (TEST_CONTRACT.md §2): data-testid="empty-state".
 * Ekran hiçbir zaman boş bırakılmaz.
 */
function EmptyState({ message }) {
  return (
    <p className="empty-state" data-testid="empty-state">
      {message}
    </p>
  )
}

export default EmptyState
