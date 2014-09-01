/**
 * IssueModel
 */
var types = require('../../node_modules/tqtopicmap/lib/types')
	, icons = require('../../node_modules/tqtopicmap/lib/icons')
	, properties = require('../../node_modules/tqtopicmap/lib/properties')
	, gameenv = require('../rpg/rpgenvironment')
	, constants = require('../../core/constants')
	, uuid = require('../../core/util/uuidutil')
	, tagmodel = require('../tag/tagmodel');

var IssueModel =  module.exports = function(environment) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var TopicModel = topicMapEnvironment.getTopicModel();
	var TagModel = new tagmodel(environment);
	var RPGEnvironment = new gameenv(environment,topicMapEnvironment);
	
	var self = this;
	
	self.getRPGEnvironment = function() {
		return RPGEnvironment;
	}
}