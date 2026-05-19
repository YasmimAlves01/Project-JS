const BASE_URL = "https://store.steampowered.com/api/";
const API_KEY = "1BB5629D80332038A4EBAECACC4E9078";
const CORS_URL = "https://corsproxy.io/?";

const buildSteamUrl = (endpoint, params = {}) => {
    const url = new URL(BASE_URL + endpoint);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    return CORS_URL + encodeURIComponent(url.toString());
};

const fetchSteamApi = async (endpoint, params = {}) => {
    try {
        const url = buildSteamUrl(endpoint, params);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(error);
    }
};