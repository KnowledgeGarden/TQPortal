/**
 * ajaxdata
 * In theory, we can use this and various REST urls to fetch data for
 * various applications
 * 
 */

var acls = require('./blog/blogmodel')
  , tag = require('./tag/tagmodel')
  , admn = require("./admin/adminmodel")
  , wiki = require("./wiki/wikimodel")
  , conv = require("./conversation/conversationmodel")
  , bkmk = require("./bookmark/bookmarkmodel")
  , usr = require('./user/usermodel');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
  var topicMapEnvironment = environment.getTopicMapEnvironment();
  var BlogModel = new acls(environment);
  var WikiModel = new wiki(environment);
  var UserModel = new usr(environment);
  var TagModel = new tag(environment);
  var AdminModel = new admn(environment);
  var ConversationModel = new conv(environment);
  var BookmarkModel = new bkmk(environment);
  console.log("Starting AjaxData");
	
  /**
   * Support the blogindex.handlebars view
   */
  app.get('/ajaxblog', function(req, res) {
//    console.log("AJAX_DATA GETBLOG "+JSON.stringify(req.body));
    var credentials = [];
    var usr = req.user;
    if (usr) {credentials = usr.credentials;}
    BlogModel.fillDatatable(credentials, function ajaxdataBlog(data) {
 //     console.log("AJAX_DATA GETBLOG "+JSON.stringify(data));
      return res.json(data);
    });
  });
  
  app.get('/ajaxbookmark', function(req, res) {
//    console.log("AJAX_DATA GETBLOG "+JSON.stringify(req.body));
    var credentials = [];
    var usr = req.user;
    if (usr) {credentials = usr.credentials;}
    BookmarkModel.fillDatatable(credentials, function ajaxdataBookmark(data) {
 //     console.log("AJAX_DATA GETBLOG "+JSON.stringify(data));
      return res.json(data);
    });
  });

  /**
   * Support the wikihome.handlebars view
   */
  app.get('/ajaxwiki', function(req, res) {
 //   console.log("AJAX_DATA GETWIKI "+JSON.stringify(req.body));
    var credentials = [];
    var usr = req.user;
    if (usr) {credentials = usr.credentials;}
    WikiModel.fillDatatable(credentials, function ajaxdataWiki(data) {
//      console.log("AJAX_DATA GETWIKI "+JSON.stringify(data));
      return res.json(data);
    });
  });
  /**
   * Support the conversationindex.handlebars view
   */
  app.get('/ajaxconversation', function(req, res) {
 //   console.log("AJAX_DATA GETWIKI "+JSON.stringify(req.body));
    var credentials = [];
    var usr = req.user;
    if (usr) {credentials = usr.credentials;}
    ConversationModel.fillDatatable(credentials, function ajaxDataConversation(data) {
//      console.log("AJAX_DATA GETWIKI "+JSON.stringify(data));
      return res.json(data);
    });
  });

  /**
   * Support the userindex.handlebars view
   */
  app.get('/ajaxuser', function(req, res) {
	console.log("AJAX_DATA GETUSER "+JSON.stringify(req.body));
	var credentials = [];
    var usr = req.user;
    if (usr) {credentials = usr.credentials;}
    UserModel.fillDatatable(credentials, function ajaxDataUser(data) {
      console.log("AJAX_DATA GETUSER "+JSON.stringify(data));
      return res.json(data);
    });
  });
  
  /**
   * Support the tagindex.handlebars view
   */
  app.get('/ajaxtag', function(req, res) {
	console.log("AJAX_DATA GETTAG "+JSON.stringify(req.body));
	var credentials = [];
    var usr = req.user;
    if (usr) {credentials = usr.credentials;}
	TagModel.fillDatatable(credentials, function ajaxDataTag(data) {
      console.log("AJAX_DATA GETTAG "+JSON.stringify(data));
      return res.json(data);
    });
  });
  //
  app.get('/ajaxadminusers', function(req, res) {
  	AdminModel.fillDatatable(function ajaxDataAdmin(data) {
  		console.log("AJAX_DATA GETADMINUSERS "+JSON.stringify(data));
  		return res.json(data);
  	});
  });
};
