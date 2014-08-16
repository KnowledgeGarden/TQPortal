/**
 * main.js
 * For view-first support
 * Must eventually handle table paging, table filling, etc
 */

/**
 * Boots a page by fetching data according to 
 * content on the page
 */
function initPage() {
	var q = $(".vfpage").attr("query");
	var language = $(".vfpage").attr("language");
	var query = q+"?language="+language;
	var type = $(".vfpage").attr("type");
	if (query) {
		$.get( query, function( data ) {
			  //alert($("div.topictitle").text());
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
		});
	}
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
    for (var i=0;i<docs.length;i++) {
    	html+= "<li><a href=\"/blog/"+docs[i].locator+"\"><img src=\""+docs[i].icon+"\">&nbsp;"+docs[i].label+"</a></li>"
    }
   html+="</ol></div>";
   $("div.doclist").html(html);
}

