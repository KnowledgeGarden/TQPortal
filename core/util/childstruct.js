/**
 * childstruct
 * A structure for child nodes which gives them context
 */
var struct = module.exports = function(contextLocator, childLocator,
			                           childLabel, childSmallImagePath) {
	var result = {};
	result.contextLocator = contextLocator;
	result.childLocator = childLocator;
	result.childLabel = childLabel;
	result.childSmallImagePath = childSmallImagePath;
	return result;
}