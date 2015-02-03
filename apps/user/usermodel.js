/**
 * User Model
 * <p>Creates a <em>Topic</em> for each new account; that's the user identity
 * that will be traded in the database, not the user's _id</p>
 * <p>User's handle must be unique and is used as the locator for that topic</p>
 */

var types = require('tqtopicmap/lib/types')
  , icons = require('tqtopicmap/lib/icons')
  , properties = require('tqtopicmap/lib/properties')
  , constants = require('../../core/constants');

var UserModel = module.exports = function(environment) {
  var myEnvironment = environment,
      CommonModel = environment.getCommonModel(),
      topicMapEnvironment = environment.getTopicMapEnvironment(),
      DataProvider = topicMapEnvironment.getDataProvider(),
      topicModel = topicMapEnvironment.getTopicModel(),
      self = this;
	
  /**
   * Update an existing user entry
   */
  self.update = function(userbody, user, credentials, callback) {
	  topicMapEnvironment.logDebug("USER.UPDATE "+JSON.stringify(userbody));
	  var lox = userbody.locator;
	  DataProvider.getNodeByLocator(lox, credentials, function userMGetNode(err, result) {
		  var error = '',
          retval;
		  if (err) {error += err;}
      if (result) {
  		  var body = userbody.body,
            lang = userbody.language,
            comment = "an edit by "+user.handle,
            oldBody;
        if(result.getBody(lang)) {
          oldBody = result.getBody(lang).theText;
        }
        if (oldBody) {
          isNotUpdateToBody = (oldBody === body);
        }
        var oldLabel = result.getSubject(lang).theText,
            isNotUpdateToLabel = (title === oldLabel);
        if (!isNotUpdateToLabel) {
          //crucial update to label
          result.updateSubject(title, lang, user.handle, comment);
          if (!isNotUpdateToBody) {
            result.updateBody(body, lang, user.handle, comment);
          }
          result.setLastEditDate(new Date());
          DataProvider.updateNodeLabel(result, oldLabel, title, credentials, function userMUpdateNodeLabel(err, data) {
            if (err) {error += err;}
            console.log("UserModel.update "+error+" "+oldLabel+" "+title);
            return callback(error, data);
          });
        } else {
          if (!isNotUpdateToBody) {
            result.updateBody(body, lang, user.handle, comment);
            result.setLastEditDate(new Date());
            DataProvider.putNode(result, function userMPutNode(err, data) {
              if (err) {error += err;}
              return callback(error, data);
            });
          } else {
            return callback(error, data);
          }
        }
      } else {
        return  callback(error, retval);
      }
    });
  };

  /**
   * Create a new user Topic from an authenticated User object
   * @param user = User, the authentication user, not the topic user
   * @param callback signature (err,data)
   */
  self.newUserTopic = function(user, callback) {
    //NOTE: user.handle is also the topic's locator
    //must be unique
    console.log('USER.newUserTopic- '+JSON.stringify(user.getData()));
    var language = "en", //TODO
        credentials = []; 
    credentials.push(user.getHandle());
    // In fact, we already check for valid and unique handle in routes.js
    console.log('USER.newUserTopic-1 '+user.getHandle());
    self.findUser(user.getHandle(), credentials, function userMFindUser(err, result) {
      console.log('USER.newUserTopic-2 '+err+' '+result);
      //if (result !== null) {
      if (result != null /*&& result.length > 0*/) {
        return callback(user.getHandle()+" already exists", null);
      } else {
        //create a new user
        var usr;
        topicModel.newInstanceNode(user.getHandle(), types.USER_TYPE,
                      "","","en",user.getHandle(), icons.PERSON_ICON_SM,icons.PERSON_ICON,
                      false, credentials, function userMNewInstance(err, result) {
          console.log('USER.newUserTopic-3 '+err+' '+result.toJSON());
          myEnvironment.logDebug('USER.newUserTopic-3 '+err+' '+result.toJSON());
          usr = result;
          // model users as AIR objects
          usr.setSubject(user.getFullName(),language, user.getHandle());
          //model user's home page in this topic
          if (user.getHomepage()) {
            usr.setResourceUrl(user.getHomepage());
          }
          DataProvider.putNode(usr, function userMPutNode1(err, data) {
            console.log('UserModel.newUserTopic+ '+usr.getLocator()+" "+err);
            return callback(err, data);
          });
        });
      }
   	});
  };
	
  /**
   * Find user topic given <code>userLocator</code>
   * @param userlocator
   * @param credentials
   * @param callback signature (err,data)
   */
  self.findUser = function(userLocator, credentials, callback) {
	  console.log("UserModel.findUser "+userLocator+" "+credentials);
    DataProvider.getNodeByLocator(userLocator, credentials, function userMGetNode1(err, result) {
      return callback(err, result);
    });
  };
  
  self.listUsers = function(start, count, credentials, callback) {
    DataProvider.listInstanceNodes(types.USER_TYPE, start, count, credentials, function userMListInstances(err, data, total) {
      console.log("UserModel.listInstanceNodes "+err+" "+data);
      return callback(err, data, total);
    });
  };
	  
	  /**
	   * @param credentials
	   * @param callback signatur (data)
	   */
  self.fillDatatable = function(start, count, credentials, callback) {
    self.listUsers(start, count, credentials, function userNListUsers(err, result, total) {
      console.log('ROUTES/users '+err+' '+result);
      var len = result.length,
          url,
          p,
          html = "<table  cellspacing=\"0\"><thead>";
      html+="<tr><th>Member</th></tr>";
      html+="</thead><tbody>";
      
      for (var i=0;i<len;i++) {
    	  p = result[i];
    	  html+="<tr><td>";
    	  url = "<a href='/user/"+p.getCreatorId()+"'>"+p.getCreatorId()+"</a>";
    	  html+=url+"</td></tr>";
      }
      //{{#each sadtable}}
      //<tr><td width="60%"><a href="{{subjloc}}">{{subjsubj}}</a></td><td width="20%"><a href="{{authloc}}">{{name}}</a></td><td>{{date}}</td></tr>
     // {{/each}}
      html+="</tbody></table>";
      console.log("FILLING "+total);
      return callback(html, len, total);	
    });
  };
};