const showsService = require('../services/shows.service');

function isInvalidTvmazeId(tvmazeId) {
  return isNaN(tvmazeId) || Number(tvmazeId) <= 0;
}

async function getShowById(req, res) {
  try {
    const { tvmazeId } = req.params;

    if (isInvalidTvmazeId(tvmazeId)) {
      return res.status(400).json({
        message: 'El tvmazeId debe ser numérico y mayor a 0'
      });
    }

    const show = await showsService.getShowById(tvmazeId);

    res.status(200).json(show);
  } catch (error) {
    res.status(error.status || 500).json({
      message: 'Error al obtener la serie',
      error: error.message
    });
  }
}

async function getSeasonsByShowId(req, res) {
  try {
    const { tvmazeId } = req.params;

    if (isInvalidTvmazeId(tvmazeId)) {
      return res.status(400).json({
        message: 'El tvmazeId debe ser numérico y mayor a 0'
      });
    }

    const seasons = await showsService.getSeasonsByShowId(tvmazeId);

    res.status(200).json(seasons);
  } catch (error) {
    res.status(error.status || 500).json({
      message: 'Error al obtener las temporadas',
      error: error.message
    });
  }
}

async function getEpisodesByShowId(req, res) {
  try {
    const { tvmazeId } = req.params;

    if (isInvalidTvmazeId(tvmazeId)) {
      return res.status(400).json({
        message: 'El tvmazeId debe ser numérico y mayor a 0'
      });
    }

    const episodes = await showsService.getEpisodesByShowId(tvmazeId);

    res.status(200).json(episodes);
  } catch (error) {
    res.status(error.status || 500).json({
      message: 'Error al obtener los episodios',
      error: error.message
    });
  }
}

async function searchShows(req, res) {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: 'El parámetro q es obligatorio'
      });
    }

    const results = await showsService.searchShows(q.trim());

    res.status(200).json(results);
  } catch (error) {
    res.status(error.status || 500).json({
      message: 'Error al buscar series',
      error: error.message
    });
  }
}

async function getEpisodesBySeason(req, res) {
  try {
    const { tvmazeId, seasonNumber } = req.params;

    if (isInvalidTvmazeId(tvmazeId)) {
      return res.status(400).json({
        message: 'El tvmazeId debe ser numérico y mayor a 0'
      });
    }

    if (isNaN(seasonNumber) || Number(seasonNumber) <= 0) {
      return res.status(400).json({
        message: 'El seasonNumber debe ser numérico y mayor a 0'
      });
    }

    const episodes = await showsService.getEpisodesBySeason(tvmazeId, seasonNumber);

    res.status(200).json(episodes);
  } catch (error) {
    res.status(error.status || 500).json({
      message: 'Error al obtener los episodios de la temporada',
      error: error.message
    });
  }
}

async function getShowCast(req, res) {
  try {
    const { tvmazeId } = req.params;

    if (isInvalidTvmazeId(tvmazeId)) {
      return res.status(400).json({
        message: 'El tvmazeId debe ser numérico y mayor a 0'
      });
    }

    const cast = await showsService.getShowCast(tvmazeId);

    res.status(200).json(cast);
  } catch (error) {
    res.status(error.status || 500).json({
      message: 'Error al obtener el reparto de la serie',
      error: error.message
    });
  }
}

async function getEpisodeBySeasonAndNumber(req, res) {
  try {
    const { tvmazeId, seasonNumber, episodeNumber } = req.params;

    if (isInvalidTvmazeId(tvmazeId)) {
      return res.status(400).json({
        message: 'El tvmazeId debe ser numérico y mayor a 0'
      });
    }

    if (isNaN(seasonNumber) || Number(seasonNumber) <= 0) {
      return res.status(400).json({
        message: 'El seasonNumber debe ser numérico y mayor a 0'
      });
    }

    if (isNaN(episodeNumber) || Number(episodeNumber) <= 0) {
      return res.status(400).json({
        message: 'El episodeNumber debe ser numérico y mayor a 0'
      });
    }

    const episode = await showsService.getEpisodeBySeasonAndNumber(
      tvmazeId,
      seasonNumber,
      episodeNumber
    );

    res.status(200).json(episode);
  } catch (error) {
    res.status(error.status || 500).json({
      message: 'Error al obtener el episodio',
      error: error.message
    });
  }
}

async function getSeasonByNumber(req, res) {
  try {
    const { tvmazeId, seasonNumber } = req.params;

    if (isInvalidTvmazeId(tvmazeId)) {
      return res.status(400).json({
        message: 'El tvmazeId debe ser numérico y mayor a 0'
      });
    }

    if (isNaN(seasonNumber) || Number(seasonNumber) <= 0) {
      return res.status(400).json({
        message: 'El seasonNumber debe ser numérico y mayor a 0'
      });
    }

    const season = await showsService.getSeasonByNumber(tvmazeId, seasonNumber);

    res.status(200).json(season);
  } catch (error) {
    res.status(error.status || 500).json({
      message: 'Error al obtener la temporada',
      error: error.message
    });
  }
}

async function getFullShow(req, res) {
  try {
    const { tvmazeId } = req.params;

    if (isInvalidTvmazeId(tvmazeId)) {
      return res.status(400).json({
        message: 'El tvmazeId debe ser numérico y mayor a 0'
      });
    }

    const result = await showsService.getFullShow(tvmazeId);

    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: 'Error al obtener el detalle completo',
      error: error.message
    });
  }
}

async function getHome(req, res) {
  try {
    const { limit } = req.query;

    const numericLimit = Number(limit) || 10;

    if (!Number.isInteger(numericLimit) || numericLimit <= 0) {
      return res.status(400).json({
        message: 'El parámetro limit debe ser un número entero mayor a 0'
      });
    }

    const result = await showsService.getHome(numericLimit);

    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: 'Error al obtener el home de series',
      error: error.message
    });
  }
}

async function getShowsByGenre(req, res) {
  try {
    const { genre } = req.params;
    const { limit } = req.query;

    if (!genre || !genre.trim()) {
      return res.status(400).json({
        message: 'El género es obligatorio'
      });
    }

    let numericLimit = Number(limit) || 10;
    const MAX_LIMIT = 20;

    if (!Number.isInteger(numericLimit) || numericLimit <= 0) {
      return res.status(400).json({
        message: 'El parámetro limit debe ser un número entero mayor a 0'
      });
    }

    if (numericLimit > MAX_LIMIT) {
      numericLimit = MAX_LIMIT;
    }

    const result = await showsService.getShowsByGenre(
      genre.trim(),
      numericLimit
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: 'Error al obtener series por género',
      error: error.message
    });
  }
}

module.exports = {
  getShowById,
  getSeasonsByShowId,
  getEpisodesByShowId,
  searchShows,
  getEpisodesBySeason,
  getShowCast,
  getEpisodeBySeasonAndNumber,
  getSeasonByNumber,
  getFullShow,
  getHome,
  getShowsByGenre
};