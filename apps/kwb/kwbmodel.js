/**
 * KnowledgeWorkbenchModel
 * A workbench for wiring relations among topics
 */
var types = require('tqtopicmap/lib/types'),
    icons = require('tqtopicmap/lib/icons'),
    properties = require('tqtopicmap/lib/properties'),
    constants = require('../../core/constants'),
    tagmodel = require('../tag/tagmodel'), 
    relationlist = require('./relationlist')
;

var KnowledgeWorkbenchModel =  module.exports = function(environment, cm, tmenv) {
	var CommonModel = cm;
    if (!CommonModel) {
        CommonModel = environment.getCommonModel();
    }
	var myEnvironment = environment;
	var topicMapEnvironment = tmenv;
    if (!topicMapEnvironment) {
        topicMapEnvironment = environment.getTopicMapEnvironment();
    }
	var DataProvider = topicMapEnvironment.getDataProvider(),
        TopicModel = topicMapEnvironment.getTopicModel(),
        RelationModel = topicMapEnvironment.getRelationModel(),
        TagModel = new tagmodel(environment, CommonModel, topicMapEnvironment),
        queryDSL = topicMapEnvironment.getQueryDSL(),
        relationForm = [];
    function buildForm() {
        var x = relationlist.RelationList;
        var y;
        for (var i=0;i<x.length;i++) {
            y = {};
            y.val = x[i];
            relationForm.push(y);
        }
    }
    buildForm();
	var self = this;
    
    self.getNewRelationForm = function() {
        return relationForm;
    };
        
    self.arrayContains = function(array, value) {
        return (array.indexOf(value) > -1);
    };
    
    /**
     * Called from CommonModel.__doAjaxFetch
     * @param theNode
     * @param callback signature (result)
     */
    self.showRelations = function(theNode, callback) {
        console.log("KnowledgeWorkbenchModel.showRelations "+theNode);
        var result = [];
        //TODO this ignores private relations
        //This looks at tuples and shows those which are found on the RelationList;
        // Push relation structs to result
        var relns = theNode.listRelations();
        myEnvironment.logDebug("KnowledgeWorkbenchModel.showRelations "+theNode.getLocator()+" "+relns);
        if (relns) {
            var len = relns.length;
            var rx;
            for (var i=0;i<len;i++) {
                rx = relns[i];
                if (self.arrayContains(relationlist.RelationList, rx.relationType)) {
                    result.push(rx);
                }
            }
            return callback(result);
        } else {
            return callback(result);
        }
    };
    
    /**
     * Create a connection between two nodes
     * @param sourceLocator
     * @param targetLocator
     * @param relationType
     * @param userObject
     * @param taglist
     * @param callback signature (err, relationnode)
     */
     //TODO needs isPrivate
    self.createConnection = function(sourceLocator, targetLocator, relationType, userObject, taglist, callback) {
        console.log("KnowledgeWorkbenchModel.createConnection "+sourceLocator+" "+targetLocator+" "+relationType);
        var error = "",
            result, //the tuple
            sourceNode, 
            targetNode,
            userTopic,
            isPrivate = false, //TODO
            credentials = userObject.credentials,
            userLocator = userObject.handle,
            retval;
        myEnvironment.logDebug("KnowledgeWorkbenchModel.createConnection "+sourceLocator+" "+targetLocator+" "+relationType+" "+taglist+" "+userLocator);
        //get UserTopic
        DataProvider.getNodeByLocator(userLocator,credentials, function kwbMGetNode(err, usr) {
            if (err) {error += err;}
            if (usr) {
                userTopic = usr;
                DataProvider.getNodeByLocator(sourceLocator, credentials, function kwbMGetNode1(err, p1) {
                    if (err) {error += err;}
                    if (p1) {
                        sourceNode = p1;
                        DataProvider.getNodeByLocator(targetLocator, credentials, function kwbMGetNode2(err, p2) {
                            if (err) {error += err;}
                            if (p2) {
                                targetNode = p2;
                                myEnvironment.logDebug("KnowledgeWorkbenchModel.createConnection-x ");
                                RelationModel.createRelation(sourceNode, targetNode, relationType, userLocator, credentials, isPrivate, function kwbMCreateRelation(err, data) {
                                    myEnvironment.logDebug("KnowledgeWorkbenchModel.createConnection-1 "+err+" "+data);
                                    //TODO seeing some kind of internal bug which returns undefined
                                    if (err) {error += err;}
                                    result = data;
                                    if (result) {
                                        myEnvironment.addRecentConnection(result.getLocator(), result.getLabel("en"));
                                        //If there are tags, process them
                                        if (taglist.length > 0) {  
                                            myEnvironment.logDebug("KnowledgeWorkbenchModel.createConnection-2 "+userLocator+" | "+err+" | "+userTopic);
                                            TagModel.processTagList(taglist, userTopic, result, credentials, function kwbProcessTags(err, rsx) {
                                                if (err) {error += err;}
                                                console.log('NEW_POST-1 '+rsx);
                                                //result could be an empty list;
                                                //TagModel already added Tag_Doc and Doc_Tag relations
                                                console.log("ARTICLES_CREATE_2 "+JSON.stringify(rsx));
                                                DataProvider.putNode(result, function kwbPutNode(err, data) {
                                                    console.log('ARTICLES_CREATE-3 '+err);	  
                                                    if (err) {console.log('ARTICLES_CREATE-3a '+err)}
                                                    console.log('ARTICLES_CREATE-3b '+userTopic);	  
                                                    TopicModel.relateExistingNodesAsPivots(userTopic,result,types.CREATOR_DOCUMENT_RELATION_TYPE,
                                                                               userTopic.getLocator(),
                                                                               icons.RELATION_ICON, icons.RELATION_ICON, false, credentials, function kwbMRelateNodes(err, data) {
                                                        if (err) {console.log('ARTICLES_CREATE-3d '+err);}
                                                        myEnvironment.logDebug("KnowledgeWorkbenchModel.createConnection-3 "+userLocator+" | "+err+" | "+result);
                                                        //modified to return entire node
                                                        return callback(err, result);
                                                    }); //r1
                                                }); //putnode 		  
                                            }); // processtaglist
                                        }  else {
                                            DataProvider.putNode(result, function kwbPutNode1(err, data) {
                                                console.log('ARTICLES_CREATE-3 '+err);	  
                                                if (err) {console.log('ARTICLES_CREATE-3a '+err)}
                                                console.log('ARTICLES_CREATE-3b '+userTopic);	  
                                                TopicModel.relateExistingNodesAsPivots(userTopic, result,types.CREATOR_DOCUMENT_RELATION_TYPE,
            		                		        userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON, false, credentials, function kwbMRelateNodes1(err, data) {
                                                    if (err) {console.log('ARTICLES_CREATE-3d '+err);}
                                                    myEnvironment.logDebug("KnowledgeWorkbenchModel.createConnection-4 "+userLocator+" | "+err+" | "+result);
                                                    return callback(err, result);
                                                }); //r1
                                            }); //putnode 		
                                        }             
                                    } else {
                                        return callback(error, result);
                                    }
                                }); //relatenodes
                            } else {
                                return callback(error, retval);
                            }
                        }); //gettarget
                    } else {
                        return callback(error, retval);
                    }
                }); // getsource
            } else {
                return callback(error, retval);
            }
        }); // getuser
    };

};