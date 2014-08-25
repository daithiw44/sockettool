var mongo = require('mongodb')
, EventEmitter = require('events').EventEmitter
, JSONStream = require('JSONStream')
, util = require('util');

/*
 * Constructor
 * note takes time to authenticate against a database after opening.
 */
MAL = function(dbSettings, callback) {
  var self = this,  server = new mongo.Server(dbSettings.host, dbSettings.port, dbSettings.options);
  var db = new mongo.Db(dbSettings.db, server, {safe:true});
  db.addListener('error', function(error) {
    util.puts('Error connecting to Mongo???', error);
  });
 /* db.addListener('close', function() {
    util.puts('DB connection Closed');
  });*/
  console.log(db._state);
  db.open(function(err) {
    util.puts(db._state);
    if (dbSettings.hasOwnProperty('username')) {
      db.authenticate(dbSettings.username, dbSettings.password, function(err) {
        if (err) {
          util.puts('Error Authentication', err);
        }
        
        _checkCallBack(self,callback);
      });
    } else {
      _checkCallBack(self,callback);
    }
  });
  self.db = db;
};

util.inherits(MAL, EventEmitter);

function _checkCallBack(self, callback) {
  util.puts('Connected to MongoDB');
  //self.emit(self.db._state);
  if (typeof callback === 'function') {
    var x = _bufferFuncStager(callback, self, self.db);
    self.buffer.unshift(x);
  }
  self.executeBuffer();
}

MAL.prototype.buffer =[];

/**
 * getCollectionByName
 */
MAL.prototype.getCollectionByName = function(collection_name, callback) {
 var bufferObj ={};
  if(this.db._state === 'connected'){
    this.db.collection(collection_name, function(error, user_collection) {
      if (error) callback(error);
      else callback(null, user_collection);
    });
  } else {
    var x = _bufferFuncStager(this.getCollectionByName, this, [collection_name, callback]);
    this.buffer.push(x);
  }
};

/**
 * Execute Buffer
 */
MAL.prototype.executeBuffer = function(){
  var self = this;
  this.buffer.forEach(function(el,index, array){
   (array.shift())();
  });
};

var _bufferFuncStager = function(fn, context, params) {
  return function() {
    fn.apply(context, params);
  };
}

/**
 * findOne
 */
MAL.prototype.findOne = function() {
  this.universalMethod('findOne',Array.prototype.slice.call(arguments));
};

/**
 * find
 * Not using univeralMethod here cause of toArray.
 */
MAL.prototype.find = function() {
  var argsArray = Array.prototype.slice.call(arguments);
  var col = argsArray.splice(0,1)[0],
  cb = argsArray.splice(argsArray.length-1,argsArray.length-1)[0];
  this.getCollectionByName(col, function(error, collection) {
    if (error) cb(error);
    else {
    collection.find.apply(collection,argsArray).toArray(cb);
    }
  });
};

/**
 * findAndRemove
 */
MAL.prototype.findAndRemove = function() {
  this.universalMethod('findAndRemove',Array.prototype.slice.call(arguments));
};

/**
 * findAndModify
 */
MAL.prototype.findAndModify = function() {
  this.universalMethod('findAndModify',Array.prototype.slice.call(arguments));
};


/**
 * insert
 */
MAL.prototype.insert = function() {
  this.universalMethod('insert',Array.prototype.slice.call(arguments));
};

/**
 * save
 */
MAL.prototype.save = function() {
  this.universalMethod('save',Array.prototype.slice.call(arguments));
};

/**
 * update
 */
MAL.prototype.update = function() {
  this.universalMethod('update',Array.prototype.slice.call(arguments));
};

/**
 * remove
 */
MAL.prototype.remove = function() {
  this.universalMethod('remove',Array.prototype.slice.call(arguments));
};

/**
 * universalMethod
 * Most calls run through here could be called publically
 *
 * .universalMethod('insert',['test',{a:1}, {safe: false}]);
 *
 */
MAL.prototype.universalMethod = function (dbMethod,argsArray){
  var callback;
  if (typeof argsArray[argsArray.length-1] === 'function'){
    callback = argsArray[argsArray.length-1];
  }
  this.getCollectionByName(argsArray[0], function(error, collection) {
    if (error) {
      (typeof callback === 'function') ? callback(error) : util.puts('error: ', error);
    } else {
      argsArray.splice(0,1);
     // console.log('args: ',argsArray);
      collection[dbMethod].apply(collection,argsArray);
    }
  });
}

/**
 * geoSearch
 */
MAL.prototype.geoNear = function(){
  this.universalMethod('geoNear',Array.prototype.slice.call(arguments));
};

/**
 * geoNear
 */
MAL.prototype.geoHaystackSearch = function(){
  this.universalMethod('geoHaystackSearch',Array.prototype.slice.call(arguments));
};

/**
 * aggregate
 */
MAL.prototype.aggregate = function(){
  this.universalMethod('aggregate',Array.prototype.slice.call(arguments));
};

/**
 * mapreduce
 */
MAL.prototype.mapReduce = function(){
  this.universalMethod('mapReduce',Array.prototype.slice.call(arguments));
};

/**
 * streamPipe
 */
MAL.prototype.streamPipe = function() {
  var args = Array.prototype.slice.call(arguments);
  collectionName = args.splice(0,1)[0];
  wrStream = args.splice(args.length-1,1)[0];
  this.getCollectionByName(collectionName, function(error, collection) {
    if (error) util.puts('error: ', error);
    collection.find.apply(collection,args).stream().pipe(JSONStream.stringify()).pipe(wrStream);
  });
};

/**
 * streamEvents
 */
MAL.prototype.streamEvents = function() {
  var args = Array.prototype.slice.call(arguments);
  collectionName = args.splice(0,1)[0];
  xStream = args.splice(args.length-1,1)[0];
  this.getCollectionByName(collectionName, function(error, collection) {
    collection.find.apply(collection,args).stream().pipe(JSONStream.stringify(open='data: ', sep='\r\n\r\n\ndata: ', close='')).pipe(xStream);
  });
};

/* geo */
MAL.prototype.ensureIndex = function(){
  this.universalMethod('ensureIndex',Array.prototype.slice.call(arguments));
};

/* distinct */
MAL.prototype.distinct = function(){
  this.universalMethod('distinct',Array.prototype.slice.call(arguments));
};

/* count */
MAL.prototype.count = function(){
  this.universalMethod('count',Array.prototype.slice.call(arguments));
};





exports.MAL = MAL;
