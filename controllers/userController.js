const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

//Start of Log in form ++++++++++++++++

exports.loginForm = (req, res) => {
	res.render('login', {title: 'Login Form'});
};

exports.loginFormFr = (req, res) => {
	res.render('login_fr', {title: 'Formulaire de connexion'});
};

// End of Log iN fORM ++++++++++++++++

// Start of User Registration +++++++++++++++

exports.registerForm = (req, res) => {
	res.render('register', { title: 'Register' });
};

exports.registerFormFr = (req, res) => {
	res.render('register_fr', { title: 'Inscrivez' });
};

// End of User Registration +++++++++++++++

// Start of User Registration Validation ++++++++++++++++++

exports.validateRegister = (req, res, next) => {
	req.sanitizeBody('name');
	req.checkBody('name', 'You need to provide a name!').notEmpty();
	req.checkBody('email', 'The Email you provided is not valid').isEmail();
	req.sanitizeBody('email').normalizeEmail({
		remove_dots: false,
		remove_extension: false,
		gmail_remove_subaddress: false
	});
	req.checkBody('password', 'Password field cannot be empty').notEmpty();
	req.checkBody('password-confirm', 'Confirm password cannot be empty!').notEmpty();
	req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

	const errors = req.validationErrors();
	if (errors) {
		req.flash('error', errors.map(err => err.msg));
		res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
		return; // Stop the function from running
	}
	next(); // There were no errors!
};

exports.validateRegisterFr = (req, res, next) => {
	req.sanitizeBody('name');
	req.checkBody('name', 'Vous devez fournir un nom!').notEmpty();
	req.checkBody('email', "L'e-mail que vous avez fourni n'est pas valide").isEmail();
	req.sanitizeBody('email').normalizeEmail({
		remove_dots: false,
		remove_extension: false,
		gmail_remove_subaddress: false
	});
	req.checkBody('password', 'Le champ de mot de passe ne peut pas être vide').notEmpty();
	req.checkBody('password-confirm', 'Confirmer le mot de passe ne peut pas être vide!').notEmpty();
	req.checkBody('password-confirm', 'Non! Vos mots de passe ne correspondent pas').equals(req.body.password);

	const errors = req.validationErrors();
	if (errors) {
		req.flash('error', errors.map(err => err.msg));
		res.render('register_fr', { title: 'Inscrivez', body: req.body, flashes: req.flash() });
		return; // Stop the function from running
	}
	next(); // There were no errors!
};
// End of User Registration Validation ++++++++++++++++++

// Start of New User Registration ++++++++++++++++++++++
exports.register = async (req, res, next) => {
	const user = new User({ email: req.body.email, name: req.body.name });
	const register = promisify(User.register, User);
	await register(user, req.body.password);
	next();
};

exports.registerFr = async (req, res, next) => {
	const user = new User({ email: req.body.email, name: req.body.name });
	const register = promisify(User.register, User);
	await register(user, req.body.password);
	next();
};
// End of New User Registration ++++++++++++++++++++++

//Start of account Edit method+++++++++++++++++++++++++++++
exports.account = (req,res) => {
	res.render('account', {title: 'Edit Your Account'});
};
exports.accountFr = (req,res) => {
	res.render('account_fr', {title: 'Modifier votre compte'});
};
//End of account edit method+++++++++++++++++++++++++++++

// Start of Account Update method ++++++++++++++++++++++++
exports.updateAccount = async (req, res) => {
	const updates = {
		name: req.body.name,
		email: req.body.email
	};

	const user = await User.findOneAndUpdate(
			{ _id: req.user._id},
			{ $set: updates },
			{ new: true, runValidators: true, context: 'query' }
		);
	
		req.flash('success', 'Updated the profile');
		res.redirect('back');
};
exports.updateAccountFr = async (req, res) => {
	const updates = {
		name: req.body.name,
		email: req.body.email
	};

	const user = await User.findOneAndUpdate(
			{ _id: req.user._id},
			{ $set: updates },
			{ new: true, runValidators: true, context: 'query' }
		);

		req.flash('success', 'Mise à jour du profil')
		res.redirect('back');

};
// End of Account Update method ++++++++++++++++++++++++