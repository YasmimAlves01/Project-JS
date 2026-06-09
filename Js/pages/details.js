import { addFavorite, removeFavorite, isFavorite } from '../services/favoritesService.js';
import { getBookFromDb } from '../services/booksService.js';
import { addToCart } from '../services/cartService.js';
import { updateNavbar } from '../components/navbar.js';
import { openModal } from '../components/modal.js';

let CURRENT_BOOK = {
  id: 'whispering-woodlands',
  title: 'The Whispering Woodlands',
  author: 'Clara Hearthwood',
  price: 14.99,
  genre: 'Ficção',
  coverTheme: 'cover-theme-2',
  emblem: '🌿',
  rating: 4.8,
  ratingsCount: 42
};

function initDetailsPage() {
  updateNavbar();

  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('id');
  
  if (bookId) {
    const cachedBook = getBookFromDb(bookId);
    if (cachedBook) {
      CURRENT_BOOK = cachedBook;
    } else {
      CURRENT_BOOK.id = bookId;
    }
  }

  populateBookDetails();
  setupFavoriteButton();
  setupQuantitySelector();
  setupAddToCartButton();
}

function populateBookDetails() {
  const breadcrumbActive = document.querySelector('.breadcrumbs .active');
  if (breadcrumbActive) breadcrumbActive.textContent = CURRENT_BOOK.title;

  const coverEl = document.querySelector('.book-sheet-gallery .book-cover-css');
  if (coverEl) {
    coverEl.className = `book-cover-css ${CURRENT_BOOK.coverTheme}`;
    const emblem = coverEl.querySelector('.cover-emblem');
    const coverTitle = coverEl.querySelector('.cover-title-text');
    const coverAuthor = coverEl.querySelector('.cover-author-text');
    if (emblem) emblem.textContent = CURRENT_BOOK.emblem;
    if (coverTitle) coverTitle.textContent = CURRENT_BOOK.title;
    if (coverAuthor) coverAuthor.textContent = CURRENT_BOOK.author;
  }

  const tag = document.querySelector('.book-details-tag');
  const title = document.querySelector('.book-details-title');
  const author = document.querySelector('.book-details-author');
  const price = document.querySelector('.book-details-price');
  const ratingCount = document.querySelector('.rating-count');

  if (tag) tag.textContent = CURRENT_BOOK.genre;
  if (title) title.textContent = CURRENT_BOOK.title;
  if (author) author.textContent = `de ${CURRENT_BOOK.author}`;
  if (price) price.textContent = `R$ ${CURRENT_BOOK.price.toFixed(2)}`;
  if (ratingCount) ratingCount.textContent = CURRENT_BOOK.rating.toString().replace('.', ',');
}

function setupFavoriteButton() {
  const btn = document.getElementById('favorite-gallery-btn');
  if (!btn) return;

  if (isFavorite(CURRENT_BOOK.id)) {
    btn.classList.add('active');
    btn.setAttribute('aria-label', 'Remover dos Favoritos');
  }

  btn.addEventListener('click', () => {
    if (isFavorite(CURRENT_BOOK.id)) {
      removeFavorite(CURRENT_BOOK.id);
      btn.classList.remove('active');
      btn.setAttribute('aria-label', 'Adicionar aos Favoritos');
      openModal(`"${CURRENT_BOOK.title}" removido dos favoritos.`);
    } else {
      addFavorite(CURRENT_BOOK);
      btn.classList.add('active');
      btn.setAttribute('aria-label', 'Remover dos Favoritos');
      openModal(`"${CURRENT_BOOK.title}" adicionado aos favoritos! ♥`);
    }
    updateNavbar();
  });
}

function setupQuantitySelector() {
  const decreaseBtn = document.querySelector('.quantity-btn[aria-label="Diminuir quantidade"]');
  const increaseBtn = document.querySelector('.quantity-btn[aria-label="Aumentar quantidade"]');
  const quantityInput = document.querySelector('.quantity-input');

  if (!decreaseBtn || !increaseBtn || !quantityInput) return;

  decreaseBtn.addEventListener('click', () => {
    const current = parseInt(quantityInput.value);
    if (current > 1) quantityInput.value = current - 1;
  });

  increaseBtn.addEventListener('click', () => {
    const current = parseInt(quantityInput.value);
    quantityInput.value = current + 1;
  });
}

function setupAddToCartButton() {
  const addCartBtn = document.getElementById('btn-add-cart-sheet');
  if (!addCartBtn) return;

  addCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const quantityInput = document.querySelector('.quantity-input');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    for (let i = 0; i < quantity; i++) {
      addToCart(CURRENT_BOOK);
    }
    updateNavbar();
    openModal(`${quantity}x "${CURRENT_BOOK.title}" adicionado ao carrinho! 🛒`);
  });
}

export { initDetailsPage };
