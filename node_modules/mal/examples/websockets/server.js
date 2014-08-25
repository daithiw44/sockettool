var http = require('http')
, MAL = require('mal').MAL;
// settings object (username and password are not compulsory)
var dbsettings = {
  host: 'localhost',
  port: 27017,
  db: 'test',
  options: {auto_reconnect: true},
  username: 'test',
  password: 'test'
};

var dbManager = new MAL(dbsettings, '');

var server = http.createServer(require('ecstatic')(__dirname + '/static'));
server.listen(8005);

var shoe = require('shoe');

var sock = shoe(function (stream) {
  dbManager.streamPipe('Tweets',{},{},{},stream);
});

sock.install(server, '/sock');
