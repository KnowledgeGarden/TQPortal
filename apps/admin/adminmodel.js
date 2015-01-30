/**
 * adminmodel
 */
var types = require('tqtopicmap/lib/types')
	, icons = require('tqtopicmap/lib/icons')
	, properties = require('tqtopicmap/lib/properties')
	, constants = require('../../core/constants')
	, uuid = require('../../core/util/uuidutil')
	, User = require('../../core/user')
	, tagmodel = require('../tag/tagmodel');

var AdminModel =  module.exports = function(environment) {
	var userDatabase = environment.getUserDatabase();
	var self = this;
	console.log("AdminModel "+userDatabase);
	/**
	 * If default user doesn't exist, create it
	 */
	self.validateDefaultUser = function() {
		var defaultEmail = environment.getConfigProperties().defaultadminemail;
		var defaultPwd = environment.getConfigProperties().defaultadminpwd;
		userDatabase.findOne(defaultEmail, function adminMValidateDefaultUser(err, data) {
			console.log("AdminModel.validateDefaultUser "+err+" "+data);
			if (!data || data === null) {
				console.log("AdminModel.validateDefaultUser-1");
				var xuser = new User({
			        handle : defaultEmail,//note: handle is username: must be unique
			        fullname : defaultEmail,
			        email   : defaultEmail,
			        avatar : defaultEmail,
			        homepage : "",
			        //leave password out; it requires a callback
			        //leave handle out: set next
				});
				xuser.setHandle(defaultEmail);
				xuser.setPassword(defaultPwd, function adminMSetPassword(err) {
					if (err) {
						console.log("AdminModel.validateDefaultUser-2 "+err);
					}
					xuser.addCredential(constants.ADMIN_CREDENTIALS);
					userDatabase.save(xuser.getData(), function adminMSave1(err, data) {
						if (err) {
							console.log("AdminModel.validateDefaultUser-3 "+err);
						}	
						console.log("NEWDEFAULTUSER "+JSON.stringify(xuser.getData()));
/**
 NEWDEFAULTUSER {"handle":"admin@topicquests.org","fullname":"admin@topicquests.o
rg","email":"admin@topicquests.org","avatar":"admin@topicquests.org","homepage":
"","_id":"admin@topicquests.org","credentials":["admin@topicquests.org","AdminCr
ed"],"password":"$2a$10$381wbTB6cGg/7OH5XGotqOhgVC5t0/Qii33PbULEdYPKqKrc7CGPi"}
 */
					});
				});
			}
			
		});
	};
	
	//Go ahead and validate the default user when first booting
	//TODO This occurs asynchronously, and might even fire after the entire website is booted
	self.validateDefaultUser();
	
	self.handleExists = function(email, callback) {

		userDatabase.handleExists(email, function adminMHandleExists(err,truth) {
			//TODO this should also call the topic map to make sure
			return callback(err, truth);
		});		
	};
	
	self.getUser = function(email, callback) {
		userDatabase.findOne(email, function adminMFindONe(err, data) {
			return callback(err, data);
		});
	};
	
	self.updateUser = function(user,callback) {
		userDatabase.save(user, function adminMSave2(err, data) {
			return callback(err, data);
		});
	};
        
    self.addToCredentials = function(user, credential, callback) {
        var creds = user.credentials;
        creds.push(credential);
        user.credentials = creds;
        self.updateUser(user, function adminMUpdateUser1(err, data) {
            return callback(err, data);
        });
    };
        
    self.removeFromCredentials = function(user, credential, callback) {
        var creds = user.credentials;
        var where = creds.indexOf(credential);
        if (where > -1) {
            creds.splice(where,1);
            user.credentials = creds;
            self.updateUser(user, function adminMUpdateUser2(err, data) {
                //fall through
            });
        }
        return callback(err, data);
    };
        
	/**
	 * @param email
	 * @param callback: signature(err, truth)
	 */
	self.hasInvitation = function(email, callback) {
		userDatabase.hasInvitation(email, function adminMHasInvitation(err, truth) {
			return callback(err, truth);
		});
	};
	
	self.addInvitation = function(email,callback) {
		userDatabase.addInvitation(email, function adminMAddInvitation(err, truth) {
			return callback(err, truth);
		});
	};
	
	self.removeUser = function(email, callback) {
		userDatabase.removeUser(email, function adminMRemoveUser(err, truth) {
			return callback(err, truth);
		});	
	};
	
	self.removeInvitation = function(email, callback) {
		userDatabase.removeInvitation(email, function adminMRemoveInvitation(err, truth) {
			return callback(err, truth);
		});
	};
	
	self.listUsers = function(callback) {
		userDatabase.listUsers(function adminMListUsers(err, data) {
			return callback(err, data);
		});
	};
	
	/**
	 * @param callback signatur (data)
	 */
	self.fillDatatable = function(callback) {
		var theResult = {};
		self.listUsers(function adminMListUsers2(err, result) {
			//list of user objects
			/*
{ "_id" : "jackpark@gmail.com", "handle" : "jackpark", "fullname" : "Jack Park",
 "email" : "jackpark@gmail.com", "avatar" : "jackpark", "homepage" : "http://kno
wledgegardens.wordpress.com/", "password" : "$2a$10$tyiCOKvgaAuYfn/MaqSTlOt05Fbr
uJd3ccZwwZ/cIuJ5PAf0ix3LC" }
			 */
			console.log('ROUTES/adminusers '+err+' '+result);
			var data = [],
				len = result.length,
				p, //the proxy
				m, //the individual message
				url,
				posts = [];
			for (var i=0;i<len;i++) {
				p = result[i];
				m = {};
				m.email = p.email;
				m.handle = p.handle;
				m.name = p.fullname;
				m.credentials = p.credentials;
			//	m = [];
			//	m.push(p.email);
			//	m.push(p.handle);
			//	m.push(p.fullname);
			//	m.push(p.credentials);
				data.push(m);
			}
			theResult.data = data;
			console.log();
			console.log("AdminModel.fillDatatable "+JSON.stringify(theResult));
			console.log();
			return callback(theResult);
		});
	};
	
};