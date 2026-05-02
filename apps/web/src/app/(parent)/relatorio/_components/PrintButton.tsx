'use client';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-hover transition-colors shadow-parent-soft"
    >
      🖨️ Salvar como PDF / Imprimir
    </button>
  );
}
