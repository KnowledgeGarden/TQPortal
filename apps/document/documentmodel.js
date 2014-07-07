/**
 * DocumentModel
 * For managing documents such as books, stories, etc, 
 */

var types = require('../../core/types')
  , icons = require('../../core/icons')
  , constants = require('../../core/constants');

var DocumentModel = module.exports = function(environment) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  var TopicModel = topicMapEnvironment.getTopicModel();
  var self = this;	
};
