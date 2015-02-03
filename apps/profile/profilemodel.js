/**
 * profilemodel
 */
var types = require('tqtopicmap/lib/types')
	, icons = require('tqtopicmap/lib/icons')
	, properties = require('tqtopicmap/lib/properties')
	, constants = require('../../core/constants')
	, uuid = require('../../core/util/uuidutil')
	, User = require('../../core/user');

var ProfileModel =  module.exports = function(environment) {
	var UserDatabase = environment.getUserDatabase(),
		topicMapEnvironment = environment.getTopicMapEnvironment(),
		self = this;
	
	self.updateProfile = function(data, user, callback) {
		console.log("PROFILE "+user.handle+" | "+JSON.stringify(data));
		var lLox = user.handle,
			dLox = data.userlocator;
		//PROFILE {"userlocator":"jackpark","email":"jackpark@gmail.com","fullname":"Jack
		//	Park","avatar":"jackpark","homepage":"http://knowledgegardens.wordpress.com/","L
		//	atitude":"4545","Longitude":"5555"}
		//Sanity
		if (lLox === dLox) {
			//TODO get user object, update it, save it
			UserDatabase.findOne(data.useremail, function profileMFindOne(err, user) {
				console.log("ProfileModel "+err+" "+user);
				if (!user) {
					topicMapEnvironment.logError("UserModel")
					return callback("ProfileMissingUser"+lLox);
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
						UserDatabase.save(user, function profileMSave(err, data) {
							console.log("ProfileModel.save "+err);
							return callback("");
						});
					} else {
						return callback("");
					}
				}
			});
		} else {
			return callback("BadProfile"+lLox);
		}
	}
};