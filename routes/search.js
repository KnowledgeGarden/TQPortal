/**
 * Search
 * For now, not a menu app
 * But, it could get its own page for advanced search
 */
var srch = require('../apps/search/searchmodel'),
    constants = require('../core/constants');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        SearchModel = new srch(environment);
	
	function isPrivate(req, res, next) {
		if (isPrivatePortal) {
			if (req.isAuthenticated()) {return next();}
			return res.redirect('/login');
		} else {
			return next();
		}
	}
		 
	/////////////////
	// Routes
	/////////////////
  
	app.get("/search", function searchGet(req, res) {
		var query = req.query["srch-term"];
			data = environment.getCoreUIData(req);
		console.log("SEARCH "+query);
		data.start=0;
		data.count=constants.MAX_HIT_COUNT; //pagination size
		data.total=0;
		data.querystring = query;
		data.query="/search/index/"+query;
		return res.render('searchhits',data);
	});
	
	app.get("/search/index/:id", isPrivate, function searchGetIndex(req, res) {
		var q = req.params.id,
			start = parseInt(req.query.start),
			count = parseInt(req.query.count);
		SearchModel.runSearch(q, req.user, "en", start, count, function searchRunSearch(data, countsent, totalavailable) {
			var cursor = start+countsent,
				json = {};
			json.start = cursor;
			json.count = constants.MAX_HIT_COUNT; //pagination size
			json.total = totalavailable;
			json.table = data;
			return res.json(json);
		});
	});  
  
};