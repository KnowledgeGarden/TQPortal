# TQPortal
A simple node-express-mongoose portal

In a sense, this portal mimics, as a scaled down prototype of ["https://github.com/KnowledgeGarden/ExpressDerbyPrototype"]("https://github.com/KnowledgeGarden/ExpressDerbyPrototype" "another project.")

The platform uses MongoDB by way of mongoose, Express 4, and Handlebars to craft a similation of a *topic map*. The javascript model file topic.js serves as the primary database artifact which is a container for all information resources, be they blog entries, the user, tags, bookmarks, or wiki pages.

## Usage
For the time being, just clone the project, make sure MongoDB is running, then:

npm update

node server.js

At the moment, the code is intended, as coded in server.js, to open at localhost, since it is configured to use port 80. So, http://localhost will bring it up. You are free to change the port back to the traditional (for node, 3000).


## Developing
Internally, it's being developed using javascript files in a directory /devtest which is not included in the repo. 



### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
