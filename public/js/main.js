/**
 * main.js
 * For view-first support
 * Must eventually handle table paging, table filling, etc
 */


var navtoggle = false;
var currentLocator;
var locator;
var query;

function fetchFromTree(lox, quex) {
	locator = lox;
	query = quex;
    doDoubleClick();
}

/**
 * ViewFirst tables:
 * Since different index tables will vary,
 * we let the server paint the html
 * query is based on <app>/index
 */
function doPageSetup() {
	//var data = $("#tabledata");
	var q = $("#tabledata").attr("query");
//	alert(q);
	var cursor = $("#tabledata").attr("start");
	var count = $("#tabledata").attr("count");
	var query = q+"?start="+cursor+"&count="+count;
//	alert(query);
	$.get( query, function( data ) {
		paintIndex(data);
	});
    
}

//custom handler for issuehome.handlebars which has several tabs with tables
function handleIssueHome() {
    //ISSUES
	var q = $("#issuetabledata").attr("query");
//	alert(q);
    if (q) {
	var cursor = $("#issuetabledata").attr("start");
	var count = $("#issuetabledata").attr("count");
	var query = q+"?start="+cursor+"&count="+count;
    var avail, surplus, more, html;
	//alert(query);
	$.get( query, function( data ) {
       // alert(JSON.stringify(data));
	  $("#issuetableindex").html(data.table);
	  $("#issuetabledata").attr("start","");
	  //$("#tabledata").attr("count","");
	  $("#issuetabledata").attr("total","");
	  $("#issuetabledata").attr("start",parseInt(data.issuestart));
	  //$("#tabledata").attr("count",parseInt(data.count));
	  $("#issuetabledata").attr("total",parseInt(data.issuetotal));
      cursor = parseInt(data.issuestart);
	  count = parseInt(data.issuecount);
	  //total available to show
	  avail = parseInt(data.issuetotal);
	  //what's to the left of the cursor
	  surplus = cursor - count;
	  //what's to the right of the cursor
	  more = avail - cursor;
        
//	alert(cursor+" "+more+" "+surplus+" "+avail);
	  //     5          5         0         10
	  //    10          0         5         10  after previous
	  html = "Available: "+avail; //doing simple javascript hrefs for now
	  if (more > 0) {
		html+="&nbsp;&nbsp;<a href=\"javascript:pageNext();\"><b>Next</a>";
	  }
	  if (surplus > 0) {
		html+="&nbsp;&nbsp;<a href=\"javascript:pagePrevious();\"><b>Previous</a>";	
	  }
      //  alert(html);
	  $("#issuepagination").html(html);
	});
    }
    //QUESTS
    q = $("#questtabledata").attr("query");
    if (q) {
	//alert(q);
	cursor = $("#questtabledata").attr("start");
	count = $("#questtabledata").attr("count");
	query = q+"?start="+cursor+"&count="+count;
    //avail, surplus, more, html;
	//alert(query);
	$.get( query, function( data ) {
 //       alert(JSON.stringify(data));
	  $("#questtableindex").html(data.table);
	  $("#questtabledata").attr("start","");
	  //$("#tabledata").attr("count","");
	  $("#questtabledata").attr("total","");
	  $("#questtabledata").attr("start",parseInt(data.issuestart));
	  //$("#tabledata").attr("count",parseInt(data.count));
	  $("#questtabledata").attr("total",parseInt(data.issuetotal));
      cursor = parseInt(data.queststart);
	  count = parseInt(data.questcount);
	  //total available to show
	  avail = parseInt(data.questtotal);
	  //what's to the left of the cursor
	  surplus = cursor - count;
	  //what's to the right of the cursor
	  more = avail - cursor;
        
//	alert(cursor+" "+more+" "+surplus+" "+avail);
	  //     5          5         0         10
	  //    10          0         5         10  after previous
	  html = "Available: "+avail; //doing simple javascript hrefs for now
	  if (more > 0) {
		html+="&nbsp;&nbsp;<a href=\"javascript:pageNext();\"><b>Next</a>";
	  }
	  if (surplus > 0) {
		html+="&nbsp;&nbsp;<a href=\"javascript:pagePrevious();\"><b>Previous</a>";	
	  }
      //  alert(html);
	  $("#questpagination").html(html);
    });
    }
    //GUILDS
    q = $("#guildtabledata").attr("query");
    if (q) {
	//alert(q);
	cursor = $("#guildtabledata").attr("start");
	count = $("#guildtabledata").attr("count");
	query = q+"?start="+cursor+"&count="+count;
    //avail, surplus, more, html;
	//alert(query);
	$.get( query, function( data ) {
 //       alert(JSON.stringify(data));
	  $("#guildtableindex").html(data.table);
	  $("#guildtabledata").attr("start","");
	  //$("#tabledata").attr("count","");
	  $("#guildtabledata").attr("total","");
	  $("#guildtabledata").attr("start",parseInt(data.guildstart));
	  //$("#tabledata").attr("count",parseInt(data.count));
	  $("#guildtabledata").attr("total",parseInt(data.guildtotal));
      cursor = parseInt(data.guildstart);
	  count = parseInt(data.guildcount);
	  //total available to show
	  avail = parseInt(data.guildtotal);
	  //what's to the left of the cursor
	  surplus = cursor - count;
	  //what's to the right of the cursor
	  more = avail - cursor;
        
//	alert(cursor+" "+more+" "+surplus+" "+avail);
	  //     5          5         0         10
	  //    10          0         5         10  after previous
	  html = "Available: "+avail; //doing simple javascript hrefs for now
	  if (more > 0) {
		html+="&nbsp;&nbsp;<a href=\"javascript:pageNext();\"><b>Next</a>";
	  }
	  if (surplus > 0) {
		html+="&nbsp;&nbsp;<a href=\"javascript:pagePrevious();\"><b>Previous</a>";	
	  }
      //  alert(html);
	  $("#guildpagination").html(html);
    });
    }
}

