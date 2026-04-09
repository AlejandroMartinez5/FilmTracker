function toSeasonResponse(season) {
  return {
    tvmazeSeasonId: season.tvmazeSeasonId ?? season.id,
    tvmazeShowId: season.tvmazeShowId ?? season.tvmazeShowId,
    number: season.number,
    name: season.name ?? null,
    episodeOrder: season.episodeOrder ?? null,
    premiereDate: season.premiereDate ?? season.premiered ?? null,
    endDate: season.endDate ?? season.ended ?? null,
    image: {
      medium: season.image?.medium ?? null,
      original: season.image?.original ?? null
    },
    summary: season.summary ?? null
  };
}

function toSeasonListResponse(seasons) {
  return {
    seasons: seasons.map(toSeasonResponse)
  };
}

module.exports = {
  toSeasonResponse,
  toSeasonListResponse
};