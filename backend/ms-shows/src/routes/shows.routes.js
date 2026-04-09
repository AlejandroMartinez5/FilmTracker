const express = require('express');
const router = express.Router();
const showsController = require('../controllers/shows.controller');

router.get('/search', showsController.searchShows);

router.get(
  '/:tvmazeId/seasons/:seasonNumber/episodes/:episodeNumber',
  showsController.getEpisodeBySeasonAndNumber
);

router.get(
  '/:tvmazeId/seasons/:seasonNumber/episodes',
  showsController.getEpisodesBySeason
);

router.get('/:tvmazeId/seasons/:seasonNumber', showsController.getSeasonByNumber);
router.get('/:tvmazeId/seasons', showsController.getSeasonsByShowId);
router.get('/:tvmazeId/episodes', showsController.getEpisodesByShowId);
router.get('/:tvmazeId/cast', showsController.getShowCast);
router.get('/:tvmazeId/full', showsController.getFullShow);
router.get('/:tvmazeId', showsController.getShowById);

module.exports = router;