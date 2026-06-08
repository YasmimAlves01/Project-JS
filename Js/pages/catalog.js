import { searchBooks, sortBooks, getBookFromDb } from '../services/booksService.js';
import { addFavorite, removeFavorite, isFavorite } from '../services/favoritesService.js';
import { addToCart } from '../services/cartService.js';
import { updateNavbar } from '../components/navbar.js';
import { renderBookCard } from '../components/bookCard.js';
import { openModal } from '../components/modal.js';

const BOOKS_PER_PAGE = 9;

const state = {
  allBooks: [],
  filteredBooks: [],
  currentPage: 1,
  searchTerm: '',
  sortBy: 'rating',
  filters: {
    genre: [],
    format: [],
    language: [],
    price: [],
    rating: []
  }
};

async function initCatalogPage() {
  updateNavbar();

  const params = new URLSearchParams(window.location.search);
  state.searchTerm = params.get('search') || 'books';

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = state.searchTerm === 'books' ? '' : state.searchTerm;

  await loadBooks();
  setupSearchForm();
  setupSortListener();
  setupFilterListeners();
  setupResetButton();
}

async function loadBooks() {
  const grid = document.querySelector('.book-grid');
  if (grid) grid.innerHTML = '<p style="padding: 2rem; color: var(--color-text-muted);">Carregando livros...</p>';

  try {
    state.allBooks = await searchBooks(state.searchTerm);
    state.currentPage = 1;
    updateFilterCounts();
    applyFiltersAndRender();
  } catch {
    if (grid) grid.innerHTML = '<p style="padding: 2rem;">Não foi possível carregar os livros. Tente novamente.</p>';
  }
}

function applyFiltersAndRender() {
  let result = [...state.allBooks];

  result = applyFilters(result);
  result = sortBooks(result, state.sortBy);

  state.filteredBooks = result;
  renderResults();
  renderPagination();
}

function applyFilters(books) {
  const { genre, format, language, price, rating } = state.filters;

  if (genre.length > 0) {
    books = books.filter(book => genre.includes(book.genre));
  }

  if (format.length > 0) {
    books = books.filter(book => format.includes(book.format));
  }

  if (language.length > 0) {
    books = books.filter(book => language.includes(book.language));
  }

  if (price.length > 0) {
    books = books.filter(book => {
      return price.some(range => {
        if (range === 'price-under-10') return book.price < 10;
        if (range === 'price-10-20') return book.price >= 10 && book.price <= 20;
        if (range === 'price-20-30') return book.price > 20 && book.price <= 30;
        return false;
      });
    });
  }

  if (rating.length > 0) {
    const minRating = rating.includes('rating-4') ? 4 : 3;
    books = books.filter(book => book.rating >= minRating);
  }

  return books;
}

function renderResults() {
  const grid = document.querySelector('.book-grid');
  const resultsEl = document.querySelector('.results-count');
  if (!grid) return;

  if (resultsEl) {
    resultsEl.innerHTML = `Exibindo <strong>${state.filteredBooks.length}</strong> resultados para <strong>${state.searchTerm}</strong>`;
  }

  if (state.filteredBooks.length === 0) {
    grid.innerHTML = '<p style="padding: 2rem; color: var(--color-text-muted);">Nenhum livro encontrado para os filtros selecionados.</p>';
    return;
  }

  const start = (state.currentPage - 1) * BOOKS_PER_PAGE;
  const end = start + BOOKS_PER_PAGE;
  const pageBooks = state.filteredBooks.slice(start, end);

  grid.innerHTML = pageBooks.map(book => renderBookCard(book)).join('');
  setupCardEvents(grid);
}

