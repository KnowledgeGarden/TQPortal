/**
 * javascript to drive RPG game pages
 */

function initGamePage() {
//	alert("Gamestart");
    if ( $("ul#metaConTree")) {
	   pageSetup();
    }
}

/**
 * ViewFirst tables:
 * Since different index tables will vary,
 * we let the server paint the html
 * query is based on <app>/index
 */
function pageSetup() {
    
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

/**	var data = $("#issuetabledata");
	var q = data.attr("query");
	var cursor = data.attr("start");
	var count = data.attr("count");
	var query = q+"?start="+cursor+"&count="+count;
//	alert(query);
	$.get( query, function( data ) {
	//	alert(data);
		paintIssueIndex(data);
	});
	data = $("#questtabledata");
	q = data.attr("query");
	cursor = data.attr("start");
	count = data.attr("count");
	query = q+"?start="+cursor+"&count="+count;
//	alert(query);
	$.get( query, function( data ) {
	//	alert(data);
		pageQuestNext(data);
	});
	data = $("#guildtabledata");
	q = data.attr("query");
	cursor = data.attr("start");
	count = data.attr("count");
	query = q+"?start="+cursor+"&count="+count;
//	alert(query);
	$.get( query, function( data ) {
	//	alert(data);
		paintGuildIndex(data);
	});
*/
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
	paintIssuePaginationButtons(data);
}

function paintQuestPaginationButtons(data) {
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