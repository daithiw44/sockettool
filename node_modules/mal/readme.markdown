### MongoDB Wrapper - MAL (MongoDB Access Layer) v0.4.0
======================================


#### Convenience methods for accessing and connecting to, authenticating and querying against a MongoDB instance in Node.
--------------------------------------------------------------------------------------------

##### What MAL is:
Mal just makes it easier to open, authenicate aconnect to a db. It should make it easier to connect to collections and preform any of the tasks an app would need to perform agaisnt a mongoDB instance.If you database server goes down or is delayed connecting MAL will buffer requests while server connects, reconnections to DB.

#####  What MAL isn't is:
At the moment by choice MAL won't directly, (but could ...see univeralMethod below), create your indexes, reIndex it won't drop collections, I normaly have them done before hand or directly in the db, if you really need them

	MAL.universalMethod('method',arguments);
	eg. MAL.universalMethod('createIndex',['collection_name',fieldOrSpec, {options}, callback]);
	see example in geo for use of universalMethod instead of ensureIndex.


-For node > 0.8.0

#### Examples
[mal examples](https://github.com/daithiw44/MAL/tree/master/examples)

#### Tests
[mal tests](https://github.com/daithiw44/MAL/tree/master/tests)

#### MAL

MAL provides an easy way to perform operations on a MongoDB instance.
[mongodb / node-mongodb-native](https://github.com/mongodb/node-mongodb-native) -- `sits on mongodb / node-mongodb-native function calls

	As a general rule function calls take the format of ('collectionname', ...>>> same rules for params as node-mongodb-native);
	*exceptions being the two streams calls where the last parameters are always the writebale stream for streamPipe 
		or readable stream for streamEvents.
	** no callback if none is desired but set {safe:false} etc.. same as node-mongodb-native.

#### Install

npm
--------------------------------
npm install mal


#### Require
var MAL = require('mal').MAL;

#### Create a dbSettings object with Authentication if required.
--------------------------------
	example dbSettings Objects.

	//Authenticate

	var dbsettings = {
		host: 'host ip or name',
		port: port number,
		db: 'database name',
		options: {auto_reconnect: true},
		username: '...',
		password: '...'
	};

	//username and password are required only if there is authentication, 
	//if there is no authentication required remove the properties from the object.

	var dbsettings = {
		host: 'host ip or name',
		port: port number,
		db: 'database name',
		options: {auto_reconnect: true}
	};

#### Fire it up
----------------------------------------------------------------

var dbManager = new MAL(dbsettings, optionalCallback);
	optionalCallback is a function that is takes an connected mongoDB server as a parameter.

	No CallBack required.
	----------------------

	var dbManager = new MAL(dbsettings);
```

	Callback required
	------------------
	//example (see test3.js)
	var obj = {
	  b: 'connected',
	  t: new Date()
	};
	var dbManager = new MAL(dbsettings, function(){
	  dbManager.insert('Tests', obj, {},function(err,result) {
		dbManager.find('Tests',{ b: 'connected'},function(err,result1) {
		  console.log(result1);
		});
	  });
	});
``` 
optionalCallback could also be a function non db related for a example a node process.


	var dbManager = new MAL(dbsettings, function(){
		http.createServer(function (req, res) {
		  res.writeHead(200, {'Content-Type': 'text/plain'});
		  res.end('Hello World\n');
		}).listen(1337, '127.0.0.1');
		console.log('Server running at http://127.0.0.1:1337/');
	});


#### Buffers requests if there is no connection established.
----------------------------------------------------------------

As of MAL 0.3.0 MAL buffers requests until a connection is establish, and then plays through the requests one the db connection status is 'connected'.

Where I use buffers is when I have a server whos job it is to speak with a database. Say the database is hosted at Mongolab for example. Typical upNode example a client connects with the server firing in requests…

* server goes down
* upNode client buffers til the server comes back up
* server comes up but hasn't established a DB connection and the client fires all its buffered requests
* In that senario all the requests are lost from the client as the server can't act on them as the db connection hasn't been established.
* MAL takes these requests and buffers them until the connection with Mongolab is etablished and then plays them through.


#### Function calls
--------------------------------

Function calls to the MAL instance follow the same pattern as node-mongodb-native the exception being 
	that all the first paramater is the name of the collection being queried.

The first parameter is always the collection name, followed by parameters expected by node-mongodb-native

	example:
	
	//Assume
	var dbManager = new MAL(dbsettings);
	dbManager.find ('col1', {name : 'name'}, {_id:0}, function(err,result){...}); 

	
#### List of calls available in v0.4
	MALinstance.
	*find(collectionName, query, fields, options, callback)
	*findOne(collectionName, query, callback) 	
	*insert(collection_Name, query, options, callback) 
	*save(collectionName,obj, callback)
	*update(collectionName, criteria, update, options, callback) 
	*remove(collectionName, criteria, callback)
	*findAndModify(collection_Name, criteria, sort, update, options, callback)
	*findAndRemove(collection_Name, criteria, sort, options, callback)
	*ensureIndex(collection_Name, ..as mongodb spec
	*count(collection_Name, ..as mongodb spec
	*distinct(collection_Name, ..as mongodb spec
	//Aggregate Framework.
	*aggregate(collection_Name, criteria, criteria....,options,callback);
	//geo Stuff
	*geoNear(collection_Name, x, y, options, callback);
	*geoHaystackSearch(collection_Name, x, y, options, callback);
	//MapReduce
	*mapReduce(collection_Name, map, reduce, options, callback);
	// for Stream methods last parameters must be the writable or readable streams.
	*streamPipe(collectionName, query, fields, options, wrStream)
	*streamEvents(collectionName, query, fields, options, xStream)

#### Streaming Functionality.
--------------------------------
	
	MAL provides two streaming methods. (see examples).
	
	//Assume
	var dbManager = new MAL(dbsettings);

	 a) streamPipe. (see stream in examples)
	 	//function(collectionName, query, fields, options, wrStream) {...
		// the first argument is always a collectionName
		// the last
	 	dbManager.streamPipe('col1',stream);
		//this calll will return everything from 'col1' 
		//and pipe the results to wrStream where wrStream is a writable stream like response or a tcp socket.

	 b) streamEvents.( Server side Events from Node/MongoDB... see sse in examples);
	 	//lets say we are streaming to serversent events.
		//pass http response object as stream, or store the response object and pass in the stores response
		dbManager.streamEvents('Col1',res);
		res.writeHead(200, {
		  'Content-Type': 'text/event-stream',
		  'Cache-Control': 'no-cache',
		  'Connection': 'keep-alive'
		});
		//flush headers
		res.write('');
	c) stream to websockets with .streamPipe
		see websockets in examples using shoe and browserify.

see 'server sent events' example on [cloudfoundry nodejs using a mongolab mongoDB instance](http://mongodbstreamdemo.cloudfoundry.com/)
streaming 4.8mb of tweets to the browser with Server Sent Events.

To populated data, pulled tweets from a twitter account that has volume tweets and stuck them in a mongoDB at mongolab.

5. ToDo.
--------------------------------

	1. Write more tests
	2. Write examples
	3. Replica Sets
	4. GridFS

6. Changelog.
--------------------------------

	1. v0.3.4 Node server may be up before DBConnection, depending on how MAL is used. MAL will now buffer the db requests while the connection is being established and execut them once the connection is live.
	2. v0.3.4 Node changes to streams in v0.10, streams for server sent events are piped.
	3. v0.4.0 Aggregate, mapreduce, geoNear, geoHaystackSearch.


