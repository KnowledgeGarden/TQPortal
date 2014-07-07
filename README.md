# TQPortal
A simple node-express-mongoose portal

In a sense, this portal mimics, as a scaled down prototype of ["https://github.com/KnowledgeGarden/ExpressDerbyPrototype"]("https://github.com/KnowledgeGarden/ExpressDerbyPrototype" "another project.")

The platform uses MongoDB by way of mongodb for user persistence, Express 4, and Handlebars to craft a similation of a *topic map*. The platform uses an instance of [https://github.com/KnowledgeGarden/TQTopicMap](https://github.com/KnowledgeGarden/TQTopicMap)
for persistence of all topics, which include blog posts and other artifacts.
## Usage
For the time being, just clone the project, make sure MongoDB is running, then:

npm update

At that time, make a copy of a fully updated TQTopicMap and drop that in a new directory: **node_modules/tqtopicmap**

node server.js

At the moment, the code is intended, as coded in server.js, to open at localhost, since it is configured to use port 80. So, http://localhost will bring it up. You are free to change the port back to the traditional (for node, 3000).


## Developing
Internally, it's being developed using javascript files in a directory /devtest which is not included in the repo. 



### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
