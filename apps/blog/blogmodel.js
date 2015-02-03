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
	var CommonModel = environment.getCommonModel(),
      PortalNodeModel = environment.getPortalNodeModel(),
      myEnvironment = environment,
      topicMapEnvironment = environment.getTopicMapEnvironment(),
      DataProvider = topicMapEnvironment.getDataProvider(),
      TopicModel = topicMapEnvironment.getTopicModel(),
      TagModel = new tagmodel(environment),
      queryDSL = topicMapEnvironment.getQueryDSL();
  console.log("BlogModel");
//  this.types = types;
//  this.icons = icons;
  var self = this;

  /**
   * Update an existing node; no tags included
   */
  self.update = function(json, user, callback) {
	  PortalNodeModel.update(json, user, function blogMUpdate(err, result) {
		  return callback(err, null);
	  });
  };
  
  /**
   * Create a new blog post
   * @param json: a JSON object with appropriate values set
   * @param user: a JSON object of the user from the session
    * @param callback: signature (err, result): result = _id of new object
   */
  self.create = function (json, user, callback) {
	  console.log('BMXXXX '+JSON.stringify(json));
	  var isPrivate = false;
    if (json.isPrivate) {
      isPrivate = json.isPrivate;
    }
	  PortalNodeModel.create(json, user,types.BLOG_TYPE,icons.PUBLICATION_SM, icons.PUBLICATION, isPrivate, function blogMCreate(err, lox) {
      if (!isPrivate) {
		    myEnvironment.addRecentBlog(lox,json.title);
      }
		  return callback(err,lox);
	  });
  };
  
  self.listBlogPosts = function(start, count, credentials, callback) {
    var query = queryDSL.sortedDateTermQuery(properties.INSTANCE_OF,types.BLOG_TYPE,start,count);
    DataProvider.listNodesByQuery(query, start,count,credentials, function blogMListNodes(err, data, total) {
      console.log("BlogModel.listBlogPosts "+err+" "+data);
      return callback(err, data, total);
    });
  };
  
  /**
   * @param start
   * @param count
   * @param credentials
   * @param callback signatur (data, countsent, totalavailable)
   */
  self.fillDatatable = function(start, count,credentials, callback) {
	  self.listBlogPosts(start, count, credentials, function(err, result, totalx) {
	      console.log('BlogModel.fillDatatable '+err+' '+totalx+" "+result);
	      CommonModel.fillSubjectAuthorDateTable(result, "/blog/", totalx, function blogMFillTable(html, len, total) {
		      console.log("FILLING "+start+" "+count+" "+total);
		      return callback(html, len, total);
	      });
	  });
  };
  
};