function paintColNav(data) {
	var html = data.colnav;
//	alert("HTML "+html);
	$("ul#myConTree").html(html);
}

/**
 * Server must send back 
 *   the table's HTML <table>
 *   the current cursor <start>
 *   the number sent <count>
 *   the total number available <total>
 * @param data
 * @returns
 */
function paintIndex(data) {
//	alert(data.total);
	$("div.tableindex").html(data.table);
	$("#tabledata").attr("start","");
	//$("#tabledata").attr("count","");
	$("#tabledata").attr("total","");
	$("#tabledata").attr("start",parseInt(data.start));
	//$("#tabledata").attr("count",parseInt(data.count));
	$("#tabledata").attr("total",parseInt(data.total));
	paintPaginationButtons(data);
}

function paintPaginationButtons(data) {
	var cursor = parseInt(data.start);
	var count = parseInt(data.count);
	//total available to show
	var avail = parseInt(data.total);
	//what's to the left of the cursor
	var surplus = cursor - count;
	//what's to the right of the cursor
	var more = avail - cursor;
//	alert(cursor+" "+more+" "+surplus+" "+avail);
	//     5          5         0         10
	//    10          0         5         10  after previous
	var html = "Available: "+avail; //doing simple javascript hrefs for now
	if (more > 0) {
		html+="&nbsp;&nbsp;<a href=\"javascript:pageNext();\"><b>Next</a>";
	}
	if (surplus > 0) {
		html+="&nbsp;&nbsp;<a href=\"javascript:pagePrevious();\"><b>Previous</a>";	
	}
	$("div.pagination").html(html);
}

function pageNext() {
	var data = $("#tabledata");
	var q = data.attr("query");
	//tells where we are (actually, points to the next
	var cursor = parseInt(data.attr("start"));
	//
	var count = parseInt(data.attr("count"));
	var avail = parseInt(data.attr("total"));
//	alert(cursor+" "+count);
	var query = q+"?start="+cursor+"&count="+count;
	$.get( query, function( data ) {
		paintIndex(data);
	});
}

