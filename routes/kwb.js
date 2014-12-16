/**
 * KnowledgeWorkbench App
 * This is not a menu app:
 *   It lives in the background, callable by AJAX (and other) calls
 *   for wiring relations among topics
 */

var kwb = require('../apps/kwb/kwbmodel'),
    relationlist = require('../apps/kwb/relationlist'),
    constants = require('../core/constants'),
    types = require('../node_modules/tqtopicmap/lib/types')
;

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        KnowledgeWorkbenchModel = new kwb(environment),
        CommonModel = environment.getCommonModel();
	console.log("KnowledgeWorkbench started "+JSON.stringify(relationlist));
	function isPrivate(req,res,next) {
		if (isPrivatePortal) {
			if (req.isAuthenticated()) {return next();}
			res.redirect('/login');
		} else {
			{return next();}
		}
	}
    
    ////////////////////////////
    // Routes
    ////////////////////////////
    
    /**
     * Forge a new connection between two nodes
     */
    app.get("/kwb/newrelation", isPrivate, function(req, res) {
        var data = environment.getCoreUIData(req),
        //it's rerq.query in a get
            lox = req.query.myLocator,
            targ = req.query.targetLocator,
            credentials = [],
            usr = req.user,
            src,
            trg;
        data.relationlist = KnowledgeWorkbenchModel.getNewRelationForm();
        Dataprovider.getNodeByLocator(lox, credentials, function(err,p1) {
            trg = p1;
            data.targetLocator = lox;
            Dataprovider.getNodeByLocator(targ, credentials, function(err, p2) {
                //we are going to reverse target and source
                // since people tend to choose the source, A cause B (A) first for transclude
                src = p2;
                var slab = "";
                if (src.getLabel(constants.ENGLISH)) {
				    slab = src.getLabel(constants.English);
                } else {
				    slab = src.getSubject(constants.ENGLISH).theText;
                }
                data.sourcelabel = slab;
                data.sourceLocator = targ;
                if (trg.getLabel(constants.ENGLISH)) {
				    slab = src.getLabel(constants.English);
                } else {
				    slab = trg.getSubject(constants.ENGLISH).theText;
                }
                data.targetlabel = slab;
                data.isNotEdit = true;
                console.log("KWB.newrelation "+lox+" "+targ);
                return res.render('connectionform',data);
            });
        });
    });
    
    app.get("/kwb/ajaxfetch/:id", isPrivate, function(req,res) {
        //establish the node's identity
        var q = req.params.id;
        //establish credentials
        //defaults to an empty array if no user logged in
        var credentials = [];
        var usr = req.user;
        if (usr) { credentials = usr.credentials;}
        //fetch the node itself
        Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
            console.log('KWBrout-1 '+err+" "+result);
            var data =  myEnvironment.getCoreUIData(req),
            //Fetch the tags
                tags = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
            if (!tags) {
                tags = [];
            }
            //this is a relation view
            var srcid = result.getSubjectLocator();
            var trgtid = result.setObject();
            data.relnSubject = srcid;
            data.relnObject = trgtid;
            var docs = [];
            var users = [];
            var transcludes = result.listPivotsByRelationType(types.DOCUMENT_TRANSCLUDER_RELATION_TYPE);
            if (!transcludes) {
                transcludes = [];
            }
            myEnvironment.logDebug("KWb.ajaxfetch "+JSON.stringify(data));
            CommonModel.__doAjaxFetch(result, credentials, "/kwb/", tags, docs, users, transcludes, data, req, function(json) {
                myEnvironment.logDebug("kwb.ajaxfetch-1 "+JSON.stringify(json));
                //send the response
                res.json(json);
            });
        });
    });
  
    /**
     * Model Fill ViewFirst: get cycle starts here
     */
    app.get('/kwb/:id', isPrivate,function(req,res) {
        var q = req.params.id;
        var data = myEnvironment.getCoreUIData(req);
        myEnvironment.logDebug("KWBBY "+JSON.stringify(req.query));
        CommonModel.__doGet(q,"/kwb/",data, req, function(viewspec, data) {
            if (viewspec === "Dashboard") {
                return res.render('vf_connection', data);
            } else {
                return res.render('vfcn_connection',data);
            }
        });
    });
  
    /**
     * Add a new connection among two nodes
     */
    app.post('/kwb/add', function(req,res) {
        //it's req.body in a post
        var src = req.body.sourceLocator;
        var targ = req.body.targetLocator;
        var reln = req.body.relnselection;
        var taglist = [];
		if (req.body.tag1 && req.body.tag1.length > 0) {
			taglist.push(req.body.tag1);
		}
		if (req.body.tag2 && req.body.tag2.length > 0) {
			taglist.push(req.body.tag2);
		}
		if (req.body.tag3 && req.body.tag3.length > 0) {
			taglist.push(req.body.tag3);
		}
		if (req.body.tag4 && req.body.tag4.length > 0) {
			taglist.push(req.body.tag4);
		}
        req.session.clipboard = ""; // clear clipboard
        console.log("KWB.add "+src+" "+targ+" "+reln);
        //NOW, create the connection
        KnowledgeWorkbenchModel.createConnection(src,targ,reln,req.user,taglist,function(err,tuple) {
            console.log("KWB.post "+err+" | "+tuple);
            if (tuple) {
                var lox = '/kwb/'+tuple.getLocator();
                console.log("Redirecting to "+lox);
                return res.redirect("/kwb/"+lox);
            } else {
                var data =  myEnvironment.getCoreUIData(req);
                data.errormessage = "Internal failure making a connection";
                console.log("WTF?");
                res.render("500",data);
            }
        });
    });
};
