const TraineeModel = require('../models/traineeModel');
const OptinModel = require('../models/optinModel');

exports.getTrainees = async (req, res, next) => {
  try {
    const trainees = await TraineeModel.find();
    res.status(200).json({
      status: 'success',
      data: {
        trainees,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.addTrainee = async (req, res, next) => {
  try {
    const trainee = await TraineeModel.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        trainee,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
