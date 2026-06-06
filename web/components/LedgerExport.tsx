'use client';

export default function LedgerExport({ json }: { json: string }) {
  function download() {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alfred-os-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="border border-cyan text-cyan font-mono text-[10px] tracking-[0.15em] uppercase px-4 py-3 hover:bg-cyan hover:text-bg transition-colors"
    >
      Export All Data (JSON)
    </button>
  );
}
