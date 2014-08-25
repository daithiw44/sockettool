//Connection test.
var MAL = require('../lib/mal').MAL
, http = require('http');

// settings object (username and password are not compulsory)
var dbsettings = {
  host: 'localhost',
  port: 27017,
  db: 'maltest',
  options: {auto_reconnect: true}
};

function testConnection (){
  //test successful connection
  if(this.db.hasOwnProperty('serverConfig')){
    if(this.db.serverConfig.connected === true){
      console.log('> 0 - true');
    } else {
      console.log('> 0 - false');
    }
  //test connected to correct DB.
    if(this.db.databaseName === dbsettings.db){
      console.log('> 1 - true');
    } else {
      console.log('> 1 - false');
    }
  } else {
    console.log('> 0 - false');
    console.log('> 1 - false');
  }
  var end = Date.now();
  var x = end - start;

  console.log('End of test0.js');
  console.log('----------------');
  console.log('Expected behaviour :');
  console.log('> 0 - true');
  console.log('> 1 - true');
  console.log('----------------');
  console.log('THE TIME TO OPEN AND AUTH IS : ', x, 'ms')
  console.log('FOR THE NEXT TESTS SET var time >', x);
  console.log('----------------');
  process.exit();
}
var start = Date.now();
console.log('Begin test0...');
var dbManager = new MAL(dbsettings, testConnection);

