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
  , Topic = mongoose.model('Topic')
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
	self.processTags = function(tags, callback) {
		console.log('TAGS.processTags '+tags);
		var labels = [];
		var locators = [];
		if (tags instanceof Array) {
			var len = tags.length;
			var t;
			for(var i=0;i<len;i++) {
				t = tags[i].trim();
				console.log('TAG '+t);
				labels.push(t);
				t = this.replaceAll(t, ' ', '_');
				locators.push(t+'_TAG');
			}
		}
		var result = {};
		result['locators'] = locators;
		result['labels'] = labels;
		callback("",result);
	};
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