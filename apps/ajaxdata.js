/**
 * ajaxdata
 * In theory, we can use this and various REST urls to fetch data for
 * various applications
 */

var acls = require('./blog/blogmodel')
  , tag = require('./tag/tagmodel')
  , usr = require('./user/usermodel');

exports.plugin = function(app, environment, ppt) {
  var topicMapEnvironment = environment.getTopicMapEnvironment();
  var BlogModel = new acls(environment);
  var UserModel = new usr(environment);
  var TagModel = new tag(environment);
  console.log("Starting AjaxData");
	
  /**
   * Support the blogindex.handlebars view
   */
  app.get('/ajaxblog', function(req, res) {
    console.log("AJAX_DATA GETBLOG "+JSON.stringify(req.body));
    var credentials = null;
    BlogModel.fillDatatable(credentials, function(data) {
      console.log("AJAX_DATA GETBLOG "+JSON.stringify(data));
      try {
        res.set('Content-type', 'text/json');
      }  catch (e) { }
      res.json(data);
    });
  });
  app.get('/ajaxuser', function(req, res) {
	    console.log("AJAX_DATA GETUSER "+JSON.stringify(req.body));
	    var credentials = null;
	    UserModel.fillDatatable(credentials, function(data) {
	      console.log("AJAX_DATA GETUSER "+JSON.stringify(data));
	      try {
	        res.set('Content-type', 'text/json');
	      }  catch (e) { }
	      res.json(data);
	    });
	  });
  app.get('/ajaxtag', function(req, res) {
	    console.log("AJAX_DATA GETTAG "+JSON.stringify(req.body));
	    var credentials = null;
	    TagModel.fillDatatable(credentials, function(data) {
	      console.log("AJAX_DATA GETTAG "+JSON.stringify(data));
	      try {
	        res.set('Content-type', 'text/json');
	      }  catch (e) { }
	      res.json(data);
	    });
	  });

};
