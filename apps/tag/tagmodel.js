/**
 * TagModel
 * NOTE: in this implementation, all tags are public
 */
var types = require('tqtopicmap/lib/types')
	, icons = require('tqtopicmap/lib/icons')
	, sb = require('tqtopicmap/lib/util/stringbuilder')
	, properties = require('tqtopicmap/lib/properties')
	, extendedtypes = require("../../core/extendedtypology")
	, constants = require('../../core/constants')
//	, S = require('string')
	, rpa = require('../../core/util/stringutil')
;

var TagModel = module.exports = function(environment, cm, tmenv) {
	var myEnvironment = environment,
        CommonModel = cm;
    if (!cm) {
        CommonModel = environment.getCommonModel();
    }
	var topicMapEnvironment = tmenv;
    if (!topicMapEnvironment) {
        topicMapEnvironment = environment.getTopicMapEnvironment();
    }
    var DataProvider = topicMapEnvironment.getDataProvider(),
        TopicModel = topicMapEnvironment.getTopicModel(),
        queryDSL = topicMapEnvironment.getQueryDSL(),
        replaceAll = rpa.replaceAll,
        self = this;
	
	self.addTagsToNode = function(blog, user, credentials, callback) {
		var taglist = CommonModel.makeTagList(blog),
			error = "",
			retval;
		//get userTopic
		DataProvider.getNodeByLocator(user.handle, credentials, function tagMGetNode(err, ut) {
			if (err) {error+=err;}
			if (ut) {
				var userTopic = ut;
				//get docTopic
				DataProvider.getNodeByLocator(blog.locator, credentials, function tagMGetNode1(err, dt) {
					if (err) {error+=err;}
					var docTopic = dt;
					if (dt) {
						//do the deed
						self.processTagList(taglist, userTopic, docTopic, credentials,function tagMProcessTags(err, result) {
							if (err) {error+=err;}
							return callback(error, result);
						});
					} else {
						return callback(error, retval);
					}
				});
			} else {
				return callback(error, retval);
			}
			
		});
	};
	
	  /**
	   * Update an existing tag entry; no tags included
	   */
	self.update = function(blog, user, credentials, callback) {
		topicMapEnvironment.logDebug("TAG.UPDATE "+JSON.stringify(blog));
		var lox = blog.locator,
			error = '',
			retval;
		DataProvider.getNodeByLocator(lox, credentials, function tagMGetNode2(err, result) {
			if (err) {error += err;}
			if (result) {
				var title = blog.title,
					body = blog.body,
					isNotUpdateToBody = true,
					lang = blog.language;
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
			    	  DataProvider.updateNodeLabel(result, oldLabel, title, credentials, function tagMUpdateNodeLabel(err, data) {
			    		  if (err) {error += err;}
			    		  console.log("TagModel.update "+error+" "+oldLabel+" "+title);
			    		  return callback(error,data);
			    	  });
		    	  } else if (!isNotUpdateToBody) {
		    		  //simple update
	    			  result.updateDetails(body,lang)
	    			  result.setLastEditDate(new Date());
	    			  DataProvider.putNode(result,function tagMPutNode(err, data) {
	    				  if (err) {error += err;}
	    				  return callback(error,data);
	    			  });
		    	  } else {
		    		  //nothing to do. Wonder why?
		    		  return callback(error, retval);
		    	  }
	    	} else {
	    		return callback(error, retval);
	    	}
		});
	};
	  
	self.__makeLocator = function(tagString) {
		  var label = tagString.trim();
          label = label.toLowerCase();
	      var locator = replaceAll(label, " ", "_");
          locator = replaceAll(locator, "'", "_");
          locator = replaceAll(locator, ":", "_");
          locator = replaceAll(locator, "+", "P");
          locator = replaceAll(locator, "-", "M");
	      locator = locator+'_TAG';
	      return locator;
	};
	  
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
	  //TODO
	  //ADD ability to setIntersect joint tags
  self.processTagList = function(tagList, usertopic, docTopic, credentials, callback) {
    topicMapEnvironment.logDebug('TAGS.processTagList '+tagList+' '+usertopic);
    var labels = [],
		locators = [],
		locator,
		result = {},
		len = tagList.length,
		label, cursor = 0,
		error='',
		myTags = [];
    function loop() {
      if (cursor >= len) {
        console.log('TAGS.processTagList+ '+myTags);
        return callback(error, myTags);
      }
      label = tagList[cursor++].trim();
      locator = self.__makeLocator(label);
      console.log('TAGS.processTagList-1 '+locator);
      self.__findOrCreateTag(tagList, locator, label, usertopic, docTopic, credentials, function tagMFindCreate(err, aTag) {
        console.log('TAGS.processTagList-2 '+err+' '+aTag);
        if (err) {error += err;}
        if (aTag) {// sanity 
          myTags.push(aTag);
        }
      });
      //stay in the loop
      loop();
    }
    //start the loop
    loop();
  };
	
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
		var buf = new sb(),
			len = label.length,
			c;
      //We really have to clean up the locator: no funky stuff
      for (var i=0;i<len;i++) {
    	  c = label.charAt(i);
    	  if (c === ' ' ||
    		  c === '\'' ||
    		  c === ',' ||
    		  c === '-') { c = '_'; }
    	  buf.append(c);
      }
      
      locator = buf.toString()+'_TAG';
      var myTags = [];
      //find or create this tag
      self.__findOrCreateTag(taglist,locator, label, usertopic,docTopic, credentials, function tagMFindCreate1(err, Tag) {
        console.log('TAGS.processTag-1 '+err+' '+aTag);
        if (aTag) {// sanity 
          myTags.push(aTag);
      	}
        return callback(err,myTags);
      });
    }
  };
  
  /**
   * Creates and maintains a set of shared tags
   * @param tagNode
   * @param tagList
   */
  self.__joinTags = function(tagNode, tagList) {
	  var lox = tagNode.getLocator();
	  var jl = tagNode.getProperty(extendedtypes.JOINT_TAG_LIST);
	  if (!jl) {jl = [];}
	  var n, tlox;
	  var len = tagList.length;
	  for (var i=0;i<len;i++) {
		  tlox = tagList[i];
		  //must be a tag locator, not a tag without a locator
		  if (tlox.indexOf("_TAG") > -1) {
			  if (tlox !== lox) {
				  if (jl.indexOf(tlox < 0)) {
					  jl.push(tlox);
				  }
			  }
		  } else {
			  tlox = self.__makeLocator(tlox);
			  jl.push(tlox);
		  }
	  }
	  tagNode.setProperty(extendedtypes.JOINT_TAG_LIST, jl);
  };

  /**
   * Utility to see if a tag with <code>tagLocator</code> exists. If not, create it.
   * NOTE: there is an axynch issue: we call this and let it run at its own pace. It
   * might happen that the calling model, typically BlogModel, might begin doing the
   * relationship wiring before this completes.
   * @param taglist
   * @param tagLocator
   * @param label
   * @param usertopic
   * @param docTopic
   * @param credentials
   * @param callback: signature (err, aTag)
   */
  self.__findOrCreateTag = function(taglist, tagLocator, label, usertopic, docTopic, credentials, callback) {
	topicMapEnvironment.logDebug('TagModel.__findOrCreateTag '+tagLocator+' '+usertopic);
	var error='',
		theTag;
	DataProvider.getNodeByLocator(tagLocator,credentials, function tagMGetNode3(err, result) {
		console.log('TagModel.__findOrCreateTag-1 '+tagLocator+' '+err+' '+result);
		if (err) {error += err;}
		//Result will be a Topic or null
		theTag = result;
		
		if (!theTag) {
			//create the tag
			//TODO: notice assume PUBLIC nodes here
			TopicModel.newInstanceNode(tagLocator, types.TAG_TYPE, label, "",constants.ENGLISH,
					usertopic.getLocator(), icons.TAG_SM, icons.TAG, false, credentials, function tagMNewInstance(err, result) {
				theTag = result;
				self.__joinTags(theTag,taglist);
				console.log('TagModel.__findOrCreateTag-2 '+theTag.toJSON());
				DataProvider.putNode(theTag, function tagMPutNode1(err, result) {
					console.log("TagModel.__findOrCreateTag-3 "+err+" "+result);
					myEnvironment.addRecentTag(tagLocator,label);
					topicMapEnvironment.logDebug("TagModel just added to RingBuffer");
					if (err) {error += err;}
					//wire this tag's relations
					self.__wireRelations(theTag,  docTopic, usertopic, credentials, function tagMWireRelations(err, data) {
						if (err) {error += err;}
					});
				});
			});
		} else {
			self.__joinTags(theTag, taglist);
			topicMapEnvironment.logDebug("TagModel.__findOrCreateTag found "+theTag.toJSON());
			//wire this tag's relations
			self.__wireRelations(theTag, docTopic, usertopic, credentials, function tagMWireRelations1(err, data) {
				if (err) {error += err;}
			});
		}
		return callback(error, theTag);
	});
  };
  

  self.__wireRelations = function(theTag, theDoc, theUser, credentials, callback) {
	var error='';
	topicMapEnvironment.logDebug("TagModel.__wireRelations "+theTag.getLocator()+" "+theDoc.getLocator()+
			" "+theUser.getLocator());
	//sourceNode, targetNode,relationTypeLocator, userLocator, smallImagePath,
	//largeImagePath, isTransclude, isPrivate, credentials, callback
	//myEnvironment.logDebug('TagModel.__wireRelations-1 '+types.TAG_CREATOR_RELATION_TYPE+" "+theUser.getLocator()+" "+theTag.getLocator());
	topicMapEnvironment.logDebug('TagModel.__wireRelations-1 '+types.TAG_CREATOR_RELATION_TYPE+" "+theUser.getLocator()+" "+theTag.getLocator());
	TopicModel.relateExistingNodesAsPivots(theUser, theTag,types.TAG_CREATOR_RELATION_TYPE,
			theUser.getLocator(), icons.RELATION_ICON_SM, icons.RELATION_ICON, false, credentials, function tagMRelateNodes(err, data) {
		if (err) {error+=err;}
		//myEnvironment.logDebug('TagModel.__wireRelations-2 '+types.TAG_DOCUMENT_RELATION_TYPE+" "+theTag.getLocator()+" "+theDoc.getLocator());
		topicMapEnvironment.logDebug('TagModel.__wireRelations-2 '+types.TAG_DOCUMENT_RELATION_TYPE+" "+theTag.getLocator()+" "+theDoc.getLocator());
		TopicModel.relateExistingNodesAsPivots(theTag, theDoc, types.TAG_DOCUMENT_RELATION_TYPE,
				theUser.getLocator(), icons.RELATION_ICON_SM, icons.RELATION_ICON, false, credentials, function tagMRelateNodes1(err, data) {
			if (err) {error+=err;}
			return callback(error, null);
		});
	});
  };
  
  
  self.listTags = function(start, count, credentials, callback) {
	  //TODO DataProvider doesn't do tuplecounting well; the tpC property is missing
	//var query = queryDSL.sortedTupleCountTermQuery(properties.INSTANCE_OF,types.TAG_TYPE);
	//DataProvider.listNodesByQuery(query, start,count,credentials, function(err,data,total) {
	DataProvider.listInstanceNodes(types.TAG_TYPE, start,count,credentials, function tagMListInstances(err, data, total) {
		console.log("TagModel.listTags "+err+" "+data,total);
		return callback(err, data, total);
	});
  };

  /**
   * @param credentials
   * @param callback signatur (data)
   */
  self.fillDatatable = function(start, count, credentials, callback) {
	self.listTags(start,count,credentials,function tagMListTags(err, result, totalx) {
		console.log('ROUTES/tag '+err+' '+result);
	      CommonModel.fillSubjectAuthorDateTable(result,"/tag/",totalx, function tagMFillTable(html, len, total) {
		      console.log("FILLING "+start+" "+count+" "+total);
		      return callback(html, len, total);
	      });
	});
  };
};