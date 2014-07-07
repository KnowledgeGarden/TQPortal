/**
 * TagModel
 */
var types = require('../../core/types')
  , icons = require('../../core/icons')
  , constants = require('../../core/constants')
  , rpa = require('../../core/util/stringutil');

var TagModel = module.exports = function(environment) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var DataProvider = topicMapEnvironment.getDataProvider();
  var TopicModel = topicMapEnvironment.getTopicModel();
  var replaceAll = rpa.replaceAll;
  var self = this;
	
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
 /*   if (len > 0) {
      var t,l;
      for(var i=0;i<len;i++) {
        l = tagList[i].trim();
        console.log('TAG-1 '+t);
        labels.push(l);
        t = replaceAll(l, ' ', '_');
        locator = t+'_TAG';
        locators.push(locator);
        //find or create this tag
        self.__findOrCreateTag(locator,l,usertopic, docLocator,docLabel);
        if (locators.lengh > 0) {
          result['locators'] = locators;
          result['labels'] = labels;
        }
      }
    }
    callback("",result); */
  },
	
  self.processTag = function(tagString, usertopic, docTopic, credentials, callback) {
    console.log('TAGS.processTag '+tagString+' '+usertopic);
    var result = {};
    if (!tagString) {
      callback(null,myTags);
    }
    if (tagString !== "") {
      var locator, locator;
      label = tagString.trim();
      console.log('TAG-2 '+label);
      locator = replaceAll(label, ' ', '_');
      locator = locator+'_TAG';
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
      if (err)
        error += err;
      //Result will be a Topic or null
      var theTag = result;
      if (theTag === null) {
        //create the tag
    	TopicModel.newInstanceNode(tagLocator, types.TAG_TYPE, label, "",constants.ENGLISH,
    			constants.SYSTEM_USER, icons.TAG_SM, icons.TAG, false, credentials, function(err, result) {   
    	  theTag = result;
          console.log('TagModel.__findOrCreateTag-2 '+theTag.toJSON());
          DataProvider.putNode(theTag, function(err, result) {
            console.log("TagModel.__findOrCreateTag-3 "+err+" "+result);
            if (err)
                error += err;
            //wire this tag's relations
            self.__wireRelations(theTag, usertopic, docTopic, credentials, function(err,data) {
            	error += err;
            });
         });
        });
      }
      callback(error,theTag);
    });
  },
  
  self.__wireRelations = function(theTag, theDoc, theUser, credentials, callback) {
	var error='';
	console.log("TagModel.__wireRelations "+theTag.getLocator()+" "+theDoc.getLocator()+
			" "+theUser.getLocator());
	//sourceNode, targetNode,relationTypeLocator, userLocator, smallImagePath,
	//largeImagePath, isTransclude, isPrivate, callback
    TopicModel.relateExistingNodes(theUser,theTag,types.TAG_CREATOR_RELATION_TYPE,
    		theUser.getLocator(),
    		icons.RELATION_ICON_SM, icons.RELATION_ICON, false, false, credentials, function(err,data) {
      if (err) {error+=err;}
        TopicModel.relateExistingNodes(theTag,theDoc,types.TAG_DOCUMENT_RELATION_TYPE,
        		theUser.getLocator(),
            		icons.RELATION_ICON_SM, icons.RELATION_ICON, false, false, credentials, function(err,data) {
          if (err) {error+=err;}
            callback(error,null);
        });
    });
  };
  
  
};