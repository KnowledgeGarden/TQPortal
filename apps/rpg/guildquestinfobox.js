/**
 * GuildQuestInfoBox
 *  A struct for manipulating state stored in a Guild's SubjectProxy
 *  which relates to a specific Quest being played by that Guild
 */

var GuildQuestInfoBox = function(questId, questTitle) {
	var QUEST_LOCATOR = "locator",
		QUEST_TITLE = "questTitle";

    var result = {};
    result[QUEST_LOCATOR] = questId;
    result[QUEST_TITLE] = questTitle;
    return result;
};

module.exports = GuildQuestInfoBox;
//Some constants
module.exports.QUEST_LOCATOR = "locator";
module.exports.QUEST_TITLE = "questTitle";
module.exports.QUEST_CONTEXT_LOCATOR = "contextLocator";
module.exports.META_TREE_ROOT_LOCATOR = "metaLocator";
