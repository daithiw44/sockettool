//Insert and find test.
var MAL = require('../lib/mal').MAL
, http = require('http');

// settings object (username and password are not compulsory)
var dbsettings = {
  host: 'localhost',
  port: 27017,
  db: 'maltest',
  options: {auto_reconnect: true}
};

var obj = {
  b: 'connected',
  t: new Date()
};
var dbManager = new MAL(dbsettings, function(){
  dbManager.insert('Tests', obj, {},function(err,result) {
    dbManager.find('Tests',{ b: 'connected'},function(err,result1) {
      console.log(result1);
      process.exit();
    });
  });
});
