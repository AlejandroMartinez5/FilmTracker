const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.tvmaze.com',
  timeout: 10000
});

async function getShowById(id) {
  const response = await api.get(`/shows/${id}`);
  return response.data;
}

async function searchShows(query) {
  const response = await api.get('/search/shows', {
    params: { q: query }
  });
  return response.data;
}

async function getShowSeasons(showId) {
  const response = await api.get(`/shows/${showId}/seasons`);
  return response.data;
}

async function getSeasonEpisodes(seasonId) {
  const response = await api.get(`/seasons/${seasonId}/episodes`);
  return response.data;
}

async function getShowCast(showId) {
  const response = await api.get(`/shows/${showId}/cast`);
  return response.data;
}

async function getEpisodesByShowId(showId) {
  const response = await api.get(`/shows/${showId}/episodes`);
  return response.data;
}

async function getSeasonsByShowId(showId) {
  const response = await api.get(`/shows/${showId}/seasons`);
  return response.data;
}


module.exports = {
  getShowById,
  searchShows,
  getShowSeasons,
  getSeasonEpisodes,
  getShowCast,
  getEpisodesByShowId,
  getSeasonsByShowId
};