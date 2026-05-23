import { fetchFeaturedCategories } from "../services/steamGames.js";
 
export async function renderGamesEmAlta() {
  const section = document.querySelector("#games-em-alta");
  if (!section) return;
 
  const topSellers = await fetchFeaturedCategories();
 
  topSellers.slice(0, 4).forEach((game, index) => {
    const name = game.name;
    const banner = game.large_capsule_image || game.header_image;
    const storeUrl = `https://store.steampowered.com/app/${game.id}`;
 
    const card = document.createElement("a");
    card.href = storeUrl;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
 
    card.innerHTML = `
      <span class="games-em-alta__ranking">#${index + 1}</span>
      <img src="${banner}" alt="Banner ${name}">
      <h3>${name}</h3>
    `;
 
    section.appendChild(card);
  });
}