function getNodeType(typ, icon) {
    var urx;
    	if (typ) {
    		if (typ === "WikiNodeType") {
    			urx = "/wiki/";
    		} else if (typ === "BlogNodeType") {
    			urx = "/blog/";
    		} else if (typ === "BookmarkNodeType") {
    			urx = "/bookmark/";
    		}
        }
        if (!urx && icon) {
    		//try to infer from image
    		if (icon === "/images/bookmark_sm.png") {
    			urx = "/bookmark/";
    		} else if (icon === "/images/publication_sm.png") {
    			//could be a wiki or a blog (until we get different icons
    			urx = "/blog/";
    		} else if (icon === "/images/cogwheels_sm.png") {
                urx = "/kwb/"
            }
    	}
    if (!urx) {
       urx ="/conversation/"; //default
    }
    return urx;
}
/////////////////////////
//GEO Location
/////////////////////////
function getLocationConstant()
{
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(onGeoSuccess,onGeoError);
    } else {
        alert("Your browser or device doesn't support Geolocation");
    }
}

// If we have a successful location update
function onGeoSuccess(event)
{
    document.getElementById("Latitude").value =  event.coords.latitude; 
    document.getElementById("Longitude").value = event.coords.longitude;

}

// If something has gone wrong with the geolocation request
function onGeoError(event)
{
    alert("Error code " + event.code + ". " + event.message);
}

function pagePrevious() {
	var data = $("#tabledata");
	var q = data.attr("query");
	//tells where we are (actually, points to the next
	var cursor = parseInt(data.attr("start"));
	//
	var count = parseInt(data.attr("count"));
	var start = cursor - count-count;
	if (start < 0) {
		start = 0;
	}
	//var avail = parseInt(data.attr("total"));
//	alert(cursor+" "+count+" "+start);
	var query = q+"?start="+start+"&count="+count;
	$.get( query, function( data ) {
		paintIndex(data);
	});

}

function paintRelationSelections(relations) {
//    alert(relations);
    var html = "";
        for (var i=0;i<relations.length;i++) {
            html += relations[i]+"<br/>";
        }
    
    $("div.relationselections").html = html;
}

function paintRelations(relations) {
    // each relnstruct has an 's' or a 't'
    // to determine where in a triple col row
    // the doc goes (source or target)
    var html = "<table width='800px'>";
    var reln, obj;
    for (var i=0;i<relations.length;i++) {
        reln = relations[i];
        html+="<tr>";
        html+="<td width='33%'>";
        //TODO figure out the app to put here
        if (reln.sort == 's') {
            obj = "<a href='/kwb/"+reln.locator+"'><img src='"+reln.icon+"'> "+reln.label+"</a>";
        } else {
            obj = "              ";
        }
        html+=obj+"</td><td width='33%'>"
        html+="<a href='/kwb/"+reln.relationLocator+"'>"+reln.relationLabel+"</a></td><td>"
         //TODO figure out the app to put here
        if (reln.sort == 't') {
            obj = "<a href='/kwb/"+reln.locator+"'><img src='"+reln.icon+"'> "+reln.label+"</a>";
        } else {
            obj = "              ";
        }
        html+=obj+"</td></tr>";
    }
    html+= "</table>"
    $("div.relationlist").html(html);
}

function paintNewRelationButton(html) {
    $("div.newreln").html(html);
}
      
function paintCConTable(data) {
	var html = "<h4>Subject</h4>";
	 html += "<ol class=\"list-unstyled\">";
	 html+="</ol></div>";
	for (var i=0;i<data.length;i++) {
	    	html+= "<li>"+data[i][0]+"</li>"
	}	
	$("div.ccontable").html(html);
}

function paintPConTable(data) {
	var html = "<h4>Subject</h4>";
	html += "<ol class=\"list-unstyled\">";
	html+="</ol></div>";
	for (var i=0;i<data.length;i++) {
		html+= "<li>"+data[i][0]+"</li>"
	}
	$("div.pcontable").html(html);
}

