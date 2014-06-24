# View Templates #

## Plans ##
Ultimately, for all information, we seek to model the views uniformly as *topic objects*, This means that, with the exception of *Tags*, which mostly present *pivot* data, any topic has some kind of title, some kind of textual presentation, then lots of relations, which can include:

_ Pivots
- 
- Tags
- Users

- Many other kinds of relations
- 

For example, a topic which is a conversation node needs to know not only its tags and users, but also the node to which it responds, and any *child nodes* which respond to it. Additionally, it might want to keep track of the *quest*, the main question or context in which it exists.

##Data  ##
Data object is a JSON object which, at the minimum, includes these two fields:

- title
- image (large icon)
- body

Other fields must be defined as a means to maintain some standard for transporting data to the view. The *image* field is generally defined by the node itself. The **Topic** object is defined with small and large icons. A small icon is used when listing a node in one of the relation lists, such as a list of tags associated with this topic. A large icon is used on the page itself in the data object.
