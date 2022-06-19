const mongoose = require('mongoose');

const traineeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  numRows: {
    type: Number,
    required: true,
    default: 0,
  },
  storage: {
    type: String,
    required: true,
  },
  containerName: {
    type: String,
    required: true,
  },
});

const QueryData = mongoose.model('QueryData', traineeSchema);
module.exports = QueryData;
