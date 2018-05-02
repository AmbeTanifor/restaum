const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const Banker = mongoose.model('Banker');
const Payment = mongoose.model('Payment');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

// Start of Log in Method +++++++++++++++++++

exports.login = passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Failed Login',
	successRedirect: '/stores',
	successFlash: 'You are now logged in!'
});

exports.loginFr = passport.authenticate('local', {
	failureRedirect: '/loginfr',
	failureFlash: 'Échec de la connexion',
	successRedirect: '/',
	successFlash: 'Vous ête connecté!'
});
// Start of Log in Method +++++++++++++++++++

//Start of ogout method+++++++++++++++++++++++++++++++++
exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You are now logged out!');
	res.redirect('/stores');
};
exports.logoutFr = (req, res) => {
	req.logout();
	req.flash('success', 'Vous êtes maintenant déconnecté!');
	res.redirect('/');
};
//End of ogout method+++++++++++++++++++++++++++++++++

// Start of check if user is logged in ++++++++++++++
exports.isLoggedIn = (req, res, next) => {
	// First check if the user is authenticated
	if(req.isAuthenticated()){
		next(); // Carry on! They are logged in!
		return;
	}
	req.flash('error', 'Oops you must be logged in to Continue');
	res.redirect('/login')
};

exports.isLoggedInFr = (req, res, next) => {
	// First check if the user is authenticated
	if(req.isAuthenticated()){
		next(); // Carry on! They are logged in!
		return;
	}
	req.flash('error', 'Oops Vous devez être connecté pour Continuer');
	res.redirect('/loginfr')
};
// End of check if user is logged in ++++++++++++++


// Start of payments to Bank Account+++++++++++++++++++++++++++++++++++++
exports.creditAccount = async (req, res) => {
	
	const dateCount = new Date();
	//const thisuser = await User.findOne({_id: req.user._id} )
	const user = req.user.email;
	const payment = new Payment({paidcode: req.body.paidcode, amountpaid: req.body.amount});
	const paidcode = req.body.paidcode;

	const banker = new Banker(req.body);
	banker.comingemail = user;
	await banker.save();

	
	payment.created = new Date();
	payment.owner = req.user._id;
	payment.startday = dateCount.getUTCDate();
	payment.startmonth = dateCount.getUTCMonth() + 1;
	payment.startyear = dateCount.getUTCFullYear();
	payment.endday = dateCount.getUTCDate();
	payment.endmonth = dateCount.getUTCMonth() + 1;
	payment.endyear = dateCount.getUTCFullYear() + 1;

	
	const datasaved = await payment.save();
	if(!datasaved){
		req.flash('error', 'Payment Data was not saved correctly, please try again!');
		return res.redirect('/stores')
	}
	
	await mail.sendpaid({
		user,
		subject: 'Purchase Was Successful',
		paidcode: payment.paidcode,
		filename: 'account-credited',
	});

	req.flash('success', `You have been sent an email with an Access code to registrer your Restaurant!`);
	res.redirect('/bnk');
};
exports.creditAccountFr = async (req, res) => {
	
	const dateCount = new Date();
	//const thisuser = await User.findOne({_id: req.user._id} )
	const user = req.user.email;
	const payment = new Payment({paidcode: req.body.paidcode, amountpaid: req.body.amount});
	const paidcode = req.body.paidcode;

	const banker = new Banker(req.body);
	banker.comingemail = user;
	await banker.save();

	
	payment.created = new Date();
	payment.owner = req.user._id;
	payment.startday = dateCount.getUTCDate();
	payment.startmonth = dateCount.getUTCMonth() + 1;
	payment.startyear = dateCount.getUTCFullYear();
	payment.endday = dateCount.getUTCDate();
	payment.endmonth = dateCount.getUTCMonth() + 1;
	payment.endyear = dateCount.getUTCFullYear() + 1;

	
	const datasaved = await payment.save();
	if(!datasaved){
		req.flash('error', "Les données de paiement n'ont pas été enregistrées correctement. Veuillez réessayer.!");
		return res.redirect('/stores')
	}
	
	await mail.sendpaid({
		user,
		subject: "L'achat a été réussi!",
		paidcode: payment.paidcode,
		filename: 'account-credited',
	});

	req.flash('success', `Vous avez reçu un e-mail avec un code d'accès pour enregistrer votre restaurant!`);
	res.redirect('/bnkfr');
};
// End of payments to Bank Account+++++++++++++++++++++++++++++++++++++

// Start of confirming email sent to customer after account is credited+++++++++
exports.purchaseEmail = async (req, res) => {
	res.render('codeorpayment', {title: 'Account credited'});
};
exports.purchaseEmailFr = async (req, res) => {
	res.render('codeorpayment_fr', {title: 'Compte crédité'});
};
// End of confirming email sent to customer after account is credited+++++++++++

