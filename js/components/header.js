function createLogo() {
  return `
    <a
      href="./index.html"
      class="justify-self-start whitespace-nowrap font-display text-xl font-semibold leading-none tracking-[-0.02em] lg:text-3xl"
      aria-label="Second Story home"
    >
      <span class="text-ink">Second</span>
      <span class="text-ink lg:text-brand">Story</span>
    </a>
  `;
}

function createTooltip(text) {
  return `
    <span
      class="pointer-events-none invisible absolute top-full left-1/2 z-40 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-sm text-white opacity-0 shadow-control transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      aria-hidden="true"
    >
      ${text}
    </span>
  `;
}

function createFullHeader() {
  return `
    <div
      class="grid h-[68px] w-full grid-cols-[1fr_auto] items-center px-[15px] lg:h-[100px] lg:px-[130px]"
    >
      ${createLogo()}

      <!-- Mobile -->
      <div
        class="flex items-center gap-3 justify-self-end lg:hidden"
      >
        <div data-auth-only hidden>
          <div
            data-wallet
            class="flex h-10 min-w-[96px] items-center justify-center gap-1.5 rounded-lg bg-ink px-3 text-white"
            aria-label="Wallet balance"
          >
            <span
              class="material-symbols-outlined text-[18px]"
              aria-hidden="true"
            >
              wallet
            </span>

            <span data-credit class="text-sm">
              0 cr
            </span>
          </div>
        </div>

        <button
          id="menu-button"
          type="button"
          class="flex size-11 flex-col items-center justify-center gap-[6px]"
          aria-label="Open navigation menu"
          aria-expanded="false"
          aria-controls="mobile-menu"
        >
          <span class="h-[2px] w-[30px] bg-ink"></span>
          <span class="h-[2px] w-[30px] bg-ink"></span>
          <span class="h-[2px] w-[30px] bg-ink"></span>
        </button>
      </div>

      <!-- Desktop -->
      <div
        class="col-start-2 row-start-1 hidden justify-self-end lg:block"
      >
        <!-- Logged out -->
        <div data-guest-only hidden>
          <a
            href="./auth.html"
            class="inline-flex h-10 min-w-[150px] items-center justify-center rounded-md bg-ink px-5 font-display text-sm font-semibold text-white transition-colors hover:bg-brand"
          >
            Register / log in
          </a>
        </div>

        <!-- Logged in -->
        <nav
          data-auth-only
          hidden
          class="items-center gap-4 lg:flex"
          aria-label="Account navigation"
        >
          <!-- Create listing -->
          <div class="group relative">
            <a
              href="./create-listing.html"
              class="flex size-12 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-brand"
              aria-label="Create listing"
            >
              <span
                class="material-symbols-outlined text-[24px]"
                aria-hidden="true"
              >
                add
              </span>
            </a>

            ${createTooltip('Create listing')}
          </div>

          <!-- Profile -->
          <div class="group relative">
            <a
              href="./profile.html"
              class="flex size-12 items-center justify-center overflow-hidden rounded-full bg-soft shadow-control transition hover:ring-2 hover:ring-divider"
              aria-label="View profile"
            >
              <img
                data-profile-avatar
                hidden
                class="h-full w-full object-cover"
                alt=""
              />

              <span
                data-profile-initial
                class="font-display text-sm font-semibold"
                aria-hidden="true"
              >
                S
              </span>
            </a>

            <!-- Profile dropdown -->
            <div
              class="pointer-events-none invisible absolute right-0 top-full z-50 w-40 pt-2 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100"
            >
              <div
                class="overflow-hidden rounded-lg border border-divider bg-page shadow-control"
              >
                <a
                  href="./profile.html"
                  class="block px-4 py-3 text-sm transition-colors hover:bg-sand"
                >
                  View profile
                </a>

                <button
                  data-logout
                  type="button"
                  class="w-full px-4 py-3 text-left text-sm transition-colors hover:bg-sand"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>

          <!-- Wallet -->
          <div class="group relative">
            <div
              data-wallet
              tabindex="0"
              class="flex h-10 min-w-[110px] items-center justify-center gap-1.5 rounded-lg bg-ink px-3 text-white"
              aria-label="Wallet balance"
            >
              <span
                class="material-symbols-outlined text-[18px]"
                aria-hidden="true"
              >
                wallet
              </span>

              <span
                data-credit
                class="text-base"
              >
                0 cr
              </span>
            </div>

            ${createTooltip('My wallet')}
          </div>
        </nav>
      </div>
    </div>
  `;
}

