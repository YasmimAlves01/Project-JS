import { fetchSteamApi } from "../api/steamApi.js";

export const fetchSteamGame = async (gameName) => {
    const data = await fetchSteamApi("store", "api/storesearch", {
        term: gameName,
        cc: "br",
        l: "portuguese"
    });
    return data.items;
};

export const fetchSteamGameDetails = async (appid) => {
  const data = await fetchSteamApi(
    "store",
    "api/appdetails",
    {
      appids: appid
    }
  );

  return data[appid].data;
};

export const fetchFeaturedCategories = async () => {
  const data = await fetchSteamApi(
    "store",
    "api/featuredcategories",
    {
      cc: "br",
      l: "portuguese"
    }
  );

  return data.top_sellers.items;
};