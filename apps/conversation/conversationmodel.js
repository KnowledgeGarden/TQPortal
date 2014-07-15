/**
 * ConversationModel
 * For managing structured conversations, which could be blog posts
 * or actual IBIS trees
 */

var types = require('../../core/types')
  , icons = require('../../core/icons')
  , constants = require('../../core/constants');

var ConversationModel = module.exports = function(environment) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  var TopicModel = topicMapEnvironment.getTopicModel();
  var self = this;	
  
  ///////////////////////////////
  //TODO
  // We need a create for each node type
  // The root class is CONVERSATION_MAP_TYPE
  
  self.createMap = function(blog,user, parentNodeLocator, credentials, callback) {
	  self.create(blog,user,types.CONVERSATION_MAP_TYPE,credentials, function(err,result) {
		  callback(err,result);
	  } );
  },
  
  self.createIssue = function(blog,user, parentNodeLocator, credentials, callback) {
	  self.create(blog,user,types.ISSUE_TYPE,credentials, function(err,result) {
		  callback(err,result);
	  } );
  },
  self.createPosition = function(blog,user, parentNodeLocator, credentials, callback) {
	  self.create(blog,user,types.POSITION_TYPE,credentials, function(err,result) {
		  callback(err,result);
	  } );
  },

  self.createPro = function(blog,user, parentNodeLocator, credentials, callback) {
	  self.create(blog,user,types.PRO_TYPE,credentials, function(err,result) {
		  callback(err,result);
	  } );
  },

  self.createCon = function(blog,user, parentNodeLocator, credentials, callback) {
	  self.create(blog,user,types.CON_TYPE,credentials, function(err,result) {
		  callback(err,result);
	  } );
  },

  
  /**
   * Create a new conversation node
   * @param blog: a JSON object with appropriate values set
   * @param user: a JSON object of the user from the session
   * @param nodeType: maptype, protype, etc
   * @param parentNodeLocator: can be <code>null</code>
   * @param credentials
   * @param callback: signature (err, result): result = _id of new object
   */
  self.create = function (blog, user, nodeType, parentNodeLocator,credentials, callback) {
//	  console.log('BM '+JSON.stringify(user));
	// some really wierd shit: the User object for the user database stores
	// as user.handle, but passport seems to muck around and return user.username
    var userLocator = user.handle; // It's supposed to be user.handle;
    //first, fetch this user's topic
    var userTopic;
    Dataprovider.getNodeByLocator(userLocator, credentials, function(err,result) {
      userTopic = result;
      console.log('BlogModel.create-1 '+userLocator+' | '+userTopic);
      // create the blog post
      TopicModel.newInstanceNode(uuid.newUUID(), nodeType,
      		blog.title, blog.body, constants.ENGLISH, userLocator,
      		icons.PUBLICATION_SM, icons.PUBLICATION, false, credentials, function(err, article) {
    	  console.log('BlogModel.create-2 '+article.toJSON());
    	     // now deal with tags
          var tags = blog.tags;
          if (tags.indexOf(',') > -1) {
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
  
  self.listConversations = function(start, count, credentials, callback) {
    var query = queryDSL.sortedDateTermQuery(properties.INSTANCE_OF,types.CONVERSATION_MAP_TYPE);
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
	  self.listConversations(0,-1,credentials,function(err,result) {
	      console.log('ROUTES/conversation '+err+' '+result);
	      var data = [];
	      var len = result.length;
	      var p; //the proxy
	      var m; //the individual message
	      var url;
	      var posts = [];
	      for (var i=0;i<len;i++) {
	        p = result[i];
	        m = [];
	        url = "<a href='conversation/"+p.getLocator()+"'>"+p.getLabel(constants.ENGLISH)+"</a>";
	        m.push(url);
	        url = "<a href='user/"+p.getCreatorId()+"'>"+p.getCreatorId()+"</a>";
	        m.push(url);
	        m.push(p.getDate());
	        data.push(m);
	      }
	      theResult.data = data;
	      console.log();
	      console.log("ConversationModel.fillDatatable "+JSON.stringify(theResult));
	      console.log();
	    callback(theResult);
	  });
  }
};
