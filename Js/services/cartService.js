import { save, get } from './storageService.js';

const CART_KEY = 'bookverse_cart';

function getCart() {
  return get(CART_KEY) || [];
}

function addToCart(book) {
  const cart = getCart();
  const existing = cart.find(item => item.id === book.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...book, quantity: 1 });
  }
  save(CART_KEY, cart);
}

function removeFromCart(bookId) {
  const updated = getCart().filter(item => item.id !== bookId);
  save(CART_KEY, updated);
}

function updateQuantity(bookId, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.id === bookId);
  if (item) {
    item.quantity = quantity;
    save(CART_KEY, cart);
  }
}

function calculateTotal() {
  return getCart().reduce((total, item) => total + item.price * item.quantity, 0);
}

export { getCart, addToCart, removeFromCart, updateQuantity, calculateTotal };
