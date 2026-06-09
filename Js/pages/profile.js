import { updateNavbar } from '../components/navbar.js';
import { openModal } from '../components/modal.js';
import { save, get } from '../services/storageService.js';

const PROFILE_KEY = 'bookverse_profile';

function initProfilePage() {
  updateNavbar();
  loadProfileData();
  renderOrderHistory();
  setupProfileForm();
  setupSidebarNavigation();
  loadAddresses();
  setupAddAddress();
  setupAddressActions();
  highlightActiveSection();
}

function loadProfileData() {
  const saved = get(PROFILE_KEY);
  if (!saved) return;

  const firstNameEl = document.getElementById('profile-first-name');
  const lastNameEl = document.getElementById('profile-last-name');
  const emailEl = document.getElementById('profile-email');
  const phoneEl = document.getElementById('profile-phone');

  if (firstNameEl) firstNameEl.value = saved.firstName || firstNameEl.value;
  if (lastNameEl) lastNameEl.value = saved.lastName || lastNameEl.value;
  if (emailEl) emailEl.value = saved.email || emailEl.value;
  if (phoneEl) phoneEl.value = saved.phone || phoneEl.value;

  updateSidebarName(saved.firstName, saved.lastName, saved.email);
}

function renderOrderHistory() {
  const container = document.getElementById('orders-list');
  if (!container) return;

  const orders = get('bookverse_orders') || [];

  if (orders.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.95rem; margin-top: 1rem;">Você ainda não realizou nenhuma compra.</p>';
    return;
  }

  container.innerHTML = orders.map(order => `
    <article class="order-card" style="border: 1px solid var(--color-border-linen); border-radius: 8px; padding: var(--spacing-md); margin-bottom: var(--spacing-md); background: #fff;">
      <p style="font-weight: 700; margin-bottom: 8px; color: var(--color-text-charcoal);">Pedido realizado em ${order.date}</p>
      <p style="color: var(--color-text-muted); margin-bottom: 4px;">${order.itemCount} ${order.itemCount === 1 ? 'livro' : 'livros'}</p>
      <p style="font-weight: 600; color: var(--color-primary); margin-bottom: 16px;">Total: R$ ${order.total.toFixed(2)}</p>
      
      <details style="cursor: pointer; user-select: none;">
        <summary style="color: var(--color-accent); font-weight: 600; list-style: none;">[Ver detalhes]</summary>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--color-border-linen);">
          ${order.items.map(item => `
            <div style="margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px;">
              <span style="font-weight: 600; color: var(--color-text-charcoal);">${item.title}</span>
              <span style="font-size: 0.85rem; color: var(--color-text-muted);">Qtd: ${item.quantity}</span>
              <span style="font-size: 0.85rem; font-weight: 500;">R$ ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      </details>
    </article>
  `).join('');
}

function setupProfileForm() {
  const form = document.getElementById('profile-details-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('profile-first-name')?.value.trim();
    const lastName = document.getElementById('profile-last-name')?.value.trim();
    const email = document.getElementById('profile-email')?.value.trim();
    const phone = document.getElementById('profile-phone')?.value.trim();

    if (!firstName || !email) {
      openModal('Nome e e-mail são obrigatórios.', 'error');
      return;
    }

    save(PROFILE_KEY, { firstName, lastName, email, phone });
    updateSidebarName(firstName, lastName, email);
    openModal('Perfil salvo com sucesso! ✓');
  });

  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => highlightFieldGroup(input));
    input.addEventListener('blur', () => removeHighlightFromGroup(input));
  });
}

function highlightFieldGroup(input) {
  const group = input.closest('.form-group');
  if (!group) return;

  const label = group.querySelector('.form-label');
  if (label) label.style.color = 'var(--color-accent, #7a9e6e)';

  const nextGroup = group.nextElementSibling;
  if (nextGroup && nextGroup.classList.contains('form-group')) {
    nextGroup.style.opacity = '0.6';
  }

  const parentRow = group.closest('.form-row');
  if (parentRow) {
    const siblings = parentRow.querySelectorAll('.form-group');
    siblings.forEach(sibling => {
      if (sibling !== group) sibling.style.opacity = '0.7';
    });
  }
}

function removeHighlightFromGroup(input) {
  const group = input.closest('.form-group');
  if (!group) return;

  const label = group.querySelector('.form-label');
  if (label) label.style.color = '';

  const nextGroup = group.nextElementSibling;
  if (nextGroup) nextGroup.style.opacity = '';

  const parentRow = group.closest('.form-row');
  if (parentRow) {
    parentRow.querySelectorAll('.form-group').forEach(sibling => {
      sibling.style.opacity = '';
    });
  }
}

function updateSidebarName(firstName, lastName, email) {
  const nameEl = document.querySelector('.profile-user-name');
  const emailEl = document.querySelector('.profile-user-email');
  const avatarEl = document.querySelector('.profile-avatar-mock');

  if (nameEl && firstName) nameEl.textContent = `${firstName} ${lastName || ''}`.trim();
  if (emailEl && email) emailEl.textContent = email;
  if (avatarEl && firstName) {
    const initials = `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
    avatarEl.textContent = initials;
  }
}

