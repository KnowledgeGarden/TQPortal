/**
 * RolePlayingGameEnvironment
 */
var  types = require('../../node_modules/tqtopicmap/lib/types')
	, sb = require('../../node_modules/tqtopicmap/lib/util/stringbuilder')
	, constants = require('../../core/constants')
	, ib = require('./rpginfoboxmodel')
;

var RPGEnvironment = module.exports = function(environment, tmenv) {
	var myEnvironment = environment;
	var topicMapEnvironment = tmenv;
	var DataProvider = topicMapEnvironment.getDataProvider();
	var RPGInfoBoxModel = new ib(environment);
	console.log("RPGEnvironment started");
	var self = this;
	//TODO
	
	self.getInfoBoxModel = function() {
		return RPGInfoBoxModel;
	}
};