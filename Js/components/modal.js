function openModal(message, type = 'success') {
  const existing = document.getElementById('bv-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'bv-modal';
  modal.setAttribute('role', 'alert');
  modal.setAttribute('aria-live', 'polite');
  modal.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: var(--color-parchment, #fdf8f0);
    border: 1px solid var(--color-border-linen, #d9cbb8);
    border-left: 4px solid ${type === 'success' ? '#7a9e6e' : '#c0392b'};
    padding: 14px 20px; border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    font-family: inherit; font-size: 0.9rem;
    color: var(--color-text-charcoal, #2c2416);
    max-width: 300px; animation: slideIn 0.3s ease;
  `;
  modal.textContent = message;

  if (!document.getElementById('bv-modal-style')) {
    const style = document.createElement('style');
    style.id = 'bv-modal-style';
    style.textContent = '@keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
    document.head.appendChild(style);
  }

  document.body.appendChild(modal);
  setTimeout(() => closeModal(), 3000);
}

function closeModal() {
  const modal = document.getElementById('bv-modal');
  if (modal) modal.remove();
}

export { openModal, closeModal };
