/**
 * javascript to drive RPG game pages
 */

function initGamePage() {
    if ( $("ul#metaConTree")) {
	   pageSetup();
    }
}
function paintMetaTree(data) {
 //   alert("Meta "+data.metaConTree);
    if (data.metaConTree) {
	   var html = data.metaConTree;
//	alert("HTML "+html);
	   $("ul#metaConTree").html(html);
    }
}


function paintGameTree(data) {
//alert("game "+data.gameConTree);
    if (data.gameConTree) {
	   var html = data.gameConTree;
//	alert("HTML "+html);
	   $("ul#gameConTree").html(html);
    }
}

function getGamePage(type, query) {
//	alert("XX "+query);
	$.get( query, function( data ) {
//		alert(data);
        currentLocator = data.locator;
        if (!navtoggle) {
            paintMetaTree(data);
            paintGameTree(data);
            $("ul#metaConTree").columnNavigation({
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

            $("ul#gameConTree").columnNavigation({
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
        //TODO lots more
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

	});
}

/**
 * Clicks on nodes in the Incubator game tree
 */
function fetchFromGameTreeTree(lox, quex) {
    locator = lox;
    if (locator !== currentLocator) {
        getGamePage("foo", quex);
    }
}

/**
 * Clicks on nodes in the Incubator meta tree
 */
function fetchFromMetaTree(lox, quex) {
    locator = lox;
    if (locator !== currentLocator) {
        getGamePage("foo", quex);
    }
}
/**
 * ViewFirst tables:
 * Since different index tables will vary,
 * we let the server paint the html
 * query is based on <app>/index
 */
function pageSetup() {
    navtoggle = false;
	var type = $(".vfpage").attr("type");
	var q = $(".vfpage").attr("query");
	if (q) {
	  var language = $(".vfpage").attr("language");
	  var cl = $(".vfpage").attr("contextLocator");
	  var query = q+"?language="+language+"&viewspec="+type;
	  getGamePage(type, query);
	}


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
function paintIssueIndex(data) {
	//alert(data.total);
	$("div.issuetableindex").html(data.table);
	$("#issuetabledata").attr("start","");
	//$("#tabledata").attr("count","");
	$("#issuetabledata").attr("total","");
	$("#issuetabledata").attr("start",parseInt(data.start));
	//$("#tabledata").attr("count",parseInt(data.count));
	$("#issuetabledata").attr("total",parseInt(data.total));
	paintIssuePaginationButtons(data);
}
function paintIssuePaginationButtons(data) {
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
		html+="&nbsp;&nbsp;<a href=\"javascript:pageIssueNext();\"><b>Next</a>";
	}
	if (surplus > 0) {
		html+="&nbsp;&nbsp;<a href=\"javascript:pageIssuePrevious();\"><b>Previous</a>";
	}
	$("div.issuepagination").html(html);
}

function pageIssueNext() {
	var data = $("div.issuetabledata");
	var q = data.attr("query");
	//tells where we are (actually, points to the next
	var cursor = parseInt(data.attr("start"));
	//
	var count = parseInt(data.attr("count"));
	var avail = parseInt(data.attr("total"));
//	alert(cursor+" "+count);
	var query = q+"?start="+cursor+"&count="+count;
	$.get( query, function( data ) {
		paintIssueIndex(data);
	});
}

function pageIssuePrevious() {
	var data = $("div.issuetabledata");
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
		paintIssueIndex(data);
	});

}
///////////////////////////////////////////////////////
function painQuestIndex(data) {
	//alert(data.total);
	$("div.questtabledata").html(data.table);
	$("#questtabledata").attr("start","");
	//$("#tabledata").attr("count","");
	$("#questtabledata").attr("total","");
	$("#questtabledata").attr("start",parseInt(data.start));
	//$("#tabledata").attr("count",parseInt(data.count));
	$("#questtabledata").attr("total",parseInt(data.total));
	paintQuestPaginationButtons(data);
}

function paintQuestPaginationButtons(data) {
	var cursor = parseInt(data.start);
	var count = parseInt(data.count);
	//total available to show
	var avail = parseInt(data.total);
//	alert("Q "+avail);
	//what's to the left of the cursor
	var surplus = cursor - count;
	//what's to the right of the cursor
	var more = avail - cursor;
//	alert(cursor+" "+more+" "+surplus+" "+avail);
	//     5          5         0         10
	//    10          0         5         10  after previous
	var html = "Available: "+avail; //doing simple javascript hrefs for now
	if (more > 0) {
		html+="&nbsp;&nbsp;<a href=\"javascript:pageIssueNext();\"><b>Next</a>";
	}
	if (surplus > 0) {
		html+="&nbsp;&nbsp;<a href=\"javascript:pageIssuePrevious();\"><b>Previous</a>";
	}
	$("div.questpagination").html(html);
}

function pageQuestNext() {
	var data = $("div.questtabledata");
	var q = data.attr("query");
	//tells where we are (actually, points to the next
	var cursor = parseInt(data.attr("start"));
	//
	var count = parseInt(data.attr("count"));
	var avail = parseInt(data.attr("total"));
//	alert("G "+avail);
//	alert(cursor+" "+count);
	var query = q+"?start="+cursor+"&count="+count;
	$.get( query, function( data ) {
		painQuestIndex(data);
	});
}

function pageQuestPrevious() {
	var data = $("div.questtabledata");
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
		painQuestIndex(data);
	});

}
///////////////////////////////////////////////////////
function paintGuildIndex(data) {
	//alert(data.total);
	$("div.guildtableindex").html(data.table);
	$("#guildtabledata").attr("start","");
	//$("#tabledata").attr("count","");
	$("#guildtabledata").attr("total","");
	$("#guildtabledata").attr("start",parseInt(data.start));
	//$("#tabledata").attr("count",parseInt(data.count));
	$("#guildtabledata").attr("total",parseInt(data.total));
	paintGuildPaginationButtons(data);
}

function paintGuildPaginationButtons(data) {
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
		html+="&nbsp;&nbsp;<a href=\"javascript:pageIssueNext();\"><b>Next</a>";
	}
	if (surplus > 0) {
		html+="&nbsp;&nbsp;<a href=\"javascript:pageIssuePrevious();\"><b>Previous</a>";
	}
	$("div.guildpagination").html(html);
}

function pageGuildNext() {
	var data = $("#guildtabledata");
	var q = data.attr("query");
	//tells where we are (actually, points to the next
	var cursor = parseInt(data.attr("start"));
	//
	var count = parseInt(data.attr("count"));
	var avail = parseInt(data.attr("total"));
//	alert(cursor+" "+count);
	var query = q+"?start="+cursor+"&count="+count;
	$.get( query, function( data ) {
		paintGuildIndex(data);
	});
}

function pageGuildPrevious() {
	var data = $("div.guildtabledata");
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
		paintGuildIndex(data);
	});
}