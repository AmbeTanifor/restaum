const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const currencySchema = new mongoose.Schema({
  currname: {
    type: String,
    required: 'Please provide the name of country!',
    trim: true
  },
  currency: {
    type: String,
    trim: true,
    required: 'Please provide the currency type!'
  }
});

module.exports = mongoose.model('Currency', currencySchema);