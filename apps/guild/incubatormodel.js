/**
 * GuildModel
 */
var types = require('../../node_modules/tqtopicmap/lib/types'),
    icons = require('../../node_modules/tqtopicmap/lib/icons'),
    properties = require('../../node_modules/tqtopicmap/lib/properties'),
    Gameenv = require('../rpg/rpgenvironment'),
    constants = require('../../core/constants'),
    uuid = require('../../core/util/uuidutil'),
    Tagmodel = require('../tag/tagmodel')
;

var IncubatorModel =  module.exports = function(environment) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        DataProvider = topicMapEnvironment.getDataProvider(),
        TopicModel = topicMapEnvironment.getTopicModel(),
        TagModel = new Tagmodel(environment),
        CommonModel = environment.getCommonModel(),
        queryDSL = topicMapEnvironment.getQueryDSL(),
        RPGEnvironment = environment.getRPGEnvironment(),
	
        self = this;
    
};