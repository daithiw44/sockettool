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

var dbManager = new MAL(dbsettings);

/*
 * Allow Connection to be established so we use a timeout as assigned to the time variable.
 *  SET time >>>> based on test0.js
 */
/*********************/
// My home internet speed is better so setting this to 2 secs.
// change this based on test0.js
var time = 2000;
/*********************/

setTimeout(function(next) {
  console.log('Begin Running Tests...');
  var test1 = function() {
    console.log('begin test2... Query: find (toArray) on empty collection');
    dbManager.find('Tests100', {},{},{limit: 10}, function(err,results) {
      if (results.length === 0) {
        console.log('> test 2 - true : count = 0 on', results);
      } else {
        console.log('> test 2 - false: count > 0 ', results);
      }
      if (typeof next === 'function') {
        next();
      } else {
        console.log('End of test2.js');
        console.log('----------------');
        console.log('Expected behaviour :');
        console.log('> test 2 - true : count = 0 on []');
        process.exit();
      }
    });
  };

   //Begin.
  test1();
},time);
