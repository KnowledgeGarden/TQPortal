/*
 * StoryApp
 */

var constants = require('../core/constants'),
    types = require('../node_modules/tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        CommonModel = environment.getCommonModel();
    //TODO
};