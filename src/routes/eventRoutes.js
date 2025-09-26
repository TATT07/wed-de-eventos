// eventRoutes.js
const express = require('express');

module.exports = function(controller) {
  const router = express.Router();

  router.get('/', controller.list); // GET /api/events
  router.get('/organizers/ranking', controller.organizers); // GET /api/events/organizers/ranking
  router.get('/:id', controller.get); // GET /api/events/:id
  router.post('/', controller.create); // POST /api/events
  router.post('/:id/comments', controller.addComment); // POST /api/events/:id/comments

  return router;
}
