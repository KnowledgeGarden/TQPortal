/**
 * A bootstrap platform which allws a portal to extend
 * the topic map's typology with portal-specific extensions
 * and property types
 */

var types = require('../node_modules/tqtopicmap/lib/types')
  , icons = require('../node_modules/tqtopicmap/lib/icons')
  , properties = require('../node_modules/tqtopicmap/lib/properties')
  , extensions = require('./extendedtypology')
  , constants = require('../core/constants');

var Bootstrap = module.exports = function(environment) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var DataProvider = topicMapEnvironment.getDataProvider();
	var TopicModel = topicMapEnvironment.getTopicModel();
	console.log("PortalBootstrap");
	var self = this;

	/**
	 * Test the database to see if it needs to be bootstrapped
	 * @param callback signature = err;
	 */
	self.bootstrap = function(callback) {
		var error="";
		//TODO
		callback(error);
	};

};