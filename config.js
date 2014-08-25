/*
  Settings
 *
  mongoDB properties as per mal module
*/

exports.settings = {
  host : "localhost",
  port : 8080,
  mongoDB :{
    host: "",
    port:,
    db: "",
    options: {
      auto_reconnect: true
    },
    username: "",
    password: ""
  }
};

/*
 *
 DB Setup
 *
  db.createCollection('messages');
  db.createCollection('channels');
  db.messages.insert({'request':'foo','message':{'test':'test'}});
  db.channels.insert({'channel':'A','listeners':[]});
  db.channels.ensureIndex({channel:1});
  db.messages.ensureIndex({request:1});
*/
