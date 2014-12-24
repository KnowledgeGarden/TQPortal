/**
 * Blog Model
 * <p>A blog post is an instance of a Topic.
 * Each tag is an instance of a Topic.
 * Each comment is an instance of a Topic.
 * All tags and comments are represented as
 * <em>relations</em> with the blog's Topic
 * </p>
 */
var types = require('tqtopicmap/lib/types')
, icons = require('tqtopicmap/lib/icons')
, properties = require('tqtopicmap/lib/properties')

  , constants = require('../../core/constants')
  , uuid = require('../../core/util/uuidutil')
  , tagmodel = require('../tag/tagmodel');

var BlogModel =  module.exports = function(environment) {
	var CommonModel = environment.getCommonModel();
	var PortalNodeModel = environment.getPortalNodeModel();
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var DataProvider = topicMapEnvironment.getDataProvider();
	var TopicModel = topicMapEnvironment.getTopicModel();
	var TagModel = new tagmodel(environment);
	var queryDSL = topicMapEnvironment.getQueryDSL();
  console.log("BlogModel");
//  this.types = types;
//  this.icons = icons;
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
   * Create a new blog post
   * @param json: a JSON object with appropriate values set
   * @param user: a JSON object of the user from the session
    * @param callback: signature (err, result): result = _id of new object
   */
  self.create = function (json, user, callback) {
	  console.log('BMXXXX '+JSON.stringify(json));
	  var isPrivate = false; //TODO
	  PortalNodeModel.create(json,user,types.BLOG_TYPE,icons.PUBLICATION_SM, icons.PUBLICATION, isPrivate,function(err,lox) {
		  myEnvironment.addRecentBlog(lox,json.title);
		  callback(err,lox);
	  });
  },
  
  self.listBlogPosts = function(start, count, credentials, callback) {
    var query = queryDSL.sortedDateTermQuery(properties.INSTANCE_OF,types.BLOG_TYPE,start,count);
    DataProvider.listNodesByQuery(query, start,count,credentials, function(err,data, total) {
      console.log("BlogModel.listBlogPosts "+err+" "+data);
      callback(err,data, total);
    });
  },
  
  /**
   * @param start
   * @param count
   * @param credentials
   * @param callback signatur (data, countsent, totalavailable)
   */
  self.fillDatatable = function(start, count,credentials, callback) {
	  self.listBlogPosts(start,count,credentials,function(err,result, totalx) {
	      console.log('BlogModel.fillDatatable '+err+' '+totalx+" "+result);
	      CommonModel.fillSubjectAuthorDateTable(result,"/blog/",totalx, function(html,len,total) {
		      console.log("FILLING "+start+" "+count+" "+total);
		      callback(html,len,total);
	    	  
	      });
	  });
  }
  
};


