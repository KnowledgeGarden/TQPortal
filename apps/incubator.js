/**
 * IncubatorApp -- the space inside a Guild where game-play occurs
 * This app is really created by GuildModel when a new Guild is created.
 * That guild then owns this incubator;
 *   its Enter button exists on the guild's landing page
 *   and is only visible when an authenticated user is a member of the guild
 */
var Incmodel = require('./guild/incubatormodel'),
    constants = require('../core/constants'),
    common = require('./common/commonmodel'),
    types = require('../node_modules/tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        CommonModel = environment.getCommonModel(),
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        IncubatorModel = new Incmodel(environment),
        self = this;
    console.log("Incubator up");
    
    //TODO change to isMember
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
  // Routes
  /////////////////

    /**
     * An Incubator view is a viewfirst view, but not in conversation mode.
     * Its conversations are performed inside the incubator in two spaces:
     *  one for a meta conversation which is the guild deciding what to play
     *  one for the game moves themselves
     * This route is associated with an Enter button at the Guild's landing page
     */
    app.get('/incubator/:id', isLoggedIn, function(req, res) {
        console.log("Get Incubator");
        myEnvironment.logDebug("INCUBATOR");
        var data =  myEnvironment.getCoreUIData(req);
        //TODO
        return res.render('vf_incubator', data);
    });

};