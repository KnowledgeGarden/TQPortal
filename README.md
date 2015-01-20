# TQPortal [![Build Status](https://travis-ci.org/KnowledgeGarden/TQPortal.svg?branch=develop)](https://travis-ci.org/KnowledgeGarden/TQPortal)
A simple node-express-mongo with topic map portal

In a sense, this portal mimics, as a scaled down prototype of ["https://github.com/KnowledgeGarden/ExpressDerbyPrototype"]("https://github.com/KnowledgeGarden/ExpressDerbyPrototype" "another project.")

The platform uses MongoDB by way of mongodb for user persistence, Express 4, and Handlebars to craft a similation of a *topic map*. The platform uses an instance of [https://github.com/KnowledgeGarden/TQTopicMap](https://github.com/KnowledgeGarden/TQTopicMap)
for persistence of all topics, which include blog posts and other artifacts.
## Usage
Installation instructions are now [here](here "https://github.com/KnowledgeGarden/TQPortal/wiki/Installation") 
((just in case GitHub refuses to show that link correctly, it is this: 
https://github.com/KnowledgeGarden/TQPortal/wiki/Installation))



## Developing
Internally, it's being developed using javascript files in a directory /devtest which is not included in the repo. 


## Debugging
Launch [node-inspector](https://github.com/node-inspector/node-inspector) with
```
npm run debug
```
then set your breakpoints and press F8 (or the resume script button) to continue starting the app.

Changes made in the debugger will be persisted to disk using the [live-edit](https://github.com/node-inspector/node-inspector/wiki/LiveEdit) mechanism.

The latest version of Chrome or Opera must be installed for node-inspector to work correctly.
If a browser window is not opened automatically, you can visit
[http://localhost:8080/debug?port=5858](http://localhost:8080/debug?port=5858)

### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
