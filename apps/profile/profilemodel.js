/**
 * profilemodel
 */
var types = require('../../node_modules/tqtopicmap/lib/types')
	, icons = require('../../node_modules/tqtopicmap/lib/icons')
	, properties = require('../../node_modules/tqtopicmap/lib/properties')
	, constants = require('../../core/constants')
	, uuid = require('../../core/util/uuidutil')
	, User = require('../../core/user');

var ProfileModel =  module.exports = function(environment) {
	var UserDatabase = environment.getUserDatabase();
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var self = this;
	
	self.updateProfile = function(data,user,callback) {
		console.log("PROFILE "+user.handle+" | "+JSON.stringify(data));
		var lLox = user.handle;
		var dLox = data.userlocator;
		//PROFILE {"userlocator":"jackpark","email":"jackpark@gmail.com","fullname":"Jack
		//	Park","avatar":"jackpark","homepage":"http://knowledgegardens.wordpress.com/","L
		//	atitude":"4545","Longitude":"5555"}
		//Sanity
		if (lLox === dLox) {
			//TODO get user object, update it, save it
			UserDatabase.findOne(data.useremail, function(err,user) {
				console.log("ProfileModel "+err+" "+user);
				if (!user) {
					topicMapEnvironment.logError("UserModel")
					callback("ProfileMissingUser"+lLox);
				} else {
					var changed = false;
					if (data.fullname !== user.fullname) {
						user.fullname = data.fullname;
						changed = true;
					} 
					if (data.homepage !== user.homepage) {
						user.homepage= data.homepage;
						changed = true;
					}
					if (data.avatar !== user.avatar) {
						user.avatar = data.avatar;
						changed = true;
					}
					if (data.Latitude !== user.latitude) {
						user.latitude = data.Latitude;
						changed = true;
					}
					if (data.Longitude !== user.longitude) {
						user.longitude = data.Longitude;
						changed = true;
					}
					if (changed) {
						UserDatabase.save(user, function(err,data) {
							console.log("ProfileModel.save "+err);
							return callback("");
						});
					} else {
						return callback("");
					}
				}
			});
		} else {
			callback("BadProfile"+lLox);
		}
	}
};