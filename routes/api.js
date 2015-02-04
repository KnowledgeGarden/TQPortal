/**
 * API
 * A route without a menu item
 * Serves REST get and put calls to the platform.
 * Current thinking: 
 *   Assign "pipes" to specific IP addresses
 *   This mimics the needs of condos talking to fed server
 */
var apim = require('../apps/api/apimodel');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        APIModel = new apim(environment);
	

	app.get('/api', function apiGet(req, res) {
		//TODO
	});
	
	app.post('/api', function apiPost(req, res) {
		//TODO
	});
};