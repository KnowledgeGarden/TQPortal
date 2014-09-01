/**
 * process support for jquery-colnav widget
 */
var  types = require('../../node_modules/tqtopicmap/lib/types')
	, sb = require('../../node_modules/tqtopicmap/lib/util/stringbuilder')
	, constants = require('../../core/constants');


var ColNavWidget = module.exports = function(environment, dp) {
	var myEnvironment = environment;
	var DataProvider = dp
	console.log("ColNavWidget "+dp);
	var self = this;
	

	/**
	 * Make a given node
	 * 
	 */
	self.__makeNodeHTML = function(node, language, buf, contextLocator, rootNodeLocator) {
		console.log("ColNavWidget.__makeNodeHTML "+JSON.stringify(node)+" "+buf);
		buf.append("<li id=\""+node.getLocator()+"\"><a class=\"nodehref\" href=\"");
		var query = "javascript:fetchFromTree('"+node.getLocator()+"', '/conversation/ajaxfetch/"+node.getLocator()+"?viewspec=ColNav&contextLocator="+contextLocator+"&rootLocator="+rootNodeLocator+"&language="+language+"')\"";
		buf.append(query+" ondblclick =\"doDoubleClick();\">");
		buf.append("<img src=\""+node.getSmallImage()+"\" class=\"nodeimg\"> ");
		title = node.getLabel(constants.ENGLISH);
		if (!title) {
			title = node.getSubject(constants.ENGLISH).theText;
		}
		buf.append("<span class='nodetitle'>"+title+"</span></a>"); // leave off trailing </li>
//		console.log("ColNavWidget.__makeNodeHTML+ "+node.getLocator()+" "+buf);
	},
	
	/**
	 * A possibly recursive system to craft a ColNav tree rooted in <code>rootNode</code>
	 * The code fills <code>buf</code> and returns buf.toString(); (note: nobody uses it)
	 * We enter this with the rootNode already painted in <code>buf</code> but missing
	 * its trailing </li>
	 * @param rootNodeLocator used in querystring to keep track of root
	 * @param rootNode
	 * @param selectedNode
	 * @param contextLocator
	 * @param language
	 * @param buf  a StringBuilder
	 * @param credentials
	 * @param callback signature (err,html)
	 */
	self.__buildColNav = function(rootNodeLocator, rootNode, selectedNode, contextLocator, language,  buf, stop, credentials, callback) {
		var error = "";
		console.log("ColNavWidget.__buildColNav "+rootNodeLocator+" "+rootNode);
		buf.append(self.__makeNodeHTML(rootNode, language, buf, contextLocator, rootNodeLocator));
//		console.log("ColNavWidget.__buildColNav-1 "+buf.toString());
		//complex: rootNode will change with recursion on children
		//when rootNode === selectedNode, paint its kids, then stop
		var stop = (rootNode.getLocator() === selectedNode.getLocator());
		var kids = rootNode.listChildNodes(contextLocator);
//		console.log("ColNavWidget.__buildColNav-2 "+kids);

		if (kids && kids.length > 0) {
//			console.log("ColNavWidget.__buildColNav-3 "+kids.length);

			buf.append("<ul>");
			var len = kids.length;
			var cursor = 0;
			var nx; //childstruct.js
			function loop() {
				if (cursor >= len) {
					buf.append("</ul>");
//					console.log("ColNavWidget.__buildColNav-6 "+buf.toString());

					callback(error,buf.toString());
				} else {
					nx = kids[cursor++];
//					console.log("ColNavWidget.__buildColNav-4 "+JSON.stringify(nx));
					DataProvider.getNodeByLocator(nx.locator,credentials, function(err,node) {
						if (err) {error+=err;}
//						console.log("ColNavWidget.__buildColNav-5 "+stop+" | "+err+" | "+node);
							self.__buildColNav(rootNodeLocator, node, selectedNode, contextLocator, language, buf, credentials, stop, function(err,html) {
								if (err) {error+=err;}
								loop();
							});
						
					});
				}
			}
			loop();
		} else {
//			console.log("ColNavWidget.__buildColNav-7 "+buf.toString());

			callback(error, buf.toString());
		}
	},	
	
	
	
	/**
	 * Recursively paint colnav treenodes starting from <code>rootNodeLocator,
	 * and stopping when selectedNode is added to the tree. It's possible that
	 * <code>rootNodeLocator</code> is the same as <code>selectedNode</code>
	 * @param rootNodeLocator
	 * @param selectedNode
	 * @contextLocator if "", then takes all child contexts
	 * @param language
	 * @param credentials
	 * @param callback signature (err,colnavhtml)
	 */
	self.makeColNav = function(rootNodeLocator, selectedNode, contextLocator, language, credentials,callback) {
		var buffer = new sb();
//		console.log("ColNavWidget.makeColNav "+buffer);
		if (selectedNode.getLocator() === rootNodeLocator) {
			self.__buildColNav(rootNodeLocator, selectedNode, selectedNode, contextLocator,language,buffer, credentials, false, function(err, html) {
//				console.log("ColNavWidget.makeColNav-1 "+html);
				buffer.append("</li>");
				callback(err,buffer.toString());
			});
		} else {
			DataProvider.getNodeByLocator(rootNodeLocator,credentials, function(err,node) {
				self.__buildColNav(rootNodeLocator, node, selectedNode, contextLocator, language,buffer, credentials, false, function(err, html) {
//					console.log("ColNavWidget.makeColNav-2 "+html);
					buffer.append("</li>");
					callback(err,buffer.toString());
				});
			});
		}
	};
	
};
