//Geo
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
      dbManager.universalMethod('ensureIndex',['irishcities',{loc:"2d"}, function(err, result){justAfter();}]);
     // ******** OR ********
     // dbManager.ensureIndex('irishcities',{loc:"2d"}, function(err, result) {
       // justAfter();
      // });
     });
  });
});

function justAfter(){
  var options = {maxDistance:2, num:2};
  dbManager.geoNear('irishcities',51.535,-8.2812,options,function(err,result){
    console.log('City of ',result.results);
    process.exit();
  });
};

/*Options
- num {Number}, max number of results to return.
- maxDistance {Number}, include results up to maxDistance from the point.
- distanceMultiplier {Number}, include a value to multiply the distances with allowing for range conversions.
- query {Object}, filter the results by a query.
- spherical {Boolean, default:false}, perform query using a spherical model.
- uniqueDocs {Boolean, default:false}, the closest location in a document to the center of the search region will always be returned MongoDB > 2.X.
- includeLocs {Boolean, default:false}, include the location data fields in the top level of the results MongoDB > 2.X.
- readPreference {String}, the preferred read preference ((Server.PRIMARY, Server.PRIMARY_PREFERRED, Server.SECONDARY, Server.SECONDARY_PREFERRED, Server.NEAREST).*/
