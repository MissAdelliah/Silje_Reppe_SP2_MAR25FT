// Drawer

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Set up an accessible drawer.
 * @param {object} options
 * @returns {{open: Function, close: Function}}
 */
export function setupDrawer({
  trigger,
  panel,
  backdrop,
  closeButtons = [],
  openClasses,
  closedClasses,
  lockScroll = true,
  onOpen,
  onClose,
}) {
  let previousFocus = null;

  function getFocusable() {
    return [...panel.querySelectorAll(focusableSelector)];
  }

  function shouldLockScroll() {
    return typeof lockScroll === 'function' ? lockScroll() : lockScroll;
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      close();

      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = getFocusable();

    if (!focusable.length) {
      return;
    }

    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();

      last.focus();
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();

      first.focus();
    }
  }

  function open() {
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
      getFocusable()[0]?.focus();
    });
  }

  function close() {
    previousFocus?.focus();

    panel.classList.remove(...openClasses);

    panel.classList.add(...closedClasses);

    trigger?.setAttribute('aria-expanded', 'false');

    panel.inert = true;

    panel.setAttribute('aria-hidden', 'true');

    if (backdrop) {
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0');

      window.setTimeout(() => {
        backdrop.hidden = true;
      }, 300);
    }

    document.body.classList.remove('overflow-hidden');

    document.removeEventListener('keydown', handleKeydown);

    onClose?.();
  }

  trigger?.addEventListener('click', open);

  closeButtons.forEach((button) => {
    button.addEventListener('click', close);
  });

  backdrop?.addEventListener('click', close);

  return {
    open,
    close,
  };
}
