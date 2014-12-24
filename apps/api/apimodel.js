/**
 * apimodel
 * For REST interface with portal
 */
var types = require('tqtopicmap/lib/types')
	, properties = require('tqtopicmap/lib/properties')
	, constants = require('../../core/constants')
;

var APIModel =  module.exports = function(environment) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var DataProvider = topicMapEnvironment.getDataProvider();
	console.log("API started");
	
};