import { deleteListing, getListing, updateListing } from '../api/listings.js';
import { initFooter } from '../components/footer.js';
import { initHeader } from '../components/header.js';
import { renderListingPreview } from '../components/listingPreview.js';
import { getUser } from '../utils/storage.js';

let listing = null;

const currentUser = getUser();
const mediaUrls = [];
const loadingView = document.querySelector('#edit-loading');
const loadErrorView = document.querySelector('#edit-load-error');
const loadErrorMessage = document.querySelector('#edit-load-error-message');
const editView = document.querySelector('#edit-view');
const form = document.querySelector('#edit-listing-form');
const backToListing = document.querySelector('#back-to-listing');
const cancelEdit = document.querySelector('#cancel-edit');

// Media
const mediaUrlInput = document.querySelector('#edit-media-url');
const addMediaButton = document.querySelector('#edit-add-media');
const mainImage = document.querySelector('#edit-main-image');
const mediaPlaceholder = document.querySelector('#edit-media-placeholder');
const mediaThumbnails = document.querySelector('#edit-media-thumbnails');
const mediaError = document.querySelector('#edit-media-error');

// Fields
const titleInput = document.querySelector('#edit-title');
const descriptionInput = document.querySelector('#edit-description');
const brandInput = document.querySelector('#edit-brand');
const sizeInput = document.querySelector('#edit-size');
const colorInput = document.querySelector('#edit-color');
const materialInput = document.querySelector('#edit-material');
const conditionInput = document.querySelector('#edit-condition');
const categoryInput = document.querySelector('#edit-category');
const deadlineInput = document.querySelector('#edit-deadline');
const editError = document.querySelector('#edit-error');
const updateButton = document.querySelector('#update-listing');

// Preview
const previewButton = document.querySelector('#preview-edit');
const previewView = document.querySelector('#edit-preview');
const backToEditButton = document.querySelector('#back-to-edit');
const previewHeading = document.querySelector('#edit-preview-heading');
const previewImage = document.querySelector('#edit-preview-image');
const previewBrand = document.querySelector('#edit-preview-brand');
const previewTitle = document.querySelector('#edit-preview-title');
const previewDescription = document.querySelector('#edit-preview-description');
const previewTags = document.querySelector('#edit-preview-tags');
const updateFromPreviewButton = document.querySelector('#update-from-preview');

// Delete
const deleteButton = document.querySelector('#delete-listing-button');
const deleteDialog = document.querySelector('#delete-dialog');
const cancelDeleteButton = document.querySelector('#cancel-delete');
const confirmDeleteButton = document.querySelector('#confirm-delete');
const deleteError = document.querySelector('#delete-error');

function getListingId() {
  return new URLSearchParams(window.location.search).get('id')?.trim() || '';
}

function isOwner() {
  return Boolean(
    currentUser?.name &&
    listing?.seller?.name &&
    currentUser.name.toLowerCase() === listing.seller.name.toLowerCase(),
  );
}

function getTagValue(prefix) {
  const tag = listing?.tags?.find((item) =>
    item.toLowerCase().startsWith(`${prefix}:`),
  );

  if (!tag) {
    return '';
  }

  return tag.slice(prefix.length + 1);
}

function formatDeadline(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function isValidImageUrl(value) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function showMainImage(url) {
  mainImage.src = url;

  mainImage.alt = titleInput.value.trim() || 'Listing image';

  mainImage.hidden = false;
  mediaPlaceholder.hidden = true;
  mainImage.onerror = () => {
    mainImage.hidden = true;
    mediaPlaceholder.hidden = false;

    mediaError.textContent = 'Could not load this image.';

    mediaError.hidden = false;
  };
}

function renderMedia() {
  mediaThumbnails.replaceChildren();

  if (!mediaUrls.length) {
    mainImage.hidden = true;
    mainImage.src = '';

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

    const removeIcon = document.createElement('span');
    removeIcon.className = 'material-symbols-outlined text-[15px]';
    removeIcon.textContent = 'close';
    removeIcon.setAttribute('aria-hidden', 'true');
    removeButton.append(removeIcon);
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

    if (!cleanValue) {
      return;
    }

    tags.push(`${key}:${cleanValue.toLowerCase()}`);
  });

  return tags;
}

function populateForm() {
  titleInput.value = listing.title ?? '';
  descriptionInput.value = listing.description ?? '';
  brandInput.value = getTagValue('brand');
  sizeInput.value = getTagValue('size');
  colorInput.value = getTagValue('color');
  materialInput.value = getTagValue('material');
  conditionInput.value = getTagValue('condition');
  categoryInput.value = getTagValue('category');
  deadlineInput.value = formatDeadline(listing.endsAt);

  mediaUrls.splice(
    0,
    mediaUrls.length,
    ...(listing.media ?? []).map((item) => item?.url?.trim()).filter(Boolean),
  );

  renderMedia();
}

