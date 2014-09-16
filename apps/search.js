/**
 * Search
 * For now, not a menu app
 * But, it could get its own page for advanced search
 */
var srch = require('./search/searchmodel'),
    constants = require('../core/constants');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        SearchModel = new srch(environment);
	
	  function isPrivate(req,res,next) {
		    if (isPrivatePortal) {
		      if (req.isAuthenticated()) {return next();}
		      res.redirect('/login');
			} else {
				{return next();}
			}
		  }
		 
/*	function __get(req,callback) {
		  var query = req.query["srch-term"];
		  SearchModel.runSearch(query, req.user, "en",0,50, function(err,data) {
			  console.log("Search.__get "+err+" "+JSON.stringify(data));
			  var result =  myEnvironment.getCoreUIData(req);
			  result.query = query;
			  //TODO if data, add it to hits;
			  result.hits = data;
			  console.log("Search.__get+ "+JSON.stringify(result));
			  callback( result);
		  });
	} */
  /////////////////
  // Routes
  /////////////////
/*  app.get('/search', function(req,res) {
	  var data = __get(req, function(data) {
		    res.render('searchhits',data);
		  
	  });
  });*/
  
  app.get("/search", function(req,res) {
	  var query = req.query["srch-term"];
	  console.log("SEARCH "+query);
	  var data = environment.getCoreUIData(req);
	  data.start=0;
	  data.count=constants.MAX_HIT_COUNT; //pagination size
	  data.total=0;
	  data.querystring = query;
	  data.query="/search/index/"+query;
	  res.render('searchhits',data);
  });
	
  app.get("/search/index/:id", isPrivate,function(req,res) {
	  var q = req.params.id;
	  var start = parseInt(req.query.start);
	  var count = parseInt(req.query.count);
	  SearchModel.runSearch(q, req.user, "en",start,count, function(data, countsent, totalavailable) {
		  var cursor = start+countsent;
		  //} else {
		//	  cursor = start-countsent;
		 // }
		//  if (cursor < 0) {cursor = 0;}
		//  topicMapEnvironment.logDebug("BLOG INDEX2 "+start+" "+countsent+" "+isNext+" "+cursor);
		  var json = {};
		  json.start = cursor;
		  json.count = constants.MAX_HIT_COUNT; //pagination size
		  json.total = totalavailable;
		  json.table = data;
		  try {
			  res.set('Content-type', 'text/json');
		  }  catch (e) { }
	      res.json(json);
	  });
  });  
  
};