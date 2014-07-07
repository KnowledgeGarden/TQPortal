/**
 * ConversationModel
 * For managing structured conversations, which could be blog posts
 * or actual IBIS trees
 */

var types = require('../../core/types')
  , icons = require('../../core/icons')
  , constants = require('../../core/constants');

var ConversationModel = module.exports = function(environment) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  var TopicModel = topicMapEnvironment.getTopicModel();
  var self = this;	
};