function validateListing() {
  editError.hidden = true;
  mediaError.hidden = true;

  if (!titleInput.value.trim()) {
    editError.textContent = 'Add a title.';

    editError.hidden = false;

    titleInput.focus();

    return false;
  }

  if (!descriptionInput.value.trim()) {
    editError.textContent = 'Add a description.';
    editError.hidden = false;
    descriptionInput.focus();

    return false;
  }

  if (!mediaUrls.length) {
    mediaError.textContent = 'Add at least one image.';
    mediaError.hidden = false;
    mediaUrlInput.focus();

    return false;
  }

  return true;
}

/**
 * exclud endsAT because the API does not allow the auction deadline to be edited.
 *
 * @returns {object}
 */
function buildUpdate() {
  const title = titleInput.value.trim();

  return {
    title,

    description: descriptionInput.value.trim(),

    tags: createTags(),

    media: mediaUrls.map((url, index) => ({
      url,

      alt: `${title} image ${index + 1}`,
    })),
  };
}

function buildPreviewListing() {
  return {
    ...listing,
    ...buildUpdate(),

    // Keep data that is not editable.
    endsAt: listing.endsAt,
    bids: listing.bids ?? [],
    seller: listing.seller,
  };
}

function showEditForm() {
  previewView.hidden = true;
  form.hidden = false;
}

function showPreview() {
  if (!validateListing()) {
    return;
  }

  renderListingPreview(buildPreviewListing(), {
    image: previewImage,
    brand: previewBrand,
    title: previewTitle,
    description: previewDescription,
    tags: previewTags,
  });

  form.hidden = true;
  previewView.hidden = false;
  previewHeading.tabIndex = -1;
  previewHeading.focus();

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

function setUpdatingState(isUpdating) {
  updateButton.disabled = isUpdating;
  updateFromPreviewButton.disabled = isUpdating;
  updateButton.textContent = isUpdating ? 'Updating...' : 'Update Listing';
  updateFromPreviewButton.textContent = isUpdating
    ? 'Updating...'
    : 'Update Listing';
}

async function handleUpdate(event) {
  event.preventDefault();

  if (!validateListing()) {
    showEditForm();

    return;
  }

  editError.hidden = true;
  setUpdatingState(true);

  try {
    const updatedListing = await updateListing(listing.id, buildUpdate());
    const id = updatedListing?.id ?? listing.id;

    window.location.assign(`./listing.html?id=${encodeURIComponent(id)}`);
  } catch (error) {
    console.error('Could not update listing:', error);

    showEditForm();

    editError.textContent =
      error instanceof Error ? error.message : 'Could not update listing.';

    editError.hidden = false;
  } finally {
    setUpdatingState(false);
  }
}

function showLoadError(message) {
  loadingView.hidden = true;
  editView.hidden = true;

  loadErrorMessage.textContent = message;

  loadErrorView.hidden = false;
}

function openDeleteDialog() {
  deleteError.hidden = true;
  deleteDialog.showModal();
  confirmDeleteButton.focus();
}

async function handleDelete() {
  deleteError.hidden = true;
  confirmDeleteButton.disabled = true;

  confirmDeleteButton.textContent = 'Deleting...';

  try {
    await deleteListing(listing.id);

    window.location.assign('./profile.html');
  } catch (error) {
    console.error('Could not delete listing:', error);

    deleteError.textContent =
      error instanceof Error ? error.message : 'Could not delete listing.';

    deleteError.hidden = false;
  } finally {
    confirmDeleteButton.disabled = false;
    confirmDeleteButton.textContent = 'Delete';
  }
}

async function loadListing() {
  const id = getListingId();

  if (!id) {
    showLoadError('No listing ID was provided.');

    return;
  }

  try {
    listing = await getListing(id);

    if (!isOwner()) {
      showLoadError('You can only edit listings that you created.');

      return;
    }

    const listingUrl = `./listing.html?id=${encodeURIComponent(listing.id)}`;
    backToListing.href = listingUrl;
    cancelEdit.href = listingUrl;

    populateForm();

    loadingView.hidden = true;
    loadErrorView.hidden = true;
    editView.hidden = false;
  } catch (error) {
    console.error('Could not load listing:', error);

    showLoadError(
      error instanceof Error ? error.message : 'Could not load listing.',
    );
  }
}

addMediaButton.addEventListener('click', addMedia);

mediaUrlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();

    addMedia();
  }
});

previewButton.addEventListener('click', showPreview);

backToEditButton.addEventListener('click', () => {
  showEditForm();

  previewButton.focus();
});

updateFromPreviewButton.addEventListener('click', () => {
  form.requestSubmit();
});

form.addEventListener('submit', handleUpdate);

deleteButton.addEventListener('click', openDeleteDialog);

cancelDeleteButton.addEventListener('click', () => {
  deleteDialog.close();
  deleteButton.focus();
});

confirmDeleteButton.addEventListener('click', handleDelete);

async function init() {
  initFooter();

  await initHeader();

  if (!currentUser?.accessToken) {
    window.location.assign('./auth.html?mode=login');

    return;
  }

  await loadListing();
}

init();
