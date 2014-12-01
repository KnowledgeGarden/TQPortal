/**
 * New node file
 */

exports.replaceAll = function(word, character, replaceChar){
	var myword = word.valueOf();
	
    while(myword.indexOf(character) !== -1)
        myword = myword.replace(character,replaceChar);

    return myword;
}