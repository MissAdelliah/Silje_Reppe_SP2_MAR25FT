import { createListing } from '../api/listings.js';
import { initFooter } from '../components/footer.js';
import { initHeader } from '../components/header.js';
import { getUser } from '../utils/storage.js';

const form = document.querySelector('#create-listing-form');

const mediaUrlInput = document.querySelector('#media-url');
const addMediaButton = document.querySelector('#add-media');
const mainPreview = document.querySelector('#media-main-preview');
const mediaPlaceholder = document.querySelector('#media-placeholder');
const mediaThumbnails = document.querySelector('#media-thumbnails');
const mediaCount = document.querySelector('#media-count');
const mediaError = document.querySelector('#media-error');

const titleInput = document.querySelector('#listing-title');
const titleCount = document.querySelector('#title-count');

const descriptionInput = document.querySelector('#listing-description');
const descriptionCount = document.querySelector('#description-count');

const brandInput = document.querySelector('#listing-brand');
const sizeInput = document.querySelector('#listing-size');
const colorInput = document.querySelector('#listing-color');
const materialInput = document.querySelector('#listing-material');
const conditionInput = document.querySelector('#listing-condition');
const categoryInput = document.querySelector('#listing-category');
const deadlineInput = document.querySelector('#listing-deadline');

const publishButton = document.querySelector('#publish-listing');
const createError = document.querySelector('#create-error');

const mediaUrls = [];

function isValidImageUrl(value) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function showMainImage(url) {
  mainPreview.src = url;

  mainPreview.alt = titleInput.value.trim() || 'Listing image preview';

  mainPreview.hidden = false;
  mediaPlaceholder.hidden = true;

  mainPreview.onerror = () => {
    mainPreview.hidden = true;
    mediaPlaceholder.hidden = false;

    mediaError.textContent = 'Could not load this image.';
    mediaError.hidden = false;
  };
}

function renderMedia() {
  mediaThumbnails.replaceChildren();

  mediaCount.textContent = `(${mediaUrls.length})`;

  if (!mediaUrls.length) {
    mainPreview.hidden = true;
    mainPreview.src = '';
    mediaPlaceholder.hidden = false;

    return;
  }

  showMainImage(mediaUrls[0]);

  mediaUrls.forEach((url, index) => {
    const wrapper = document.createElement('div');

    wrapper.className =
      'relative size-[72px] shrink-0 overflow-hidden rounded-lg bg-soft';

    const selectButton = document.createElement('button');

    selectButton.type = 'button';
    selectButton.className = 'h-full w-full';

    selectButton.setAttribute('aria-label', `View image ${index + 1}`);

    const image = document.createElement('img');

    image.src = url;
    image.alt = `Listing image ${index + 1}`;
    image.className = 'h-full w-full object-cover';

    selectButton.append(image);

    selectButton.addEventListener('click', () => {
      showMainImage(url);
    });

    const removeButton = document.createElement('button');

    removeButton.type = 'button';

    removeButton.className =
      'absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-ink text-white';

    removeButton.setAttribute('aria-label', `Remove image ${index + 1}`);

    removeButton.innerHTML = `
      <span
        class="material-symbols-outlined text-[15px]"
        aria-hidden="true"
      >
        close
      </span>
    `;

    removeButton.addEventListener('click', (event) => {
      event.stopPropagation();

      mediaUrls.splice(index, 1);

      renderMedia();
    });

    wrapper.append(selectButton, removeButton);
    mediaThumbnails.append(wrapper);
  });
}

function addMedia() {
  const url = mediaUrlInput.value.trim();

  mediaError.hidden = true;

  if (!url) {
    mediaError.textContent = 'Paste an image URL first.';
    mediaError.hidden = false;
    return;
  }

  if (!isValidImageUrl(url)) {
    mediaError.textContent = 'Enter a valid public image URL.';
    mediaError.hidden = false;

    return;
  }

  if (mediaUrls.includes(url)) {
    mediaError.textContent = 'This image has already been added.';
    mediaError.hidden = false;

    return;
  }

  const testImage = new Image();

  testImage.onload = () => {
    mediaUrls.push(url);

    mediaUrlInput.value = '';

    renderMedia();
  };

  testImage.onerror = () => {
    mediaError.textContent = 'Could not load an image from this URL.';

    mediaError.hidden = false;
  };

  testImage.src = url;
}

function createTags() {
  const tags = [];

  const fields = {
    brand: brandInput.value,
    size: sizeInput.value,
    color: colorInput.value,
    material: materialInput.value,
    condition: conditionInput.value,
    category: categoryInput.value,
  };

  Object.entries(fields).forEach(([key, value]) => {
    const cleanValue = value.trim();

    if (!cleanValue) return;

    tags.push(`${key}:${cleanValue.toLowerCase()}`);
  });

  return tags;
}

function validateListing() {
  createError.hidden = true;
  mediaError.hidden = true;

  if (!titleInput.value.trim()) {
    createError.textContent = 'Add a title.';
    createError.hidden = false;

    titleInput.focus();
    return false;
  }

  if (!descriptionInput.value.trim()) {
    createError.textContent = 'Add a description.';
    createError.hidden = false;

    descriptionInput.focus();
    return false;
  }

  if (!mediaUrls.length) {
    mediaError.textContent = 'Add at least one image before publishing.';

    mediaError.hidden = false;

    mediaUrlInput.focus();
    return false;
  }

  if (!deadlineInput.value) {
    createError.textContent = 'Choose an auction deadline.';

    createError.hidden = false;

    deadlineInput.focus();
    return false;
  }

  const deadline = new Date(deadlineInput.value);

  if (Number.isNaN(deadline.getTime()) || deadline.getTime() <= Date.now()) {
    createError.textContent = 'The auction deadline must be in the future.';

    createError.hidden = false;

    deadlineInput.focus();
    return false;
  }

  return true;
}

function buildListing() {
  const title = titleInput.value.trim();

  return {
    title,

    description: descriptionInput.value.trim(),

    tags: createTags(),

    media: mediaUrls.map((url, index) => ({
      url,
      alt: `${title} image ${index + 1}`,
    })),

    endsAt: new Date(deadlineInput.value).toISOString(),
  };
}

async function handlePublish(event) {
  event.preventDefault();

  if (!validateListing()) {
    return;
  }

  createError.hidden = true;
  publishButton.disabled = true;
  publishButton.textContent = 'Publishing...';

  try {
    const listing = await createListing(buildListing());

    console.log('Created listing:', listing);

    window.location.assign(
      `./listing.html?id=${encodeURIComponent(listing.id)}`,
    );
  } catch (error) {
    console.error('Could not create listing:', error);

    createError.textContent =
      error instanceof Error ? error.message : 'Could not publish listing.';

    createError.hidden = false;
  } finally {
    publishButton.disabled = false;
    publishButton.textContent = 'Publish Listing';
  }
}

addMediaButton.addEventListener('click', addMedia);

mediaUrlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();

    addMedia();
  }
});

titleInput.addEventListener('input', () => {
  titleCount.textContent = `${titleInput.value.length}/120`;
});

descriptionInput.addEventListener('input', () => {
  descriptionCount.textContent = `${descriptionInput.value.length}/500`;
});

form.addEventListener('submit', handlePublish);

async function init() {
  initFooter();

  await initHeader();

  const user = getUser();

  if (!user?.accessToken) {
    window.location.assign('./auth.html?mode=login');

    return;
  }

  renderMedia();
}

init();
