import { fetchSteamApi } from "../api/steamApi.js";

//id do meu perfil para testes: 76561199234001677
export const fetchSteamProfile = async (id) => {
    const data = await fetchSteamApi("api", "ISteamUser/GetPlayerSummaries/v2/", {
        key: "1BB5629D80332038A4EBAECACC4E9078",
        steamids: id
    });
    return data.response.players;
};