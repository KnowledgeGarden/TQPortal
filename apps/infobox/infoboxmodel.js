/**
 * InfoBoxModel
 * This model should have the ability to read an InfoBox schema (JSON) and
 * paint an HTML form from it, then handle the InfoBox data.
 * A SubjectProxy has an infoBox API:
 *   putInfoBox = function(name, jsonString)
 *   removeInfoBox = function(name)
 *   getInfoBoxes = function()
 *   getInfoBox = function(name)
 * based on named boxes.
 */
var types = require('tqtopicmap/lib/types')
	, icons = require('tqtopicmap/lib/icons')
	, properties = require('tqtopicmap/lib/properties')
	, constants = require('../../core/constants')
;

var InfoBoxModel = module.exports = function(environment) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var DataProvider = topicMapEnvironment.getDataProvider();
//TODO
};
