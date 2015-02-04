/**
 * StringUtil
 */

exports.replaceAll = function(word, char1, replaceChar){
	var myword = word; //word.valueOf();
	return myword.replace(new RegExp(char1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(replaceChar?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):replaceChar);
}