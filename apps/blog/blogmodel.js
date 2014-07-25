/**
 * Blog Model
 * <p>A blog post is an instance of a Topic.
 * Each tag is an instance of a Topic.
 * Each comment is an instance of a Topic.
 * All tags and comments are represented as
 * <em>relations</em> with the blog's Topic
 * </p>
 */
var types = require('../../node_modules/tqtopicmap/lib/types')
, icons = require('../../node_modules/tqtopicmap/lib/icons')
, properties = require('../../node_modules/tqtopicmap/lib/properties')

  , constants = require('../../core/constants')
  , uuid = require('../../core/util/uuidutil')
  , tagmodel = require('../tag/tagmodel');

var BlogModel =  module.exports = function(environment) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var TopicModel = topicMapEnvironment.getTopicModel();
	var TagModel = new tagmodel(environment);
	var queryDSL = topicMapEnvironment.getQueryDSL();
  console.log("BlogModel");
//  this.types = types;
//  this.icons = icons;
  var self = this;

  /**
   * Update an existing blog entry; no tags included
   */
  self.update = function(blog,user,credentials,callback) {
	  topicMapEnvironment.logDebug("BLOG.UPDATE "+JSON.stringify(blog));
	  var lox = blog.locator;
	  Dataprovider.getNodeByLocator(lox, credentials, function(err,result) {
		  var error = '';
		  if (err) {error += err;}
		  var title = blog.title;
		  var body = blog.body;
    	  var lang = blog.language;
    	  var comment = "an edit"; //TODO add comment field to form
    	  if (!lang) {lang = "en";}
    	  result.updateSubject(title,lang,user.handle,comment);
    	  result.updateBody(body,lang,user.handle,comment);
    	  result.setLastEditDate(new Date());

    	  Dataprovider.putNode(result, function(err,data) {
    		  if (err) {error += err;}
    		  callback(error,data);
    	  });
	  });
  },
  
  /**
   * Create a new blog post
   * @param blog: a JSON object with appropriate values set
   * @param user: a JSON object of the user from the session
   * @param credentials
   * @param callback: signature (err, result): result = _id of new object
   */
  self.create = function (blog, user, credentials, callback) {
	  console.log('BMXXXX '+JSON.stringify(blog));
	// some really wierd shit: the User object for the user database stores
	// as user.handle, but passport seems to muck around and return user.username
    var userLocator = user.handle; // It's supposed to be user.handle;
    //first, fetch this user's topic
    var userTopic;
    Dataprovider.getNodeByLocator(userLocator, credentials, function(err,result) {
      userTopic = result;
      console.log('BlogModel.create-1 '+userLocator+' | '+userTopic);
      // create the blog post
      console.log("FOO "+types.BLOG_TYPE);
      //NOTE: we are creating an AIR, which uses subject&body, not label&details
      TopicModel.newInstanceNode(uuid.newUUID(), types.BLOG_TYPE,
      		"", "", constants.ENGLISH, userLocator,
      		icons.PUBLICATION_SM, icons.PUBLICATION, false, credentials, function(err, article) {
    	  var lang = blog.language;
    	  if (!lang) {lang = "en";}
    	  var subj = blog.title;
    	  var body = blog.body;
    	  article.setSubject(subj,lang,userLocator);
    	  article.setBody(body,lang,userLocator);
    //	  console.log('BlogModel.create-2 '+article.toJSON());
			myEnvironment.addRecentBlog(article.getLocator(),blog.title);
    	     // now deal with tags
          var tags = blog.tags;
          if (tags.length > 0 && tags.indexOf(',') > -1) {
            var tagList = tags.split(',');
            TagModel.processTagList(tagList, userTopic, article, credentials, function(err,result) {
              console.log('NEW_POST-1 '+result);
              //result could be an empty list;
              //TagModel already added Tag_Doc and Doc_Tag relations
              console.log("ARTICLES_CREATE_2 "+JSON.stringify(article));
              Dataprovider.putNode(article, function(err,data) {
                console.log('ARTICLES_CREATE-3 '+err);	  
                if (err) {console.log('ARTICLES_CREATE-3a '+err)}
                console.log('ARTICLES_CREATE-3b '+userTopic);	  

                TopicModel.relateExistingNodes(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
                		userTopic.getLocator(),
                      		icons.RELATION_ICON, icons.RELATION_ICON, false, false, credentials, function(err,data) {
                    if (err) {console.log('ARTICLES_CREATE-3d '+err);}
                      callback(err,article.getLocator());
                 }); //r1
              }); //putnode 		  
        	}); // processtaglist
          } else {
            TagModel.processTag(tags, userTopic, article, credentials, function(err,result) {
              console.log('NEW_POST-2 '+result);
              //result is a list of tags already related to doc and user
              console.log("ARTICLES_CREATE_22 "+JSON.stringify(article));
              Dataprovider.putNode(article, function(err,data) {
                console.log('ARTICLES_CREATE-33 '+err);	  
                if (err) {console.log('ARTICLES_CREATE-33a '+err)};	  
                TopicModel.relateExistingNodes(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
                		userTopic.getLocator(),
                    		icons.RELATION_ICON_SM, icons.RELATION_ICON, false, false, credentials, function(err,data) {
                    if (err) {console.log('ARTICLES_CREATE-3d '+err);}
                      callback(err,article.getLocator());
                 }); //r1
              }); //putNode
            });//processTags
          } // else      	
      });
    });
  },
  
  self.listBlogPosts = function(start, count, credentials, callback) {
    var query = queryDSL.sortedDateTermQuery(properties.INSTANCE_OF,types.BLOG_TYPE,start,count);
    Dataprovider.listNodesByQuery(query, start,count,credentials, function(err,data) {
      console.log("BlogModel.listBlogPosts "+err+" "+data);
      callback(err,data);
    });
  },
  
  /**
   * @param credentials
   * @param callback signatur (data)
   */
  self.fillDatatable = function(credentials, callback) {
	  var theResult = {};
	  self.listBlogPosts(0,100,credentials,function(err,result) {
	      console.log('ROUTES/blog '+err+' '+result);
	      var data = [];
	      var len = result.length;
	      var p; //the proxy
	      var m; //the individual message
	      var url;
	      var posts = [];
	      for (var i=0;i<len;i++) {
	        p = result[i];
	        m = [];
	        url = "<a href='blog/"+p.getLocator()+"'>"+p.getSubject(constants.ENGLISH).theText+"</a>";
	        m.push(url);
	        url = "<a href='user/"+p.getCreatorId()+"'>"+p.getCreatorId()+"</a>";
	        m.push(url);
	        m.push(p.getDate());
	        data.push(m);
	      }
	      theResult.data = data;
	    //  console.log();
	    //  console.log("BlogModel.fillDatatable "+JSON.stringify(theResult));
	    //  console.log();
	    callback(theResult);
	  });
  }
  
};


