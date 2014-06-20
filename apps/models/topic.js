/**
 * Topic, the primary information artifact
 */
var mongoose = require('mongoose')
  , utils = require('../../lib/utils')
  , Schema = mongoose.Schema;


////////////////////////////
//Primary Schema
////////////////////////////
var TopicSchema = new Schema ({
	  locator :{type : String, default : '', trim : true},
	  instanceOf : {type : String, default : '', trim : true},
	  subOf : { type : []},
	  //TODO issue of multiple labels and languages
	  label     : {type : String, default : '', trim : true}, 
	  //TODO issue of multiple details and languages
	  details     : {type : String, default : '', trim : true},
	  smallIcon :  {type : String, default : '', trim : true},
	  largeIcon :  {type : String, default : '', trim : true},
	  //a relation could be a structure {locator:'x', label:'y'}
	  relations: {type: []},
//	  relationsLabels: {type: []},
	  user: { type : Schema.ObjectId, ref : 'User' },
	  creatorId: {type: String, default : 'unknown', trim: true},
	  createdAt  : {type : Date, default : Date.now},
	  editedAt :  {type : Date, default : Date.now},
});

//exports.schema = TopicSchema;


//TopicSchema.methods = {
		
TopicSchema.methods.addSuperClassLocator = function(superClassLocator)	{
		if (!this.subOf)
			this.subOf = [];
		this.subOf.push(superClassLocator);
	};

	/**
	 * <p>Add a modeled relation to this topic.</p>
	 * <p>Relations are modeled as a JSON object, with fields used
	 * according to the type of relation.</p>
	 * <p>There are two model types: <em>SimpleRelationType</em> and
	 * <em>ComplexRelationType</em>.</p>
	 * 
	 */
TopicSchema.methods.addRelation = function(modelType, relationType, relationLabel,
						  targetLocator, targetLabel) {
		console.log('TOPIC.addRelation '+modelType+' '+relationType+' '+relationLabel+
				targetLocator+' '+targetLabel);
		var rx = {};
		rx['modelType']=modelType;
		rx['type'] = relationType;
		if (relationLabel)
			rx['relLabel'] = relationLabel
		rx['locator'] = targetLocator;
		rx['label'] = targetLabel;
		if (!this.relations)
			this.relations = [];
		this.relations.push(rx);
	};
	
TopicSchema.methods.getLabelForRelation = function(relationLocator) {
		var where = this.relations.indexOf(relationLocator);
		if (where > -1)
			return relationLabels[where];
		return null;
	};
	
TopicSchema.statics.listNodesByType = function(nodeType, callback) {
	var p = {};
	p['instanceOf']=nodeType;
	Topic.find(p, function(err, result) {
		console.log('TOPIC.listNodesByType '+nodeType+' '+err+' '+result);
		callback(err,result);
	});
};

TopicSchema.statics.findNodeByLocator = function(locator, callback) {
	var p = {};
	p['locator'] = locator;
	Topic.find(p,function(err,result){
		console.log('TOPIC.findNodeBylocator '+locator+' '+err+' '+result);
		callback(err,result);
	});
};
var Topic = mongoose.model('Topic', TopicSchema);
module.exports = Topic;

