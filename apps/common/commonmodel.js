/**
 * commonmodel
 */
var  constants = require('../../core/constants');

var CommonModel = module.exports = function(environment, tmenv) {
	var myEnvironment = environment;
	var topicMapEnvironment = tmenv;
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var self = this;
	
	  /**
	   * @param proxyList
	   * @param urx  e.g. "conversation/"
	   * @param callback signatur (data)
	   */
	  self.fillDatatable = function(proxyList, urx, callback) {
		  var theResult = {};
		 
		      var data = [];
		      var len = proxyList.length;
		      var p; //the proxy
		      var m; //the individual message
		      var url;
		      var posts = [];
		      for (var i=0;i<len;i++) {
		        p = proxyList[i];
		        m = [];
		        var subj = "";
		        if (p.getSubject(constants.ENGLISH)) {
		        	subj = p.getSubject(constants.ENGLISH).theText;
		        } else {
		        	subj = p.getLabel(constants.ENGLISH);
		        }
		        url = "<a href='"+urx+p.getLocator()+"'>"+subj+"</a>";
		        m.push(url);
		        url = "<a href='user/"+p.getCreatorId()+"'>"+p.getCreatorId()+"</a>";
		        m.push(url);
		        m.push(p.getDate());
		        data.push(m);
		      }
		      theResult.data = data;
		      console.log();
		      console.log("CommonModel.fillDatatable "+JSON.stringify(theResult));
		      console.log();
		    callback(theResult);
	  },
	  
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
	  self.fillConversationTable = function(isConversation, isChild, locator,contextLocator,credentials,callback) {
		  var TheResult = {};
		  Dataprovider.getNodeByLocator(locator,credentials, function(err,data) {
			  topicMapEnvironment.logDebug("CommonModel.fillConversationTable- "+err+" "+data);
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
			  topicMapEnvironment.logDebug("CommonModel.fillConversationTable-1 "+isChild+" "+snappers+" "+data.toJSON());
			  console.log("CommonModel.fillConversationTable-1 "+isChild+" "+snappers);
		      var p; //the struct
		      var m; //the individual message
		      var url;
			  var data = [];
		      var posts = [];
			  if (snappers) {
				  topicMapEnvironment.logDebug("CommonModel.fillConversationTable- "+isChild+" "+JSON.stringify(snappers));
				  var len = snappers.length;
				  for (var i=0;i<len;i++) {
					  p = snappers[i];
					  topicMapEnvironment.logDebug("CommonModel.fillConversationTable "+JSON.stringify(p));
					  m = [];
					  //track context with a query string
				      url = "<a href='/conversation/"+p.locator+"?contextLocator="+p.contextLocator+"'><img src=\""+p.smallImagePath+"\"> "+p.subject+"</a>";
				      m.push(url);
				      m.push("");
				      m.push("");
				      data.push(m);
				  }
			  }
			  TheResult.data = data;
			  topicMapEnvironment.logDebug("CommonModel.fillConversationTable+ "+isChild+" "+JSON.stringify(TheResult));
			  return callback(err,TheResult);
		  });
	  },
	  
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
	   * @callback signature (result) which is the data to paint
	   */
	  self.generateViewFirstData = function(theNode, tagList, docList, userList, credentials, 
			  canEdit, coreData, contextLocator, app, clipboard, language, callback) {
		  var data = coreData;
		  var q = theNode.getLocator();
    	  data.canEdit = canEdit;
    	  data.isNotEdit = true;
    	  var editLocator = app+"edit/"+q;
    	  var date = theNode.getLastEditDate();
    	  data.locator = q;
    	  if (theNode.getResourceUrl()) {
    		  data.url = "<a href=\""+theNode.getResourceUrl()+"\"><b>URL:&nbsp;"+theNode.getResourceUrl()+"</b></a>";
    	  }
    	  
    	  console.log("ZZZZ "+language+" | "+JSON.stringify(theNode.getSubject(language)));
    	  var title = "";
    	  if (theNode.getSubject(language)) {
    		  title = theNode.getSubject(language).theText;
    	  } else if (theNode.getLabel("language")) {
    		  title = theNode.getLabel("language");
    	  }
    	  data.title = "<h2 class=\"blog-post-title\"><img src="+theNode.getImage()+">&nbsp;"+title+"</h2>"
	      var details = "";
	      if (theNode.getBody(language)) {
	    	  details = theNode.getBody(language).theText;
	      } else if (theNode.getDetails(language)) {
	    	  details = theNode.getDetails(language);
	      }
    	  data.body = details;
    //	  data.tags = tags;
    	  var edithtml = "";
    	  if (canEdit) {
    		  edithtml = "&nbsp;&nbsp;&nbsp;&nbsp;<a href=\""+editLocator+"\"><b>Edit</b></a>";
    	  }
    	  data.user = theNode.getLastEditDate()+"&nbsp;&nbsp;<a href=\"/user/"+theNode.getCreatorId()+"\">"+theNode.getCreatorId()+"</a>"+edithtml;
    	  
	      if (contextLocator) {
	    	  data.contextLocator = contextLocator;
	    	  //TODO this must be used in the transclude button
	      }
	      data.source = theNode.toJSON();
	      var transcludehtml="";
	      if (credentials.length > 0 && clipboard === "") {
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
	    		  "<button type=\"submit\" class=\"btn btn-primary\">Remember This Node For Transclusion</button>";
	    	  transcludehtml += "</div></div></form>";
	      }
	      data.transclude = transcludehtml;
	      if (tagList.length > 0) {
	    	  data.tags = tagList;
	      }
	      if (userList.length > 0) {
	    	  data.users = userList;
	      }
	      if (docList.length > 0) {
	    	  data.documents = docList;
	      }

	      return callback(data);
	  }
	  
};