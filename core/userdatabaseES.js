/**
 * userdatabase for ElasticSearch
 */
var constants = require('./constants'),
	fs = require('fs'),
	Usr = require ('./user'),
	constants = require('./constants');
;
/**
 * @param environment
 * @param configProperties
 * @param callback signature(error, UserDatabase
 */
function UserDatabase(environment, esclient, configProperties, callback) {
	var myEnvironment = environment,
		ESClient = esclient,
		mappingpath = __dirname+"/../config/mappings.json",
		error = "";
		this.myEnvironment = environment;
	console.log("UDB "+environment);
	fs.readFile(mappingpath, function userDbReadMap(err, mapfil) {
		if (err) {error += err;}
//		console.log("UDB-1 "+mapfil);
		var config = {};
		config._indices = [];
		config._types = [];
		config.refresh = true;
		config.server = {};
		var clusters = configProperties.clusters;
		var len = clusters.length;
		var sip;
		config._indices.push(constants.USER_COLLECTION);
		config._types.push(constants.CORE_TYPE);
		if (len > 1) {
			//code not tested yet
			var h = [];
			for (var i=0;i<len;i++) {
				sip = clusters[i];
				h.push(sip.host+":"+sip.port);
			}
			config.server.hosts = h;
			} else {
			sip = clusters[0];
			config.server.host = sip.host;
			config.server.port = sip.port;
		}
		//init USER_COLLECTION
		ESClient.initIndex(config, JSON.parse(mapfil), function userDbInitIndex(err, client) {
			if (err) {error += err;}
			config._indices = [];
			config._indices.push(constants.INVITATION_COLLECTION);
			//init INVITATION_COLLECTION
			ESClient.initIndex(config, JSON.parse(mapfil), function userDbInitIndex1(err, client) {
				console.log("UserDatabase- "+this.ESClient+" | "+err);
				this.ESClient = ESClient;
				return callback(error, this);
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
	var _jopts = {};
	_jopts._index = constants.USER_COLLECTION;
	_jopts._type = constants.CORE_TYPE;
	_jopts._id = user.email;
	console.log("UserDatabase.save "+JSON.stringify(user));
	console.log("UserDatabase.save-1 "+JSON.stringify(_jopts));
	ESClient.index(_jopts, user, function userDbSave(err, data) {
		return callback(err, data);
	});
};
	
UserDatabase.prototype.removeUser = function(email, callback) {
	var _jopts = {};
	_jopts._index = constants.USER_COLLECTION;
	_jopts._type = constants.CORE_TYPE;
	_jopts._id = email;
	ESClient.index(_jopts, function userDbIndex(err, data) {
		return callback(err, data);
	});	
};

	
/**
 * Fetch a user by <code>handle</code>. Used only when a 
 * profile change returns a new email address.
 */
UserDatabase.prototype.__getUserByHandle = function(handle, callback) {
	var _jopts = {};
	_jopts._index = constants.USER_COLLECTION;
	_jopts._type = constants.CORE_TYPE;
	var query = {},
		m = {},
		q = {};
	q.handle = handle;
	//supposed to be term but that didn't work
	m.term = q;
	query.query = m;
	ESClient.search(_jopts, query, function userDbSearch(err, data) {
		//Returns a json blob
		var usr;
		if (data) {
			usr = new Usr(data);
		}
		return callback(err, usr);
	});
};

/**
 * Find a user given <code>email</code>
 * @param email
 * @param callback: signature (err,data) returns a JSON object
 */
UserDatabase.prototype.findOne = function(email, callback) {
	var _jopts = {};
	_jopts._index = constants.USER_COLLECTION;
	_jopts._type = constants.CORE_TYPE;
	var query = {},
		m = {},
		q = {};
	q.email = email;
	//supposed to be term but that didn't work
	m.term = q;
	query.query = m;
//	console.log("UserDatabase.findOne "+email+" | "+ESClient);
	ESClient.search(_jopts, query, function userDbSearch1(err, data) {
		//Returns a json blob
//		console.log("UserDatabase.findOne-1 "+JSON.stringify(data));
		var usr;
		if (data) {
			if (data.hits.total > 0) {
//				console.log("UserDatabase.findOne-2 "+JSON.stringify(data.hits));
//				console.log("UserDatabase.findOne-3 "+JSON.stringify(data.hits.hits[0]));
				var ux = data.hits.hits[0]._source;
//				console.log("UserDatabase.findOne-4 "+JSON.stringify(ux));
				//we just return a json object
				usr = ux;
			}
		}
		return callback(err, usr);
	});
};
	
UserDatabase.prototype.listUsers = function(callback) {
	var _jopts = {};
	_jopts._index = constants.USER_COLLECTION;
	_jopts._type = constants.CORE_TYPE;
	var query = {};
	var foo = this;
//		m = {},
//		q = {};
//	q.email = email;
//	//supposed to be term but that didn't work
//	m.term = q;
//	query.query = m;
	ESClient.search(_jopts, query, function userDbSearch2(err, data) {
		console.log("UDB "+JSON.stringify(data));
		foo.myEnvironment.logDebug("UserDatabase.listUsers "+JSON.stringify(data));
		//Returns a json blob
		var usrs = [],
			hits = data.hits.hits;
		if (hits) {
		console.log("UserDatabase.listUsers-1 "+JSON.stringify(hits));
			for(var i=0;i<hits.length;i++) {
				usrs.push(hits[i]._source);
			}
//			usr = new Usr(data);
		}
		return callback(err, usrs);
	});

};

/**
 * See if this <code>handle</code> exists. Handles must be unique
 * @param email
 * @param callback: signature (err,truth)
 */
UserDatabase.prototype.handleExists = function(handle, callback) {
	var _jopts = {};
	_jopts._index = constants.USER_COLLECTION;
	_jopts._type = constants.CORE_TYPE;
	var query = {},
		m = {},
		q = {};
	q.handle = handle;
	//supposed to be term but that didn't work
	m.term = q;
	query.query = m;
	ESClient.search(_jopts, query, function userDbSearch3(err, data) {
		console.log("USERDATABASE EXISTS "+JSON.stringify(data));
		var truth = (data.hits.total > 0);
		return callback(err, truth);
	});
};

///////////////////
// Invitation handling
///////////////////

UserDatabase.prototype.hasInvitation = function(email, callback) {
	var _jopts = {};
	_jopts._index = constants.INVITATION_COLLECTION;
	_jopts._type = constants.CORE_TYPE;
	_jopts._ID = email;

	ESClient.existsDocument(_jopts, email, function userDbExists(err, data) {
		var truth = (data && data.exists);
		return callback(err, truth);
	});
};
	
UserDatabase.prototype.addInvitation = function(email, callback) {
	var _jopts = {};
	_jopts._index = constants.INVITATION_COLLECTION;
	_jopts._type = constants.CORE_TYPE;
	_jopts._id = email;
	ESClient.index(_jopts, {}, function userDbIndex2(err, data) {
		return callback(err, data);
	});
};
	
UserDatabase.prototype.removeInvitation = function(email, callback) {
	var _jopts = {};
	_jopts._index = constants.INVITATION_COLLECTION;
	_jopts._type = constants.CORE_TYPE;
	_jopts._id = email;
	ESClient.index(_jopts, function userDbIndex3(err, data) {
		return callback(err, data);
	});	
};

module.exports = UserDatabase;