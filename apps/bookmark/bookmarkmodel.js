/**
 * Bookmark model
 */
var types = require('tqtopicmap/lib/types')
  , icons = require('tqtopicmap/lib/icons')
  , properties = require('tqtopicmap/lib/properties')

  , constants = require('../../core/constants')
  , uuid = require('../../core/util/uuidutil')
  , tagmodel = require('../tag/tagmodel');

var BookmarkModel =  module.exports = function(environment) {
	var myEnvironment = environment,
		CommonModel = environment.getCommonModel(),
		PortalNodeModel = environment.getPortalNodeModel(),
		topicMapEnvironment = environment.getTopicMapEnvironment(),
		DataProvider = topicMapEnvironment.getDataProvider(),
		TopicModel = topicMapEnvironment.getTopicModel(),
		TagModel = new tagmodel(environment),
		queryDSL = topicMapEnvironment.getQueryDSL(),
		self = this;
  
	self.getBookmarkByURL = function(url, credentials, callback) {
		DataProvider.getNodeByURL(url, credentials, function bookmarkMGetNode(err, data) {
			console.log('BookmarkModel.getNodeByURL '+url+" "+err+" "+data);
			return callback(err, data);
		});
	};

	/**
	 * Update an existing node; no tags included
	 */
	self.update = function(json,user,callback) {
		PortalNodeModel.update(json,user,function boomkarkMUpdate(err, result) {
			return callback(err,null);
		});
	};
	

	self.createAnnotationAndTags = function(bookmarkNode, blog, userTopic, credentials, callback) {
		myEnvironment.logDebug("BBBB "+JSON.stringify(userTopic));
		//TODO create the position node
		//copy from conversationmodel (move to common model?)
		//Deal with tags
		var lang = blog.language,
			url = blog.url,
			error = "";
		var isPrivate = bookmarkNode.getIsPrivate();


		if (!lang) {lang = "en";}

		topicMapEnvironment.logDebug("BookmarkModel.createAnnotationAndTags "+bookmarkNode.toJSON());
		//contextLocator, parentNode,newLocator, 
		//nodeType, subject, body, language, smallIcon, largeIcon,
		//  credentials, userLocator, isPrivate, callback
		TopicModel.createTreeNode(bookmarkNode.getLocator(), bookmarkNode, "", types.NOTE_TYPE,
						blog.subject, blog.body, lang, icons.NOTE_SM, icons.NOTE,
						credentials, userTopic.getLocator(), isPrivate, function boomkarkMCreateTreeNode(err, data) {
			var positionNode = data;
			positionNode.setResourceUrl(url);
			if (!isPrivate) {
			  myEnvironment.addRecentConversation(positionNode.getLocator(),blog.subject);
			}
			if (err) {error += err;}
			var taglist = CommonModel.makeTagList(blog);
			topicMapEnvironment.logDebug("BookmarkModel.createAnnotationAndTags-1 "+JSON.stringify(taglist));
	        if (taglist.length > 0) {
				TagModel.processTagList(taglist, userTopic, positionNode, credentials, function bookmarkMProcessTags(err, result) {
					console.log('NEW_POST-1 '+result);
					//result could be an empty list;
					//TagModel already added Tag_Doc and Doc_Tag relations
					console.log("ARTICLES_CREATE_2 "+JSON.stringify(positionNode));
					DataProvider.putNode(positionNode, function bookmarkMPutNode(err, data) {
						console.log('ARTICLES_CREATE-3 '+err);	  
						if (err) {error += err;}
						console.log('ARTICLES_CREATE-3b '+userTopic);	  
						TopicModel.relateExistingNodesAsPivots(userTopic ,positionNode, types.CREATOR_DOCUMENT_RELATION_TYPE,
														userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON,
														isPrivate, credentials, function bookmarkMRelateNodes(err, data) {
							if (err) {error += err;}
							return callback(error,positionNode.getLocator());
						}); //r1
					}); //putnode 		  
				}); // processtaglist
	        } else {
	            DataProvider.putNode(positionNode, function bookmarkMPutNode1(err, data) {
					console.log('ARTICLES_CREATE-3 '+err);	  
					if (err) {error += err;}
					console.log('ARTICLES_CREATE-3b '+userTopic);	  
					TopicModel.relateExistingNodesAsPivots(userTopic, positionNode,types.CREATOR_DOCUMENT_RELATION_TYPE,
		              			userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON,
		              			isPrivate, credentials, function bookmarkMRelateNodes1(err, data) {
		      			if (err) {error += err;}
						return callback(error, positionNode.getLocator());
					}); //r1
				}); //putnode 		  
	        }
		});
	};
	/**
	 * This is a bookmark. A bookmark for this URL might already exist.
	 * If so, we simply add a new AIR to it. Bookmark form has URL, title, subject, body, tags.
	 * If the bookmark doesn't exist, create it.
	 * Given the bookmark, then create a Position node with it as the conversation root.
	 */
	self.create = function (blog, user, credentials, callback) {
		topicMapEnvironment.logDebug('BOOKMARK.create '+JSON.stringify(blog));
		// some really wierd shit: the User object for the user database stores
		// as user.handle, but passport seems to muck around and return user.username
	    var userLocator = user.handle, // It's supposed to be user.handle;
	    //first, fetch this user's topic
			url = blog.url,
			userTopic,
			bookmarkTopic,
			error = '',
			retval;
			isPrivate = false;
	    if (blog.isPrivate) {
	    	isPrivate = blog.isPrivate;
	    }
	    //get the user
	    DataProvider.getNodeByLocator(userLocator, credentials, function bookmarkMGetNode1(err, utpx) {
	    	if (err) {error+=err;}
	    	if (utpx) {
				userTopic = utpx;
				topicMapEnvironment.logDebug('BookmarkModel.create- '+userLocator+' | '+userTopic.toJSON());
				//see if the bookmark exists
				DataProvider.getNodeByURL(url, credentials, function bookmarkMGetNode2(err, dNode) {
					if (err) {error+=err;}
					var lox;
					topicMapEnvironment.logDebug("BookmarkModel.create-1 "+url+" "+lox);
			      	if (dNode) {
			      		lox = dNode.getLocator();
						bookmarkTopic = dNode;
						//MAKE Note
						//TAGS to Bookmark and Position
						self.createAnnotationAndTags(bookmarkTopic, blog, userTopic, credentials, function bookmarkMCreateAnnotation(err, result) {
						      if (err) {error+=err;}
				    		  return callback(error, result);
						});
					} else {
				    	  //create the bookmark
					      TopicModel.newInstanceNode(uuid.newUUID(), types.BOOKMARK_TYPE,
						      		"", "", constants.ENGLISH, userLocator,
						      		icons.BOOKMARK_SM, icons.BOOKMARK, isPrivate, credentials, function bookmarkMNewInstance(err, article) {
					    	  myEnvironment.logDebug("BookmarkModel.create-2 "+err+" "+article);
						      if (err) {error+=err;}
						      bookmarkTopic = article;
					    	  var lang = blog.language;
					    	  if (!lang) {lang = "en";}
					    	  var subj = blog.title;
					    	  article.setSubject(subj,lang,userLocator);
					    	  article.setBody("",lang,userLocator);
					    	  article.setResourceUrl(url);
					    	  if (!isPrivate) {
							  	myEnvironment.addRecentBookmark(bookmarkTopic.getLocator(), blog.title);
							  }
							  DataProvider.putNode(bookmarkTopic, function bookmarkMPutNode2(err, data) {
							      if (err) {error+=err;}
							      TopicModel.relateExistingNodesAsPivots(userTopic,bookmarkTopic,types.CREATOR_DOCUMENT_RELATION_TYPE,
						              						userTopic.getLocator(), icons.RELATION_ICON_SM, icons.RELATION_ICON,
						              						isPrivate, credentials, function bookmarkMRelateNodes2(err, data) {
							  			  if (err) {error += err;}
							  			  //MAKE POSITION
							  			  //TAGS to Bookmark and Position
							  			  self.createAnnotationAndTags(bookmarkTopic, blog, userTopic, credentials, function bookmarkMCreateAnnotation1(err, result) {
							  				  if (err) {error+=err;}
							  				  return callback(error, result);
							  			  });
							      });
							  });
					      });
					}
			    }); //getNodeByURL
		    } else {
		    	return callback(error, retval);
		    }	  
		}); //getNodeByLocator
	};
	  
	  self.listBlogPosts = function(start, count, credentials, callback) {
	    var query = queryDSL.sortedDateTermQuery(properties.INSTANCE_OF,types.BOOKMARK_TYPE,start,count);
	    DataProvider.listNodesByQuery(query, start, count, credentials, function bookmarkMListNodes(err, data, total) {
	      console.log("BookmarkModel.listBlogPosts "+err+" "+data);
	      return callback(err, data, total);
	    });
	  };
	  
	  /**
	   * @param credentials
	   * @param callback signature (html, length, total)
	   */
	  self.fillDatatable = function(start, count, credentials, callback) {
		  self.listBlogPosts(start,count,credentials,function(err,result,totalx) {
		      console.log('ROUTES/bookmark '+err+' '+result);
		      CommonModel.fillSubjectAuthorDateTable(result, "/bookmark/", totalx, function bookmarkMFillTable(html, len, total) {
			      console.log("FILLING "+start+" "+count+" "+total);
			      return callback(html, len, total);
		    	  
		      });
		  });
	  };
};