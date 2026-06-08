import { save, get } from './storageService.js';

const FAVORITES_KEY = 'bookverse_favorites';

function getFavorites() {
  return get(FAVORITES_KEY) || [];
}

function isFavorite(bookId) {
  return getFavorites().some(book => book.id === bookId);
}

function addFavorite(book) {
  const favorites = getFavorites();
  if (!isFavorite(book.id)) {
    favorites.push(book);
    save(FAVORITES_KEY, favorites);
  }
}

function removeFavorite(bookId) {
  const updated = getFavorites().filter(book => book.id !== bookId);
  save(FAVORITES_KEY, updated);
}

export { getFavorites, isFavorite, addFavorite, removeFavorite };
