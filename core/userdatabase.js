/**
 * userdatabase
 */
var usr = require('./user')
	constants = require('./constants'),
	mongo = require('mongodb')
;
/**
 * @param configProperties
 * @param callback signature(error, UserDatabase
 */
function UserDatabase(configProperties, callback) {
	var database,
		MongoClient = mongo.MongoClient,
		error = "",
		self = this;
    MongoClient.connect(configProperties.mongoString, function(err, db) {
        console.log("BOOTING DB "+err+" "+db);
        database = db;
        if(err) {error+=err;}
        console.log("We are connected "+err+" "+database);
        //now create the user collection
        database.createCollection(constants.USER_COLLECTION, {strict:true}, function(err, collection) {
			console.log('---'+err+" "+collection);
			if(err) {error+=err;}
			//create invitation collection
			database.createCollection(constants.INVITATION_COLLECTION, {strict:true}, function(err, collection) {
				console.log('----'+err+" "+collection);
				if(err) {error+=err;}
				self.database = database;
				return callback(err, this);
			});
        });
    });
};

///////////////////
// User handling
///////////////////
/**
 * Save this <code>user</code>
 * @param user: JSON object
 * @param callback: signature (err,data)
 */
UserDatabase.prototype.save = function(user, callback) {
	this.database.collection(constants.USER_COLLECTION, function(err, collection) {
		collection.save(user, {upsert:'true'}, function(err, result) {
			return callback(err, result);
		});
	});
};
	
UserDatabase.prototype.removeUser = function(email, callback) {
	var q = {};
	q.email = email;
	this.database.collection(constants.USER_COLLECTION, function(err, collection) {
		collection.remove(q, function(err, result) {
			return callback(err, result);
		});
	});
	
};

	
/**
 * Fetch a user by <code>handle</code>. Used only when a 
 * profile change returns a new email address.
 */
UserDatabase.prototype.__getUserByHandle = function(handle, callback) {
this.database.collection(constants.USER_COLLECTION, function(err, collection) {
		var q = {};
		q.handle = handle;
		collection.findOne(q, function(err, result) {
			return callback(err, result);
		});
	});
	
};

/**
 * Find a user given <code>email</code>
 * @param email
 * @param callback: signature (err,data) returns a JSON object
 */
UserDatabase.prototype.findOne = function(email, callback) {
//		console.log("UserDatabase.findOne "+email);
	this.database.collection(constants.USER_COLLECTION, function(err, collection) {
		var q = {};
		q.email = email;
		collection.findOne(q, function(err, result) {
			return callback(err, result);
		});
	});
};
	
UserDatabase.prototype.listUsers = function(callback) {
	this.database.collection(constants.USER_COLLECTION, function(err, collection) {
		collection.find().toArray(function(err, result) {
			//returns a cursor converted to an array of users
			//TODO what are the limits in cardinatlity of returns?
			return callback(err, result);
		});
			
	});
};

/**
 * See if this <code>handle</code> exists. Handles must be unique
 * @param email
 * @param callback: signature (err,truth)
 */
UserDatabase.prototype.handleExists = function(handle, callback) {
this.database.collection(constants.USER_COLLECTION, function(err, collection) {
		var q = {};
		q.handle = handle;
		collection.findOne(q, function(err, result) {
			console.log("UserDatabase.handleExists "+err+" "+result);
			var truth = (result != null);
			return callback(err, truth);
		});
	});
};
///////////////////
// Invitation handling
///////////////////

UserDatabase.prototype.hasInvitation = function(email, callback) {
	this.database.collection(constants.INVITATION_COLLECTION, function(err, collection) {
		var q = {};
		q.email = email;
		collection.findOne(q,function(err, result) {
			console.log("UserDatabase.hasInvitation "+err+" "+result);
			var truth = (result != null);
			return callback(err, truth);
		});
	});
};
	
UserDatabase.prototype.addInvitation = function(email, callback) {
	var q = {};
	q.email = email;
	this.database.collection(constants.INVITATION_COLLECTION, function(err, collection) {
		collection.save(q, {upsert:'true'}, function(err, result) {
			return callback(err, result);
		});
	});
};
	
UserDatabase.prototype.removeInvitation = function(email, callback) {
	var q = {};
	q.email = email;
	this.database.collection(constants.INVITATION_COLLECTION, function(err, collection) {
		collection.remove(q, function(err, result) {
			return callback(err, result);
		});
	});
	
};

module.exports = UserDatabase;