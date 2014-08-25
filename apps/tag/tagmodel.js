/**
 * TagModel
 */
var types = require('../../node_modules/tqtopicmap/lib/types')
, icons = require('../../node_modules/tqtopicmap/lib/icons')
, sb = require('../../node_modules/tqtopicmap/lib/util/stringbuilder')
, properties = require('../../node_modules/tqtopicmap/lib/properties')

  , constants = require('../../core/constants')
   , rpa = require('../../core/util/stringutil');

var TagModel = module.exports = function(environment) {
	var myEnvironment = environment;
	var CommonModel = environment.getCommonModel();
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var DataProvider = topicMapEnvironment.getDataProvider();
	var TopicModel = topicMapEnvironment.getTopicModel();
	var queryDSL = topicMapEnvironment.getQueryDSL();
	var replaceAll = rpa.replaceAll;
	var self = this;
	
	self.addTagsToNode = function(blog, user, credentials, callback) {
		var taglist = CommonModel.makeTagList(blog);
		var error = "";
		//get userTopic
		DataProvider.getNodeByLocator(user.handle, credentials, function(err,ut) {
			if (err) {error+=err;}
			var userTopic = ut;
			//get docTopic
			DataProvider.getNodeByLocator(blog.locator, credentials, function(err,dt) {
				if (err) {error+=err;}
				var docTopic = dt;
				//do the deed
				self.processTagList(taglist,userTopic,docTopic,credentials,function(err,result) {
					if (err) {error+=err;}
					callback(error,result);
				});
			});
			
		});
	},
	  /**
	   * Update an existing tag entry; no tags included
	   */
	  self.update = function(blog,user,credentials,callback) {
		  topicMapEnvironment.logDebug("TAG.UPDATE "+JSON.stringify(blog));
		  var lox = blog.locator;
		  DataProvider.getNodeByLocator(lox, credentials, function(err,result) {
			  var error = '';
			  if (err) {error += err;}
			  var title = blog.title;
			  var body = blog.body;
			  var isNotUpdateToBody = true;
	    	  var lang = blog.language;
	    	  if (!lang) {lang = "en";}
	    	  var oldBody = result.getDetails(lang);
	    	  if (oldBody) {
	    		  isNotUpdateToBody = (oldBody === body);
	    	  }
	    	  var oldLabel = result.getLabel(lang);
	    	  var isNotUpdateToLabel = (title === oldLabel);
	    	  if (!isNotUpdateToLabel) {
	    		  //crucial update to label
	    		  result.updateLabel(title,lang);
	    		  if (!isNotUpdateToBody) {
	    			  result.updateDetails(body,lang)
	    		  }
		    	  result.setLastEditDate(new Date());
		    	  DataProvider.updateNodeLabel(result, oldLabel, title, credentials, function(err,data) {
		    		  if (err) {error += err;}
		    		  console.log("TagModel.update "+error+" "+oldLabel+" "+title);
		    		  callback(error,data);
		    	  });
	    	  } else if (!isNotUpdateToBody) {
	    		  //simple update
    			  result.updateDetails(body,lang)
    			  result.setLastEditDate(new Date());
    			  DataProvider.putNode(result,function(err,data) {
    				  if (err) {error += err;}
    				  callback(error,data);
    			  });
	    	  } else {
	    		  //nothing to do. Wonder why?
	    		  callback(error,null);
	    	  }
		  });
	  },
  /**
   * Process new tags into Topic objects
   * @param tags: one of String or []
   * @callback: signature (err, results)
   * where <code>results</code> include two lists:
   * { locators: [],
   *   labels: [] }
   */
  //{"locators":["First_Tag_TAG","First_Post_TAG","Bitchen_TAG"],
  //"labels":["First Tag","First Post","Bitchen"]}	
  self.processTagList = function(tagList, usertopic, docTopic, credentials, callback) {
    console.log('TAGS.processTagList '+tagList+' '+usertopic);
    var labels = [];
    var locators = [];
    var locator;
    var result = {};
    var len = tagList.length;
    var label, cursor = 0;
    var error='';
    var myTags = [];
    function loop() {
      if (cursor >= len) {
        console.log('TAGS.processTagList+ '+myTags);
        return callback(error, myTags);
      }
      label = tagList[cursor++].trim();
      locator = replaceAll(label, ' ', '_');
      locator = locator+'_TAG';
      console.log('TAGS.processTagList-1 '+locator);
      self.__findOrCreateTag(locator, label, usertopic,docTopic, credentials, function(err,aTag) {
        console.log('TAGS.processTagList-2 '+err+' '+aTag);
        if (err) {error += err;}
        if (aTag) // sanity 
          myTags.push(aTag);
      });
      //stay in the loop
      loop();
    };
    //start the loop
    loop();
  },
	
  self.processTag = function(tagString, usertopic, docTopic, credentials, callback) {
    console.log('TAGS.processTag '+tagString+' '+usertopic);
    var result = {};
    if (!tagString) {
      callback(null,myTags);
    }
    if (tagString !== "") {
      var locator, label;
      label = tagString.trim();
      console.log('TAG-2 '+label);
      var buf = new sb();
      var len = label.length;
      var c;
      //We really have to clean up the locator: no funky stuff
      for (var i=0;i<len;i++) {
    	  c = label.charAt(i);
    	  if (c === ' ' ||
    		  c === '\'' ||
    		  c === ',' ||
    		  c === '-') {
    		  c = '_';
    	  }
    	  buf.append(c);
      }
      
      locator = buf.toString()+'_TAG';
      var myTags = [];
      //find or create this tag
      self.__findOrCreateTag(locator, label, usertopic,docTopic, credentials, function(err,aTag) {
        console.log('TAGS.processTag-1 '+err+' '+aTag);
        if (aTag) // sanity 
          myTags.push(aTag);
        callback(err,myTags);
      });
    }
  },

  /**
   * Utility to see if a tag with <code>tagLocator</code> exists. If not, create it.
   * NOTE: there is an axynch issue: we call this and let it run at its own pace. It
   * might happen that the calling model, typically BlogModel, might begin doing the
   * relationship wiring before this completes.
   * @param tagLocator
   * @param label
   * @param usertopic
   * @param docTopic
   * @param credentials
   * @param callback: signature (err, aTag)
   */
  self.__findOrCreateTag = function(tagLocator, label, usertopic, docTopic, credentials, callback) {
	console.log('TagModel.__findOrCreateTag '+tagLocator+' '+usertopic);
	var error='';
	DataProvider.getNodeByLocator(tagLocator,credentials, function(err,result) {
		console.log('TagModel.__findOrCreateTag-1 '+tagLocator+' '+err+' '+result);
		if (err) {error += err;}
		//Result will be a Topic or null
		var theTag = result;
		
		if (!theTag) {
			//create the tag
			TopicModel.newInstanceNode(tagLocator, types.TAG_TYPE, label, "",constants.ENGLISH,
					usertopic.getLocator(), icons.TAG_SM, icons.TAG, false, credentials, function(err, result) {
				theTag = result;
				console.log('TagModel.__findOrCreateTag-2 '+theTag.toJSON());
				DataProvider.putNode(theTag, function(err, result) {
					console.log("TagModel.__findOrCreateTag-3 "+err+" "+result);
					myEnvironment.addRecentTag(tagLocator,label);
					topicMapEnvironment.logDebug("TagModel just added to RingBuffer");
					if (err) {error += err;}
					//wire this tag's relations
					self.__wireRelations(theTag,  docTopic, usertopic,credentials, function(err,data) {
						if (err) {error += err;}
					});
				});
			});
		} else {
			topicMapEnvironment.logDebug("TagModel.__findOrCreateTag found "+theTag.toJSON());
			//wire this tag's relations
			self.__wireRelations(theTag,  docTopic, usertopic,credentials, function(err,data) {
				if (err) {error += err;}
			});
		}
		callback(error,theTag);
	});
  },
  

  self.__wireRelations = function(theTag, theDoc, theUser, credentials, callback) {
	var error='';
	topicMapEnvironment.logDebug("TagModel.__wireRelations "+theTag.getLocator()+" "+theDoc.getLocator()+
			" "+theUser.getLocator());
	//sourceNode, targetNode,relationTypeLocator, userLocator, smallImagePath,
	//largeImagePath, isTransclude, isPrivate, credentials, callback
	//myEnvironment.logDebug('TagModel.__wireRelations-1 '+types.TAG_CREATOR_RELATION_TYPE+" "+theUser.getLocator()+" "+theTag.getLocator());
	topicMapEnvironment.logDebug('TagModel.__wireRelations-1 '+types.TAG_CREATOR_RELATION_TYPE+" "+theUser.getLocator()+" "+theTag.getLocator());
	TopicModel.relateExistingNodesAsPivots(theUser,theTag,types.TAG_CREATOR_RELATION_TYPE,
			theUser.getLocator(),
			icons.RELATION_ICON_SM, icons.RELATION_ICON, false, false, credentials, function(err,data) {
		if (err) {error+=err;}
		//myEnvironment.logDebug('TagModel.__wireRelations-2 '+types.TAG_DOCUMENT_RELATION_TYPE+" "+theTag.getLocator()+" "+theDoc.getLocator());
		topicMapEnvironment.logDebug('TagModel.__wireRelations-2 '+types.TAG_DOCUMENT_RELATION_TYPE+" "+theTag.getLocator()+" "+theDoc.getLocator());
		TopicModel.relateExistingNodesAsPivots(theTag,theDoc,types.TAG_DOCUMENT_RELATION_TYPE,
				theUser.getLocator(),
				icons.RELATION_ICON_SM, icons.RELATION_ICON, false, false, credentials, function(err,data) {
			if (err) {error+=err;}
			callback(error,null);
		});
	});
  },
  
  
  self.listTags = function(start, count, credentials, callback) {
	  //TODO DataProvider doesn't do tuplecounting well; the tpC property is missing
	//var query = queryDSL.sortedTupleCountTermQuery(properties.INSTANCE_OF,types.TAG_TYPE);
	//DataProvider.listNodesByQuery(query, start,count,credentials, function(err,data,total) {
	DataProvider.listInstanceNodes(types.TAG_TYPE, start,count,credentials, function(err,data,total) {
		console.log("TagModel.listTags "+err+" "+data,total);
		callback(err,data, total);
	});
  },

  /**
   * @param credentials
   * @param callback signatur (data)
   */
  self.fillDatatable = function(start, count, credentials, callback) {
	self.listTags(start,count,credentials,function(err,result,totalx) {
		console.log('ROUTES/tag '+err+' '+result);
	      CommonModel.fillSubjectAuthorDateTable(result,"/tag/",totalx, function(html,len,total) {
		      console.log("FILLING "+start+" "+count+" "+total);
		      callback(html,len,total);
	    	  
	      });
	});
  }
};