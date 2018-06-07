const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStoresFr));
router.get('/storesFr', catchErrors(storeController.getStoresFr)); 
router.get('/stores', catchErrors(storeController.getStores));

// Start of route for pagination ++++++++++++++++++++++++++++++++++++++++++++
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/storesFr/page/:page', catchErrors(storeController.getStoresFr));
// End of route for pagination ++++++++++++++++++++++++++++++++++++++++++++


// Start of Adding ie creating new store or udating existing one +++++++++++++
router.post('/add', 
	storeController.upload,
	catchErrors(storeController.resize), 
	catchErrors(storeController.createStore)
	);

router.post('/add/:id', 
	storeController.upload,
	catchErrors(storeController.resize),
	catchErrors(storeController.updateStore));

router.post('/addfr', 
	storeController.upload,
	catchErrors(storeController.resize), 
	catchErrors(storeController.createStoreFr)
	);

router.post('/addfr/:id', 
	storeController.upload,
	catchErrors(storeController.resize),
	catchErrors(storeController.updateStoreFr));
// End of Adding ie creating new store or udating existing one +++++++++++++


// Start of Adding New Restaurants+++++++++++++++++++++++++++++++++++++++++++
router.get('/add', authController.isLoggedIn, catchErrors(authController.verifyCode));
router.get('/addfr', authController.isLoggedInFr, catchErrors(authController.verifyCodeFr));
// End of Adding New Restaurants++++++++++++++++++++++++++++++++++++++++++++++


// Start of Adding New Restaurants+++++++++++++++++++++++++++++++++++++++++++
//*************** ADMINISTRATOR PRIVILEGES *******************************
router.get('/adminAcc', authController.isLoggedIn, authController.adminAccess);
router.get('/adminAccfr', authController.isLoggedInFr, authController.adminAccessFr);
//************************************************************************
router.get('/market/:ga', authController.isLoggedIn, storeController.addStore);// ga stands for give access
router.get('/marketfr/:ga', authController.isLoggedInFr, storeController.addStoreFr);
// End of Adding New Restaurants++++++++++++++++++++++++++++++++++++++++++++++

//Start of route for method of payment ++++++++++++++++++++++++++++++++++++
router.post('/dues', storeController.payChoice); // THIS OPENS THE PAYMENT FORMS BY POST
router.get('/dues', storeController.payChoice); // THIS OPENS THE PAYMENT FORMS BY GET
router.post('/duesfr', storeController.payChoiceFr);
router.get('/duesfr', storeController.payChoiceFr);
router.get('/papalpay/:pp', storeController.paypalPay);
router.get('/papalpayfr/:pp', storeController.paypalPayFr); // pp stands for papal
router.get('/ecard/:ec', storeController.eCard);
router.get('/ecardfr/:ec', storeController.eCardFr); // ec stands for e-card
router.post('/bnk', catchErrors(authController.creditAccount));
router.get('/bnk', authController.purchaseEmail);// This is redirect after purchase email is sent
router.post('/bnkfr', catchErrors(authController.creditAccountFr));
router.get('/bnkfr', authController.purchaseEmailFr);// This is redirect after purchase email is sent
//Start of route for method of payment ++++++++++++++++++++++++++++++++++++

// Start of editting and existing restaurant++++++++++++++++++++++++++++
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/storesfr/:id/edit', catchErrors(storeController.editStoreFr));
// End of editting and existing restaurant++++++++++++++++++++++++++++

// Start of route by Slug +++++++++++++++++++++++++++++++++++++++++++++++
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/storefr/:slug', catchErrors(storeController.getStoreBySlugFr));
// End of route by Slug +++++++++++++++++++++++++++++++++++++++++++++++++

// Start of Routes for Tags +++++++++++++++++++++
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));
router.get('/tagsfr', catchErrors(storeController.getStoresByTagFr));
router.get('/tagsfr/:tag', catchErrors(storeController.getStoresByTagFr));
//End of Routes for Tags +++++++++++++++++++++++++

// Start of Login +++++++++++++++++++++++++++++
router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/loginfr', userController.loginFormFr);
router.post('/loginfr', authController.loginFr);
// End of Login +++++++++++++++++++++++++++++

// Start of Register method++++++++++++++++++
router.get('/register', userController.registerForm);
router.post('/register', 
	userController.validateRegister,
	userController.register,
	authController.login
	);
router.get('/registerfr', userController.registerFormFr);
router.post('/registerfr', 
	userController.validateRegisterFr,
	userController.registerFr,
	authController.loginFr
	);
// End of Register method +++++++++++++++++

//Start of logout++++++++++++++++++++++++++
router.get('/logout', authController.logout);
router.get('/logoutfr', authController.logoutFr);
//End of logout++++++++++++++++++++++++++

// Start of account route++++++++++++++++++++++++++++++++++++++++++++
router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.get('/accountfr', authController.isLoggedInFr, userController.accountFr);
router.post('/accountfr', catchErrors(userController.updateAccountFr));
// End of account route++++++++++++++++++++++++++++++++++++++++++++

//Start of forgot password route+++++++++++++++++++++++++++++++++++++
router.post('/account/forgot', catchErrors(authController.forgot));
router.post('/accountfr/forgotfr', catchErrors(authController.forgotFr));
//End of forgot password route+++++++++++++++++++++++++++++++++++++

//Start of password reset routes+++++++++++++++++++++++++++++++++++++++++++++++++
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', 
	authController.confirmedPasswords, 
	catchErrors(authController.update)
	);
router.get('/accountfr/resetfr/:token', catchErrors(authController.resetFr));
router.post('/accountfr/resetfr/:token', 
	authController.confirmedPasswordsFr, 
	catchErrors(authController.updateFr)
	);
//End of password reset routes+++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/map', storeController.mapPage);
router.get('/mapfr', storeController.mapPageFr);

//Start of Hearts route+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
router.get('/hearts', authController.isLoggedIn, catchErrors(storeController.getHearts));
router.get('/heartsfr', authController.isLoggedInFr, catchErrors(storeController.getHeartsFr));
//End of Hearts route+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.post('/reviews/:id', authController.isLoggedIn, catchErrors(reviewController.addReview));
router.post('/reviewsfr/:id', authController.isLoggedInFr, catchErrors(reviewController.addReviewFr));

// Start of Top Restaurants ++++++++++++++++++++++++++
router.get('/top', catchErrors(storeController.getTopStores));
router.get('/topfr', catchErrors(storeController.getTopStoresFr));
// End of Top Restaurants ++++++++++++++++++++++++++

router.get('/newmenu/:storeId', catchErrors(storeController.addMenu));
router.post('/newmenu/', catchErrors(storeController.createMenu));
router.get('/mls/:amenu', catchErrors(storeController.getMenu));
router.get('/newmenu/:id/edit', catchErrors(storeController.editMenu));
router.post('/newmenu/:id', catchErrors(storeController.updateMenu));
router.post('/currency', catchErrors(storeController.addCurrency));
router.get('/deleteitem/:id/:restauid/delete', catchErrors(storeController.deletFoodItem));


/*
	API
*/

// Start of search api rroute ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
router.get('/api/search', catchErrors(storeController.searchStores));
// End of search api rroute ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Start of route for stores api end point for a cluster of stores ++++++++++++++++++++++
router.get('/api/stores/near', catchErrors(storeController.mapStores));
// End of route for stores api end point for a cluster of stores ++++++++++++++++++++++

// Start of Hearting a store +++++++++++++++++++++++++++++++++++++++++++++++++++
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore));
// // End of Hearting a store +++++++++++++++++++++++++++++++++++++++++++++++++++

module.exports = router;

