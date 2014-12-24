/**
 * biographymodel
 * Biographies use the InfoBox feature in any SubjectProxy (node)
 */
var types = require('tqtopicmap/lib/types')
	, icons = require('tqtopicmap/lib/icons')
	, properties = require('tqtopicmap/lib/properties')
	, constants = require('../../core/constants')
;
//some app constants
module.exports.PERSON_BIOGRAPHY				= "person";
module.exports.GROUP_BIOGRAPHY				= "group";
module.exports.PLACE_BIOGRAPHY				= "place";
module.exports.THING_BIOGRAPHY				= "thing";
module.exports.EVENT_BIOGRAPHY				= "event";

var BiographyModel =  module.exports = function(environment) {
	var CommonModel = environment.getCommonModel();
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var DataProvider = topicMapEnvironment.getDataProvider();
//	var TopicModel = topicMapEnvironment.getTopicModel();
	var queryDSL = topicMapEnvironment.getQueryDSL();
	
	var self = this;

	/**
	 * Update an existing node; no tags included
	 */
	self.update = function(json,user,credentials,callback) {
		PortalNodeModel.update(json,user,function(err,result) {
			callback(err,null);
		});
	},

	self.create = function (json, user, credentials, callback) {
		  console.log('BMXXXX '+JSON.stringify(json));
		  var isPrivate = false; //TODO
		  PortalNodeModel.create(json,user,types.BIOGRAPHY_TYPE,icons.BIOGRAPHY_SM, icons.BIOGRAPHY_SM, isPrivate,function(err,lox) {
			//TODO  myEnvironment.addRecentBlog(lox,json.title);
			  callback(err,lox);
		  });
	},
	  
	self.listBiographies = function(start, count, credentials, callback) {
	    var query = queryDSL.sortedDateTermQuery(properties.INSTANCE_OF,types.BIOGRAPHY_TYPE,start,count);
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
	  self.listBiographies(start,count,credentials,function(err,result, totalx) {
	      console.log('BlogModel.fillDatatable '+err+' '+totalx+" "+result);
	      CommonModel.fillSubjectAuthorDateTable(result,"/biography/",totalx, function(html,len,total) {
		      console.log("FILLING "+start+" "+count+" "+total);
		      callback(html,len,total);
	    	  
	      });
	  });
	};

};