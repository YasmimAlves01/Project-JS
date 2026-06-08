import { isFavorite } from '../services/favoritesService.js';

function renderBookCard(book, basePath = '') {
  const isActive = isFavorite(book.id) ? 'active' : '';
  const favoriteLabel = isActive ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos';

  return `
    <article class="book-card" data-book-id="${book.id}">
      <button class="favorite-btn-overlay ${isActive}" aria-label="${favoriteLabel}" data-book-id="${book.id}">♥</button>
      <figure class="book-card-cover">
        <a href="${basePath}details.html?id=${book.id}">
          <div class="book-cover-css ${book.coverTheme}" aria-hidden="true">
            <span class="cover-emblem">${book.emblem}</span>
            <div class="cover-title-text">${book.title}</div>
            <div class="cover-author-text">${book.author}</div>
          </div>
        </a>
      </figure>
      <span class="book-card-genre">${book.genre}</span>
      <h3 class="book-card-title"><a href="${basePath}details.html?id=${book.id}">${book.title}</a></h3>
      <p class="book-card-author">de ${book.author}</p>
      <div class="book-card-meta">
        <div class="rating-stars" aria-label="Avaliação: ${book.rating} de 5 estrelas">
          ★★★★★ <span class="rating-count">(${book.ratingsCount})</span>
        </div>
        <div class="book-card-bottom">
          <span class="book-card-price">R$ ${book.price.toFixed(2)}</span>
          <button class="btn btn-primary btn-sm btn-add-to-cart" data-book-id="${book.id}" aria-label="Adicionar ao Carrinho: ${book.title}">🛒 Adicionar</button>
        </div>
      </div>
    </article>
  `;
}

export { renderBookCard };
