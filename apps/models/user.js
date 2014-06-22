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

var UserModel = module.exports = function() {
	var self = this;
	
	self.newUserTopic = function(user, callback) {
		//NOTE: user.username same as handle
		console.log('USER.newUserTopic- '+JSON.stringify(user));
		// In fact, we already check for valid and unique handle in routes.js
		console.log('USER.newUserTopic-1 '+user.username)
		this.findUser(user.username, function(err,result) {
			console.log('USER.newUserTopic- '+err+' '+result);
			//if (result !== null) {
			if (result.lengh > 0) {
				callback(user.username+" already exists", null);
			} else {
				//create a new user
				var usr = new Topic();
				usr.locator = user.username;
				usr.instanceOf = types.USER_TYPE;
				usr.creatorId = constants.SYSTEM_USER;
				usr.largeIcon = icons.PERSON_ICON;
				usr.smallIcon = icons.PERSON_ICON_SM;
				usr.label = user.fullname;
				usr.save(function(err) {
					console.log('USER.newUserTopic saved '+err);
					console.log(JSON.stringify(usr));
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