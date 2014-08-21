/**
 * main.js
 * For view-first support
 * Must eventually handle table paging, table filling, etc
 */

/**
 * A constant value (for now)
 */
var __pageCount = 30;

/**
 * Boots a page by fetching data according to 
 * content on the page
 */
function initPage() {
	var test = $("#tabledata").attr("query");
	//first, see if this is an index page
	if (test) {
		pageSetup();
	} else {
	//paint virtual page
		var q = $(".vfpage").attr("query");
		if (q) {
		  var language = $(".vfpage").attr("language");
		  var type = $(".vfpage").attr("type");
		  var cl = $(".vfpage").attr("contextLocator");
		  var query = q+"?language="+language;
		  if (cl) {
			  query += "&contextLocator="+cl;
		}
	
		$.get( query, function( data ) {
		//	alert(data);
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
			  $("div.sourcecode").html(data.source);
			  if (data.tags) {
				  paintTags(data.tags);
			  }
			  if (data.users) {
				  paintUsers(data.users);
			  }
			  if (data.documents) {
				  paintDocs(data.documents);
			  }
			  if (data.ccontable) {
				  paintCConTable(data.ccontable.data);
			  }
			  if (data.pcontable) {
				  paintPConTable(data.pcontable.data);
			  }
			  if (data.isAuthenticated) {
				  if ($("div.newconform")) {
					  paintNewCon(data.locator, data.newnodetype);
				  }
			  }
			  
			  if (data.jtree) {
				 // if ($("#jstree_div"))
				  paintTree(data.jtree);
			  }
		});
		}
	}
}

/**
 * ViewFirst tables:
 * Since different index tables will vary,
 * we let the server paint the html
 * query is based on <app>/index
 */
function pageSetup() {
	var data = $("#tabledata");
	var q = data.attr("query");
	var cursor = data.attr("start");
	var count = data.attr("count");
	var query = q+"?start="+cursor+"&count="+count;
	$.get( query, function( data ) {
		paintIndex(data);
	});
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
	//alert(data.total);
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

function paintNewCon(locator, type) {
	html = "<div class=\"form-group\">";
	html+="<form method=\"post\" action=\"/conversation/new/"+locator+"\"  role=\"form\" class=\"form-horizontal\">";
	html += "<input type=\"hidden\" name=\"nodefoo\" value=\""+type+"\">";
	html+="<button type=\"submit\" class=\"btn btn-btn-success btn-small\">New Conversation</button>";
	html+="</form></div>";
	$("div.newconform").html(html);
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

function paintTags(tags) {
    var html = "<h4>Tags</h4> <div class=\"sidebar-module pre-scrollable\" style=\"border: 1px solid #e1e1e8;\">";
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
function paintDocs(docs) {
    var html = "<h4>Documents</h4> <div class=\"sidebar-module pre-scrollable\" style=\"border: 1px solid #e1e1e8;\">";
    html += "<ol class=\"list-unstyled\">"
    var urx, typ;
    for (var i=0;i<docs.length;i++) {
    	urx="/conversation/"; //default
    	typ = docs[i].documentType;
    	if (typ) {
    		if (typ === "WikiNodeType") {
    			urx = "/wiki/";
    		} else if (typ === "BlogNodeType") {
    			urx = "/blog/";
    		} else if (typ === "BookmarkNodeType") {
    			urx = "/bookmark/";
    		}
    	} else {
    		//try to infer from image
    		typ = docs[i].icon;
    		if (typ === "/images/bookmark_sm.png") {
    			urx = "/bookmark/";
    		} else if (typ === "/images/publication_sm.png") {
    			//could be a wiki or a blog (until we get different icons
    			urx = "/blog";
    		}
    	}
    	html+= "<li><a href=\""+urx+docs[i].locator+"\"><img src=\""+docs[i].icon+"\">&nbsp;"+docs[i].label+"</a></li>"
    }
   html+="</ol></div>";
   $("div.doclist").html(html);
}

/**
{
  id          : "string" // will be autogenerated if omitted
  text        : "string" // node text
  icon        : "string" // string for custom
  state       : {
    opened    : boolean  // is the node open
    disabled  : boolean  // is the node disabled
    selected  : boolean  // is the node selected
  },
  children    : []  // array of strings or objects
  li_attr     : {}  // attributes for the generated LI node
  a_attr      : {}  // attributes for the generated A node
}

        {
            "locator": "16d55530-27ae-11e4-b75f-057310846a0f",
            "label": "16d55530-27ae-11e4-b75f-057310846a0f",
            "img": "/images/ibis/map_sm.png",
            "typ": "ConversationMapNodeType",
            "children": [
                {
                    "locator": "09e2a6b0-27ff-11e4-9e44-af27f0222d89",
                    "label": "09e2a6b0-27ff-11e4-9e44-af27f0222d89",
                    "img": "/images/ibis/plus_sm.png",
                    "typ": "ProNodeType"
                },

*/

function createNode(data) {
	var html = "<li data-jstree='{ \"icon\" : \""+data.img+"\" }'>"+data.label;
	var kids = data.children;
	if (kids) {
		if (kids.length > 0) {
	//		alert("Foo "+html);
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
//	alert("P0 "+root);
	var html = "<ul>";
	html+= createNode(root);
	html+="</ul>";
//	alert("P1 "+html);
	if (html) {
		$('#jstree_div').html(html);
		$('#jstree_div').jstree();

	}
}


