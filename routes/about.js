/**
 * about app
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	function __get(req) {
		  var data =  myEnvironment.getCoreUIData(req);
		  return data;
	}

  /////////////////
  // Routes
  /////////////////
  app.get('/about', function aboutGet(req, res) {
    res.render('about', __get(req));
  });
};