/**
 * commonmodel
 */
var  types = require('tqtopicmap/lib/types'),
    sb = require('tqtopicmap/lib/util/stringbuilder'),
    constants = require('../../core/constants'),
    colnavwidget = require('../widgets/jquerycolnav'),
    kwb = require('../kwb/kwbmodel')
;

var CommonModel = module.exports = function(environment, tmenv) {
	var myEnvironment = environment,
        topicMapEnvironment = tmenv,
        DataProvider = topicMapEnvironment.getDataProvider(),
        ColNavWidget = new colnavwidget(environment, DataProvider),
        KnowledgeWorkbenchModel = new kwb(environment, this, tmenv),
        self = this;
	
	////////////////////////////////
	// Matters related to authentication
	////////////////////////////////
	/**
	 * Return <code>true</code> if credentials are that of either
	 * and Admin or the creator of <code>node</code>
	 */
	self.isOwnerOrAdmin = function(node, credentials) {
		var result = false;
		//TODO
		return result;
	};
	
	/**
	 * Return <code>true</code> if <code>node</code> can be edited by
	 * holder of <code>credentials</code>
	 */
	self.canEdit = function(node, credentials) {
		console.log("CommonModel.canEdit " + JSON.stringify(credentials));
		var result = false;
		if (credentials) {
			// node is deemed editable if the user created the node
			// or if user is an admin
			var cid = node.getCreatorId(),
			    where = credentials.indexOf(cid);
			if (where < 0) {
				var where2 = credentials.indexOf(constants.ADMIN_CREDENTIALS);
				if (where2 > -1) {result = true;}
			} else {
				result = true;
			}
		}
		topicMapEnvironment.logDebug("CommonModel.canEdit "+JSON.stringify(credentials)+" | "+node.getCreatorId()+" | "+result);
		return result;
	};


	//////////////////////
	//Tend to the needs of the View Menu
	//////////////////////
    
	self.getColNavViewSpec = function(app, locator) {
		return "{\"href\":\"/conversation/" + locator + "\" , \"nav\":\"Conversation\"}";
	};
    
	self.getDashboardViewSpec = function(app, locator) {
		return "{\"href\":\"" + app + locator + "\" , \"nav\":\"Dashboard\"}";
	};

	//////////////////////
	//Tend to tags
	//////////////////////
	
	self.makeTagList = function(body) {
		var taglist = [];
		//look for every tag in body
		if (body.tag1 && body.tag1.length > 0) {
			taglist.push(body.tag1);
		}
		if (body.tag2 && body.tag2.length > 0) {
			taglist.push(body.tag2);
		}
		if (body.tag3 && body.tag3.length > 0) {
			taglist.push(body.tag3);
		}
		if (body.tag4 && body.tag4.length > 0) {
			taglist.push(body.tag4);
		}
		return taglist;
	};
	
	/**
	 * Fill a conversation Tree; returns the root node
	 * of a filled tree
	 * @param rootLocator
	 * @param credentials
	 * @param callback signature (err,node)
	 */
	self.fillTree = function(rootLocator, credentials, callback) {
		DataProvider.getTree(rootLocator, 0,0,0, credentials, function commonMGetTree(err, node) {
			console.log("CommonModel.fillTree " + rootLocator + " " + JSON.stringify(node));
			//myEnvironment.logDebug("CommonModel.fillTree "+)
			callback(err, node);
		});
	};
	
	//TODO: this needs a lot of work.
	// which relations depend on nodeType
	//probably more efficient to let apps harvest their own
	self.gatherPivots = function(node, json) {
	/*	var tags = node.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
	      if (!tags) {
	    	  tags = [];
	      }
		var docs = node.listPivotsByRelationType(types.CREATOR_DOCUMENT_RELATION_TYPE);
	      if (!docs) {
	    	  docs = [];
	      }*/
	};
    
	////////////////////////////////////////////
	// For index pages where you page through nodes to select
	////////////////////////////////////////////
	/**
	 * @param proxyList
	 * @param urx  e.g. "conversation/"
	 * @param total available in the original database query
	 * @param callback signatur (data)
	 */
	self.fillSubjectAuthorDateTable = function(proxyList, urx, total, callback) {
		//NOW, build the table in html
		var len = proxyList.length;
		myEnvironment.logDebug("CommonModel.fillSubjectAuthorDateTable " + proxyList + " " + urx + " " + len + " " + total);
		var url, p, label;
		//here, we are actually building the table's HTML
		//TODO: find a way to move this to main.js
		//TODO: makes sense to use a StringBuilder here
		var html = "<table  cellspacing=\"0\"><thead>";
		html += "<tr><th width=\"60%\">Subject</th><th>Author</th><th>Date</th></tr>";
		html += "</thead><tbody>";
		//ripple through the proxyList and paint table rows
        //OK: this is where private nodes will not be visible
        console.log("BARF  "+len+" "+proxyList);
		for (var i=0;i<len;i++) {
			p = proxyList[i];
			html+="<tr><td width=\"60%\">";
			label = "";
			if (p.getLabel(constants.ENGLISH)) {
				label = p.getLabel(constants.English);
			} else {
				label = p.getSubject(constants.ENGLISH).theText;
			}
			url = "<a href='"+urx+p.getLocator()+"'>"+label+"</a>";
			html+=url+"</td><td width=\"20%\">";
			url = "<a href='/user/"+p.getCreatorId()+"'>"+p.getCreatorId()+"</a>";
			html+=url+"</td><td>"+p.getLastEditDate()+"</td></tr>";
		}
		html+="</tbody></table>";
		callback(html,len,total);
	};

	//////////////////////////
	//In Dashboard View:
	//   two tables:
	//   P-Conversation, where the list is of a node's child nodes
	//     as collected under a specific context (conversation rootLocator)
	//   C-Conversation, where the list is of all a node's parent nodes
	// In Conversation View:
	//   Only the C-Conversation table is painted
	//////////////////////////
	/**
	 * Fill a topic's conversation table. In this case, the topic is
	 * always the context for any child nodes.
	 * @param isConversation <code>true</code> only if in conversation view
	 * @param isChild: <code>true</code> if we are to paint parents
	 * @param locator
	 * @param contextLocator  can be "" to mean undefined
	 * @param credentials
	 * @param callback signature (err,data)
	 */
	//TODO: this needs viewspec and rootLocator for a full href
	self.fillConversationTable = function(isConversation, isChild, locator,contextLocator,credentials,callback) {
		var TheResult = {},
			error = '';
		DataProvider.getNodeByLocator(locator,credentials, function commonMGetNode(err, data) {
			if (err) {error+=err;}
			if (data) {
				var snappers;
				if (isChild) {
					if (isConversation) {
						if (contextLocator === "") {
							snappers = data.listParentNodes();
						} else {
							snappers = data.listParentNodes(contextLocator);
						}
					} else {
						snappers = data.listParentNodes();
					}
				} else {
					if (isConversation) {
						if (contextLocator === "") {
							snappers = data.listChildNodes();
						} else {
							snappers = data.listChildNodes(contextLocator);
						}
					} else {
						snappers = data.listChildNodes();
					}
				}
	//			  myEnvironment.logDebug("CommonModel.fillConversationTable-1 "+isChild+" "+snappers+" "+data.toJSON());
	//			  console.log("CommonModel.fillConversationTable-1 "+isChild+" "+snappers);
				var p, //the struct
					m, //the individual message
					url,
					datax = [],
					posts = [];
				if (snappers) {
	//			  myEnvironment.logDebug("CommonModel.fillConversationTable- "+isChild+" "+JSON.stringify(snappers));
					var len = snappers.length,
						ntype;
					for (var i=0;i<len;i++) {
						p = snappers[i];
						myEnvironment.logDebug("CommonModel.fillConversationTable "+JSON.stringify(p));
						m = [];
						//track context with a query string
						//Determine node type here!!!
						//TODO: this needs to be extensible:
						// EACH application installs its mappers 
	//TODO: this needs more work!!!
						url = "<a class=\"nodehref\" href='/conversation/"+p.locator+"?contextLocator="+p.contextLocator+"'><img src=\""+p.smallImagePath+"\"> "+p.subject+"</a>";
						m.push(url);
						m.push("");
						m.push("");
						datax.push(m);
					}
				}
				TheResult.data = datax;
	//		  myEnvironment.logDebug("CommonModel.fillConversationTable+ "+isChild+" "+JSON.stringify(TheResult));
				return callback(error, TheResult);
			} else {
				return callback(error, TheResult);
			}
		});
	};

	/////////////////////////////////
	//ViewFirst
	// A query to an app with a node's id gets a first bit of HTML
	// painted:
	//   enough to generate a query which, ultimately, calls
	//   this in order to pain the core of the node in the form
	//   of a JSON blob which is processed at the browser
	//   by main.js
	/////////////////////////////////
	/**
	 * 
	 * @param theNode to be painted
	 * @param tagList can be []
	 * @param docList can be []
	 * @param userList can be []
	 * @param credentials
	 * @param canEdit  boolean
	 * @param coreData for this user and this request
	 * @param contextLocator
	 * @param app = "/blog/", "/bookmark/" etc
	 * @param language
	 * @param transcludeList  can be []
	 * @param viewspec: should be one of "Dashboard" or "Conversation"
	 * @callback signature (result) which is the data to paint
	 */
	//TODO: use viewspec to decide whether to fillTree or not: not needed in Conversation mode
	self.generateViewFirstData = function(theNode, tagList, docList, userList, credentials,
			canEdit, coreData, contextLocator, app, clipboard, language, transcludeList, viewspec, callback) {
		var data = coreData,
			q = theNode.getLocator();
		data.canEdit = canEdit;
		data.isNotEdit = true;
		var editLocator = app+"edit/"+q,
			date = theNode.getLastEditDate();
		data.locator = q;
		data.app = app;
		data.smallIcon = theNode.getSmallImage();
        //transcluder
        var transcluderLocator,
			tc = theNode.listPivotsByRelationType(types.DOCUMENT_TRANSCLUDER_RELATION_TYPE);
        if (tc && tc.length > 0) {
            //TODO
            //I THINK THIS IS TO PREVENT REPEAT TRANSCLUSIONS ???
        }
		//some nodes have URLs, such as bookmarks
		if (theNode.getResourceUrl()) {
			data.url = "<a href=\""+theNode.getResourceUrl()+"\"><b>URL:&nbsp;"+theNode.getResourceUrl()+"</b></a>";
		}
		console.log("ZZZZ "+language+" | "+JSON.stringify(theNode.getSubject(language)));
		var title;
		try {
			title = theNode.getSubject(language).theText;
		} catch(e) {console.log("BIGERROR "+e);}
		if (!title) {
			title = theNode.getLabel(language);
		}
        myEnvironment.logDebug("FOO "+theNode.getImage()+" "+theNode.toJSON());
        topicMapEnvironment.logDebug("FOO "+theNode.getImage()+" "+theNode.toJSON());
		//title is the "subject" line at the topic of a node view, not the page title
		data.title = "<h2 class=\"blog-post-title\"><img src="+theNode.getImage()+">&nbsp;"+title+"</h2>";
		var details = "";
		if (theNode.getBody(language)) {
			details = theNode.getBody(language).theText;
		} else if (theNode.getDetails(language)) {
			details = theNode.getDetails(language);
		}
		data.body = details;
		var edithtml = "";
		//////////////////////////////////////////////
		//TODO
		// We need to control editing on Quest Game Trees
		//   NO EDITING allowed on any tree node in a Quest's Game Tree
		// To Simplify that, we need to add use canEdit to tell that.
		//////////////////////////////////////////////
		if (canEdit) {
			edithtml = "&nbsp;&nbsp;&nbsp;&nbsp;<a href=\""+editLocator+"\"><b>Edit</b></a>";
		}
		//TODO: would like to include a "Transcluded by: " user href here;
		//It's not at all clear just how to go about doing that.
		//One approach is to include a transcludeuser parameter in a rest call if this is painted
		//from a list, which means changing the signature of this method to include that.
		var tu="";
		//if (transcludeUser) {
		//	tu="&nbsp;&nbsp<a href=\"/user/"+transcludeUser+"\">Transcluded by: "+transcludeUser+"</a>";
		//}
		data.user = theNode.getLastEditDate()+"&nbsp;&nbsp;<a href=\"/user/"+
			theNode.getCreatorId()+"\">Created by: "+theNode.getCreatorId()+"</a>"+tu+edithtml;
		if (contextLocator) {
			data.contextLocator = contextLocator;
			//TODO this must be used in the transclude button
		}
		data.source = theNode.toJSON();
		var transcludehtml="",
			newrelnhtml = "";
		if (credentials.length > 0 && clipboard === "") {
            //authenticated and nothing on the clipboard
            //deal with remembering this node
			transcludehtml =
				"<form method=\"post\" action=\"/conversation/remember\"  role=\"form\" class=\"form-horizontal\">";
			transcludehtml +=
				"<input type=\"hidden\" name=\"transcludeLocator\" value=\"\">";
			transcludehtml +=
				"<input type=\"hidden\" name=\"myLocator\" value=\""+q+"\">";
			transcludehtml +=
				"<input type=\"hidden\" name=\"contextLocator\" value=\""+contextLocator+"\">";
			transcludehtml +=
				"<div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\">";
			transcludehtml +=
				"<button type=\"submit\" class=\"btn btn-info  btn-xs\" title=\"Remember for transclusion or relation\">Remember This Node</button>";
			transcludehtml += "</div></div></form>";
		}
        if (credentials.length > 0 && clipboard.length > 0) {
            //authenticated and something on the clipboard; might be a relation
 			newrelnhtml =
				"<form method=\"get\" action=\"/kwb/newrelation\"  role=\"form\" class=\"form-horizontal\">";
			newrelnhtml +=
				"<input type=\"hidden\" name=\"myLocator\" value=\""+q+"\">";
			newrelnhtml +=
				"<input type=\"hidden\" name=\"targetLocator\" value=\""+clipboard+"\">";
			newrelnhtml +=
				"<div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\">";
			newrelnhtml +=
				"<button type=\"submit\" class=\"btn btn-info  btn-xs\">Create a New Relation</button>";
			newrelnhtml += "</div></div></form>";
        }
		data.transclude = transcludehtml;
        data.newrelnhtml = newrelnhtml;
		if (tagList.length > 0) {
			data.tags = tagList;
		}
        if (transcludeList.length > 0) {
            data.transcludes = transcludeList;
        }
		if (userList.length > 0) {
			data.users = userList;
		}
		if (docList.length > 0) {
			data.documents = docList;
		}
		//Technically speaking, we don't need to do this in Conversation view
		if (viewspec === "Dashboard") {
			self.fillTree(q,credentials, function commonMFillTree(err, node) {
				console.log("CommonModel.generateViewFirstData "+err+" "+node);
				if (node) {
					data.jtree = node;
				}
				return callback(data);
			});
		} else {
			return callback(data);
		}
	};
	
	/**
	 * This is the big kahoona for handling an ajax fetch for ViewFirst views
	 */
	self.__doAjaxFetch = function(theNode, credentials, app, tags, docs, users, transcludes, data, req, callback) {
		myEnvironment.logDebug("CommonModel.__doAjaxFetch- "+JSON.stringify(data));
		var q = theNode.getLocator(),
			lang = req.query.language;
		if (!lang) {
			lang = "en";
		}
		data.language = lang;
		//establish rootLocator if any
		//required if there is a conversation tree in play
		var rootLocator = req.query.rootLocator,
		//establish the viewspec
			viewspec = req.query.viewspec;
		if (!viewspec) {
			//Default to Dashboard
			viewspec = "Dashboard";
		}
        // contextLocator is alwasy important to conversation nodes
		var contextLocator;
		if (req.query.contextLocator) {
			//was passed in through the query
			contextLocator = req.query.contextLocator;
		} else {
			//if it's a map node, use that: an assumption that this is not a nested map
			if (theNode.getNodeType() === types.CONVERSATION_MAP_TYPE) {
				contextLocator = q;
			} else {
				//this is a punt: not sure the precise use case
				//we may need to do something more analytical here
				contextLocator = q;
				//TODO conversations might not do this
			}
		}
		//////////////////////////////////////////
		//Rules for this node's editablity:
		//  the node's creator
		//  an Admin
		// EXCEPTIONS:
		//	The node being viewed is a Quest GameTree Node being viewed in the Quest itself
		// TODO
		//   NEED to add a isQuestGameNode
		///////////////////////////////////////////
		var canEdit,
			isQuestGameNode = data.isQuestGameNode;
		if (isQuestGameNode) {
			canEdit = false;
		} else {
			canEdit = data.isNotEditable;
		}
		if (!isQuestGameNode && !data.isNotEditable) {
			canEdit = self.canEdit(theNode,credentials);
		}
		//must pass this to view
		var editLocator = app+"edit/"+theNode.getLocator();
		//we leave it to the caller to load pivots
		//see if there is a clipboard, meaning someone "remembered" another
		// node to transclude into this one
		var clipboard = req.session.clipboard;
		//if there is a node to transclude, it's nice to know who the user is
		//generate the ViewFirst node data
		//TODO must add transcludes
		self.generateViewFirstData(theNode, tags, docs, users, credentials, canEdit, data,
				contextLocator, app, clipboard, lang, transcludes, viewspec, function commonMGenerateView(json) {
			json.myLocatorXP = q+"?contextLocator="+contextLocator;
			json.myLocator = q;
            KnowledgeWorkbenchModel.showRelations(theNode, function commonMShowRelations(rresult) {
                if (rresult) {
                    json.relations = rresult;
                }
                myEnvironment.logDebug("CommonModel.__doAjax-1 "+JSON.stringify(json));
                //get all parents
                self.fillConversationTable(true, true, q, "", credentials, function commonMFillTable(err, cresult) {
                    if (cresult) {
                        //the field which olds the C-Conversation nodes
                        json.ccontable = cresult;
                    }
                    //get just my parents in particular context
                    //TODO
                    //HUGE ISSUE: if viewspec === "Conversation" we don't need this
                    self.fillConversationTable(true, false, q, contextLocator, credentials, function commonMFillTable1(err, presult) {
                        if (presult) {
                            //for displaying P-Conversations
                            json.pcontable = presult;
                        }
                        //viewspec came in either from the query, or defaulted to "Dashboard"
                        if (viewspec === "Conversation") {
                            //if this is a Conversation view, we are very concerned with rootLocator
                            if (!rootLocator) {rootLocator = q;}
                            //create the actual MillerColumn html
                            var js = "javascript:fetchFromTree";
                           // ColNavWidget.makeColNav(rootLocator, theNode, contextLocator, lang, js, "/conversation/ajaxfetch/", "", credentials, function(err,html) {
                            ColNavWidget.makeColNav(rootLocator, theNode, contextLocator, lang, js, app+ "ajaxfetch/", "", credentials, function commonMMakeColNav(err, html) {
                                json.colnav = html;
                                return callback(json, contextLocator);
                            });
                        } else {
                            return callback(json, contextLocator);
                        }
                    });
                });
            });
		});
	};
    
	/**
	 * Handles fetching an app given an id
	 */
	self.__doGet = function(locator, app, data, req, callback) {
		var viewspec = "Dashboard", // default
			rootLocator = "",
			contextLocator = "";
		try {
			if (req.query.viewspec) {
				viewspec = req.query.viewspec;
			}
			rootLocator = req.query.rootLocator;
			contextLocator = req.query.contextLocator;
		} catch (e) {console.log("ConversationGET error: "+e);}
		data.rootLocator = rootLocator;
		data.contextLocator = contextLocator;
		data.locator = locator;
        var vx;
		if (viewspec === "Dashboard") {
            vx = self.getColNavViewSpec(app, locator);
			data.viewmenu = JSON.parse(vx);
		} else {
            vx = self.getDashboardViewSpec(app, locator);
			data.viewmenu = JSON.parse(vx);
		}

		var l = req.query.language;
		if (!l) {
			l = "en";
		}
		data.language = l;
		data.app=app;
		data.query = app+"ajaxfetch/"+locator;
		data.type = viewspec;
		return callback(viewspec, data);
	};
  
};