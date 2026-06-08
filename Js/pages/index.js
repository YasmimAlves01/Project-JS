import { getFeaturedBooks, getBookFromDb } from '../services/booksService.js';
import { addFavorite, removeFavorite, isFavorite } from '../services/favoritesService.js';
import { addToCart } from '../services/cartService.js';
import { updateNavbar } from '../components/navbar.js';
import { renderBookCard } from '../components/bookCard.js';
import { openModal } from '../components/modal.js';

async function initHomePage() {
  updateNavbar();
  setupNewsletterForm();
  setupStaticCardEvents();

  const grid = document.querySelector('#home-curated-reads .book-grid');
  if (!grid) return;

  try {
    const books = await getFeaturedBooks();
    if (books.length > 0) {
      grid.innerHTML = books.map(book => renderBookCard(book, 'pages/')).join('');
      setupDynamicCardEvents(grid);
    }
  } catch {
    setupStaticCardEvents();
  }
}

function setupDynamicCardEvents(container) {
  container.querySelectorAll('.favorite-btn-overlay').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const bookId = btn.dataset.bookId;
      const card = btn.closest('.book-card');
      const title = card.querySelector('.book-card-title a').textContent;
      
      const book = getBookFromDb(bookId);
      if (!book) return; // Fail safe

      if (isFavorite(bookId)) {
        removeFavorite(bookId);
        btn.classList.remove('active');
        btn.setAttribute('aria-label', 'Adicionar aos Favoritos');
        openModal(`"${title}" removido dos favoritos.`);
      } else {
        addFavorite(book);
        btn.classList.add('active');
        btn.setAttribute('aria-label', 'Remover dos Favoritos');
        openModal(`"${title}" adicionado aos favoritos! ♥`);
      }
      updateNavbar();
    });
  });

  container.querySelectorAll('.btn-add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
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

function setupStaticCardEvents() {
  const staticButtons = document.querySelectorAll('.favorite-btn-overlay');
  staticButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      updateNavbar();
    });
  });
}

function setupNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    openModal(`Obrigado! ${emailInput.value} inscrito com sucesso. 📚`);
    emailInput.value = '';
  });
}

export { initHomePage };
