# The Apps Directory #
Latest edit: 20140827<br/>
In this directory, there are now four kinds of objects:<br/>
- Routers<br/>
- Models<br/>
- Widgets<br/>
- Boneyard<br/>
## Routers ##
Router files are typically named <appname>.js.<br/>
All router files are processed by server.js during application boot. Each router file presents the following *signature* to the server:<br/><br/>
  exports.plugin = function(app, environment, ppt, isPrivatePortal)<br/>
where:<br/>
&nbsp;&nbsp;*app* is an instance of Express<br/>
&nbsp;&nbsp;*environment* is an instance of the Environment object<br/>
&nbsp;&nbsp;*ppt* is an instance of Passport (authentication)</br/>
&nbsp;&nbsp;*isPrivate* is a boolean telling whether the site's configuration specifies that authentication is required for any route to be followed.</br>
Not every router actually installs itself in Express as a router; some of them may simply offer services which don't require routing.<br/>
In general, a router accomplishes the following:<br/>
$nbsp;&nbsp;Provide Express with router handlers for *get* and *post* response handling<br/>
$nbsp;&nbsp;Paint *HTML* by passing information to appropriate templates in the *view* directory.<br/>
$nbsp;&nbsp;Optionally, call either a *model* or a *widget* (or both) for services required to generate the data to paint.<br/>
## Models ##
A model provides connections between views and any databases. Models also are able to provide many support functions. For instance, TQPortal includes one model: /common/commonmodel.js which provides common services to many other models.<br/>
## Widgets ##
From time to time, some javascript widgets require backside code to interface the widget with the database in order to create a view. TQPortal separates widgets from models. In the long run, there is a desire to generate a common approach to switching widgets, making it possible to change the look&feel of the system by switching widgets without rewriting code. We're not there yet.
## Boneyard ##
During the development of the system, it is frequently useful to switch off some applications. Rather than deleting them, the boneyard directory provides a place to drag an app's router. Once there, it is not detected during boot; it is effectively switched off.
