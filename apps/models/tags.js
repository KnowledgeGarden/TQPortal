/**
 * Tags
 * <p>Tags are instances of Topic objects.
 * They get unique Locators which are composed
 * of the tag string itself, plus a suffix: _TAG.
 * That provides a unique identifier such that a tag
 * occurs one and only one time, though it can be used
 * many times.</p>
 */
var mongoose = require('mongoose')
  , Topic = require('./topic')
  , types = require('../types')
  , icons = require('../icons')
  , rpa = require('../../lib/stringutil')
  , utils = require('../../lib/utils');


var TagModel = module.exports = function() {
	var self = this;
	this.replaceAll = rpa.replaceAll;
	console.log('TAGS '+this.replaceAll);
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
	self.processTagList = function(tagList, usertopic, docLocator, docLabel, callback) {
		console.log('TAGS.processTagList '+tagList+' '+usertopic);
		var labels = [];
		var locators = [];
		var locator;
		var result = {};
		var len = tagList.length;
		if (len > 0) {
			var t,l;
			for(var i=0;i<len;i++) {
				l = tagList[i].trim();
				console.log('TAG-1 '+t);
				labels.push(l);
				t = this.replaceAll(l, ' ', '_');
				locator = t+'_TAG';
				locators.push(locator);
				//find or create this tag
				this.findOrCreateTag(locator,l,usertopic, docLocator,docLabel, function() {
					if (locators.lengh > 0) {
						  result['locators'] = locators;
						  result['labels'] = labels;
						}
					
				});
			}
		}
		callback("",result);
	};
	
	self.processTag = function(tagString, usertopic, docLocator, docLabel, callback) {
		console.log('TAGS.processTag '+tagString+' '+usertopic);
	  var result = {};
	  if (tagString !== "") {
		var labels = [];
		var locators = [];
		var locator;
		var t,l;
		l = tagString.trim();
		console.log('TAG-2 '+t);
		labels.push(t);
		t = this.replaceAll(l, ' ', '_');
		locator = t+'_TAG';
		locators.push(locator);
		//find or create this tag
		this.findOrCreateTag(locator, l, usertopic, docLocator,docLabel, function() {
			if (locators.lengh > 0) {
				  result['locators'] = locators;
				  result['labels'] = labels;
			}			
		});
		
	  }
	  callback("",result);
	};
	
	self.findOrCreateTag = function(tagLocator, label, usertopic, docLocator, docLabel, callback) {
		console.log('TAGS.findOrCreate '+tagLocator+' '+usertopic);
		Topic.findNodeByLocator(tagLocator, function(err,result) {
			console.log('TAGS.processTags-1 '+tagLocator+' '+err+' '+result);
			var theTag = result;
			if (theTag === null) {
				//create the tag
				theTag = new Topic();
				theTag.locator = tagLocator;
				theTag.label = label;
				theTag.instanceOf = types.TAG_TYPE;
				theTag.creatorId = usertopic.locator;
				theTag.largeIcon = icons.TAG;
				theTag.smallIcon = icons.TAG_SM;
			}
			console.log('TAGS.findOrCreate-1 '+theTag);
			//wire this tag's relations
			usertopic.addRelation(types.SIMPLE_RELATION_TYPE, types.TAG_CREATOR_RELATION_TYPE, 'Tag-Creator Relation', tagLocator, label);						
			theTag.addRelation(types.SIMPLE_RELATION_TYPE, types.TAG_CREATOR_RELATION_TYPE, 'Tag-Creator Relation', usertopic.locator, usertopic.locator);			
			theTag.addRelation(types.SIMPLE_RELATION_TYPE, types.TAG_DOCUMENT_RELATION_TYPE, 'Tag-Document Relation', docLocator, docLabel);
			theTag.save(function(err) {
				console.log("TAGS.findOrCreateTag saved "+tagLocator+" "+err);
			});
			callback();
		});		
	}
};


/**
 * List items tagged with a tag
 * 
 * * /


exports.index = function (req, res) {
  var criteria = { tags: req.param('tag') };
  var perPage = 5;
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var options = {
    perPage: perPage,
    page: page,
    criteria: criteria
  };

  Article.list(options, function(err, articles) {
    if (err) return res.render('500');
    Article.count(criteria).exec(function (err, count) {
      res.render('/blog', {
        title: 'Articles tagged ' + req.param('tag'),
        articles: articles,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });
};

*/