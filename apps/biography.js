/**
 * biography
 */
var biog = require('./biography/biographymodel'),
    constants = require('../core/constants'),
    common = require('./common/commonmodel'),
    types = require('../node_modules/tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        CommonModel = environment.getCommonModel(),
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        BiographyModel = new biog(environment);
    
	function isPrivate(req,res,next) {
		if (isPrivatePortal) {
			if (req.isAuthenticated()) {return next();}
			res.redirect('/login');
		} else {
			{return next();}
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
		res.redirect('/');
	}
	/////////////////
	// Menu
	/////////////////
	myEnvironment.addApplicationToMenu("/biography","Biography");
	
	/////////////////
	// Routes
	/////////////////
	app.get('/biography', isPrivate,function(req,res) {
		var data = environment.getCoreUIData(req);
		data.start=0;
		data.count=constants.MAX_HIT_COUNT; //pagination size
		data.total=0;
		data.query="/biography/index";
		//rendering this will cause an ajax query to blog/index
		res.render('biographyhome',data);
	});

	/**
	 * Fetch based on page Next and Previous buttons from ajax
	*/
	app.get("/biography/index", isPrivate,function(req,res) {
		var start = parseInt(req.query.start);
		var count = parseInt(req.query.count);
		var credentials= [];
		if (req.user) {credentials = req.user.credentials;}

		BiographyModel.fillDatatable(start,count, credentials, function(data, countsent,totalavailable) {
			console.log("Biography.index "+data);
			var cursor = start+countsent;
			var json = {};
			//pagination is based on start and count
			//both values are maintained in an html div
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