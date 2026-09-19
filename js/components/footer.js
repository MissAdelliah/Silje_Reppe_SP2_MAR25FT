function createFooter() {
  return `
    <div
      class="mx-auto w-full max-w-[1280px] px-6 py-14
      lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-start
      lg:gap-10 lg:px-[72px] lg:py-20"
    >
      <!-- Brand -->
      <div
        class="text-center
        lg:justify-self-start lg:text-left"
      >
        <a
          href="./index.html"
          class="font-display text-2xl font-semibold leading-none
          lg:text-xl"
          aria-label="Second Story home"
        >
          <span class="text-ink">Second</span>
          <span class="text-brand">Story</span>
        </a>

        <p
          class="mt-3 text-base text-ink
          lg:mt-2 lg:text-sm lg:text-muted"
        >
          Made by students for students.
        </p>
      </div>

      <!-- Social media -->
      <div
        class="mt-10 text-center
        lg:col-start-3 lg:row-start-1
        lg:mt-0 lg:justify-self-end lg:text-right"
      >
        <div
          class="flex items-center justify-center gap-7
          lg:justify-end lg:gap-4"
          aria-label="Social media"
        >
          <!-- Instagram -->
          <a
            href="#"
            aria-label="Instagram"
            class="flex size-10 items-center justify-center
            transition-opacity duration-150 hover:opacity-60"
          >
            <svg
              viewBox="0 0 24 24"
              class="size-7 lg:size-[18px]"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
              ></rect>

              <circle
                cx="12"
                cy="12"
                r="4"
              ></circle>

              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                fill="currentColor"
                stroke="none"
              ></circle>
            </svg>
          </a>

          <!-- TikTok -->
          <a
            href="#"
            aria-label="TikTok"
            class="flex size-10 items-center justify-center
            transition-opacity duration-150 hover:opacity-60"
          >
            <svg
              viewBox="0 0 24 24"
              class="size-7 lg:size-[18px]"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M14 4v10.2a4.2 4.2 0 1 1-3.4-4.1"
              ></path>

              <path
                d="M14 4c.4 2.2 1.8 3.7 4 4"
              ></path>

              <path
                d="M18 8v3c-1.5-.1-2.9-.6-4-1.5"
              ></path>
            </svg>
          </a>

          <!-- Facebook -->
          <a
            href="#"
            aria-label="Facebook"
            class="flex size-10 items-center justify-center
            transition-opacity duration-150 hover:opacity-60"
          >
            <svg
              viewBox="0 0 24 24"
              class="size-7 lg:size-[18px]"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M13.6 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.7c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v1.8H7V13h3v8h3.6Z"
              ></path>
            </svg>
          </a>
        </div>

        <p
          class="mt-5 hidden font-display text-sm font-semibold
          lg:block"
        >
          Follow our socials
        </p>
      </div>

     <!-- Navigation -->
<nav
  class="mt-14 flex items-center justify-center gap-14 text-base
  lg:col-start-2 lg:row-start-1 lg:mt-0
  lg:flex-col lg:gap-6 lg:text-sm lg:font-semibold"
  aria-label="Footer navigation"
>
  <!-- Mobile only -->
  <a
    href="#"
    class="transition-colors duration-150 hover:text-brand
    lg:hidden"
  >
    Service
  </a>

  <a
    href="#"
    class="transition-colors duration-150 hover:text-brand"
  >
    About us
  </a>

  <!-- Desktop only -->
  <a
    href="#"
    class="hidden transition-colors duration-150 hover:text-brand
    lg:block"
  >
    Contact
  </a>

  <a
    href="#"
    class="transition-colors duration-150 hover:text-brand"
  >
    T&amp;C
  </a>
</nav>
      <!-- Copyright -->
      <p
        class="mt-12 text-center text-base text-ink
        lg:col-span-3 lg:mt-0 lg:justify-self-center
        lg:text-sm lg:text-muted"
      >
        © 2026 Secondstory AS. All rights reserved.
      </p>
    </div>
  `;
}

export function initFooter() {
  const footer = document.querySelector('#site-footer');

  if (!footer) return;

  footer.className = 'bg-sand';
  footer.innerHTML = createFooter();
}
