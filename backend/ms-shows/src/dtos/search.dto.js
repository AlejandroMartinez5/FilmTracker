function normalizeEmptyString(value) {
  if (value === '') return null;
  return value ?? null;
}

function toSearchShowResponse(show) {
  return {
    tvmazeId: show.id ?? show.tvmazeId,
    name: normalizeEmptyString(show.name),
    type: normalizeEmptyString(show.type),
    language: normalizeEmptyString(show.language),
    genres: show.genres || [],
    status: normalizeEmptyString(show.status),
    runtime: show.runtime ?? null,
    averageRuntime: show.averageRuntime ?? null,
    premiered: normalizeEmptyString(show.premiered),
    ended: normalizeEmptyString(show.ended),
    officialSite: normalizeEmptyString(show.officialSite),
    rating: {
      average: show.rating?.average ?? null
    },
    image: {
      medium: show.image?.medium ?? null,
      original: show.image?.original ?? null
    },
    summary: normalizeEmptyString(show.summary),
    tvmazeUpdated: show.updated ?? show.tvmazeUpdated ?? null
  };
}

function toSearchResponse(results) {
  return results.map(item => ({
    score: item.score,
    show: toSearchShowResponse(item.show)
  }));
}

module.exports = {
  toSearchShowResponse,
  toSearchResponse
};