const page = document.body.dataset.page;

async function bootstrap() {
  if (page === 'home') {
    const { initHomePage } = await import('./pages/index.js');
    initHomePage();
  } else if (page === 'catalog') {
    const { initCatalogPage } = await import('./pages/catalog.js');
    initCatalogPage();
  } else if (page === 'details') {
    const { initDetailsPage } = await import('./pages/details.js');
    initDetailsPage();
  } else if (page === 'favorites') {
    const { initFavoritesPage } = await import('./pages/favorites.js');
    initFavoritesPage();
  } else if (page === 'cart') {
    const { initCartPage } = await import('./pages/cart.js');
    initCartPage();
  } else if (page === 'checkout') {
    const { initCheckoutPage } = await import('./pages/checkout.js');
    initCheckoutPage();
  } else if (page === 'profile') {
    const { initProfilePage } = await import('./pages/profile.js');
    initProfilePage();
  }
}

bootstrap();
