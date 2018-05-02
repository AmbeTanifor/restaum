const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const Foodmenu = mongoose.model('Foodmenu');
const Currency = mongoose.model('Currency');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
	storage: multer.memoryStorage(),
	//fileFilter: function(req, res, next)
	// Can use the shorthand ES6 method syntax because fileFilter
	//  is using a real function you can delet function keyword and column so
	fileFilter(req, file, next){
		const isPhoto = file.mimetype.startsWith('image/');
		if(isPhoto){
			next(null, true);
		}else{
			next({ message: 'That filetype isn\'t allowed!'}, false);
		}
	}
};


exports.homePage = (req, res) => {
	
	res.render('index');
};

/*
// Start of Payment Access Code +++++++++++++++++++++++++++++++++++++++++++++++++++++
exports.makePayment = (req, res) => {
	res.render('codeorpayment', {title: 'Payment Authentication'});
};
exports.makePaymentFr = (req, res) => {
	res.render('codeorpayment_fr', {title: 'Authentification de paiement'});
};  
// End of Payment Access Code +++++++++++++++++++++++++++++++++++++++++++++++++++++ */

// Start of choosing payment method++++++++++++++++++++++++++++++++++++++
exports.payChoice = (req, res) => {
		res.render('creditchoice', {title: 'Payment Method'});
};
exports.payChoiceFr = (req, res) => {
	res.render('creditchoice_fr', {title: 'Mode De Paiement'})
};
exports.paypalPay = (req, res) => {
	const pp = req.params.pp;
	res.render('creditchoice', {title: 'Payment Method', pp: pp});
};
exports.paypalPayFr = (req, res) => {
	const pp = req.params.pp;
	res.render('creditchoice_fr', {title: 'Mode de paiement', pp: pp});
};
exports.eCard = (req, res) => {
	const ec = req.params.ec;
	res.render('creditchoice', {title: 'Payment Method', ec: ec});
};
exports.eCardFr = (req, res) => {
	const ec = req.params.ec;
	res.render('creditchoice_fr', {title: 'Mode de paiement', ec: ec});
};
// End of choosing payment method++++++++++++++++++++++++++++++++++++++


//Start of rendering the Add Restaurant form Method++++++++++++++++++++++
exports.addStore = (req, res) => {
	
	res.render('editStore', {title: 'Add A Restaurant', accessCode: req.params.ga});
};

exports.addStoreFr = (req, res) => {
	
	res.render('editStore_fr', {title: 'Ajouter Un Restaurant', accessCode: req.params.ga});
};
//End of rendering the Add Restaurant form Method++++++++++++++++++++++++


// uplod and resize are only one version not English and french +++++++++
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
	//Check if there is no new file to resize

	if(!req.file){
		// if none, Skip to the next middleware
		next();
		return;
	}
	const extension = req.file.mimetype.split('/')[1];
	req.body.photo = `${uuid.v4()}.${extension}`;
	// now we resize
	const photo = await jimp.read(req.file.buffer);
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);
	// Once we have written the photo to our file system, keep going!
	next();
};
// End of uplod and resize++++++++++++++++++++++++++++++++++++++++++++++

// Start of Creating a New Store +++++++++++++++++++++++++++++++++++++++
exports.createStore = async (req, res) => {
	req.body.author = req.user._id;
	
	const store = await(new Store(req.body)).save();
	
	req.flash('success', `successfully Created ${store.name}. Care to leave a review?`);

	res.redirect(`/store/${store.slug}`);
};
exports.createStoreFr = async (req, res) => {
	req.body.author = req.user._id;
	
	const store = await(new Store(req.body)).save();
	
	req.flash('success', `${store.name} a été créé avec succès. Voulez-vous laisser un commentaire?`);

	res.redirect(`/storefr/${store.slug}`);
};
// End of Creating a New Store +++++++++++++++++++++++++++++++++++++++++

// START OF GET STORES ++++++++++++++++++++++++++++++++++++++++++++++++++++

exports.getStoresFr = async (req, res) => {
	const page = req.params.page || 1;
	const limit = 6;
	const skip = (page * limit) - limit;

	// 1. Before render or show the stores on page, we need to Query the database for a list of all stores
	const storesPromise = Store
	.find()
	.skip(skip)
	.limit(limit)
	.sort({ created: 'desc' })
	const countPromise = Store.count();

	const [stores, count] = await Promise.all([storesPromise, countPromise]);
	const pages = Math.ceil(count / limit);
	if (!stores.length && skip) {
		req.flash('info', `Attention! Vous avez demandé une page ${page}. Mais ça n'existe pas. Alors je vous mets à la page ${pages}.`);
		res.redirect(`/storesFr/page/${pages}`);
		// Then return from this so that render does not execute
		return;
	}

	res.render('stores_fr', { title: 'Votre Restaurants prefere', stores: stores, page, pages, count });
};

