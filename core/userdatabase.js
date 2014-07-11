/**
 * userdatabase
 */
var usr = require('./user')
  , constants = require('./constants');

var UserDatabase = module.exports = function(db) {
	var database = db;
	var self = this;

	///////////////////
	// User handling
	///////////////////
	/**
	 * Save this <code>user</code>
	 * @param user: JSON object
	 * @param callback: signature (err,data)
	 */
	self.save = function(user, callback) {
		database.collection(constants.USER_COLLECTION, function(err, collection) {
			collection.save(user, {upsert:'true'}, function(err,result) {
				callback(err,result);
			});
		});
	},
  
	/**
	 * Find a user given <code>email</code>
	 * @param email
	 * @param callback: signature (err,data)
	 */
	self.findOne = function(email, callback) {
		database.collection(constants.USER_COLLECTION, function(err, collection) {
			var q = {};
			q.email = email;
			collection.findOne(q,function(err, result) {
				callback(err,result);
			});
		});
	},
	
	self.listUsers = function(callback) {
		database.collection(constants.USER_COLLECTION, function(err, collection) {
			collection.find().toArray(function(err,result) {
				//returns a cursor converted to an array of users
				//TODO what are the limits in cardinatlity of returns?
				callback(err,result);
			});
				
		});
	},
/**
MongoDB shell version: 2.6.1
> show dbs
> db.users.find()
{ "_id" : "jackpark@gmail.com", "handle" : "jackpark", "fullname" : "Jack Park",
 "email" : "jackpark@gmail.com", "avatar" : "jackpark", "homepage" : "http://kno
wledgegardens.wordpress.com/", "password" : "$2a$10$tyiCOKvgaAuYfn/MaqSTlOt05Fbr
uJd3ccZwwZ/cIuJ5PAf0ix3LC" }
{ "_id" : "sam@slow.com", "handle" : "sammy", "fullname" : "Sam Slow", "email" :
 "sam@slow.com", "avatar" : "sammy", "homepage" : "", "password" : "$2a$10$bKKM7
2fCKOjqN/Jrvnx7duMTl.Fpk.MGYEMy.svlxGEwcmgk3CRnW" }
{ "_id" : "admin@topicquests.org", "handle" : "admin@topicquests.org", "fullname
" : "admin@topicquests.org", "email" : "admin@topicquests.org", "avatar" : "admi
n@topicquests.org", "homepage" : "", "credentials" : [ "admin@topicquests.org",
"AdminCred" ], "password" : "$2a$10$381wbTB6cGg/7OH5XGotqOhgVC5t0/Qii33PbULEdYPK
qKrc7CGPi" }
{ "_id" : "foo@bar.com", "fullname" : "foo bar", "email" : "foo@bar.com", "avata
r" : "", "homepage" : "", "handle" : "foobar", "credentials" : [ "foobar" ], "pa
ssword" : "$2a$10$n4CiuK2dSwyrMS7ejqi0pusRSl5sNPO1wZT1OfmOL7jC.JtNgGrQu" }
{ "_id" : "bar@bar.com", "fullname" : "bar bar", "email" : "bar@bar.com", "avata
r" : "", "homepage" : "", "handle" : "barbar", "credentials" : [ "barbar" ], "pa
ssword" : "$2a$10$mgxsm23REAAOQnvdABJLpOHYyfeDTG2gBlP0uGYZukqwKDhgR4N92" }
{ "_id" : "joe@sixpack.com", "fullname" : "Joe  Sixpack", "email" : "joe@sixpack
.com", "avatar" : "sixer", "homepage" : "", "handle" : "sixer", "credentials" :
[ "sixer" ], "password" : "$2a$10$W.Llln627D0usY91XZXDMu4/L.I9aSVKbVbj.zsRR2SKPl
ahhXYuO" }
{ "_id" : "sara@sixpack.com", "fullname" : "Sara Sixpack", "email" : "sara@sixpa
ck.com", "avatar" : "sarasix", "homepage" : "", "handle" : "sarasix", "credentia
ls" : [ "sarasix" ], "password" : "$2a$10$crty7nqitk4.uLbvIYuDVep9gkYdSs4oipMXQl
6fSWVz5OTxjYq/i" }
>
 */	
	/**
	 * See if this <code>handle</code> exists. Handles must be unique
	 * @param email
	 * @param callback: signature (err,truth)
	 */
	self.handleExists = function(handle, callback) {
		database.collection(constants.USER_COLLECTION, function(err, collection) {
			var q = {};
			q.handle = handle;
			collection.findOne(q,function(err, result) {
				console.log("UserDatabase.handleExists "+err+" "+result);
				var truth = (result != null);
				callback(err,truth);
			});
		});
	},
	///////////////////
	// Invitation handling
	///////////////////

	self.hasInvitation = function(email, callback) {
		database.collection(constants.INVITATION_COLLECTION, function(err, collection) {
			var q = {};
			q.email = email;
			collection.findOne(q,function(err, result) {
				console.log("UserDatabase.hasInvitation "+err+" "+result);
				var truth = (result != null);
				callback(err,truth);
			});
		});
	},
	
	self.addInvitation = function(email, callback) {
		var q = {};
		q.email = email;
		database.collection(constants.INVITATION_COLLECTION, function(err, collection) {
			collection.save(q, {upsert:'true'}, function(err,result) {
				callback(err,result);
			});
		});
	},
	
	self.removeInvitation = function(email, callback) {
		var q = {};
		q.email = email;
		database.collection(constants.INVITATION_COLLECTION, function(err, collection) {
			collection.remove(q, function(err,result) {
				callback(err,result);
			});
		});
		
	}
};