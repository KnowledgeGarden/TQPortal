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
		        url = "<a href='"+urx+p.getLocator()+"'>"+p.getSubject(constants.ENGLISH).theText+"</a>";
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
			  console.log("CommonModel.fillConversationTable- "+err+" "+data);
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
			  topicMapEnvironment.logDebug("CommonModel.fillConversationTable- "+isChild+" "+snappers+" "+data.toJSON());
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
	  }
	  
};