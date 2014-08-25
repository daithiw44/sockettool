//Aggregate test5
var MAL = require('../lib/mal').MAL;

// settings object (username and password are not compulsory)
var dbsettings = {
  host: 'localhost',
  port: 27017,
  db: 'maltest',
  options: {auto_reconnect: true}
};

var dbManager = new MAL(dbsettings, function(){
  //clear the collection
  dbManager.remove('names',function(err,result){
    //Insert two records
    dbManager.insert('names',{handle:'daithi44', user_id:1}, function(err,result){
      dbManager.insert('names',{handle:'zigor_uriate', user_id:0}, function(err,result){
        //Build our aggregation object.
        //Turns handles to upper and sort by user_id;
        var obj1 = [
          { $project : { handle:{$toUpper:"$handle"} , user_id:1,  _id:0 } },
          { $sort : { user_id : 1 } }
        ];
        //Call aggregate function.
        dbManager.aggregate('names',obj1,function(err,result){
          console.log(result);
          process.exit();
        });
      });
    });
  });
});

