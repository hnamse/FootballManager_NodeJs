var express = require('express');
var playerRouter = express.Router();
var paginate = require('express-paginate');
const playerController = require('../Controllers/playerController');
const auth = require('../config/auth')

/* GET users listing. */

playerRouter.route('/')
  .get(paginate.middleware(10, 50), playerController.index)
  .post(auth.ensureAuthenticated, auth.isAdmin, playerController.create)

playerRouter.route('/filter')
  .post(playerController.filter)

playerRouter.route('/search')
  .get(playerController.search)

playerRouter.route('/edit/:playerId')
  .get(auth.ensureAuthenticated, auth.isAdmin, playerController.formEdit)
  .post(auth.ensureAuthenticated, auth.isAdmin, playerController.edit)

playerRouter.route('/delete/:playerId')
  .get(auth.ensureAuthenticated, auth.isAdmin, playerController.delete)

module.exports = playerRouter;
