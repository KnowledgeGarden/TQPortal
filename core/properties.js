/**
 * properties.js: keys for key/value SubjectProxy properties
 * <p>These are all derived from the interface specifications of the
 * Java topic map at https://github.com/SolrSherlock/JSONTopicMap</p>
 * <p>They must be the same in order to insure database compatibility:<br/>
 * both the NodeJS and Java topic maps should be able to work from the
 * same database.</p>
 */
///////////////////////////
// SubjectProxy Properties
///////////////////////////
module.exports.LOCATOR 										= 'locator';
module.exports.INSTANCE_OF 									= 'instanceOf';
module.exports.SUB_OF		 								= 'subOf';
module.exports.TRANSITIVE_CLOSURE							= 'transitiveClosure';
module.exports.LABEL										= 'label';
module.exports.DETAILS										= 'details';
module.exports.URL											= 'url';
module.exports.CREATOR_ID									= 'creatorId';
module.exports.LARGE_ICON									= 'largeIcon';
module.exports.CREATED_DATE									= 'smallIcon';
module.exports.LAST_EDIT_DATE								= 'lastEditDate';
module.exports.IS_PRIVATE									= 'isPrivate';
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
module.exports.RESTRICTION_PROPERTY_TYPE 					= 'restrictions';
//used for tuples which are public
module.exports.TUPLE_LIST_PROPERTY							= 'tuples';
//userd for tuples which are not public (have restrictions)
module.exports.TUPLE_LIST_PROPERTY_RESTRICTED				= 'tuplesR';
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
module.exports.TRANSCLUDE_LIST_PROPERTY					= 'transcludes';
module.exports.MERGE_REASON_RULES_PROPERTY				= 'mergeReasonRules';
//each node can have one and only one merge tuple
module.exports.MERGE_TUPLE_PROPERTY						= 'mergetuple';
module.exports.SCOPE_LIST_PROPERTY_TYPE 				= 'scopes';
module.exports.TUPLE_OBJECT_PROPERTY					= 'tupleObject';
module.exports.TUPLE_OBJECT_TYPE_PROPERTY				= 'tupleObjectType';
module.exports.TUPLE_SUBJECT_PROPERTY					= 'tupleSubject';
module.exports.TUPLE_SUBJECT_TYPE_PROPERTY				= 'tupleSubjectType';
module.exports.TUPLE_IS_TRANSCLUDE_PROPERTY				= 'isTransclude';
module.exports.TUPLE_SUBJECT_ROLE_PROPERTY				= 'tupleSubjectRole';
module.exports.TUPLE_OBJECT_ROLE_PROPERTY				= 'tupleObjectRole';
module.exports.TUPLE_THEME_PROPERTY						= 'tupleTheme';
module.exports.TUPLE_SIGNATURE_PROPERTY					= 'tupleSig';
///////////////////////////
// AIR node properties
///////////////////////////
module.exports.AIR_SUBJECT_PROPERTY						= "AirSubjectProperty";
module.exports.AIR_BODY_PROPERTY						= "AirBodyProperty";
module.exports.AIR_SUBJECT_VERSION_PROPERTY				= "AirSubjectVersionProperty";
module.exports.AIR_BODY_VERSION_PROPERTY				= "AirBodyVersionProperty";
///////////////////////////
//Miscellaneous
///////////////////////////
//some nodes which represent web pages might be href'd by other pages
module.exports.BACKLINK_LIST_PROPERTY					= 'backlinks';
module.exports.RELATION_WEIGHT							= 'RelationWeightPropertyType';