function paintTags(tags, isAuthenticated, locator) {
	var nx = "";
	if (isAuthenticated) {
		nx = "<a title = \"Add More Tags\" href=\"/tag/addtag/"+locator+"\"><img src=\"/images/newbutton_sm.png\"></a>";
	}
    var html = "<h4>Tags"+nx+"</h4> <div class=\"sidebar-module pre-scrollable\" style=\"border: 1px solid #e1e1e8;\">";
    html += "<ol class=\"list-unstyled\">";
    for (var i=0;i<tags.length;i++) {
    	html+= "<li><a href=\"/tag/"+tags[i].locator+"\"><img src=\""+tags[i].icon+"\">&nbsp;"+tags[i].label+"</a></li>"
    }
   html+="</ol></div>";
   $("div.taglist").html(html);
}

function paintUsers(users) {
    var html = "<h4>Users</h4> <div class=\"sidebar-module pre-scrollable\" style=\"border: 1px solid #e1e1e8;\">";
    html += "<ol class=\"list-unstyled\">";
    for (var i=0;i<users.length;i++) {
    	html+= "<li><a href=\"/user/"+users[i].locator+"\"><img src=\""+users[i].icon+"\">&nbsp;"+users[i].label+"</a></li>"
    }
   html+="</ol></div>";
   $("div.userlist").html(html);
}

function paintTranscludes(docs) {
 //   alert(JSON.stringify(docs));
    var html = "<h4>Transcludes</h4> <div class=\"sidebar-module pre-scrollable\" style=\"border: 1px solid #e1e1e8;\">";
    html += "<ol class=\"list-unstyled\">"
    var urx, typ;
    for (var i=0;i<docs.length;i++) {
    	urx=getNodeType(docs[i].documentType, docs[i].icon);
    	html+= "<li><a href=\""+urx+docs[i].locator+"\"><img src=\""+docs[i].icon+"\">&nbsp;"+docs[i].label+"</a></li>"
    }
   html+="</ol></div>";
   $("div.transcludelist").html(html);
}

function paintDocs(docs) {
    var html = "<h4>Documents</h4> <div class=\"sidebar-module pre-scrollable\" style=\"border: 1px solid #e1e1e8;\">";
    html += "<ol class=\"list-unstyled\">"
    var urx;
    for (var i=0;i<docs.length;i++) {
    	urx=getNodeType(docs[i].documentType, docs[i].icon);
    	html+= "<li><a href=\""+urx+docs[i].locator+"\"><img src=\""+docs[i].icon+"\">&nbsp;"+docs[i].label+"</a></li>"
    }
   html+="</ol></div>";
   $("div.doclist").html(html);
}

/**
 * Guilds in a Quest
 */
function paintGuilds(docs) {
    var html = "<h4>Guilds</h4> <div class=\"sidebar-module pre-scrollable\" style=\"border: 1px solid #e1e1e8;\">";
    html += "<ol class=\"list-unstyled\">"
    var urx;
    for (var i=0;i<docs.length;i++) {
    	urx=getNodeType(docs[i].documentType, docs[i].icon);
    	html+= "<li><a href=\""+urx+docs[i].locator+"\"><img src=\""+docs[i].icon+"\">&nbsp;"+docs[i].label+"</a></li>"
    }
   html+="</ol></div>";
   $("div.guildlist").html(html);
}

/**
 * Quests on an Issue
 */
function paintQuests(docs) {
    var html = "<h4>Quests</h4> <div class=\"sidebar-module pre-scrollable\" style=\"border: 1px solid #e1e1e8;\">";
    html += "<ol class=\"list-unstyled\">"
    var urx;
    for (var i=0;i<docs.length;i++) {
    	urx=getNodeType(docs[i].documentType, docs[i].icon);
    	html+= "<li><a href=\""+urx+docs[i].locator+"\"><img src=\""+docs[i].icon+"\">&nbsp;"+docs[i].label+"</a></li>"
    }
   html+="</ol></div>";
   $("div.questlist").html(html);
}

function clearEvidence() {
	$("div.evidencelist").html("");
}

