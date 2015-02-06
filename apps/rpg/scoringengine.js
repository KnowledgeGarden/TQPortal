/**
 * ScoringEngine
 * The class builds and maintains Node InfoBox instances which are a 
 * ValueMatrix based on creation, context, and more
 */
 var types = require('tqtopicmap/lib/types'),
    sb = require('tqtopicmap/lib/util/stringbuilder'),
    constants = require('../../core/constants'),
    infoBoxConstants = require('./gamevvaluematrixinfoboxconstants'),
    RGBib = require('./rpginfoboxmodel')
;

var ScoringEngine = module.exports = function(environment, tmenv) {
	var myEnvironment = environment,
		TopicMapEnvironment = tmenv,
		DataProvider = TopicMapEnvironment.getDataProvider(),
		self = this;

///////////////////////////////////////////////////////////////////
// Definitions
//   'N' is the total value of a node -- a dynamic value
//    "bucket brigade": full value is added first to the parent, then
//       declining values added to each of the parent's parent nodes
// Scoring Rules (as they presently exist) limited only to the allowable
//    moves in a game
//  1- Act of creation is worth 10 points to the node's creator
//  2- Act of Transclusion is worth 'N' points to the individual who 
//     performed the act, and 'N' points to the parent node
//     NOTE: 'N' to the parent depends on whether the transcluded node
//			supports (+) or opposes (-). Note: this is a bucket brigade
//  3- Act of creating a child node is worth 10 points to the node's
//     creator--same as (1), and is worth 'N' (originally 10) points
//     to the Parent. Note: this is a bucket brigade.
///////////////////////////////////////////////////////////////////
	/**
	 * Score the entire gameTree
	 * @param gameTreeRoot
	 * @param callback signature (err);
	 */
	self.scoreGameTree = function(gameTreeRoot, callback) {
		val error;

		//TODO
		return callback(error)
	};

};