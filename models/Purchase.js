const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

// Creat the bankng Schema

const bankSchema = new mongoose.Schema({
	nameoncard: {
		type: String,
		required: 'Provide the name on card',
		trim: true
	},
	dateexpire: {
		type: Date,
		required: "Please provide card's expiration date",
		trim: true
	},
	cardnumber: {
		type: Number,
		required: 'You must provide card number',
	},
	email: {
		type: String,
		unique: true,
		lowercase: true,
		required: 'You must provide a valid email address'
	},
	customer: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'You must provide a valid email address'
	},
	securitycode: {
		type: Number,
		required: 'You must provide the 3 or 4 digit security code on card',
		trim: true
	},
	amount:{
		type: Number,
		required: 'You must enter amount'
	}
});

module.exports = mongoose.model('Banker', bankSchema);