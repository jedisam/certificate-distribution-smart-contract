const mongoose = require('mongoose');

const traineeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  mint: {
    type: String,
    default: 'Mint',
  },
});

const TraineeData = mongoose.model('trainee', traineeSchema);
module.exports = TraineeData;
