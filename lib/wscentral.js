var _LookUp, dbManager, MAL 
, sys = require('sys')
, events = require('events')
, uuid = require('node-uuid')
, listeners = require('./listeners')
, Listener = require('./listener').Listener
, config = require('../config')
, MAL = MAL = require('mal').MAL
, dbManager = new MAL(config.settings.mongoDB);

function wscentral() {
  //return this;
  this.version = '0.0';
  events.EventEmitter.call(this);
};
sys.inherits(wscentral, events.EventEmitter);

//clear all listeners on start up
dbManager.update('channels',{}, { $set : {'listeners': [] }} , {multi:true, safe:false} );

wscentral.prototype.terminal = function (socket, json) {
  var that = this,
  secureArray = ['conn','sub','unsub','fetch'];
  //Refactor this part.
  if (that._LookUp.hasOwnProperty(json.method)) {
    if (json.method === 'conn' || socket.uid === json.uid) {
      console.log('here',json.method);
      that._LookUp[json.method](socket, json,that)
    } else if (json.method === 'disconn'){
      that._LookUp[json.method](json);
    } else if (json.method === 'beep'){
      that._LookUp[json.method](that,json);
    } else if (secureArray.indexOf(json.method) = -1 && socket.web === true) {
      that._LookUp[json.method](socket, json, that);
    } else {
      that._errorCast(socket, "unauthorised request");
    }
  } else {
    that._errorCast(socket, "method doesn\'t exist");
  }
};

wscentral.prototype._errorCast = function (socket, msg) {
  if(socket){
    socket.send('{"e":1,"m":"' + msg + '"}');
  }
}

//_LookUp
wscentral.prototype._LookUp = {

  //conn
  "conn": function (socket, json) {
    var guid;
    console.log("1", listeners);
    if (!socket.hasOwnProperty('uid')) {
      guid = uuid.v4();
      console.log('guid',guid);
      socket.uid = json.uid;
      socket.id = guid;
      if(json.hasOwnProperty('s')){
        socket.web = true;
        if(!listeners.hasOwnProperty('web')){
          listeners['web'] = new Listener(socket, 'web');
        } else {
          listeners['web'].ws.sockets.push(socket);
        }
      } else {
        listeners[guid] = socket;
      }
      //console.log('send0',socket.send);
      socket.send(JSON.stringify({ "e": 0,"method": json.method, "uid":json.uid}));
    } else {
      if (socket.uid === json.uid) {
        socket.send(JSON.stringify({ "e": 1,"method": json.method}));
      } else {
        socket.send(JSON.stringify({ "e": 1,"method": json.method}));
      }
    }
  },

  //get
  "get": function (socket, json) {
    dbManager.findOne('messages',{request:json.request},{},function(e,r){
      if(e){
        socket.send(JSON.stringify({"e":1,"method":"get"})); 
      } else {
        if(!r.hasOwnProperty('messsage')){
          r.messaage = {};
        }
        socket.send(JSON.stringify({"e":0,"method":json.request,"messages":r.message}));
      }
    });
  },

  //add
  "am": function (socket, json, that) {
    var handler =  function(e,r){
      if (e){
        socket.send(JSON.stringify({"e":1,"method":"am"}));
      } else {
        //console.log('r',r);
        r[0].e = 0;
        r[0].method = json.method;
        //socket.send(JSON.stringify(r[0]));
        // send it to all web clients
        that.emit('web',r[0]);
      }
    }
    if(json.hasOwnProperty('message')){
      //add a message
      dbManager.insert('messages',{'message':json.message, 'request':json.request},handler);
    } else if (json.hasOwnProperty('channel')){
      dbManager.findOne('channels',{'channel':json.channel},function(e,r){
        if(r === null){
          dbManager.insert('channels',{'channel':json.channel, 'listeners':[]},handler);
        } else {
          handler('e','');
        }
      });
    } else {
      //nothing to see here
    }
  },

  //remove
  "rm": function (socket, json, that) {
    var mid = new dbManager.db.bson_serializer.ObjectID(json._id);
    dbManager.remove('messages',{_id:mid},{},function(e,r){
      that.emit('web',{"e":0,"method":"rm","id":json._id, "rowIndex":json.rowIndex});
    });
  },

  //update
  "ud": function (socket, json, that) {
    dbManager.update();
  },

  //subscribe
  "sub": function (socket, json) {
    dbManager.update('channels',{'channel':json.channel},{ $addToSet: {'listeners':socket.id }},function(e,r){
      if(e){
        socket.send(JSON.stringify({"e":1,"method":"sub", "channel":json.channel}));
      } else {
        socket.send(JSON.stringify({"e":0,"method":"sub", "channel":json.channel}));
      }
    });
  },

  //unsubscribe
  "unsub": function (socket, json) {
    var dbObj = {}
    dbObj.listeners = socket.id;
    dbManager.update('channels',{'channel':json.channel},{ $pull: dbObj },function(e,r){
      if(e){
        socket.send(JSON.stringify({"e":1,"method":"unsub", "channel":json.channel}));
      } else {
        socket.send(JSON.stringify({"e":0,"method":"unsub", "channel":json.channel}));
      }
    });
  },

  //fetch
  "fetch": function (socket, json) {
    dbManager.find('messages',{},{},function(e,r){
      if(e){
       socket.send(JSON.stringify({"e":1,"method":"fetch"})); 
      } else {
        dbManager.find('channels',{},{},function(e,c){
          if(e){
           socket.send(JSON.stringify({"e":1,"method":"fetch"})); 
          } else {
            if(r){
              socket.send(JSON.stringify({"e":0,"method":"fetch","messages":r, "channels":c}));
            }
          }
        });
      }
    });
  },

  //beep
  "beep": function (socket, json, that) {
     console.log('beep',json);
     dbManager.findOne('channels',{'channel':json.channel},{'_id':0,'channel':0},function(e,r){
      if(e){
        
      } else {
        console.log('r',r);
        if(r){
          if(r.listeners.length > 0){
            console.log(that, {'l':r.listeners,'m':json.message});
            that.emit('broadcast',{'l':r.listeners,'m':json.message});
            //socket.send()
          }
        } else {

        }
      }
    });

  },

  //socket disconnects
  "disconn" : function (json) {
    console.log('disconn');
    dbManager.update('channels',{ listeners: { $all: [ json.id ] } },{ $pull: {listeners : json.uid }},{safe: false, multi: true});
  },

  //server status
  "ss": function (socket) {
    socket.send(JSON.stringify({
      pid: process.pid,
      memory: process.memoryUsage(),
      uptime:process.uptime()
    }));
  }
};
module.exports = wscentral;