function renderPagination() {
  const container = document.querySelector('.pagination');
  if (!container) return;

  const totalPages = Math.ceil(state.filteredBooks.length / BOOKS_PER_PAGE);

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';

  html += `<a href="#" class="page-link ${state.currentPage === 1 ? 'disabled' : ''}" data-page="prev" aria-label="Página Anterior">&laquo;</a>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<a href="#" class="page-link ${state.currentPage === i ? 'active' : ''}" data-page="${i}">${i}</a>`;
  }

  html += `<a href="#" class="page-link ${state.currentPage === totalPages ? 'disabled' : ''}" data-page="next" aria-label="Próxima Página">&raquo;</a>`;

  container.innerHTML = html;

  container.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (link.classList.contains('disabled')) return;

      const page = link.dataset.page;
      if (page === 'prev') state.currentPage--;
      else if (page === 'next') state.currentPage++;
      else state.currentPage = parseInt(page);

      renderResults();
      renderPagination();

      const header = document.querySelector('.catalog-results-header');
      if (header) header.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function updateFilterCounts() {
  const books = state.allBooks;

  document.querySelectorAll('.filter-checkbox').forEach(cb => {
    const filterValue = cb.dataset.filter;
    const countEl = cb.closest('.filter-item')?.querySelector('.filter-item-count');
    if (!countEl || !filterValue) return;

    let count = 0;

    if (filterValue === 'price-under-10') {
      count = books.filter(b => b.price < 10).length;
    } else if (filterValue === 'price-10-20') {
      count = books.filter(b => b.price >= 10 && b.price <= 20).length;
    } else if (filterValue === 'price-20-30') {
      count = books.filter(b => b.price > 20 && b.price <= 30).length;
    } else if (filterValue === 'rating-4') {
      count = books.filter(b => b.rating >= 4).length;
    } else if (filterValue === 'rating-3') {
      count = books.filter(b => b.rating >= 3).length;
    } else {
      count = books.filter(b =>
        b.genre === filterValue || b.format === filterValue || b.language === filterValue
      ).length;
    }

    countEl.textContent = count;
  });
}

function readFiltersFromDOM() {
  state.filters = { genre: [], format: [], language: [], price: [], rating: [] };

  document.querySelectorAll('.filter-section').forEach(section => {
    const type = section.dataset.filterType;
    if (!type || !state.filters[type]) return;

    section.querySelectorAll('.filter-checkbox:checked').forEach(cb => {
      state.filters[type].push(cb.dataset.filter);
    });
  });
}

function setupFilterListeners() {
  document.querySelectorAll('.filter-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      readFiltersFromDOM();
      state.currentPage = 1;
      applyFiltersAndRender();
    });
  });
}

function setupSortListener() {
  const sortSelect = document.getElementById('catalog-sort');
  if (!sortSelect) return;

  state.sortBy = sortSelect.value;

  sortSelect.addEventListener('change', () => {
    state.sortBy = sortSelect.value;
    state.currentPage = 1;
    applyFiltersAndRender();
  });
}

function setupSearchForm() {
  const form = document.getElementById('search-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    if (query) {
      state.searchTerm = query;
      state.currentPage = 1;
      document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
      readFiltersFromDOM();
      await loadBooks();
    }
  });
}

function setupResetButton() {
  const resetBtn = document.getElementById('filter-reset');
  if (!resetBtn) return;

  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
    readFiltersFromDOM();
    state.currentPage = 1;
    applyFiltersAndRender();
  });
}

function setupCardEvents(container) {
  container.querySelectorAll('.favorite-btn-overlay').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.book-card');
      const bookId = btn.dataset.bookId;
      const title = card.querySelector('.book-card-title a').textContent;
      const book = getBookFromDb(bookId);

      if (!book) return; // Fail safe

      if (isFavorite(bookId)) {
        removeFavorite(bookId);
        btn.classList.remove('active');
        openModal(`"${title}" removido dos favoritos.`);
      } else {
        addFavorite(book);
        btn.classList.add('active');
        openModal(`"${title}" adicionado aos favoritos! ♥`);
      }
      updateNavbar();
    });
  });

  container.querySelectorAll('.btn-add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.book-card');
      const title = card.querySelector('.book-card-title a').textContent;
      const bookId = btn.dataset.bookId;
      const book = getBookFromDb(bookId);
      
      if (!book) return;

      addToCart(book);
      updateNavbar();
      openModal(`"${title}" adicionado ao carrinho! 🛒`);
    });
  });
}

export { initCatalogPage };

