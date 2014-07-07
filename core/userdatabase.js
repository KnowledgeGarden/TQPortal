/**
 * userdatabase
 */
var usr = require('./user')
  , constants = require('./constants');

var UserDatabase = module.exports = function(db) {
  var database = db;
  var self = this;
  
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
   * @param user: email
   * @param callback: signature (err,data)
   */
  self.findOne = function(email, callback) {
    database.collection(constants.USER_COLLECTION, function(err, collection) {
      var q = {};
	    q['email'] = email;
	  collection.findOne(q,function(err, result) {
	    callback(err,result);	
	  });
	});
  }
};