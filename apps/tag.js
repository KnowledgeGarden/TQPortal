/**
 * tag app
 */
var tagModel = require('./tag/tagmodel')
  , constants = require('../core/constants')
  , types = require('../core/types');


exports.plugin = function(app, environment, ppt) {
  var topicMapEnvironment = environment.getTopicMapEnvironment();
  var Dataprovider = topicMapEnvironment.getDataProvider();
//  this.TagModel = new userModel(environment);

  /////////////////
  // Routes
  /////////////////
  app.get('/tag', function(req,res) {
    res.render('tagindex');
  });
		
  app.get('/tag/:id', function(req,res) {
	    var q = req.params.id;
	    console.log('TAGrout '+q);
	    var credentials = null; //TODO
	    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
	      console.log('TAGrout-1 '+err+" "+result);
	      var title = result.getLabel(constants.ENGLISH);
	      var details = result.getDetails(constants.ENGLISH);
	      var userid = result.getCreatorId();
	      // paint tags
	      var tags = result.listRelationsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
	      
	      var date = result.editedAt;
	      var data = {};
	      data.title = title;
	      data.body = details;
	      data.tags = tags;
	      data.date = date;
	      data.image = "/images/tag.png";
	      //TODO paint provenance creator Id setup to point to user
	      console.log('TAGrout-2 '+JSON.stringify(data));
	      res.render('topic', data);
	    });
	  }); 
  
}