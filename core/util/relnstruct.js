/**
 * Relation Struct
 */

var struct = module.exports = function(relationType, relationLabel,
			                           documentType, documentSmallIcon,
			                           documentLocator, documentLabel) {
	var result = {};
	result.relationType = relationType;
	result.relationLabel = relationLabel;
	result.documentType = documentType;
	result.icon = documentSmallIcon;
	result.locator = documentLocator;
	result.label = documentLabel;
	return result;
};