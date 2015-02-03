/**
 * Wiki model
 */
var constants = require('../../core/constants'),
	types = require('tqtopicmap/lib/types'),
	icons = require('tqtopicmap/lib/icons'),
	properties = require('tqtopicmap/lib/properties'),
	uuid = require('../../core/util/uuidutil'),
	tagmodel = require('../tag/tagmodel');

var WikiModel =  module.exports = function(environment) {
	var CommonModel = environment.getCommonModel(),
		PortalNodeModel = environment.getPortalNodeModel(),
		myEnvironment = environment,
		topicMapEnvironment = environment.getTopicMapEnvironment(),
		DataProvider = topicMapEnvironment.getDataProvider(),
		queryDSL = topicMapEnvironment.getQueryDSL(),
		TopicModel = topicMapEnvironment.getTopicModel(),
		TagModel = new tagmodel(environment),
		self = this;
	/**
	 * Update an existing node; no tags included
	 */
	self.update = function(json, user, callback) {
		PortalNodeModel.update(json, user, function wikiMUpdate(err, result) {
			return callback(err, null);
		});
	};
	
	/**
	 * Create a new wiki topic
	 * @param json: a JSON object filled in
	 * @user: a User object to be converted to a userTopic
	 */
	self.create = function (json, user, callback) {
		var isPrivate = false;
		if (json.isPrivate) {
			isPrivate = json.isPrivate;
		}
		PortalNodeModel.create(json, user, types.WIKI_TYPE, icons.PUBLICATION_SM, icons.PUBLICATION, isPrivate, function wikiMCreate(err, lox) {
			if (!isPrivate) {
				myEnvironment.addRecentWiki(lox, json.title);
			}
			return callback(err,lox);
		});
	};

	self.listWikiPosts = function(start, count, credentials, callback) {
		DataProvider.listInstanceNodes(types.WIKI_TYPE, start,count,credentials, function wikiMListInstances(err, data, total){
			console.log("WikiModel.listBlogPosts "+err+" "+data);
			return callback(err, data, total);
	  });
	};
	  
	/**
	 * @param credentials
	 * @param callback signatur (data)
	 */
	self.fillDatatable = function(start, count, credentials, callback) {
		self.listWikiPosts(start,count,credentials,function wikiMListTopics(err, result, totalx) {
			console.log('ROUTES/bookmark '+err+' '+result);
			CommonModel.fillSubjectAuthorDateTable(result, "/wiki/", totalx, function wikiMFillTable(html, len, total) {
				console.log("FILLING "+start+" "+count+" "+total);
				return callback(html, len, total);  
			});
		});
	};
};