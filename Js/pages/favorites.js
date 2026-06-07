import { getFavorites, removeFavorite, addFavorite } from '../services/favoritesService.js';
import { addToCart } from '../services/cartService.js';
import { updateNavbar } from '../components/navbar.js';
import { openModal } from '../components/modal.js';

function initFavoritesPage() {
  updateNavbar();
  renderFavoritesList();
}

function renderFavoritesList() {
  const grid = document.querySelector('.book-grid');
  if (!grid) return;

  const favorites = getFavorites();

  updateHeaderCount(favorites.length);

  if (favorites.length === 0) {
    grid.innerHTML = buildEmptyState();
    return;
  }

  grid.innerHTML = '';

  favorites.forEach(book => {
    const card = createFavoriteCard(book);
    grid.appendChild(card);
  });
}

function buildEmptyState() {
  return `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
      <p style="font-size: 1.2rem; color: var(--color-text-muted); margin-bottom: 1rem;">Sua lista de desejos está vazia.</p>
      <a href="catalog.html" class="btn btn-primary">Explorar o Catálogo</a>
    </div>
  `;
}

function createFavoriteCard(book) {
  const card = document.createElement('article');
  card.className = 'book-card';
  card.dataset.bookId = book.id;

  card.innerHTML = `
    <div class="book-card-cover">
      <a href="details.html?id=${book.id}">
        <div class="book-cover-css ${book.coverTheme || 'cover-theme-2'}" aria-hidden="true">
          <span class="cover-emblem">${book.emblem || '📖'}</span>
          <div class="cover-title-text">${book.title}</div>
          <div class="cover-author-text">${book.author}</div>
        </div>
      </a>
    </div>
    <span class="book-card-genre">${book.genre || 'Favorito'}</span>
    <h3 class="book-card-title"><a href="details.html?id=${book.id}">${book.title}</a></h3>
    <p class="book-card-author">de ${book.author}</p>
    <div class="book-card-meta">
      <div class="rating-stars" aria-label="Avaliação: ${book.rating || 0} de 5 estrelas">
        ★★★★★ <span class="rating-count">(${book.ratingsCount || 0})</span>
      </div>
      <span class="book-card-price">R$ ${book.price.toFixed(2)}</span>
      <div class="favorites-actions-row">
        <button class="btn btn-primary btn-sm btn-move-to-cart" data-book-id="${book.id}">🛒 Mover para o Carrinho</button>
        <button class="remove-favorite-btn" aria-label="Remover ${book.title} da lista de desejos" data-book-id="${book.id}">✕</button>
      </div>
    </div>
  `;

  setupCardEvents(card, book);
  return card;
}

function setupCardEvents(card, book) {
  const removeBtn = card.querySelector('.remove-favorite-btn');
  const moveCartBtn = card.querySelector('.btn-move-to-cart');

  removeBtn.addEventListener('click', () => {
    removeFavorite(book.id);

    const grid = removeBtn.closest('.book-grid');
    card.remove();

    const remaining = grid.querySelectorAll('.book-card').length;
    updateHeaderCount(remaining);

    if (remaining === 0) {
      grid.innerHTML = buildEmptyState();
    }

    updateNavbar();
    openModal(`"${book.title}" removido dos favoritos.`);
  });

  moveCartBtn.addEventListener('click', () => {
    addToCart(book);
    removeFavorite(book.id);

    const grid = moveCartBtn.closest('.book-grid');
    card.remove();

    const remaining = grid.querySelectorAll('.book-card').length;
    updateHeaderCount(remaining);

    if (remaining === 0) {
      grid.innerHTML = buildEmptyState();
    }

    updateNavbar();
    openModal(`"${book.title}" movido para o carrinho! 🛒`);
  });
}

function updateHeaderCount(count) {
  const countEl = document.querySelector('.favorites-header-title strong');
  if (countEl) {
    countEl.textContent = count;
  }

  const subtitle = document.querySelector('.favorites-header-title span');
  if (subtitle) {
    subtitle.textContent = `Você tem ${count} ${count === 1 ? 'joia literária' : 'joias literárias'} esperando por uma xícara de chá quente.`;
  }
}

export { initFavoritesPage };
