const BASE_URL = "https://store.steampowered.com/api/appdetails/";
const API_KEY = "1BB5629D80332038A4EBAECACC4E9078";
const CORS_URL = "https://corsproxy.io/?";

const buildSteamUrl = (params = {}) => {
  const url = new URL(BASE_URL);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return CORS_URL + encodeURIComponent(url.toString());
};

const fetchSteamApi = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    console.log(result);
  } catch (error) {
    console.error(error.message);
  }
};