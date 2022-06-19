const mongoose = require('mongoose');

const optinSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  asset_id: {
    type: Number,
    required: true,
  },
});

const Optins = mongoose.model('Optin', optinSchema);
module.exports = Optins;
