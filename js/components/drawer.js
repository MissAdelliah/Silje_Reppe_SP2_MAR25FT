const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Set up an accessible drawer or sheet.
 * @param {object} options
 * @returns {{open: Function, close: Function, isOpen: Function}}
 */
export function setupDrawer({
  trigger = null,
  panel,
  backdrop = null,
  closeButtons = [],
  openClasses = [],
  closedClasses = [],
  lockScroll = true,
  bindTrigger = true,
  onOpen,
  onClose,
}) {
  let previousFocus = null;
  let openState = false;

  function getFocusableElements() {
    return [...panel.querySelectorAll(focusableSelector)].filter(
      (element) => !element.hasAttribute('hidden'),
    );
  }

  function shouldLockScroll() {
    return typeof lockScroll === 'function' ? lockScroll() : lockScroll;
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      close();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = getFocusableElements();

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function open() {
    if (openState) return;

    openState = true;
    previousFocus = document.activeElement;

    panel.inert = false;
    panel.setAttribute('aria-hidden', 'false');

    trigger?.setAttribute('aria-expanded', 'true');

    panel.classList.remove(...closedClasses);
    panel.classList.add(...openClasses);

    if (backdrop) {
      backdrop.hidden = false;

      requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
      });
    }

    if (shouldLockScroll()) {
      document.body.classList.add('overflow-hidden');
    }

    document.addEventListener('keydown', handleKeydown);

    onOpen?.();

    requestAnimationFrame(() => {
      getFocusableElements()[0]?.focus();
    });
  }

  function close() {
    if (!openState) return;

    openState = false;

    panel.classList.remove(...openClasses);
    panel.classList.add(...closedClasses);

    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');

    trigger?.setAttribute('aria-expanded', 'false');

    if (backdrop) {
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0');

      window.setTimeout(() => {
        backdrop.hidden = true;
      }, 300);
    }

    if (shouldLockScroll()) {
      document.body.classList.remove('overflow-hidden');
    }

    document.removeEventListener('keydown', handleKeydown);

    onClose?.();

    if (previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  }

  if (bindTrigger) {
    trigger?.addEventListener('click', open);
  }

  closeButtons.forEach((button) => {
    button?.addEventListener('click', close);
  });

  backdrop?.addEventListener('click', close);

  return {
    open,
    close,
    isOpen: () => openState,
  };
}
