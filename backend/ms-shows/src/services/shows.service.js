const tvmazeClient = require('../clients/tvmaze.client');
const showsRepository = require('../repositories/shows.repository');
const seasonsRepository = require('../repositories/seasons.repository');
const { toShowResponse } = require('../dtos/show.dto');
const { toSeasonListResponse, toSeasonResponse } = require('../dtos/season.dto');
const { toSearchResponse } = require('../dtos/search.dto');
const { toEpisodeListResponse, toEpisodeResponse } = require('../dtos/episode.dto');
const { toCastListResponse } = require('../dtos/cast.dto');

function mapTvmazeShowToDocument(show) {
  return {
    tvmazeId: show.id,
    name: show.name,
    type: show.type,
    language: show.language,
    genres: show.genres || [],
    status: show.status,
    runtime: show.runtime ?? null,
    averageRuntime: show.averageRuntime ?? null,
    premiered: show.premiered ?? null,
    ended: show.ended ?? null,
    officialSite: show.officialSite ?? null,
    rating: {
      average: show.rating?.average ?? null
    },
    image: {
      medium: show.image?.medium ?? null,
      original: show.image?.original ?? null
    },
    summary: show.summary ?? null,
    tvmazeUpdated: show.updated ?? null,
    lastSyncedAt: new Date()
  };
}

function mapTvmazeSeasonToDocument(season, tvmazeShowId) {
  return {
    tvmazeSeasonId: season.id,
    tvmazeShowId: Number(tvmazeShowId),
    number: season.number,
    name: season.name ?? null,
    episodeOrder: season.episodeOrder ?? null,
    premiereDate: season.premiereDate ?? null,
    endDate: season.endDate ?? null,
    image: {
      medium: season.image?.medium ?? null,
      original: season.image?.original ?? null
    },
    summary: season.summary ?? null,
    tvmazeUpdated: season.updated ?? null,
    lastSyncedAt: new Date()
  };
}

async function getShowById(tvmazeId) {
  const numericId = Number(tvmazeId);

  const localShow = await showsRepository.findByTvmazeId(numericId);

  if (localShow) {
    console.log('Show obtenido desde MongoDB');
    return toShowResponse(localShow);
  }

  console.log('Show no encontrado en MongoDB, consultando TVmaze');

  const externalShow = await tvmazeClient.getShowById(numericId);
  const mappedShow = mapTvmazeShowToDocument(externalShow);

  const savedShow = await showsRepository.createShow(mappedShow);

  return toShowResponse(savedShow);
}

async function getSeasonsByShowId(tvmazeId) {
  const numericId = Number(tvmazeId);

  const localSeasons = await seasonsRepository.findByTvmazeShowId(numericId);

  if (localSeasons.length > 0) {
    console.log('Seasons obtenidas desde MongoDB');
    return toSeasonListResponse(localSeasons);
  }

  console.log('Seasons no encontradas en MongoDB, consultando TVmaze');

  const externalSeasons = await tvmazeClient.getSeasonsByShowId(numericId);

  const mappedSeasons = externalSeasons.map(season =>
    mapTvmazeSeasonToDocument(season, numericId)
  );

  const savedSeasons = await seasonsRepository.createManySeasons(mappedSeasons);

  return toSeasonListResponse(savedSeasons);
}

async function getEpisodesByShowId(tvmazeId) {
  const numericId = Number(tvmazeId);
  const episodes = await tvmazeClient.getEpisodesByShowId(numericId);
  return toEpisodeListResponse(episodes, numericId);
}

async function getEpisodesBySeason(tvmazeId, seasonNumber) {
  const numericId = Number(tvmazeId);
  const numericSeason = Number(seasonNumber);

  const episodes = await tvmazeClient.getEpisodesByShowId(numericId);

  const filteredEpisodes = episodes.filter(
    episode => Number(episode.season) === numericSeason
  );

  return toEpisodeListResponse(filteredEpisodes, numericId);
}

async function searchShows(query) {
  const results = await tvmazeClient.searchShows(query);
  return toSearchResponse(results);
}

async function getShowCast(tvmazeId) {
  const numericId = Number(tvmazeId);
  const cast = await tvmazeClient.getShowCast(numericId);
  return toCastListResponse(numericId, cast);
}

async function getEpisodeBySeasonAndNumber(tvmazeId, seasonNumber, episodeNumber) {
  const numericId = Number(tvmazeId);
  const numericSeason = Number(seasonNumber);
  const numericEpisode = Number(episodeNumber);

  const episodes = await tvmazeClient.getEpisodesByShowId(numericId);

  const episode = episodes.find(
    item =>
      Number(item.season) === numericSeason &&
      Number(item.number) === numericEpisode
  );

  if (!episode) {
    const error = new Error('Episodio no encontrado');
    error.status = 404;
    throw error;
  }

  return toEpisodeResponse(episode, numericId);
}

async function getSeasonByNumber(tvmazeId, seasonNumber) {
  const numericId = Number(tvmazeId);
  const numericSeason = Number(seasonNumber);

  const localSeasons = await seasonsRepository.findByTvmazeShowId(numericId);

  if (localSeasons.length > 0) {
    const season = localSeasons.find(
      item => Number(item.number) === numericSeason
    );

    if (season) {
      console.log('Temporada obtenida desde MongoDB');
      return toSeasonResponse(season);
    }
  }

  console.log('Temporada no encontrada en MongoDB, consultando TVmaze');

  const externalSeasons = await tvmazeClient.getSeasonsByShowId(numericId);

  const mappedSeasons = externalSeasons.map(season =>
    mapTvmazeSeasonToDocument(season, numericId)
  );

  if (localSeasons.length === 0 && mappedSeasons.length > 0) {
    await seasonsRepository.createManySeasons(mappedSeasons);
  }

  const season = mappedSeasons.find(
    item => Number(item.number) === numericSeason
  );

  if (!season) {
    const error = new Error('Temporada no encontrada');
    error.status = 404;
    throw error;
  }

  return toSeasonResponse(season);
}

async function getFullShow(tvmazeId) {
  const numericId = Number(tvmazeId);

  const [show, seasons, cast] = await Promise.all([
    getShowById(numericId),
    getSeasonsByShowId(numericId),
    getShowCast(numericId)
  ]);

  return {
    show,
    seasons,
    cast
  };
}

module.exports = {
  getShowById,
  getSeasonsByShowId,
  getEpisodesByShowId,
  getEpisodesBySeason,
  searchShows,
  getShowCast,
  getEpisodeBySeasonAndNumber,
  getSeasonByNumber,
  getFullShow
};