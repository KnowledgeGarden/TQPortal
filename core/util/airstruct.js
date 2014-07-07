/**
 * airstruct.js
 */
var struct = module.exports = function(theText, lastEditDate,
			                           userLocator, editComment) {
	var result = {};
	result.theText = theText;
	result.lastEditDate = lastEditDate;
	result.creatorId = userLocator;
	result.editComment = editComment;
	return result;
}