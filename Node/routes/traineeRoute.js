const express = require('express');

const traineeController = require('../controllers/traineeController');

const router = express.Router();

router
  .route('/')
  .get(traineeController.getTrainees)
  .post(traineeController.addTrainee);

module.exports = router;
