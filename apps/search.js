/**
 * Search
 * For now, not a menu app
 * But, it could get its own page for advanced search
 */
var srch = require('./search/searchmodel');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var SearchModel = new srch(environment);
	
	function __get(req,callback) {
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
	}
  /////////////////
  // Routes
  /////////////////
  app.get('/search', function(req,res) {
	  var data = __get(req, function(data) {
		    res.render('searchhits',data);
		  
	  });
  });
};