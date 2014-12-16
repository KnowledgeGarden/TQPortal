/**
 * Properties to add to behaviors which extend what is available
 * to the topic map itself
 */
///////////////////////////
// SubjectProxy Properties
///////////////////////////
module.exports.FOLLOWERS_LIST		= "folwrs";
//used in Tag nodes as a set of tags shared jointly by a document
//Using this list, we can implement drill-down tag navigation
module.exports.JOINT_TAG_LIST		= "jntgl";
///////////////////////////
// Pivots added to TQPortal
///////////////////////////
module.exports.DOCUMENT_TRANSCLUDER_RELATION_TYPE	= "DocumentTranscluderRelationType";
module.exports.ISSUE_QUEST_RELATION_TYPE            = "IssueQuestRelationType";
module.exports.QUEST_GUILD_RELATION_TYPE            = "QuestGuildRelationType";
module.exports.USER_GUILD_RELATION_TYPE             = "UserGuildRelationType";
///////////////////////////
// New Node Type, extends NodeType
///////////////////////////
module.exports.MOCK_GAME_NODE_TYPE             = "MockGameNodeType";