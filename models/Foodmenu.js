const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const foodmenuSchema = new mongoose.Schema({
  category: {
    type: String,
    required: 'Please provide the food category!',
    trim: true
  },
	itemname: {
		type: String,
		trim: true,
		required: 'Please enter a name for the menu item!'
	},
	description: {
    type: String,
    trim: true,
    required: 'Please provide a short description of the menu item!'
  },
  measurement: {
  	type: String,
  	trim: true,
  	required: 'Please provide the quanty of the item served!'
  },
  price: {
  	type: Number,
  	trim: true,
  	required: 'Please let your customers know the price!'
  },
  currsymbol: {
    type: String,
    trim: true,
    required: 'Please provide the currency type!'
  },
  restauid: {
  	type: String,
  	trim: true,
  	required: 'You must provide the Restaurant Name!'
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply the owner of the restaurant with this menu item!'
  }
});

module.exports = mongoose.model('Foodmenu', foodmenuSchema);