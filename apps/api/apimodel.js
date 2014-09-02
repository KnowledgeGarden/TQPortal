/**
 * apimodel
 * For REST interface with portal
 */
var types = require('../../node_modules/tqtopicmap/lib/types')
	, properties = require('../../node_modules/tqtopicmap/lib/properties')
	, constants = require('../../core/constants')
;

var APIModel =  module.exports = function(environment) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var DataProvider = topicMapEnvironment.getDataProvider();
	console.log("API started");
	
};