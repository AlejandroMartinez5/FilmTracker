function toCastMemberResponse(item) {
  return {
    person: {
      id: item.person?.id ?? null,
      name: item.person?.name ?? null,
      country: item.person?.country?.name ?? null,
      birthday: item.person?.birthday ?? null,
      image: {
        medium: item.person?.image?.medium ?? null,
        original: item.person?.image?.original ?? null
      }
    },
    character: {
      id: item.character?.id ?? null,
      name: item.character?.name ?? null,
      image: {
        medium: item.character?.image?.medium ?? null,
        original: item.character?.image?.original ?? null
      }
    },
    self: item.self ?? false,
    voice: item.voice ?? false
  };
}

function toCastListResponse(showId, cast = []) {
  return {
    showId: Number(showId),
    cast: cast.map(toCastMemberResponse)
  };
}

module.exports = {
  toCastMemberResponse,
  toCastListResponse
};