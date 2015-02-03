/**
 * SearchModel
 */
var types = require('tqtopicmap/lib/types')
, icons = require('tqtopicmap/lib/icons')
, properties = require('tqtopicmap/lib/properties')

  , constants = require('../../core/constants')
   , rpa = require('../../core/util/stringutil');


var SearchModel = module.exports = function(environment) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var DataProvider = topicMapEnvironment.getDataProvider();
	var TopicModel = topicMapEnvironment.getTopicModel();
	var queryDSL = topicMapEnvironment.getQueryDSL();
	var self = this;

	self.isConversationType = function(type) {
		var result = false;
		if (type) {
			if (type === types.CONVERSATION_MAP_TYPE ||
				type === types.PRO_TYPE ||
				type === types.CON_TYPE ||
				type === types.POSITION_TYPE ||
				type === types.CHALLENGE_TYPE ||
				type === types.ISSUE_TYPE ||
				type === types.EVIDENCE_TYPE ||
				type === types.CLAIM_TYPE ||
				type === types.DECISION_TYPE)
				result = true;
		}
		return result;
	}
	
	/**
	 * Each line of hits should include locator, label
	 * Locator must include the object type, e.g. /blog/locator
	 * @param query
	 * @param user
	 * @param language
	 * @param start
	 * @param count
	 * @param callback: signature (err,data)
	 */
	self.runSearch = function(query, user, language, start, count, callback) {
//		var test = {};
		var credentials = []; //default
		if (user) {credentials = user.credentials;}
//		test.locator = "/blog/89e1a570-0dd1-11e4-a522-c7f7131601c9";
//		test.label = "This one's for the gipper";
//		result.push(test);
		console.log("SearchModel.runSearch "+query+" "+user);
		DataProvider.listNodesByTextSearch(query, language, start, count, credentials, function searchMListNodes(err, data, total) {
			console.log("SearchModel.runSearch-1 "+err+data);
			var len = 0;
		      var html = "<table  cellspacing=\"0\"><thead>";
		      html+="<tr><th>Hits</th></tr>";
		      html+="</thead><tbody>";
			if (data) {
				len = data.length;
				var p, typ, loc,lab;
				var urx = "/blog/";  //default
				for (var i=0;i<len;i++) {
					urx = "/blog/";
					p = data[i];
					console.log("SearchModel.runSearch-2 "+p.toJSON());
					
					loc = p.getLocator();
					typ = p.getNodeType();
					lab = p.getLabel(language);
					if (!lab) {
						lab = p.getSubject(language).theText;
					}
					//now figure out the node type
					if (typ === types.WIKI_TYPE) {
						urx = "/wiki/";
					} else if (typ === types.BLOG_TYPE) {
						urx = "/blog/";
					} else if (typ === types.TAG_TYPE) {
						urx = "/tag/";
					} else if (typ === types.USER_TYPE) {
						urx = "/user/";
					} else if (typ === types.BOOKMARK_TYPE) {
						urx = "/bookmark/";
					} else if (self.isConversationType(typ)) {
						urx = "/conversation/";
					
					} else {
						//here's where we crash and burn
						topicMapEnvironment.logError("SearchModel unknown type: "+typ+" | "+loc);
						//Actually, we don't: this will happen when the upper typology nodes fall
						//into the search so, we just show them as blogs
					}
					html+="<tr><td><a href=\""+urx+loc+"\">"+lab+"</a></td></tr>";
				}
			}
		    html+="</tbody></table>";
		    return callback(html, len, total);	
		});
	};
};