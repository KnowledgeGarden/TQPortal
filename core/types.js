/**
 * Types
 */
///////////////////////
// Topic types
///////////////////////
module.exports.USER_TYPE								= "UserType";
module.exports.CHALLENGE_TYPE 							= 'ChallengeNodeType';
module.exports.ISSUE_TYPE								= 'IssueNodeType';
module.exports.EVIDENCE_TYPE							= 'EvidenceNodeType';
module.exports.CLAIM_TYPE								= 'ClaimNodeType';
module.exports.RESOURCE_TYPE							= 'ResourceNodeType';
module.exports.GUILD_TYPE								= 'GuildNodeType';
module.exports.QUEST_TYPE								= 'QuestNodeType';
module.exports.AVATAR_TYPE								= 'AvatarNodeType';
module.exports.TAG_TYPE									= 'TagNodeType';
module.exports.THEME_TYPE								= 'ThemeNodeType';
module.exports.PRO_TYPE									= 'ProNodeType';
module.exports.CON_TYPE									= 'ConNodeType';
module.exports.SOLUTION_TYPE							= 'SolutionNodeType';
module.exports.POSITION_TYPE							= 'PositionNodeType';
module.exports.CONVERSATION_MAP_TYPE					= 'ConversationMapNodeType';
module.exports.ONTOLOGY_NODE_TYPE						= 'OntologyNodeType';
module.exports.GRAPH_NODE_TYPE							= 'GraphNodeType';
module.exports.NODE_TYPE								= "NodeType"
//TUPLE_TYPE								= "TypleType",
module.exports.GRAPH_TYPE								= "GraphType";
//needed in merge and export of a tuple
module.exports.VIRTUAL_NODE_TYPE						= "VirtualNodeType";
//Addressable Information Resource (e.g. paragraphs in documents)
module.exports.AIR_TYPE									= "AIRType";
//@see topic.js #addRelation
//This represents new thinking over the JSONTopicMap model of relations.
// A simple relation is the equivalent of a hyperlink and would be modeled thus:
//  {modelType:'SimpleRelationType', type:'<somerelationtype>', 
//   locator:'<somelocator>', label: '<somelabel>'}
module.exports.SIMPLE_RELATION_TYPE						= 'SimpleRelationType';
//A complex relation is the equivalent of a topic map triple of the form:
// {subject, relation, object}, in which we want the label for the relation
// as well as the label for the target object
//{modelType:'ComplesRelationType', type:'<somerelationtype>', relLable:'<somerelationlabel>',
//locator:'<somelocator>', label: '<somelabel>'}
//Note: as we become more sophisticated, label modeling will entail available languages, e.g.
// label: {'en':'<someenglishlabel>',
//         'fr':'<somefrenchlabel>'......}
module.exports.COMPLEX_RELATION_TYPE					= 'ComplexRelationType';

module.exports.CITATION_NODE_TYPE						= 'CitationNodeType';
module.exports.ESSAY_TYPE								= 'EssayNodeType';
module.exports.ORGANIZATION_TYPE 						= 'OrganizationNodeType';
module.exports.PROJECT_TYPE								= 'ProjectNodeType';
module.exports.BLOG_TYPE								= 'BlogNodeType';
module.exports.MICROBLOG_TYPE							= 'MicroblogNodeType';
module.exports.SUMMARY_TYPE								= 'SummaryNodeType';
module.exports.PERSPECTIVE_TYPE							= 'PerspectiveNodeType';
module.exports.BOOKMARK_TYPE							= 'BookmarkNodeType';

////////////////////////////////
//Relation Types
////////////////////////////////
module.exports.CAUSES_RELATION_TYPE						= 'CausesRelationType'; //
module.exports.EXPLAINS_WHAT_RELATION_TYPE				= 'ExplainsWhatRelationType'; //
module.exports.EXPLAINS_WHY_RELATION_TYPE				= 'ExplainsWhyRelationType'; //
module.exports.EXPLAINS_HOW_RELATION_TYPE				= 'ExplainsHowRelationType'; //
//IDENTICAL_TO_RELATION_TYPE 			= 'IdenticalToRelationType'; now IS_SAME_AS
module.exports.IS_SIMILAR_TO_RELATION_TYPE 				= 'IsSimilarToRelationType'; //
module.exports.SHARES_ISSUES_WITH_RELATION_TYPE 		= 'SharesIssuesWithRelationType';//
module.exports.IS_ANALOGOUS_RELATION_TYPE 				= 'IsAnalogousRelationType'; //
module.exports.IS_METAPHOR_RELATION_TYPE 				= 'IsMetaphorRelationType'; //
//	IS_ABOUT_RELATION_TYPE 				= 'IsAboutRelationType';
module.exports.AGREES_WITH_RELATION_TYPE 				= 'AgreesWithRelationType'; //
module.exports.IS_DIFFERENT_TO_RELATION_TYPE 			= 'IsDifferentToRelationType'; //
module.exports.IS_OPPOSITE_OF_RELATION_TYPE 			= 'IsOppositeOfRelationType';//
	/**Note merge implications on this one -- might need a daemon watching it */
