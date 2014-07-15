/**
 * properties.js: keys for key/value SubjectProxy properties
 * <p>These are all derived from the interface specifications of the
 * Java topic map at https://github.com/SolrSherlock/JSONTopicMap</p>
 * <p>They must be the same in order to insure database compatibility:<br/>
 * both the NodeJS and Java topic maps should be able to work from the
 * same database.</p>
 * <p>NOTE: these are now shortened property strings. These must be coordinated
 * with the JSONTopicMap platform.</p
 */
///////////////////////////
// SubjectProxy Properties
///////////////////////////
module.exports.LOCATOR 										= 'lox';
module.exports.INSTANCE_OF 									= 'inOf';
module.exports.SUB_OF		 								= 'sbOf';
////////////////////////////
// Added for conversation nodes
// this tells what kind of node the conversation node is
// e.g. map, question, answer,...
////////////////////////////
module.exports.CONVERSATION_NODE_TYPE						= 'conTyp';
module.exports.CHILD_NODE_LIST							 	= "cNL";
module.exports.CONVERSATION_ROOT							= "conRt";
//
module.exports.TRANSITIVE_CLOSURE							= 'trCl';
module.exports.LABEL										= 'label';
module.exports.DETAILS										= 'details';
module.exports.URL											= 'url';
module.exports.CREATOR_ID									= 'crtr';
module.exports.LARGE_ICON									= 'lIco';
module.exports.SMALL_ICON									= 'sIco';
module.exports.SORT_DATE									= 'srtDt';
module.exports.CREATED_DATE									= 'crDt';
module.exports.LAST_EDIT_DATE								= 'lEdDt';
module.exports.IS_PRIVATE									= 'isPrv';
//published subject indicator: unique for a topic
module.exports.PSI_PROPERTY_TYPE 							= 'psi';
/**
 * If a proxy has a RestrictionProperty, then it might be:
 * <ul>
 * <li>Not public</li>
 * <li>Editable by only selected people</li>
 * <li>...</li>
 * </ul>
 */
module.exports.RESTRICTION_PROPERTY_TYPE 					= 'rstns';
//used for tuples which are public
module.exports.TUPLE_LIST_PROPERTY							= 'tpL';
//userd for tuples which are not public (have restrictions)
module.exports.TUPLE_LIST_PROPERTY_RESTRICTED				= 'tpLr';
//cardinality of tuples stored for sorting (e.g. popular tags)
module.exports.TUPLE_COUNT									= 'tpC';
///////////////////////////
// Tuple Properties
// A tuple is a SubjectProxy specifically used to represent:
//    subject, predicate, object  -- the core triple
//    plus
//    subjectType, objectType, subjectRole, objectRole
//    and
//    list scopes
// In the case that a tuple is used as a merge relation, it must also
//   represent *reasons* for the merge
// ALL tuples have a *signature* which is composed of the identites of
// the subject, object, and tupleType. This makes each tuple 
//   *content addressable*
///////////////////////////
module.exports.TRANSCLUDE_LIST_PROPERTY					= 'tclL';
module.exports.MERGE_REASON_RULES_PROPERTY				= 'mrgRnRlL';
//each node can have one and only one merge tuple
module.exports.MERGE_TUPLE_PROPERTY						= 'mrgT';
module.exports.SCOPE_LIST_PROPERTY_TYPE 				= 'scpL';
module.exports.TUPLE_OBJECT_PROPERTY					= 'tupO';
module.exports.TUPLE_OBJECT_TYPE_PROPERTY				= 'tupOT';
module.exports.TUPLE_SUBJECT_PROPERTY					= 'tupS';
module.exports.TUPLE_SUBJECT_TYPE_PROPERTY				= 'tupST';
module.exports.TUPLE_IS_TRANSCLUDE_PROPERTY				= 'isTrcld';
module.exports.TUPLE_SUBJECT_ROLE_PROPERTY				= 'tupSR';
module.exports.TUPLE_OBJECT_ROLE_PROPERTY				= 'tupOR';
module.exports.TUPLE_THEME_PROPERTY						= 'tupTh';
//we may not use this since the tuple's locator is its signature
module.exports.TUPLE_SIGNATURE_PROPERTY					= 'tupSig';
///////////////////////////
//Miscellaneous
///////////////////////////
//some nodes which represent web pages might be href'd by other pages
module.exports.BACKLINK_LIST_PROPERTY					= 'bklkL';
module.exports.RELATION_WEIGHT							= 'relWt';

