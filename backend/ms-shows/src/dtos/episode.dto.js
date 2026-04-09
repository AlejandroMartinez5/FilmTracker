function toEpisodeResponse(episode, tvmazeShowId) {
  return {
    tvmazeShowId: Number(tvmazeShowId),
    tvmazeEpisodeId: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
    type: episode.type ?? null,
    airdate: episode.airdate ?? null,
    airtime: episode.airtime ?? null,
    airstamp: episode.airstamp ?? null,
    runtime: episode.runtime ?? null,
    rating: {
      average: episode.rating?.average ?? null
    },
    image: {
      medium: episode.image?.medium ?? null,
      original: episode.image?.original ?? null
    },
    summary: episode.summary ?? null
  };
}

function toEpisodeListResponse(episodes, tvmazeShowId) {
  return {
    tvmazeShowId: Number(tvmazeShowId),
    episodes: episodes.map(episode => toEpisodeResponse(episode, tvmazeShowId))
  };
}

module.exports = {
  toEpisodeResponse,
  toEpisodeListResponse
};