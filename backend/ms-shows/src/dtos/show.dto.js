function toShowResponse(show) {
  return {
    tvmazeId: show.tvmazeId,
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
    tvmazeUpdated: show.tvmazeUpdated ?? null,
    lastSyncedAt: show.lastSyncedAt ?? null
  };
}

module.exports = {
  toShowResponse
};