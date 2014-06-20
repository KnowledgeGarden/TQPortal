/**
 * User Model
 * <p>Creates a <em>Topic</em> for each new account; that's the user identity
 * that will be traded in the database, not the user's _id</p>
 * <p>User's handle must be unique and is used as the locator for that topic</p>
 */
var mongoose = require('mongoose')
  , types = require('../types')
  , icons = require('../icons')
  , constants = require('../constants')
  , Topic = require('./topic');

var UserModel = function() {
	var self = this;
	
	self.newUserTopic = function(user, callback) {
		// In fact, we already check for valid and unique handle in routes.js
		this.findUser(user.handle, function(err,result) {
			if (result !== null) {
				callback(user.handle+" already exists", null);
			} else {
				//create a new user
				var usr = new Topic();
				usr.locator = user.handle;
				usr.instanceOf = types.USER_TYPE;
				usr.creatorId = constants.SYSTEM_USER;
				usr.largeIcon = icons.PERSON_ICON;
				usr.smallIcon = icons.PERSON_ICON_SM;
				usr.label = user.fullname;
				user.save(function(err) {
					console.log('USER.newUserTopic saved '+err);
					callback(err,null);
				});

			}
		});
	};
	
	self.findUser = function(userLocator, callback) {
		Topic.findNodeByLocator(userLocator, function(err,result) {
			callback(err,result);
		});
	}
};