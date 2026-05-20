const BASES = {
    store: "https://store.steampowered.com/",
    api: "https://api.steampowered.com/",
};
const CORS_URL = "https://corsproxy.io/?";


const buildUrl = (base, endpoint, params = {}) => {
    const url = new URL(base + endpoint);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    return CORS_URL + encodeURIComponent(url.toString());
};

export const fetchSteamApi = async (baseKey, endpoint, params = {}) => {
    try {
        const url = buildUrl(BASES[baseKey], endpoint, params);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(error);
    }
};