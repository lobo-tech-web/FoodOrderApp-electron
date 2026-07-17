export const writeClipboardText = async (text) => {
  const value = String(text ?? '').trim();

  if (!value) {
    throw new Error('No hay texto para copiar');
  }

  if (window.electronAPI?.writeClipboardText) {
    const result = await window.electronAPI.writeClipboardText(value);

    if (result?.copied) return value;

    throw new Error('Electron no pudo copiar el texto');
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return value;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error('No se pudo copiar al portapapeles');
  }

  return value;
};
