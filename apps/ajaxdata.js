/**
 * ajaxdata
 * In theory, we can use this and various REST urls to fetch data for
 * various applications
 */

var acls = require('./blog/blogmodel');

exports.plugin = function(app, environment, ppt) {
  var topicMapEnvironment = environment.getTopicMapEnvironment();
  var BlogModel = new acls(environment);
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

};
