/**
 * Topic, the primary information artifact
 */
var mongoose = require('mongoose')
  , utils = require('../../lib/utils')
  , struct = require('../../lib/relnstruct')
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
	  user: { type : Schema.ObjectId, ref : 'User' },
	  creatorId: {type: String, default : 'unknown', trim: true},
	  createdAt  : {type : Date, default : Date.now},
	  editedAt :  {type : Date, default : Date.now},
	  //a relation could be a structure {locator:'x', label:'y'}
	  relations: {type: []},
	  //a child could be a structure {locator:'x', label:'y'}
	  children: {type: []},

});

//////////////////////////////////////
// Instance Methods
//////////////////////////////////////
  /**
   * Add a <code>superClassLocator</code> to this topic
   * @param superClassLocator
   */		
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
  TopicSchema.methods.addRelation = function(relationType, relationLabel, documentType,
                          documentSmallIcon,
						  targetLocator, targetLabel) {
    console.log('TOPIC.addRelation '+documentSmallIcon+' '+relationType+' '+relationLabel+
				targetLocator+' '+targetLabel);
    var rx = struct(relationType,relationLabel,documentType,
    		documentSmallIcon, targetLocator, targetLabel);
    if (!this.relations)
      this.relations = [];
    this.relations.push(rx);
  };

  /**
   * Add a child node to this topic: this builds a conversation tree.
   * @param childSmallIcon
   * @param childLocator
   * @param childLabel
   */
  TopicSchema.methods.addChildNode = function(childSmallIcon, childLocator,childLabel) {
    console.log('TOPIC.addChildNode '+childLocator+' '+childLabel);
    var rx = struct("","","",
    		childSmallIcon, childLocator, targetchildLabelLabel);
    if (!this.children)
      this.children = [];
    this.children.push(rx);
  };

  //TODO removeChildNode
  
  TopicSchema.methods.getLabelForRelation = function(relationLocator) {
    var where = this.relations.indexOf(relationLocator);
    if (where > -1)
      return relationLabels[where];
    return null;
  };
  
//////////////////////////////////////
//Static Methods
//////////////////////////////////////
	
  /**
   * List all topics by <code>nodeType</code>
   * @param nodeType
   */
  TopicSchema.statics.listNodesByType = function(nodeType, callback) {
	var p = {};
	p['instanceOf']=nodeType;
	Topic.find(p, function(err, result) {
		console.log('TOPIC.listNodesByType '+nodeType+' '+err+' '+result);
		//TODO: this returns a list of JSON objects, not topics
		callback(err,result);
	});
  };

  /**
   * Find a topic by its <code>locator</code>
   * @param locator
   */
  TopicSchema.statics.findNodeByLocator = function(locator, callback) {
	var p = {};
	p['locator'] = locator;
	
	console.log('TOPIC.findNodeByLocator '+locator+' '+JSON.stringify(p));
	
	Topic.findNodeByQuery(p,function(err,result){
		//result will be a TopicSchema object
		callback(err,result);
	});
  };
  
  TopicSchema.statics.findNodeByQuery = function(queryObject, callback) {
    console.log('TOPIC.findNodeByQuery '+JSON.stringify(queryObject));
    Topic.findOne(queryObject,function(err,result){
      console.log('TOPIC.findNodeByQuery-1 '+err+' '+result);
      //result will be a TopicSchema object
      callback(err,result);
    });  
  };

  TopicSchema.statics.listNodesByQuery = function(queryObject, callback) {
    console.log('TOPIC.listNodesByQuery '+JSON.stringify(queryObject));
    Topic.find(queryObject,function(err,result){
      console.log('TOPIC.listNodesByQuery-1 '+err+' '+result);
      //result will be a list of TopicSchema objects
      callback(err,result);
    });  
  };

  


//Export goes here in order to capture all the methods
var Topic = mongoose.model('Topic', TopicSchema);
module.exports = Topic;

