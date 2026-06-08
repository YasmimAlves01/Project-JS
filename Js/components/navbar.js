import { getFavorites } from '../services/favoritesService.js';
import { getCart } from '../services/cartService.js';

function updateNavbar() {
  const favoritesBadge = document.getElementById('favorites-badge');
  const cartBadge = document.getElementById('cart-badge');

  if (favoritesBadge) {
    favoritesBadge.textContent = getFavorites().length;
  }

  if (cartBadge) {
    const totalItems = getCart().reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
  }
}

export { updateNavbar };
