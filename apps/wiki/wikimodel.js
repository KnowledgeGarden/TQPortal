/**
 * Wiki model
 */
var constants = require('../../core/constants')
  , types = require('../../node_modules/tqtopicmap/lib/types')
  , icons = require('../../node_modules/tqtopicmap/lib/icons')
  , properties = require('../../node_modules/tqtopicmap/lib/properties')
 
  , uuid = require('../../core/util/uuidutil')
  , tagmodel = require('../tag/tagmodel');

var WikiModel =  module.exports = function(environment) {
	var CommonModel = environment.getCommonModel();
	var PortalNodeModel = environment.getPortalNodeModel();
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var DataProvider = topicMapEnvironment.getDataProvider();
	var queryDSL = topicMapEnvironment.getQueryDSL();
	var TopicModel = topicMapEnvironment.getTopicModel();
	var TagModel = new tagmodel(environment);
	var self = this;
	/**
	 * Update an existing node; no tags included
	 */
	self.update = function(json,user,callback) {
		PortalNodeModel.update(json,user,function(err,result) {
			callback(err,null);
		});
	},
	
  /**
   * Create a new wiki topic
   * @param wiki: a JSON object filled in
   * @user: a User object to be converted to a userTopic
   */
  self.create = function (wiki, user, callback) {
	var isPrivate = false; //TODO
	PortalNodeModel.create(json,user,types.WIKI_TYPE,icons.PUBLICATION_SM, icons.PUBLICATION, isPrivate,function(err,lox) {
			  myEnvironment.addRecentBlog(lox,json.title);
			  callback(err,lox);
	});
  },

  	self.listWikiPosts = function(start, count, credentials, callback) {
	  DataProvider.listInstanceNodes(types.WIKI_TYPE, start,count,credentials, function(err,data,total){
		  console.log("WikiModel.listBlogPosts "+err+" "+data);
		  callback(err,data, total);
	  });
	},
	  
	  /**
	   * @param credentials
	   * @param callback signatur (data)
	   */
	  self.fillDatatable = function(start, count, credentials, callback) {
          self.listWikiPosts(start,count,credentials,function(err,result,totalx) {
		      console.log('ROUTES/bookmark '+err+' '+result);
		      CommonModel.fillSubjectAuthorDateTable(result,"/wiki/",totalx, function(html,len,total) {
			      console.log("FILLING "+start+" "+count+" "+total);
			      callback(html,len,total);
		    	  
		      });
		  });
	  }
};