exports.getStores = async (req, res) => {
	const page = req.params.page || 1;
	const limit = 6;
	const skip = (page * limit) - limit;

	// 1. Before render or show the stores on page, we need to Query the database for a list of all stores
	const storesPromise = Store
	.find()
	.skip(skip)
	.limit(limit)
	.sort({ created: 'desc' })
	const countPromise = Store.count();

	const [stores, count] = await Promise.all([storesPromise, countPromise]);
	const pages = Math.ceil(count / limit);
	if (!stores.length && skip) {
		req.flash('info', `Attention! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}.`);
		res.redirect(`/stores/page/${pages}`);
		// Then return from this so that render does not execute
		return;
	}

	res.render('stores', { title: 'Your Favorite Restaurants', stores: stores, page, pages, count });
};
// END OF GET STORES++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const confirmOwner = (store, user) => {
	if(!store.author.equals(user._id)){
		throw Error('You must own a store in order to edit it!');
	}
};

// Start of Editting an existing restaurant Method+++++++++++++++++++++++++++++++++++
exports.editStore = async (req, res) => {
	// 1. Find the store given the ID
	const store = await Store.findOne({_id: req.params.id});
	// 2. Confirm they are owner of the store
	confirmOwner(store, req.user);
	// 3. Render out the edit form so the user cqn update their store
	res.render('editStore', {title: `Edit ${store.name}`, store: store })

};
exports.editStoreFr = async (req, res) => {
	// 1. Find the store given the ID
	const store = await Store.findOne({_id: req.params.id});
	// 2. Confirm they are owner of the store
	confirmOwner(store, req.user);
	// 3. Render out the edit form so the user cqn update their store
	res.render('editStore_fr', {title: `Modifier ${store.name}`, store: store })

};
// End of Editting an existing restaurant Method+++++++++++++++++++++++++++++++++++

// Start of Updating the Store++++++++++++++++++++++++++++++++++++++++++++++++++++++
exports.updateStore = async (req, res) => {
	// set location data to be a point
	req.body.location.type = 'Point';
	// Find and update store
	const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
	new: true, // return the new store instead of the old one
	runValidators: true
	}).exec();
	req.flash('success', `Successfully udated <strong>${store.name}</strong>. <a href="/store/${store.slug}">View Restaurant > </a> `);
	res.redirect(`/stores/${store._id}/edit`);

	// Redirect them to store and tell them it worked
};
exports.updateStoreFr = async (req, res) => {
	// set location data to be a point
	req.body.location.type = 'Point';
	// Find and update store
	const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
	new: true, // return the new store instead of the old one
	runValidators: true
	}).exec();
	req.flash('success', `Mise à jour réussie sur <strong>${store.name}</strong>. <a href="/storefr/${store.slug}">Voir Restaurant > </a> `);
	res.redirect(`/storesfr/${store._id}/edit`);

	// Redirect them to store and tell them it worked
};
// End of Updating the Store++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// //Start of Getting a store by slug+++++++++++++++++++++++++++++++++++++++++++++++++++++
exports.getStoreBySlug = async (req, res, next) => {
	// Query the database for the specific store
	const store = await Store.findOne({ slug: req.params.slug}).populate('author reviews');
	if (!store) return next();
	res.render('store', {store, titlle: store.name});
};
exports.getStoreBySlugFr = async (req, res, next) => {
	// Query the database for the specific store
	const store = await Store.findOne({ slug: req.params.slug}).populate('author reviews');
	if (!store) return next();
	res.render('store_fr', {store, titlle: store.name});
};
//End of Getting a store by slug+++++++++++++++++++++++++++++++++++++++++++++++++++++

// Start of Get Stores By Tags ++++++++++++++++++++++++

exports.getStoresByTag = async (req, res) => {
	const tag = req.params.tag;
	const tagQuery = tag || { $exists: true}
	const tagsPromise = Store.getTagsList();
	const storesPromise = Store.find({ tags:  tagQuery});
	const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
	
	res.render('tag', { tags, title: 'Tags', tag, stores });
};

exports.getStoresByTagFr = async (req, res) => {
	const tag = req.params.tag;
	const tagQuery = tag || { $exists: true}
	const tagsPromise = Store.getTagsList();
	const storesPromise = Store.find({ tags:  tagQuery});
	const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
	
	res.render('tag_fr', { tags, title: 'Tags', tag, stores });
};
// End of Get Stores By Tags ++++++++++++++++++++++++

exports.searchStores = async (req, res) => {
	const stores = await Store
	// First find stores that match
	.find({
		$text: {
			$search: req.query.q
		}
	}, {
		score: {$meta: 'textScore'}
	})
	// Then sort them
	.sort({
		score: {$meta: 'textScore'}
	})
	// Limit to only 6 results
	.limit(6);
	res.json(stores);
};

