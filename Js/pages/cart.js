import { getCart, removeFromCart, updateQuantity, calculateTotal } from '../services/cartService.js';
import { updateNavbar } from '../components/navbar.js';
import { openModal } from '../components/modal.js';

const SHIPPING_THRESHOLD = 35;
const SHIPPING_COST = 4.99;
const TAX_RATE = 0.08;

function initCartPage() {
  updateNavbar();
  renderCartFromStorage();
  setupCouponButton();
}

function renderCartFromStorage() {
  const cart = getCart();
  const container = document.querySelector('.cart-items-container');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="padding: 3rem; text-align: center;">
        <p style="color: var(--color-text-muted); margin-bottom: 1rem; font-size: 1.1rem;">Seu carrinho está vazio.</p>
        <a href="catalog.html" class="btn btn-primary">Explorar o Catálogo</a>
      </div>
    `;
    updateSummary(0, 0);
    return;
  }

  container.innerHTML = '';
  cart.forEach(item => {
    const el = createCartItemElement(item);
    container.appendChild(el);
  });

  updateSummary(calculateTotal(), cart.length);
}

function createCartItemElement(item) {
  const article = document.createElement('article');
  article.className = 'cart-item';
  article.dataset.bookId = item.id;

  article.innerHTML = `
    <div class="cart-item-cover-wrapper">
      <div class="book-cover-css ${item.coverTheme || 'cover-theme-2'}" aria-hidden="true">
        <span class="cover-emblem">${item.emblem || '📖'}</span>
        <div class="cover-title-text" style="font-size: 0.5rem; margin-top: 5px;">${item.title}</div>
        <div class="cover-author-text" style="font-size: 0.4rem; margin-bottom: 2px;">${item.author}</div>
      </div>
    </div>
    <div class="cart-item-info">
      <h2 class="cart-item-title"><a href="details.html?id=${item.id}">${item.title}</a></h2>
      <p class="cart-item-author">de ${item.author}</p>
      <span class="cart-item-meta">Formato: Capa Dura em Linho</span>
    </div>
    <span class="cart-item-price-unit">R$ ${item.price.toFixed(2)}</span>
    <div class="quantity-selector cart-item-qty" aria-label="Ajustar quantidade">
      <button class="quantity-btn" aria-label="Diminuir quantidade">-</button>
      <input type="text" class="quantity-input" value="${item.quantity}" readonly aria-label="Quantidade de itens">
      <button class="quantity-btn" aria-label="Aumentar quantidade">+</button>
    </div>
    <span class="cart-item-price-subtotal">R$ ${(item.price * item.quantity).toFixed(2)}</span>
    <button class="cart-item-remove-btn" aria-label="Remover ${item.title} do carrinho">✕</button>
  `;

  setupItemEvents(article, item);
  return article;
}

function setupItemEvents(article, item) {
  const decreaseBtn = article.querySelector('[aria-label="Diminuir quantidade"]');
  const increaseBtn = article.querySelector('[aria-label="Aumentar quantidade"]');
  const quantityInput = article.querySelector('.quantity-input');
  const subtotalEl = article.querySelector('.cart-item-price-subtotal');
  const removeBtn = article.querySelector('.cart-item-remove-btn');

  decreaseBtn.addEventListener('click', () => {
    const current = parseInt(quantityInput.value);
    if (current <= 1) return;
    const newQty = current - 1;
    quantityInput.value = newQty;
    updateQuantity(item.id, newQty);
    subtotalEl.textContent = `R$ ${(item.price * newQty).toFixed(2)}`;
    updateSummary(calculateTotal(), getCart().length);
    updateNavbar();
  });

  increaseBtn.addEventListener('click', () => {
    const newQty = parseInt(quantityInput.value) + 1;
    quantityInput.value = newQty;
    updateQuantity(item.id, newQty);
    subtotalEl.textContent = `R$ ${(item.price * newQty).toFixed(2)}`;
    updateSummary(calculateTotal(), getCart().length);
    updateNavbar();
  });

  removeBtn.addEventListener('click', () => {
    removeFromCart(item.id);
    article.remove();
    const remaining = getCart();
    updateSummary(calculateTotal(), remaining.length);
    updateNavbar();

    if (remaining.length === 0) {
      const container = document.querySelector('.cart-items-container');
      if (container) {
        container.innerHTML = '<div style="padding: 3rem; text-align: center;"><p style="color: var(--color-text-muted);">Seu carrinho está vazio.</p><a href="catalog.html" class="btn btn-primary" style="margin-top:1rem;">Explorar o Catálogo</a></div>';
      }
    }

    openModal(`"${item.title}" removido do carrinho.`);
  });
}

function updateSummary(subtotal, itemCount) {
  const SHIPPING_THRESHOLD = 35;
  const SHIPPING_COST = 4.99;
  
  const hasCoupon = sessionStorage.getItem('bookverse_coupon') === 'LEITURACOZY';
  const discount = hasCoupon ? subtotal * 0.10 : 0;
  
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal - discount + shipping;

  const subtotalEl = document.querySelector('#summary-subtotal span:last-child');
  const shippingEl = document.querySelector('#summary-shipping span:last-child');
  const discountRow = document.getElementById('summary-discount');
  const discountEl = document.querySelector('#summary-discount span:last-child');
  const totalEl = document.querySelector('#summary-total span:last-child');

  if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2)}`;
  
  if (discountRow && discountEl) {
    if (hasCoupon && subtotal > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = `-R$ ${discount.toFixed(2)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }
  
  if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2)}`;

  const subtotalLabel = document.querySelector('.summary-row span:first-child');
  if (subtotalLabel) {
    subtotalLabel.textContent = `Subtotal do Carrinho (${itemCount} ${itemCount === 1 ? 'livro' : 'livros'})`;
  }

  const progressText = document.querySelector('.shipping-progress-text');
  if (progressText) {
    if (subtotal >= SHIPPING_THRESHOLD) {
      progressText.innerHTML = 'Parabéns! Você ganhou <strong>FRETE GRÁTIS</strong>! 🎉';
    } else {
      const remaining = (SHIPPING_THRESHOLD - subtotal).toFixed(2);
      progressText.innerHTML = `Adicione mais <strong>R$ ${remaining}</strong> para frete <strong>GRÁTIS</strong>!`;
    }
  }

  const progressFill = document.querySelector('.shipping-progress-fill');
  if (progressFill) {
    const percent = Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100);
    progressFill.style.width = `${percent}%`;
  }
}

function setupCouponButton() {
  const btn = document.getElementById('btn-apply-coupon');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const couponInput = document.getElementById('coupon-code');
    const code = couponInput ? couponInput.value.trim().toUpperCase() : '';
    if (code === 'LEITURACOZY') {
      sessionStorage.setItem('bookverse_coupon', code);
      openModal('Cupom LEITURACOZY aplicado! 10% de desconto. 🍵');
      const cart = getCart();
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      updateSummary(subtotal, cart.length);
    } else {
      sessionStorage.removeItem('bookverse_coupon');
      openModal('Cupom inválido. Tente LEITURACOZY.', 'error');
      const cart = getCart();
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      updateSummary(subtotal, cart.length);
    }
  });
}

export { initCartPage };
