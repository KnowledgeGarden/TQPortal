/**
 * home app -- the landing page
 */
exports.plugin = function(app, environment, ppt) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  console.log("Starting Home");
	
  app.get('/', function(req, res) {
    //changing this value allows changing landing page
    var idx = 'newindex';
    res.render(idx, { title: 'TQPortal' });
	  
  });

};