// Start of Map Stroes Method ++++++++++++++++++++++++++++++++++++++++
exports.mapStores = async (req, res) => {
	const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
	const q = {
		location: {
			$near:{
				$geometry: {
					type: 'Point',
					coordinates
				},
				$maxDistance: 10000 // 10 km
			}
		}
	};
	const stores = await Store.find(q).select('slug name description location photo').limit(10);
	res.json(stores)
};
// End of Map Stroes Method ++++++++++++++++++++++++++++++++++++++++

exports.addMenu = async (req, res) => {
	const currencies = await Currency.find();
	
		//  Find the store's ID
	const storeID = await Store.findOne({_id: req.params.storeId});
	res.render('editMenu', { title: 'Add A Menu Item', storeid: storeID._id, currencies });
};
exports.createMenu = async (req, res) => {
	req.body.owner = req.user._id;
	const foodmenu = new Foodmenu(req.body); 
	await foodmenu.save();
	req.flash('success', `Successfully Created ${foodmenu.itemname}. You may add another menu item to this category or choose a different category`);
	res.redirect(`/newmenu/${foodmenu.restauid}`); 
};
exports.getMenu = async (req, res) => {
	const thismenu = await Foodmenu.find({restauid: req.params.amenu});
	res.render('daysmenu', { title: 'Menu Of The Day', menulist: thismenu });
};

const confirmThisOwner = (fooditem, user) => { 
	if (!fooditem.owner.equals(user._id)) {
		throw Error('You must be the owner of this restaurant in order to edit it!');
	}
};

exports.editMenu = async (req, res) => {
	const currencies = await Currency.find();
	const fooditem = await Foodmenu.findOne({_id: req.params.id});
	confirmThisOwner(fooditem, req.user);
	res.render('editMenu', { title: `Edit ${fooditem.itemname}`, fooditem, currencies });
};
exports.updateMenu = async (req, res) => {
	// Find and update store
	
	const thismenu = await Foodmenu.findOneAndUpdate({ _id: req.params.id }, req.body, {
	new: true, // return the new store instead of the old one
	runValidators: true
	}).exec();
	req.flash('success', `Successfully udated <strong>${thismenu.itemname}</strong>.</a> `);
	res.redirect(`/mls/${thismenu.restauid}`);

	// Redirect them to store and tell them it worked
};
exports.addCurrency = async (req, res) => {
	const currency = new Currency(req.body);
	await currency.save();
	req.flash('success', `Successfully added currency for  ${currency.currname}. You may add another menu item to this category or choose a different category`);
	res.redirect(`/newmenu/${req.body.restauid}/edit`); 
};
exports.deletFoodItem = async (req, res) => {
	const itemname = req.params.nm;
	const restoid = req.params.restauid;
	await Foodmenu.remove( { _id: req.params.id } );
	const thismenu = await Foodmenu.find({restauid: req.params.restauid});
	//req.flash('success', ` Menu item ${itemname} was successfully deleted`);
	res.render('daysmenu', { title: 'Menu Of The Day', menulist: thismenu });
};



// Start of Map method+++++++++++++++++++++++++++++++++++++++++++
exports.mapPage = (req, res) => {
	res.render('map', {title: 'Map'});
};
exports.mapPageFr = (req, res) => {
	res.render('map_fr', {title: 'Carte Géographique'});
};
// End of Map method+++++++++++++++++++++++++++++++++++++++++++

exports.heartStore = async (req, res) => {
	const hearts =req.user.hearts.map(obj => obj.toString());
	const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
	const user = await User.findByIdAndUpdate(req.user.id, { [operator]: {hearts: req.params.id}}, {new: true} );
	res.json(user);
};

// Start of hearts method ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
exports.getHearts = async (req, res) => {
	const stores = await Store.find({
		// we are sayng, find where the _id prperty of the store is in req.user.hearts (the hearts array)
		_id: { $in: req.user.hearts }
	});
	res.render('stores', {title: 'Hearted Stores', stores});
};
exports.getHeartsFr = async (req, res) => {
	const stores = await Store.find({
		// we are sayng, find where the _id property of the store is in req.user.hearts (the hearts array)
		_id: { $in: req.user.hearts }
	});

	res.render('stores_fr', {title: 'Magasins coeurs', stores});
};
// End of hearts method ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Start of Top Restorants +++++++++++++++++

exports.getTopStores = async (req, res) =>{
	const stores = await Store.getTopStores();
	res.render('topStores', {stores, title: 'Top Restorants!'});
};

exports.getTopStoresFr = async (req, res) =>{
	const stores = await Store.getTopStores();
	res.render('topStores_fr', {stores, title: 'Top Restaurants!'});
}

// End of Top Restorants +++++++++++++++++