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
	  label     : {type : String, default : '', trim : true}, 
	  details     : {type : String, default : '', trim : true},
	  relations: {type: []},
	  relationsLabels: {type: []},
	  user: { type : Schema.ObjectId, ref : 'User' },
	  createdAt  : {type : Date, default : Date.now},
	  editedAt :  {type : Date, default : Date.now},
});

exports.schema = TopicSchema;

mongoose.model('Topic', TopicSchema);

TopicSchema.methods = {
		
	addSuperClassLocator: function(superClassLocator)	{
		if (!this.subOf)
			this.subOf = [];
		this.subOf.push(superClassLocator);
	},

	addRelation: function(relationLocator, relationLabel) {
		if (!this.relations)
			this.relations = [];
		if (!this.relationsLabels)
			this.relationsLabels = [];
		//these are pushed in ordered pairs
		this.relations.push(relationLocator);
		this.relationsLabels.push(relationLabel);
	},
	
	getLabelForRelation: function(relationLocator) {
		var where = this.relations.indexOf(relationLocator);
		if (where > -1)
			return relationLabels[where];
		return null;
	}
};