module.exports.IS_SAME_AS_RELATION_TYPE					= 'IsSameAsRelationType';//
module.exports.IS_NOT_ANALOGOUS_RELATION_TYPE 			= 'IsNotAnalogousRelationType'; //
module.exports.HAS_NOTHING_TO_DO_WITH_RELATION_TYPE 	= 'HasNothingToDoWithRelationType';//
module.exports.DISAGREES_WITH_RELATION_TYPE 			= 'DisagreesWithRelationType'; //
module.exports.USES_RELATION_TYPE 						= 'UsesRelationType'; //
module.exports.IMPLIES_RELATION_TYPE 					= 'ImpliesRelationType'; //
	//issue: most are right handed: a implies b
	// this is left handed: a is enabled by b
	// maybe should standardize on right handed? e.g. ENABLES
	//ENABLED_BY_RELATION_TYPE 			= 'EnabledByRelationType';
module.exports.ENABLES_RELATION_TYPE					= 'EnablesRelationType'; //
module.exports.IMPROVES_ON_RELATION_TYPE 				= 'ImprovesOnRelationType'; //
module.exports.ADDRESSES_RELATION_TYPE 					= 'AddressesRelationType'; //
module.exports.SOLVES_RELATION_TYPE 				 	= 'SolvesRelationType'; //
module.exports.IS_PREREQUISITE_FOR_RELATION_TYPE 		= 'IsPrerequisiteForRelationType';
module.exports.IMPAIRS_RELATION_TYPE 					= 'ImpairsRelationType'; //
module.exports.PREVENTS_RELATION_TYPE 					= 'PreventsRelationType'; //
module.exports.PROVES_RELATION_TYPE 					= 'ProvesRelationType'; //
module.exports.REFUTES_RELATION_TYPE 					= 'RefutesRelationType'; //
module.exports.IS_EVIDENCE_FOR_RELATION_TYPE 			= 'IsEvidenceForRelationType'; //
module.exports.IS_EVIDENCE_AGAINST_RELATION_TYPE 		= 'IsEvidenceAgainstRelationType'; //
module.exports.IS_CONSISTENT_WITH_RELATION_TYPE 		= 'IsConsistentWithRelationType'; //
module.exports.IS_EXAMPLE_OF_RELATION_TYPE 				= 'IsExampleRelationType'; //
module.exports.PREDICTS_RELATION_TYPE 					= 'PredictsRelationType';
module.exports.ENVISAGES_RELATION_TYPE 					= 'EnvisagesRelationRelationType'; //
module.exports.UNLIKELY_TO_AFFECT_RELATION_TYPE 		= 'UnlikelyToAffectRelationType';
module.exports.IS_INCONSISTENT_WITH_RELATION_TYPE 		= 'InconsistentWithRelationType'; //
module.exports.RESPONDS_TO_RELATION_TYPE 				= 'RespondsToRelationType'; //
//more relations from looking at OBO ontologies
module.exports.IS_RELATED_TO_RELATION_TYPE				= 'IsRelatedToRelationType';
module.exports.IS_PART_OF_RELATION_TYPE					= 'IsPartOfRelationType';
module.exports.IS_CONTAINED_IN_RELATION_TYPE			= 'IsContainedInRelationType';
module.exports.HAS_ROLE_RELATION_TYPE					= 'HasRoleRelationType';

// more detail
module.exports.BOOMARK_RELATION_TYPE					= 'BookmarkRelationType';
module.exports.TAG_DOCUMENT_RELATION_TYPE				= 'TagDocumentRelationType';
module.exports.DOCUMENT_TAG_RELATION_TYPE				= 'DocumentTagRelationType';
module.exports.TAG_CREATOR_RELATION_TYPE				= 'TagCreatorRelationType';
module.exports.CREATOR_TAG_RELATION_TYPE				= 'CreatorTagRelationType';
module.exports.DOCUMENT_CREATOR_RELATION_TYPE			= "DocumentCreatorRelationType";
module.exports.CREATOR_DOCUMENT_RELATION_TYPE			= "CreatorDocumentRelationType";

