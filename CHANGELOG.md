Change Log
==========

### 0.13.0 / 2014-11-30

Major upgrade, though still not complete.

* Added KnowledgeWorkbench for creating _Connections_ among nodes
* Added DbPedia for doing simple research from DbPedia
* Fixed GeoMap since their api changed
* Added basic RPG game features: Issues, Quests, and Guilds -- far from finished
* Added bootstrap data which adds necessary classes to the core topic map, which means: to get full benefit from this upgrade, the database needs to be cleared to start over.  Since this is a really early build, we do not yet include the ability to upgrade a database (planned feature).  Note: when the topic map is emptied, the user database must be emptied as well (again: no feature yet to facilitate upgrades--that's planned).

### 0.12.0 / 2014-09-02

Several changes:

* Added two new kinds of logging, and modified /config/logger.json to add them:
    * Monitor -- for logging any queries to the portal which are not trapped by any routers
    * API -- for logging API queries for a soon-to-be developed REST API
* Started the shell for a REST API, which doesn't show on the menu, but will be made available for REST calls to the portal
* Added /core/logplatform.js to create the loggers and move that out of Environment
* Moved MongoDB user configuration out of Environment into UserDatabase
* Wire much of the RPG game platform, tested new Issue

### 0.11.1 / 2014-09-01

* Installed viewspec:
    * Dashboard is default view
    * Conversation is a selectable view on nearly every kind of node (except tags and user) which provides a column navigation (Miller Column) that treats the node as a conversation. Any _child_ nodes will be viewable directly.
* Added ability to edit bookmark nodes
* Added ability to transclude a node into a conversation _as evidence_.
* Improved use of Bootstrap CSS
* Started evolving the game platform

### 0.10.0 / 2014-08-24

* Added Profile app for user control of some settings.
* Added geo-location to user data, including signup.handlebars
* Corrected and improved ability to update any node. When a node is updated, if its label/subject line is changed, that can have consequences on any node which references that node by way of relations, pivots or immediate parent or child tree structures. The TopicMap now correctly updates all of those references.

### 0.9.0 / 2014-08-21

Huge upgrade for error handling:

* Now using 500.handlebars for reporting errors. Mostly used in Admin signup, where we do sanity checks on the signup form. An error there now redirects to /error/<somemessage>, where <somemessage> is very terse, e.g. "MissingPassword" -- note, we could later add password strength testing, etc.

Started a TopicMap application shell.
Started a Calendar application shell -- it's far from functional.

Added geo location to Signup, and ability to add those to the user's database entry. Those will eventually be used to put pins on a map which will exist on the User app landing page to show where users live.

### 0.8.0 / 2014-08-20

Late breaking: added two new applications: one that displays sunlight anywhere over the planet, and one that displays OpenStreetMap in an application that allows programmable layers to be added.

Added table paging for all index pages. Added Admin capability to remove a user from the user database.

### 0.7.0 / 20140819

Latebreaking: a Tree tab was added to views to paint conversations associated with any node.

Not really a version upgrade, just a mild upgrade and massive bug fixes. Added features include:

* Ability for an Admin to write a red message across the landing page at the top; typically to warn of portal maintenance, etc.
* Ability for Admin to persist all the recent ringbuffers before shutting the portal down for maintenance. That way, when the portal is rebooted, all the recent messages on the landing page will be returned.
* Ability for anyone to directly access the Carrot2 clustering search engine with a new WebResearch app.

### 0.6.0 / 2014-08-16

Upgraded to ViewFirst for all present apps:

* Blog
* Bookmark
* Conversation
* Tag
* User
* Wiki

This means that we don't use the rich text editor to display rich text once created. BookmarkForm.handlebars now uses an iframe to display the page being bookmarked.<br/>
Next version will include persisting recent events, and a more elegant way to start a conversation on any topic: presently it just allows to start a conversation map node. That will change to allow making a statement (!) or asking a question (?).

### 0.5.0 / 2014-08-13

The platform now does social bookmarking. A webpage is encountered, a tiny bookmarklet of this form:
```javascript
location.href='http://localhost:3000/bookmark/new?url='+ encodeURIComponent(location.href)+'&title='+ encodeURIComponent(document.title)
```
where `localhost:3000` is substituted by the actual server URL, is clicked. That opens a form (for an authenticated user) which will present the web page's URL and page title (which can be edited), and also presents a space where a conversation node will be created. That includes _subject_ and _body_ areas, plus a field to input comma-delimited tags. Thus, a topic is created for the URL; if that URL already has a topic, it is used again. Then, a conversation Position (answer) node is created which contains the annotation as captured during the bookmark session.  Any given web page can accumulate many such annotations, each the basis for a conversation, each able to be transcluded into any conversation as _evidence_ to support that conversation.

Further work is now aimed at refining what is now working. For example, the code is going to migrate to a _View First_ approach; tables are painted that way; going forward, all topics will be painted that way as well.

### 0.4.0 / 2014-08-04

The platform now does structured conversations. While they leave a lot of room for UX improvement, the code, at the moment, is really to debug the complexities of context. These capabilities exist, and they make tracking a node's conversational context (which conversation am I in?) complex:

* Ability to transclude any node into a conversation as a child node of some chosen conversation node
* Ability to treat a transcluded node as a conversation node and use it as a parent node for further conversation
* Ability to start a conversation on any node in the system, which includes blogs, wikis and eventually bookmarks

Next version will add social bookmarking and begin to explore the Issue-based game system.

### 0.3.0 / 2014-07-25

The platform now adds these features:

* A theme (which can be swapped to others)
* Rich text editing
* Ability for authenticated owners of documents to edit them, including the User description
* Blog, Wiki, and User are now modelled as AIRs (addressable information resources)
The platform is now ready to take to the next level with:
* Social Bookmarking
* Structured Conversations

### 0.2.1 / 2014-07-18

The platform has now been installed online, live, for modest testing. That illuminated a very few bugs, which are fixed in today's commit. The platform is now ready for its next version change, anticipating these changes:

* Ability to validate a user's **handle** before signing up. A handle must be unique to the database since it is also an identifier for a topic in the topic map for that user. Each user who signs up gets a topic since all objects created by that user will have pivots between that user and those objects.
* Rich text editing: right now, the text area used to display topics do not handle rich text. That's to be changed.
* Ability to edit the documents you create. In this platform, only an owner and an Admin have that capability. Eventually, we will create a sophisticated ACL infrastructure for allowing groups to edit documents.
* Beginnings of the Conversation Application

### 0.2.0 / 2014-07-17

The platform now has full text search, and ability to tailor the menu bar to whether user is authenticated or admin. More importantly, this is the first version where the apps install themselves in the menubar. Over time, the apps will get more control of what is put in the main.handlebars template. The goal in that matter is that apps install themselves fully; no need to anticipate in hard code.

### 0.1.0 / 2014-07-15

The platform can now create and maintain blog posts and wiki topics, including tags, and handle pivots among documents, tags, and users.  That's its first real milestone.  Up next, we need to work on:

* Adding Edit capabilities to documents, editable only by the creator or Admin
* Adding rich text editing
* Adding file upload to support images in documents

Applications started but not completed include:

* Conversation -- structured conversations (tree structure)
* Bookmark -- social bookmarks as documents that can be linked to or used in conversations
* Issue -- a landing page for an _issue-based game-like environment_

### 0.0.3 / 2014-07-11

In addition to the ability to make a portal private, you can now use the invitationOnly configuration property. When true, the SignUp page will show a message which says your email must be on an invitation list. The Admin function to add emails to that list now works. To get to it, you must be authenticated with Administrative credentials. The system provides a default administrator; log in with that and then perform the following:

* List Users
* Type the email of a selected user into the text field at the top.
* Click Select, which opens a new view for editing the credentials of the chosen user.
* To make that user into an Admin: add the word ",AdminCreds" as shown in the view, to the user's credentials. Note the leading comma. This is a comma-separated list. No spaces necessary.
* Click Submit.

That user will now have administrative capabilities.
To add a user to the invitation list,

* Visit the Admin page
* Click Invite User
* Type in the user's email
* Click Submit

When that user visits SignUp and signs up, that email will be removed from the invitation list.

### 0.0.2 / 2014-07-09

Dropped in a shell for Conversation App; this will be a structured conversation app, similar to the blog, except that each conversation can be a tree-structured collection of blog-like posts, each taking a different node type, such as Question, Answer, and so forth.

Added the **isPortalPrivate** boolean to each app's signature. This is defined in the **config.json** file. Now, it is possible to boot an entirely private instance of the portal.

Long day for development.  Bugs pulled off topic.handlebars in order to get pivots working. Pivots let a topic view pivot to that topics tags, related documents or related users.

Added tabs to the topic view.One tab is the topic itself. Another is the _source_ of the topic itself, and the third is a not-yet-developed Relations tab.

Source tag shows the JSON representation of the entire topic being viewed. This is most useful in system development to see what, precisely, the topic map returned.

### 0.0.1 / 2014-07-08

Prior to today, an earlier version of this platform was uploaded to this repo. It was essentially a _textbook_ server system, based on the usual Express layouts. But, what is really desired is a _plug-in application framework_ such that there would be two sections to the system:

* a Core portion of the platform which takes care of user management, and provides common support features.
* an Applications portion, which is a directory with *.js files, each of which has a common signature for booting as an application.

The entire original codebase was replaced with this plugin framework. Today, for the first time, there are three applications which have just a bit of something to show, even if still buggy. They are:

* Blog, which allows to create blog posts, list them and view them. Each blog post can include tags.
* Tag, which allows to list and to view tags created during blogging
* User, which lists and displays members (users) who have signed up.  There be bugs in that view.
* Wiki, which simply displays an empty home page. Lots to do there.

