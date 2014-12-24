/**
 * DocumentModel
 * For managing documents such as books, stories, etc, 
 */

var types = require('tqtopicmap/lib/types')
, icons = require('tqtopicmap/lib/icons')
, properties = require('tqtopicmap/lib/properties')

  , constants = require('../../core/constants');

var DocumentModel = module.exports = function(environment) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  var TopicModel = topicMapEnvironment.getTopicModel();
  var self = this;	
};
