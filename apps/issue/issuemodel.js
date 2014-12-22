/**
 * IssueModel
 * Issues, not to be confused with IBIS ISSUE_TYPE (question) is a CHALLENGE_TYPE
 */
var types = require('../../node_modules/tqtopicmap/lib/types'),
	icons = require('../../node_modules/tqtopicmap/lib/icons'),
	properties = require('../../node_modules/tqtopicmap/lib/properties'),
	Gameenv = require('../rpg/rpgenvironment'),
	constants = require('../../core/constants'),
	uuid = require('../../core/util/uuidutil'),
    Infobox = require('../rpg/guildquestinfobox'),
	Tagmodel = require('../tag/tagmodel')
;

var IssueModel =  module.exports = function(environment) {
	var myEnvironment = environment,
	    TopicMapEnvironment = environment.getTopicMapEnvironment(),
	    DataProvider = TopicMapEnvironment.getDataProvider(),
	    TopicModel = TopicMapEnvironment.getTopicModel(),
	    TagModel = new Tagmodel(environment),
	    CommonModel = environment.getCommonModel(),
	    queryDSL = TopicMapEnvironment.getQueryDSL(),
        RPGEnvironment = environment.getRPGEnvironment(),
        self = this;
	
	self.getRPGEnvironment = function() {
		return RPGEnvironment;
	};
	
	
	/**
	 * Update an existing issue (quest); no tags included
	 */
	self.update = function(blog, user, credentials, callback) {
		myEnvironment.logDebug("Issue.UPDATE "+JSON.stringify(blog));
		var lox = blog.locator;
		DataProvider.getNodeByLocator(lox, credentials, function(err, result) {
			var error = '';
			if (err) {error += err;}
			var title = blog.title,
				body = blog.body,
				lang = blog.language,
				comment = "an edit by "+user.handle;
			if (!lang) {lang = "en";}
			var isNotUpdateToBody = true,
				oldBody;
			if(result.getBody(lang)) {
				oldBody = result.getBody(lang).theText;
			}
			if (oldBody) {
				isNotUpdateToBody = (oldBody === body);
			}
			var oldLabel = result.getSubject(lang).theText,
				isNotUpdateToLabel = (title === oldLabel);
			if (!isNotUpdateToLabel) {
				//crucial update to label
				result.updateSubject(title,lang,user.handle,comment);
				if (!isNotUpdateToBody) {
					result.updateBody(body,lang,user.handle,comment);
				}
				result.setLastEditDate(new Date());
				DataProvider.updateNodeLabel(result, oldLabel, title, credentials, function(err, data) {
					if (err) {error += err;}
					console.log("IssueModel.update "+error+" "+oldLabel+" "+title);
					return callback(error, data);
				});
			} else if (!isNotUpdateToBody) {
				result.updateBody(body, lang, user. handle, comment);
				result.setLastEditDate(new Date());
				DataProvider.putNode(result, function(err, data) {
					if (err) {error += err;}
					return callback(error, data);
				});
			} else {
				var foo;
				return callback(error, foo);
			}
		});
	};
	  
	  /**
	   * Create a new issue post
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
	    DataProvider.getNodeByLocator(userLocator, credentials, function(err,result) {
	      userTopic = result;
	      console.log('IssueModel.create-1 '+userLocator+' | '+userTopic);
	      // create the blog post
	      console.log("FOO "+types.CHALLENGE_TYPE);
	      //NOTE: we are creating an AIR, which uses subject&body, not label&details
	      TopicModel.newInstanceNode(uuid.newUUID(), types.CHALLENGE_TYPE,
	      		"", "", constants.ENGLISH, userLocator,
	      		icons.WARNING_SM, icons.WARNING, false, credentials, function(err, article) {
	    	  var lang = blog.language;
	    	  if (!lang) {lang = "en";}
	    	  var subj = blog.title;
	    	  var body = blog.body;
	    	  article.setSubject(subj,lang,userLocator);
	    	  article.setBody(body.trim(),lang,userLocator);
	    //	  console.log('BlogModel.create-2 '+article.toJSON());
	    	  RPGEnvironment.addRecentIssue(article.getLocator(),blog.title);
	    	     // now deal with tags
				var taglist = CommonModel.makeTagList(blog);
	          if (taglist.length > 0) {
	            TagModel.processTagList(taglist, userTopic, article, credentials, function(err,result) {
	              console.log('NEW_POST-1 '+result);
	              //result could be an empty list;
	              //TagModel already added Tag_Doc and Doc_Tag relations
	              console.log("ARTICLES_CREATE_2 "+JSON.stringify(article));
	              DataProvider.putNode(article, function(err,data) {
	                console.log('ARTICLES_CREATE-3 '+err);	  
	                if (err) {console.log('ARTICLES_CREATE-3a '+err)}
	                console.log('ARTICLES_CREATE-3b '+userTopic);	  

	                TopicModel.relateExistingNodesAsPivots(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
	                		userTopic.getLocator(),
	                      		icons.RELATION_ICON, icons.RELATION_ICON, false, credentials, function(err,data) {
	                    if (err) {console.log('ARTICLES_CREATE-3d '+err);}
	                    return callback(err,article.getLocator());
	                 }); //r1
	              }); //putnode 		  
	        	}); // processtaglist
	          }  else {
	              DataProvider.putNode(article, function(err,data) {
	                  console.log('ARTICLES_CREATE-3 '+err);	  
	                  if (err) {console.log('ARTICLES_CREATE-3a '+err)}
	                  console.log('ARTICLES_CREATE-3b '+userTopic);	  

	                  TopicModel.relateExistingNodesAsPivots(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
	                  		userTopic.getLocator(),
	                       icons.RELATION_ICON, icons.RELATION_ICON, false, credentials, function(err,data) {
	                               if (err) {console.log('ARTICLES_CREATE-3d '+err);}
	                               return callback(err, article.getLocator());
	                       }); //r1
	                }); //putnode 		  

	          }    	
	      });
	    });
	  };
	  
	  self.listIssues = function(start, count, credentials, callback) {
        DataProvider.listInstanceNodes(types.CHALLENGE_TYPE, start,count,credentials, function(err,data,total){
                console.log("IssueModel.listIssues "+err+" "+data);
	      return callback(err,data, total);
	    });
	  };
	  
	  /**
	   * @param start
	   * @param count
	   * @param credentials
	   * @param callback signatur (data, countsent, totalavailable)
	   */
	  self.fillDatatable = function(start, count,credentials, callback) {
		  self.listIssues(start,count,credentials,function(err,result, totalx) {
		      console.log('IssueModel.fillDatatable '+err+' '+totalx+" "+result);
		      CommonModel.fillSubjectAuthorDateTable(result,"/issue/",totalx, function(html,len,total) {
			      console.log("FILLING "+start+" "+count+" "+total);
			      return callback(html,len,total);
		    	  
		      });
		  });
	  };
	  
}