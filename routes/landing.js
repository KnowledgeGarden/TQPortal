/**
 * langing page form
 * does not appear on menu
 */
var lm = require('../apps/landing/landingmodel'),
    constants = require('../core/constants')
;

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        LandingModel = new lm(environment);
	
	var isAdmin = function(credentials) {
		console.log("BLOG.canEdit "+JSON.stringify(credentials));
		var result = false;
		if (credentials) {
			var where = credentials.indexOf(constants.ADMIN_CREDENTIALS);
			if (where > -1) {
				result = true;
			}
		}
		return result;
	};
	
	/////////////
	// Routes
	/////////////
	
	/**
	 * Essentially, getOrCreate called by ajax
	 * If available, returns json
	 * Otherwise, opens an edit form
	 */
	app.get("/landing/:id", function(req, res) {
		var q = req.params.id;
		var usx = req.user;
		var credentials = [];
		if (usx) {credentials = usx.credentials;}
		console.log("LANDING "+q);
	});
	
	app.post("/landing", function(req, res) {
		
	});
	
};