function paintEvidence(docs) {
    var html = "<h4>Evidence</h4> <div class=\"sidebar-module pre-scrollable\" style=\"border: 1px solid #e1e1e8;\">";
    html += "<ol class=\"list-unstyled\">";
    var urx;
    for (var i=0;i<docs.length;i++) {
    	urx=getNodeType(docs[i].documentType, docs[i].icon);
    	html+= "<li><a href=\""+urx+docs[i].locator+"\"><img src=\""+docs[i].smallImagePath+"\">&nbsp;"+docs[i].subject+"</a></li>"
    }
   html+="</ol></div>";
//	alert(html);

   $("div.evidencelist").html(html);
}

function createNode(data) {
	
	var html = "<li data-jstree='{ \"icon\" : \""+data.img+"\" }'>"+data.label;
	var kids = data.children;
	if (kids) {
		if (kids.length > 0) {
			var shtml = "<ul>";
			var kid;
			for (var i=0;i<kids.length;i++) {
				//recurse
				shtml+=createNode(kids[i]);
			}
			shtml+="</ul>";
			html+=shtml;
		}
	}
	html+="</li>";

	return html;
}

function paintTree(root) {
	var html = "<ul>";
	html+= createNode(root);
	html+="</ul>";
//	alert("P1 "+html);
	if (html) {
		//set the html
		$('#jstree_div').html(html);
		//initialize tree
		$('#jstree_div').jstree();

	}
}


function getPage(type, query) {
//	alert("XX "+query);
	$.get( query, function( data ) {
//		alert(data);
		currentLocator = data.locator;
		if (type === "Conversation") {
		//	alert("here "+navtoggle);
			if (!navtoggle) {
				paintColNav(data);
				$("ul#myConTree").columnNavigation({
					containerPosition:"relative",
					containerWidth:"900px",
					containerHeight:"210px",
					containerBackgroundColor:"rgb(255,255,255)",
					containerFontColor:"rgb(50,50,50)",
					columnWidth:300,
					columnFontFamily:"'Helvetica Neue', 'HelveticaNeue', Helvetica, sans-serif",
					columnFontSize:"90%",
					columnSeperatorStyle:"1px solid rgb(220,220,220)",
					columnDeselectFontWeight:"normal",
					columnDeselectColor:"rgb(50,50,50)",
					columnSelectFontWeight:"normal",
					columnSelectColor:"rgb(255,255,255)",
					columnSelectBackgroundColor:"rgb(27,115,213)",
					columnSelectBackgroundPosition:"top",
					columnItemPadding:"3px 3px 5px 3px",
					columnScrollVelocity:50,
				});
                navtoggle = true;
			}
		} else {
				//paint p-con
			if (data.pcontable) {
				paintPConTable(data.pcontable.data);
			}
		}
		//now, paint the page
		$("div.topictitle").html(data.title);
		$("div.userref").html(data.user);
		if (data.url) {
			$("div.urlref").html(data.url);
		}
		$("div.body").html(data.body);
		if (data.responsebuttons) {
			$("div.responsebuttons").html(data.responsebuttons);
		}
		if (data.transclude) {
			$("div.transclude").html(data.transclude);
		}
		if (data.transcludeevidence) {
			$("div.transcludeevidence").html(data.transcludeevidence);
		}
		$("div.sourcecode").html(data.source);
		if (data.tags) {
			paintTags(data.tags, data.isAuthenticated, data.locator);
		} else if (data.isAuthenticated) {
			paintTags([], data.isAuthenticated, data.locator);
		}
		if (data.users) {
			paintUsers(data.users);
		}
		if (data.documents) {
			paintDocs(data.documents);
		}
        if (data.transcludes) {
            paintTranscludes(data.transcludes);
        }
		if (data.evidence) {
			paintEvidence(data.evidence);
		} else {
			clearEvidence();
		}
		if (data.ccontable) {
			paintCConTable(data.ccontable.data);
		}
		if (data.jtree) {
			paintTree(data.jtree);
		}
        
        if (data.relations) {
            paintRelations(data.relations);
        }
        if (data.newrelnhtml) {
            paintNewRelationButton(data.newrelnhtml);
        }
        if (data.relationlist) {
            paintRelationSelections(data.relationlist);
        }
        //specific to kwb.js
        if (data.relnSubject) {
            var x = "<a href='/blog/"+data.relnSubject+"'>Relation Source</a>";
            $("div.relnsubj").html(x);
        }
   //     alert(data.relnObject);
        if (data.relnObject) {
             var x = "<a href='/blog/"+data.relnObject+"'>Relation Target</a>";
            $("div.relnobj").html(x);
       }
	});
}

