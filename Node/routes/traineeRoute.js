const express = require('express');

const traineeController = require('../controllers/traineeController');
const optinController = require('../controllers/optinController');

const router = express.Router();

router
  .route('/')
  .get(traineeController.getTrainees)
  .post(traineeController.addTrainee);

router
  .route('/optin')
  .get(optinController.getOptins)
  .post(optinController.optin)
  .delete(optinController.removeOptin);

module.exports = router;
