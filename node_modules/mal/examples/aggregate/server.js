//Aggregate
var MAL = require('../../lib/mal').MAL;
// Easy Way: Fire up a local instance of MongoDB
// settings object (username and password are not compulsory)
var dbsettings = {
  host: 'localhost',
  port: 27017,
  db: 'malexamples',
  options: {auto_reconnect: true}
};

var dbManager = new MAL(dbsettings, function(){
  //clear the collection
  dbManager.remove('irishcities',function(err,result){
  //Irish Cenus 2011 and Others
     var cityData = [
      {
      city: "Dublin",
      province: "Leinster",
      pop: 525383,
      loc: [
        53.43777,
        -6.25972
      ]
    },
    {
      city: "Cork",
      province: "Munster",
      pop: 118912,
      loc: [
        51.5350,
        -8.2812
      ]
    },
    {
      city: "Waterford",
      province: "Munster",
      pop: 46747,
      loc: [
        52.25666,
        -7.12916
      ]
    },
    {
      city: "Galway",
      province: "Connacht",
      pop: 75414,
      loc: [
        53.27194,
        -9.04888
      ]
    },
    {
      city: "Belfast",
      province: "Ulster",
      pop: 281000,
      loc: [
        54.6633,
        -6.2258
      ]
    },
    {
      city: "Limerick",
      province: "Munster",
      pop: 56779,
      loc: [
        53.11472,
        -9.04388
      ]
    }
    ]
    //BULK Insert city Data
     dbManager.insert('irishcities',cityData, {safe:false},function(){
      justAfter();
     });
  });
});

function justAfter(){
  /* Group by Provinces the total populatioon 
    and match those with pop > 10000 */

  //var one = {$group :{ _id : "$province", totalPop : { $sum : "$pop" } } }
  //var two = { $match : {totalPop : { $gte : 10 } } }
  //  ******* OR **********
  var onetwo =[ {$group :{ _id : "$province", totalPop : { $sum : "$pop" } } },{ $match : {totalPop : { $gte : 100000 } } }]
  //Call aggregate function.
  //dbManager.aggregate('names',one,two,function(err,result){
  //  ******* OR **********
  dbManager.aggregate('irishcities',onetwo,function(err,result){
    console.log(result);
    process.exit();
  });
};

/* Full Records
 [ { _id: 'Ulster', totalPop: 281000 },
  { _id: 'Connacht', totalPop: 75414 },
  { _id: 'Munster', totalPop: 222438 },
  { _id: 'Leinster', totalPop: 525383 } ]*/
