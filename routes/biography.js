/**
 * biography
 */
var biog = require('../apps/biography/biographymodel'),
    constants = require('../core/constants'),
    common = require('../apps/common/commonmodel'),
    types = require('tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        CommonModel = environment.getCommonModel(),
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        BiographyModel = new biog(environment);
    
	function isPrivate(req,res,next) {
		if (isPrivatePortal) {
			if (req.isAuthenticated()) {return next();}
			return res.redirect('/login');
		} else {
			return next();
		}
	}
	
	function isLoggedIn(req, res, next) {
		// if user is authenticated in the session, carry on 
		console.log('ISLOGGED IN '+req.isAuthenticated());
		if (req.isAuthenticated()) {return next();}
		// if they aren't redirect them to the home page
		// really should issue an error message
		if (isPrivatePortal) {
			return res.redirect('/login');
		}
		return res.redirect('/');
	}
	/////////////////
	// Menu
	/////////////////
	myEnvironment.addApplicationToMenu("/biography","Biography");
	
	/////////////////
	// Routes
	/////////////////
	app.get('/biography', isPrivate, function biographyGet(req, res) {
		var data = environment.getCoreUIData(req);
		data.start=0;
		data.count=constants.MAX_HIT_COUNT; //pagination size
		data.total=0;
		data.query="/biography/index";
		//rendering this will cause an ajax query to blog/index
		return res.render('biographyhome', data);
	});

	/**
	 * Fetch based on page Next and Previous buttons from ajax
	*/
	app.get("/biography/index", isPrivate, function biographyGetIndex(req, res) {
		var start = parseInt(req.query.start),
			count = parseInt(req.query.count),
			credentials= [];
		if (req.user) {credentials = req.user.credentials;}

		BiographyModel.fillDatatable(start,count, credentials, function biographyFillTable(data, countsent, totalavailable) {
			console.log("Biography.index "+data);
			var cursor = start+countsent,
				json = {};
			//pagination is based on start and count
			//both values are maintained in an html div
			json.start = cursor;
			json.count = constants.MAX_HIT_COUNT; //pagination size
			json.total = totalavailable;
			json.table = data;
			return res.json(json);
		});
	});
};