/**
 *
 */
function doDoubleClick() {

	if (locator !== currentLocator) {
		currentLocator = locator;
		getPage("Conversation", query);
	}
}

/**
 * Boots a page by fetching data according to 
 * content on the page
 */
function initPage() {
	try {
		$('.miller-container').taxonomyBrowser({
	        source       : 'json',                  /* Data Source: html | json */
	        json         : '/json/taxonomy.json',    /* JSON url */
			  columns: 4
			});
	} catch (e) {}
//	if ("WebSocket" in window) {
//		alert("WS");
//	} else {
//		alert("NoWS");
//	}
//alert("foo");
    
handleIssueHome();
	//test for chatroom
	if ($("#chatroom")) {
		//TODO nickname could be picked up from handle in a div
/*		var nickname = "foobar:";

		var connection = new WebSocket("ws://"+window.location.hostname+":4444")
		connection.onopen = function () {
			console.log("Connection opened");
			connection.send(nickname);
			$("#chatroom").onsubmit = function (event) {
				var msg = document.getElementById("msg")
				if (msg.value) {
					console.log("Sending "+msg.value);
					connection.send(msg.value)
				}
				msg.value = "";
				event.preventDefault();
			}	
		}
		connection.onclose = function () {
			console.log("Connection closed")
		}
		connection.onerror = function () {
			console.error("Connection error")
		}
		connection.onmessage = function (event) {
			
			var div = $("#output");
			var val = event.data +"<br/>";
			console.log("Got "+val);
			var where = val.indexOf("Received:");
			var where1 = val.indexOf("Sent:");
			console.log(where+" "+where1);
			if (where === -1 && where1 === -1) {
				var content =div.html()+val;
				div.html(content);
			}
		} */
	}

	var isTable = $("#tabledata").attr("query");
	//first, see if this is an index page
	if (isTable) {
		doPageSetup();
	} else {

		//paint  page
		//types are either
		//	viewspec
		//    Dashboard
		//    Conversation
		//  landing
		
		var type = $(".vfpage").attr("type");
		var q = $(".vfpage").attr("query");
		var rootLocator = $(".vfpage").attr("rootLocator");
		var lox = $(".vfpage").attr("locator");
		currentLocator = lox;
		
		if (type !== "Conversation") {
			navtoggle = false;
		}
		if (q) {
		  var language = $(".vfpage").attr("language");
		  var cl = $(".vfpage").attr("contextLocator");
		  var query = q+"?language="+language+"&viewspec="+type;
		  if (cl) {
			  query += "&contextLocator="+cl;
		  }
		  if (rootLocator) {
			  query +="&rootLocator="+rootLocator;
		  }
		  getPage(type, query);
		}
	}
}

/////////////////////////
//Relations/Connections
/////////////////////////

/**
 * Reverse source and target on relationform.handlebars
 */
function reverseSourceTarget() {
    var src = $("#sourceLocator").attr("value");
    var trg = $("#targetLocator").attr("value");
    $("#sourceLocator").attr("value", trg);
    $("#targetLocator").attr("value", src);
    src = $("div.sourcelabel").html();
    trg = $("div.targetlabel").html();
    $("div.sourcelabel").html(trg);
    $("div.targetlabel").html(src);
}

/**
 * Answer a click to select a RelationType in relationform.handlebars
 */
function selectRelation(reln) {
 //   alert(reln);
    $("#relnselection").attr("value", reln);
    $("div.selectedReln").html(reln);
}