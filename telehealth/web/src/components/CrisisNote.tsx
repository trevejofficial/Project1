/**
 * Aviso de seguridad para salud mental y emergencias.
 * Se muestra en la atención psicológica y en el pie de página.
 */
export function CrisisNote({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="crisis-compact">
        ¿Crisis o emergencia? Llama al <a href="tel:911">911</a> o a la línea de salud mental{' '}
        <a href="tel:988">988</a> (en español, marca 2).
      </p>
    );
  }
  return (
    <div className="crisis-note" role="note">
      <strong>⚠️ Si es una emergencia, llama al 911.</strong>
      <p>
        Si tú o alguien más está en crisis o pensando en hacerse daño, llama o envía un mensaje a la{' '}
        <strong>Línea 988</strong> de Prevención del Suicidio y Crisis (atención en español: marca{' '}
        <strong>2</strong>). Es gratis, confidencial y disponible las 24 horas.
      </p>
    </div>
  );
}
