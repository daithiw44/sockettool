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
// My home internet speed is shit so setting this to 20 secs.
// change this based on test0.js
var time = 20000;
/*********************/

setTimeout(function() {
  console.log('Begin Running Tests...');
  var test0 = function() {
    console.log('begin test0... add 10 records');
    var i = 0;
    for (i = 0; i < 10; i++) {
      insertInTo(i);
    }
  };

  function insertInTo(i) {
    var obj = {
      a: i
    };
    dbManager.insert('Tests', obj, {},function(err,result) {
      if (i === 9) {
        test1(test2);
      }
    });
  }

  var test1 = function(next) {
    console.log('begin test1... count records');
    dbManager.find('Tests', {},{},{limit: 10}, function(err,results) {
      if (results.length === 10) {
        console.log('> test 1 - true : count = ', results.length);
      } else {
        console.log('> test 1 - false: count = ', results.length);
      }
      if (typeof next === 'function') {
        next();
      } else {
        console.log('End of test1.js');
        console.log('----------------');
        console.log('Expected behaviour :');
        console.log('> test 1 - true : count = 10');
        console.log('> test 1 - false : count = 0');
        process.exit();
      }
    });
  };

  var test2 = function() {
    console.log('begin test2... remove records');
    dbManager.remove('Tests', {},{safe: true},function(err, results) {
      if (err) {console.log(err);}
      else {
        test1();
      }
    });
  };
  //Begin.
  test0();
},time);