function setupSidebarNavigation() {
  const navLinks = document.querySelectorAll('.profile-nav-link');

  navLinks.forEach(link => {
    if (link.id === 'profile-nav-logout') return;

    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      e.preventDefault();

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const targetId = href.replace('#', '');
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const parent = targetSection.parentElement;
        const allSections = parent.querySelectorAll('.profile-section-block');

        allSections.forEach(section => {
          if (section !== targetSection) {
            section.style.opacity = '0.5';
            section.style.transition = 'opacity 0.3s ease';
          }
        });

        targetSection.style.opacity = '1';
        targetSection.style.outline = '2px solid var(--color-accent, #7a9e6e)';
        targetSection.style.outlineOffset = '8px';
        targetSection.style.borderRadius = '8px';

        setTimeout(() => {
          allSections.forEach(section => section.style.opacity = '');
          targetSection.style.outline = '';
          targetSection.style.outlineOffset = '';
        }, 2000);
      }
    });
  });
}

const ADDRESSES_KEY = 'bookverse_addresses';

function loadAddresses() {
  const grid = document.getElementById('address-grid');
  const emptyMsg = document.getElementById('no-addresses-msg');
  if (!grid) return;

  let addresses = get(ADDRESSES_KEY) || [];
  grid.innerHTML = '';

  let needsSave = false;
  addresses = addresses.map((addr, index) => {
    if (!addr.id) {
      addr.id = 'addr_' + Date.now() + '_' + index;
      needsSave = true;
    }
    return addr;
  });

  if (needsSave) {
    save(ADDRESSES_KEY, addresses);
  }

  if (addresses.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
  } else {
    if (emptyMsg) emptyMsg.style.display = 'none';

    addresses.forEach((addr, index) => {
      const card = document.createElement('article');
      card.className = index === 0 ? 'address-card default' : 'address-card';
      card.dataset.id = addr.id;

      const defaultBadge = index === 0 ? '<span class="address-badge-default">Padrão</span>' : '';

      card.innerHTML = `
        ${defaultBadge}
        <p class="address-card-name">${addr.name}</p>
        <p class="address-card-text">${addr.text.replace(/\n/g, '<br>')}</p>
        <div class="address-card-actions">
          <button type="button" class="address-edit-btn" style="background: none; border: none; padding: 0; font: inherit; cursor: pointer; color: inherit; text-decoration: underline;">Editar</button>
          <span style="color: var(--color-border-linen-hover);">|</span>
          <button type="button" class="address-remove-btn" style="background: none; border: none; padding: 0; font: inherit; cursor: pointer; color: var(--color-text-muted); text-decoration: underline;">Remover</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }
}

function setupAddAddress() {
  const btnAdd = document.getElementById('btn-add-address');
  const form = document.getElementById('add-address-form');
  const btnCancel = document.getElementById('btn-cancel-address');
  const grid = document.getElementById('address-grid');

  if (!btnAdd || !form) return;

  btnAdd.addEventListener('click', () => {
    form.style.display = 'block';
    btnAdd.style.display = 'none';
    if (grid) grid.style.display = 'none';
  });

  btnCancel.addEventListener('click', () => {
    form.reset();
    form.style.display = 'none';
    btnAdd.style.display = 'block';
    if (grid) grid.style.display = 'grid';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('new-address-name');
    const textInput = document.getElementById('new-address-text');

    if (!nameInput || !textInput || !nameInput.value.trim() || !textInput.value.trim()) {
      openModal('Preencha todos os campos do endereço.', 'error');
      return;
    }

    const addresses = get(ADDRESSES_KEY) || [];
    const newAddress = {
      id: 'addr_' + Date.now(),
      name: nameInput.value.trim(),
      text: textInput.value.trim()
    };

    addresses.push(newAddress);
    save(ADDRESSES_KEY, addresses);

    form.reset();
    form.style.display = 'none';
    btnAdd.style.display = 'block';
    if (grid) grid.style.display = 'grid';

    loadAddresses();
    openModal('Endereço adicionado com sucesso! 🏡');
  });
}

function setupAddressActions() {
  const addressGrid = document.getElementById('address-grid');
  if (!addressGrid) return;

  addressGrid.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.address-edit-btn');
    const removeBtn = e.target.closest('.address-remove-btn');

    if (editBtn) {
      e.preventDefault();
      handleEditAddress(editBtn);
    }

    if (removeBtn) {
      e.preventDefault();
      handleRemoveAddress(removeBtn);
    }
  });
}

function handleEditAddress(link) {
  const card = link.closest('.address-card');
  const cardId = card.dataset.id;

  const nameEl = card.querySelector('.address-card-name');
  const textEl = card.querySelector('.address-card-text');
  const actionsDiv = card.querySelector('.address-card-actions');

  if (card.classList.contains('editing')) {
    const inputsContainer = card.querySelector('.edit-inputs-container');
    const nameInput = inputsContainer.querySelector('input');
    const textInput = inputsContainer.querySelector('textarea');

    const newName = nameInput.value.trim();
    const newText = textInput.value.trim();

    if (!newName || !newText) {
      openModal('Preencha ambos os campos.', 'error');
      return;
    }

    const addresses = get(ADDRESSES_KEY) || [];
    const target = addresses.find(a => String(a.id) === String(cardId));
    if (target) {
      target.name = newName;
      target.text = newText;
      save(ADDRESSES_KEY, addresses);
    }

    loadAddresses();
    openModal('Endereço atualizado! 🏡');
    return;
  }

  card.classList.add('editing');

  const currentName = nameEl.textContent;
  const currentText = textEl.innerHTML.replace(/<br\s*[\/]?>/gi, '\n');

  nameEl.style.display = 'none';
  textEl.style.display = 'none';

  const container = document.createElement('div');
  container.className = 'edit-inputs-container';
  container.style.marginBottom = '12px';

  const editName = document.createElement('input');
  editName.type = 'text';
  editName.className = 'form-input';
  editName.value = currentName;
  editName.style.marginBottom = '8px';

  const editText = document.createElement('textarea');
  editText.className = 'form-input';
  editText.rows = 3;
  editText.value = currentText;

  container.appendChild(editName);
  container.appendChild(editText);

  card.insertBefore(container, actionsDiv);
  editName.focus();
  link.textContent = 'Salvar';
}

function handleRemoveAddress(link) {
  const card = link.closest('.address-card');
  const cardId = card.dataset.id;
  const nameEl = card.querySelector('.address-card-name');
  const name = nameEl ? nameEl.textContent : 'Endereço';

  card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  card.style.opacity = '0';
  card.style.transform = 'scale(0.95)';

  setTimeout(() => {
    let addresses = get(ADDRESSES_KEY) || [];
    addresses = addresses.filter(a => String(a.id) !== String(cardId));
    save(ADDRESSES_KEY, addresses);

    loadAddresses();
    openModal(`Endereço de ${name} removido.`);
  }, 300);
}

function highlightActiveSection() {
  const hash = window.location.hash;
  if (!hash) return;

  const targetId = hash.replace('#', '');
  const targetSection = document.getElementById(targetId);
  if (!targetSection) return;

  setTimeout(() => {
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const matchingNav = document.querySelector(`.profile-nav-link[href="${hash}"]`);
    if (matchingNav) {
      document.querySelectorAll('.profile-nav-link').forEach(l => l.classList.remove('active'));
      matchingNav.classList.add('active');
    }
  }, 300);
}

export { initProfilePage };
