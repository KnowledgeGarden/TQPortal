/**
 * RolePlayingGameEnvironment
 */
var  types = require('../../node_modules/tqtopicmap/lib/types')
	, sb = require('../../node_modules/tqtopicmap/lib/util/stringbuilder')
	, constants = require('../../core/constants')
;

var RPGEnvironment = module.exports = function(environment, tmenv) {
	var myEnvironment = environment;
	var topicMapEnvironment = tmenv;
	var DataProvider = topicMapEnvironment.getDataProvider();
	console.log("RPGEnvironment started");
	var self = this;
	//TODO
};