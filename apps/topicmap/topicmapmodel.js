/**
 * TopicMap Model
 */
var types = require('tqtopicmap/lib/types')
, icons = require('tqtopicmap/lib/icons')
, properties = require('tqtopicmap/lib/properties')

  , constants = require('../../core/constants')
  , uuid = require('../../core/util/uuidutil')
  , tagmodel = require('../tag/tagmodel');

var TopicMapModel =  module.exports = function(environment) {
	var CommonModel = environment.getCommonModel();
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var TopicModel = topicMapEnvironment.getTopicModel();
	var TagModel = new tagmodel(environment);
	var queryDSL = topicMapEnvironment.getQueryDSL();
	

};