function createMobileMenu() {
  return `
    <div
      id="menu-backdrop"
      hidden
      class="fixed inset-0 z-40 bg-black/35 opacity-0 transition-opacity duration-300 lg:hidden"
    ></div>

    <aside
      id="mobile-menu"
      inert
      aria-hidden="true"
      class="fixed inset-y-0 right-0 z-50 flex h-dvh w-[min(100%,390px)] translate-x-full flex-col bg-page shadow-drawer transition-transform duration-300 ease-out lg:hidden"
    >
      <div
        class="grid h-[82px] grid-cols-[1fr_auto] items-center border-b border-divider px-6"
      >
        <a
          href="./index.html"
          class="font-display text-xl font-semibold"
        >
          Second Story
        </a>

        <button
          data-menu-close
          type="button"
          class="flex size-11 items-center justify-center"
          aria-label="Close navigation menu"
        >
          <span
            class="material-symbols-outlined text-[28px]"
            aria-hidden="true"
          >
            close
          </span>
        </button>
      </div>

      <div
        class="flex min-h-0 flex-1 flex-col overflow-y-auto px-6"
      >
        <!-- Logged out -->
        <div
          data-guest-only
          hidden
          class="pt-7"
        >
          <a
            href="./auth.html"
            class="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-ink font-display text-base font-semibold text-white"
          >
            Register / Log in
          </a>
        </div>

        <!-- Logged in profile -->
        <div
          data-auth-only
          hidden
          class="border-b border-divider py-6"
        >
          <a
            href="./profile.html"
            class="flex items-center gap-4"
          >
            <div
              class="flex size-12 items-center justify-center overflow-hidden rounded-full bg-soft"
            >
              <img
                data-profile-avatar
                hidden
                class="h-full w-full object-cover"
                alt=""
              />

              <span
                data-profile-initial
                class="font-display text-base font-semibold"
                aria-hidden="true"
              >
                S
              </span>
            </div>

            <div>
              <p
                data-profile-name
                class="font-semibold"
              >
                Profile
              </p>

              <p class="text-sm text-muted">
                View profile →
              </p>
            </div>
          </a>
        </div>

        <nav
          class="py-4"
          aria-label="Mobile navigation"
        >
          <a
            href="./index.html"
            class="block border-b border-divider py-4"
          >
            Home
          </a>

          <a
            href="./index.html#listings"
            class="block border-b border-divider py-4"
          >
            Browse listings
          </a>

          <div
            data-auth-only
            hidden
          >
            <a
              href="./create-listing.html"
              class="block border-b border-divider py-4"
            >
              Create listing
            </a>

            <a
              href="./profile.html?tab=bids"
              class="block border-b border-divider py-4"
            >
              My bids
            </a>
          </div>
        </nav>

        <div
          data-auth-only
          hidden
          class="mt-auto pb-8 text-center"
        >
          <button
            data-logout
            type="button"
            class="min-h-11 px-4 text-sm text-muted"
          >
            Log out
          </button>
        </div>
      </div>
    </aside>
  `;
}

function showGuestUI() {
  document.querySelectorAll('[data-auth-only]').forEach((element) => {
    element.hidden = true;
  });

  document.querySelectorAll('[data-guest-only]').forEach((element) => {
    element.hidden = false;
  });
}

function showAuthenticatedUI() {
  document.querySelectorAll('[data-auth-only]').forEach((element) => {
    element.hidden = false;
  });

  document.querySelectorAll('[data-guest-only]').forEach((element) => {
    element.hidden = true;
  });
}

/**
 * Update account information shown in the shared header and mobile menu.
 *
 * @param {object} profile
 */
export function updateHeaderProfile(profile) {
  const name = profile?.name || '';
  const avatarUrl = profile?.avatar?.url?.trim() || '';

  if (profile?.credits !== undefined) {
    document.querySelectorAll('[data-credit]').forEach((element) => {
      element.textContent = `${profile.credits} cr`;
    });
  }

  document.querySelectorAll('[data-profile-name]').forEach((element) => {
    element.textContent = name;
  });

  document.querySelectorAll('[data-profile-avatar]').forEach((image) => {
    const initial = image.parentElement?.querySelector(
      '[data-profile-initial]',
    );

    image.hidden = !avatarUrl;
    image.src = avatarUrl;
    image.alt = avatarUrl ? `${name} profile image` : '';

    image.onerror = () => {
      image.hidden = true;

      if (initial) {
        initial.hidden = false;
      }
    };
  });

  document.querySelectorAll('[data-profile-initial]').forEach((element) => {
    element.hidden = Boolean(avatarUrl);
    element.textContent = name.trim().charAt(0).toUpperCase() || 'S';
  });
}

export async function initHeader() {
  const header = document.querySelector('#site-header');

  if (!header) return;

  const variant = header.dataset.headerVariant ?? 'full';

  if (variant === 'minimal') {
    header.className = 'border-b border-divider bg-page';

    header.innerHTML = `
      <div
        class="grid h-[68px] w-full items-center px-[15px] lg:h-[100px] lg:px-[130px]"
      >
        ${createLogo()}
      </div>
    `;

    return;
  }

  header.className =
    'sticky top-0 z-30 border-b border-divider bg-page/95 backdrop-blur';

  header.innerHTML = createFullHeader();

  document.querySelector('#menu-backdrop')?.remove();
  document.querySelector('#mobile-menu')?.remove();

  header.insertAdjacentHTML('afterend', createMobileMenu());

  const [authModule, profileModule, storageModule, drawerModule] =
    await Promise.all([
      import('../api/auth.js'),
      import('../api/profiles.js'),
      import('../utils/storage.js'),
      import('./drawer.js'),
    ]);

  const { logoutUser } = authModule;
  const { getProfile } = profileModule;
  const { getUser } = storageModule;
  const { setupDrawer } = drawerModule;

  const menuButton = document.querySelector('#menu-button');
  const mobileMenu = document.querySelector('#mobile-menu');
  const backdrop = document.querySelector('#menu-backdrop');
  const closeButton = document.querySelector('[data-menu-close]');

  if (mobileMenu) {
    setupDrawer({
      trigger: menuButton,
      panel: mobileMenu,
      backdrop,
      closeButtons: [closeButton],
      openClasses: ['translate-x-0'],
      closedClasses: ['translate-x-full'],
    });
  }

  function handleLogout() {
    logoutUser();
    window.location.assign('./index.html');
  }

  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', handleLogout);
  });

  const user = getUser();

  if (!user?.accessToken) {
    showGuestUI();
    return;
  }

  showAuthenticatedUI();
  updateHeaderProfile(user);

  try {
    const profile = await getProfile(user.name);
    updateHeaderProfile(profile);
  } catch (error) {
    console.error('Could not load profile:', error);
  }
}
