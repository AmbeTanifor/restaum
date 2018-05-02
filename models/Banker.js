const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const validator = require('validator');

// Creat the bankng Schema

const bankSchema = new mongoose.Schema({
	nameoncard: {
		type: String,
		required: 'Provide the name on card',
		trim: true
	},
	dateexpire: {
		type: Date,
		required: 'Please provide card expiration date',
		trim: true
	},
	cardnumber: {
		type: Number,
		required: 'You must provide card number'
	},
	paidcode: {
		type: Number,
		unique: true,
		required: 'You must provide the Payment code'
	},
	comingemail: {
		type: String,
		trim: true,
		lowercase: true,
		required: 'You must provide a valid email address'
	},
	securitycode: {
		type: Number,
		required: 'You must provide the 3 or 4 digit security code on card',
		trim: true
	},
	amount: {
		type: Number,
		required: 'You must enter amount'
	}
});

module.exports = mongoose.model('Banker', bankSchema);