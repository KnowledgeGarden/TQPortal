/**
 * Game Constants
 */
//List of a guild's leaders
//NOTE: guild owner is the creatorId of the Guild proxy
module.exports.GUILD_LEADER_LIST_PROPERTY       = "GuildLeaders";
//List of guild's members (includes leaders)
//This is the list you check for membership
module.exports.GUILD_MEMBER_LIST_PROPERTY       = "GuildMembers";
//List of quests a guild is playing
module.exports.GUILD_QUEST_LIST_PROPERTY        = "GuildQuestList";
//Guilds can switch quests; this is the current (active) quest
module.exports.GUILD_CURRENT_QUEST_PROPERTY     = "CurrentQuest";
//List of guilds engaged in a quest
module.exports.QUEST_GUILD_LIST_PROPERTY        = "QuestGuildList";
//The locator for the quest's tree root node
module.exports.QUEST_ROOT_NODE_PROPERTY         = "QuestRootNode";
//List of locators for Perspective documents
module.exports.QUEST_PERSPECTIVE_LIST_PROPERTY  = "QuestPerspectives";