// End of verify Access Code++++++++++++++++++++++++++++++++++++++++++++++
exports.verifyCode = async (req, res) => {
	const user = req.user._id;
	const userExists = await Payment.findOne({owner: user}); // VERIFY IF USER EXIST IN PAYMENT COLLECTION

	if (userExists){
	const accesscode = userExists.paidcode;
	const payCode = await Store.findOne({ codeowner: accesscode});
		if (payCode){
		req.flash('error', 'Sorry! This credit has been used. If you intend to register another Restaurant or take-away shop, make a new subscription.');
		res.redirect('/dues');
				
		}else{
			return res.redirect(`/market/${accesscode}`);
		} 	

	}else{
			req.flash('error', 'Sorry! You need to make a payment to set up your Restaurant/Store.');
		return res.redirect('/dues'); 
	}



};
exports.verifyCodeFr = async (req, res) => {
	const user = req.user._id;
	const trueCode = await Payment.findOne({ paidcode: req.body.accesscode, owner: user});
	const bankCode = await Store.findOne({ codeowner: req.body.accesscode});
	if (trueCode){
	if (bankCode){
		req.flash('error', "Désolé! Ce crédit a été utilisé. Si vous avez l'intention d'enregistrer un autre restaurant ou magasin à emporter, faites un nouvel abonnement.");
		res.redirect('/duesfr');
		
	}else{
		return res.redirect(`/marketfr/${req.body.accesscode}`);
		}
	}else{
		req.flash('error', "Désolé! Ce code est invalide. Veuillez vérifier votre code et réessayer ou effectuer un paiement si vous ne l'avez pas fait");
		return res.redirect('/bnkfr');
	}
	
	
};
// End of verify Access Code++++++++++++++++++++++++++++++++++++++++++++++

// Start of forgot password+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
exports.forgot = async (req, res) => {
	// 1. See if a user with that email exists
	const user = await User.findOne({ email: req.body.email });
	if(!user) {
		req.flash('error', 'No account with that email exists.');
		return res.redirect('/login');
	}
	// 2. Set the reset token and expiry on their account
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 36000000; // 1 hour to reset password
	await user.save(); // Just wait till the user is saved 
	// 3. Send them an email with the token
	const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
	await mail.send({
		user,
		subject: 'Password Reset',
		resetURL,
		filename: 'password-reset'
	})

	req.flash('success', `You have been sent a password reset link.`);
	// 4. redirect to login page
	res.redirect('/login');
};
exports.forgotFr = async (req, res) => {
	// 1. See i a user with that email exists
	const user = await User.findOne({ email: req.body.email });
	if(!user) {
		req.flash('error', "Aucun compte avec cet email n'existe.");
		return res.redirect('/loginfr');
	}
	// 2. Set the reset token and expiry on their account
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 36000000; // 1 hour to reset password
	await user.save(); // Just wait till the user is saved 
	// 3. Send them an email with the token
	const resetURL = `http://${req.headers.host}/accountfr/resetfr/${user.resetPasswordToken}`;
	await mail.send({
		user,
		subject: 'Réinitialiser le mot de passe',
		resetURL,
		filename: 'password-reset'
	})

	req.flash('success', `Vous avez reçu un lien de réinitialisation de mot de passe.`);
	// 4. redirect to login page
	res.redirect('/loginfr');
};
// End of forgot password+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Start of reset password Method+++++++++++++++++++++++++++++++++++++++++++++++++++
exports.reset = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {$gt: Date.now()}
	});
	if(!user){
		req.flash('error', 'password reset is invalid or has expired');
		return res.redirect('/login');
	}
	// But if there is a user, show the reset password form
	res.render('reset', {title: 'Reset your Password'});
};
exports.resetFr = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {$gt: Date.now()}
	});
	if(!user){
		req.flash('error', 'la réinitialisation du mot de passe est invalide ou a expiré');
		return res.redirect('/loginfr');
	}
	// But if there is a user, show the reset password form
	res.render('reset_fr', {title: 'Réinitialisez votre mot de passe'});
};
// End of reset password Method+++++++++++++++++++++++++++++++++++++++++++++++++++

// Start of confirm password ++++++++++++++++++++++++++++++++++++++++++++
exports.confirmedPasswords = async (req, res, next) => {
	if (req.body.password === req.body['confirm-password']) {
		next();
		return;
	}
	req.flash('error', 'Passwords do not match!');
	res.redirect('back');
};
exports.confirmedPasswordsFr = async (req, res, next) => {
	if (req.body.password === req.body['confirm-password']) {
		next();
		return;
	}
	req.flash('error', 'Les mots de passe ne correspondent pas!');
	res.redirect('back');
};
// End of confirm password ++++++++++++++++++++++++++++++++++++++++++++

// Start of update password++++++++++++++++++++++++++++++++++++++++++++
exports.update = async (req, res) => { 
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {$gt: Date.now()}
	});
	if(!user){
		req.flash('error', 'password reset is invalid or has expired');
		return res.redirect('/login');
	}

	const setPassword = promisify(user.setPassword, user);
	await setPassword(req.body.password);
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	const updatedUser = await user.save();
	await req.login(updatedUser);
	req.flash('success', 'Nice! Your password has been reset! You are now logged in!');
	res.redirect('/');
};
exports.updateFr = async (req, res) => { 
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {$gt: Date.now()}
	});
	if(!user){
		req.flash('error', 'la réinitialisation du mot de passe est invalide ou a expiré');
		return res.redirect('/loginfr');
	}

	const setPassword = promisify(user.setPassword, user);
	await setPassword(req.body.password);
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	const updatedUser = await user.save();
	await req.login(updatedUser);
	req.flash('success', 'Super! Votre mot de passe a été réinitialisé! Vous êtes maintenant connecté!');
	res.redirect('/');
};
// End of update password++++++++++++++++++++++++++++++++++++++++++++
