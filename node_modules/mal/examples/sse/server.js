var stream = require('stream')
,es = require('event-stream')
, fs = require('fs')
, MAL = require('../../lib/mal').MAL
, http = require('http');

// settings object (username and password are not compulsory, remove from object if not required)
/*var dbsettings = {
  host: '>>>>> HOST <<<<<<<'
  ,port: 1234567
  ,db: '>>>> DB <<<<<<'
  , options: {auto_reconnect: true}
  ,username: '',
  ,password: ''
};*/
var dbsettings = {
	  host: '',
	  port: ,
	  db: '',
    options: {auto_reconnect: true},
	  username: '',
	  password: ''
};

var dbManager = new MAL(dbsettings, '');
var server = http.createServer(function(req, res) {
  if (req.url === '/') {
    fileName = 'index.html';
    var out = fs.createReadStream(fileName);
    out.pipe(res);
  } else if (req.url === '/stream') {
    console.log('stream');
    //Insert Collection here, pass http res.
    dbManager.streamEvents('Tweets',res);
    var start = Date.now();
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    //flush headers
    res.write('');
  }
});

server.listen(5000);
