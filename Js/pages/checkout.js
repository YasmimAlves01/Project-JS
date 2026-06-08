import { updateNavbar } from '../components/navbar.js';
import { openModal } from '../components/modal.js';
import { save, get, remove } from '../services/storageService.js';
import { getCart, calculateTotal } from '../services/cartService.js';

function initCheckoutPage() {
  updateNavbar();
  renderOrderSummary();
  setupFormValidation();
  setupPaymentMethodToggle();
}

function renderOrderSummary() {
  const cart = getCart();
  const receiptList = document.querySelector('.receipt-items-list');
  const submitBtn = document.getElementById('btn-submit-order');

  if (!receiptList) return;

  if (cart.length === 0) {
    receiptList.innerHTML = '<p style="text-align: center; color: var(--color-text-muted); font-size: 0.9rem;">Seu carrinho está vazio.</p>';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.style.cursor = 'not-allowed';
    }
    return;
  }

  receiptList.innerHTML = '';
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'receipt-item-row';
    row.innerHTML = `
      <span class="receipt-item-name">${item.title} <span>x ${item.quantity}</span></span>
      <span class="receipt-item-price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
    `;
    receiptList.appendChild(row);
  });

  const subtotal = calculateTotal();
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
}

function setupFormValidation() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const errors = validateForm(form);
    clearAllErrors(form);

    if (errors.length > 0) {
      errors.forEach(({ fieldId, message }) => showFieldError(fieldId, message));
      openModal('Por favor, corrija os campos destacados.', 'error');
      return;
    }

    processOrder(form);
  });

  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => clearFieldError(input));
  });
}

function validateForm(form) {
  const errors = [];

  const requiredFields = [
    { id: 'shipping-first-name', label: 'Nome' },
    { id: 'shipping-last-name', label: 'Sobrenome' },
    { id: 'shipping-address', label: 'Endereço' },
    { id: 'shipping-city', label: 'Cidade' },
    { id: 'shipping-zip', label: 'CEP' },
  ];

  requiredFields.forEach(({ id, label }) => {
    const field = document.getElementById(id);
    if (!field || !field.value.trim()) {
      errors.push({ fieldId: id, message: `${label} é obrigatório.` });
    }
  });

  const selectedPayment = form.querySelector('.payment-radio:checked');
  const paymentLabel = selectedPayment?.closest('.payment-method-card')?.querySelector('.payment-name')?.textContent;

  if (paymentLabel === 'Cartão de Crédito') {
    const ccNumber = document.getElementById('cc-number');
    const ccExpiry = document.getElementById('cc-expiry');
    const ccCvv = document.getElementById('cc-cvv');

    if (!ccNumber?.value.trim() || ccNumber.value.replace(/\s/g, '').length < 13) {
      errors.push({ fieldId: 'cc-number', message: 'Número do cartão inválido.' });
    }
    if (!ccExpiry?.value.trim() || !/^\d{2}\/\d{2}$/.test(ccExpiry.value)) {
      errors.push({ fieldId: 'cc-expiry', message: 'Data de validade inválida (MM/AA).' });
    }
    if (!ccCvv?.value.trim() || ccCvv.value.length < 3) {
      errors.push({ fieldId: 'cc-cvv', message: 'CVV inválido.' });
    }
  }

  return errors;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.style.borderColor = '#c0392b';

  const errorEl = document.createElement('span');
  errorEl.className = 'field-error-msg';
  errorEl.style.cssText = 'display: block; color: #c0392b; font-size: 0.8rem; margin-top: 4px;';
  errorEl.textContent = message;

  const parent = field.closest('.form-group');
  if (parent) parent.appendChild(errorEl);
}

function clearFieldError(input) {
  input.style.borderColor = '';
  const parent = input.closest('.form-group');
  if (parent) {
    const errorMsg = parent.querySelector('.field-error-msg');
    if (errorMsg) errorMsg.remove();
  }
}

function clearAllErrors(form) {
  form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
  form.querySelectorAll('.form-input').forEach(input => {
    input.style.borderColor = '';
  });
}

function processOrder(form) {
  const submitBtn = document.getElementById('btn-submit-order');
  if (submitBtn) {
    submitBtn.textContent = 'Processando...';
    submitBtn.disabled = true;
  }

  setTimeout(() => {
    const cart = getCart();
    if (cart.length > 0) {
      const subtotal = calculateTotal();
      const hasCoupon = sessionStorage.getItem('bookverse_coupon') === 'LEITURACOZY';
      const discount = hasCoupon ? subtotal * 0.10 : 0;
      const shipping = subtotal >= 35 ? 0 : 4.99;
      const total = subtotal - discount + shipping;
      const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

      const order = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('pt-BR'),
        items: cart,
        total: total,
        itemCount: itemCount
      };

      const orders = get('bookverse_orders') || [];
      orders.unshift(order);
      save('bookverse_orders', orders);
    }

    remove('bookverse_cart');
    updateNavbar();

    const firstName = document.getElementById('shipping-first-name')?.value || 'Leitor';
    openModal(`Pedido confirmado, ${firstName}! Você receberá um e-mail em breve. 📦`);

    if (submitBtn) {
      submitBtn.textContent = 'Pedido Confirmado! ✓';
      submitBtn.style.background = '#7a9e6e';
    }

    setTimeout(() => {
      window.location.href = 'profile.html#orders-history';
    }, 2500);
  }, 1500);
}

function setupPaymentMethodToggle() {
  const radios = document.querySelectorAll('.payment-radio');
  const cardFields = document.getElementById('credit-card-fields-group');
  if (!radios.length || !cardFields) return;

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      const label = radio.closest('.payment-method-card')?.querySelector('.payment-name')?.textContent;
      cardFields.style.display = label === 'Cartão de Crédito' ? 'block' : 'none';

      document.querySelectorAll('.payment-method-card').forEach(card => card.classList.remove('selected'));
      radio.closest('.payment-method-card')?.classList.add('selected');
    });
  });
}

export { initCheckoutPage };
