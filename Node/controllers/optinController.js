const TraineeModel = require('../models/traineeModel');
const OptinModel = require('../models/optinModel');

exports.getOptins = async (req, res, next) => {
  try {
    const optins = await OptinModel.find();
    res.status(200).json({
      status: 'success',
      data: {
        optins,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.optin = async (req, res, next) => {
  try {
    const optinExists = await OptinModel.findOne({ email: req.body.email });
    if (optinExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already opted in',
      });
    }
    const optin = await OptinModel.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        optin,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
