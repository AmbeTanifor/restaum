const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const paySchema = new mongoose.Schema({

	paidcode: {
		type: Number,
		unique: true,
		trim: true,
		required: 'You must provide your payment code'
	},
	owner: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'You must supply an owner'
	},
	created: {
		type: Date,
		default: Date.now
	},
	amountpaid: {
		type: Number,
		reguired: 'Provide the amount'
	},

	startday: {
		type: Number,
		reguired: 'Provide the start day'
	},
	startmonth: {
		type: Number,
		reguired: 'Provide the start month'
	},
	startyear: {
		type: Number,
		reguired: 'Provide the start year'
	},
	endday: {
		type: Number,
		reguired: 'Provide the end day'
	},
	endmonth: {
		type: Number,
		reguired: 'Provide the end month'
	},
	endyear: {
		type: Number,
		reguired: 'Provide the end year'
	}
});

module.exports = mongoose.model('Payment', paySchema);