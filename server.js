var httpServer, WebSocketServer = require('ws').Server
, http = require('http')
, fs = require('fs')
, config = require('./config');

var port = process.env.www_port || config.settings.port
, wsCentral = require('./lib/wscentral') 
, listeners = require('./lib/listeners')
, ws
, wsCentral = new wsCentral();

httpServer = http.createServer(function(req, res) {
  var filename;
  if (req.url === '/') {
    req.url = '/index.html';
    console.log('page');
  } 
  if (req.url !== '/favicon.ico') {
    console.log('here', req.url);
    filename = (__dirname + '/static' + req.url);
    readStream = fs.createReadStream(filename);
    readStream.pipe(res); 
  }
}).listen(port);

wss = new WebSocketServer({server:httpServer/*port: port*/})

//Events
wss.on('connection', function(ws) {
  // connection
  ws.send('{"e":0,"method":"init"}');
  ws.on('message', function(msg) {
    var json
    //console.log('in - ', msg);
    try {
      json = JSON.parse(msg); // Parse the current string
      if(json.hasOwnProperty('uid')){
        //console.log('uid', json.uid, wsCentral.terminal);
        wsCentral.terminal(ws,json);
      } else {
        //error type 1
        ws.send('{"e":1,"method":"unauthorised request"}');
      }
    } catch (ex) {
      console.log('ex',ex);
      //error type 2
      ws.send('{"e":1,"method":"invalid request"}');
    }
  });

  ws.on('close',function(){
    //console.log('close',ws.uid);
    var index, before, after, json = {};
    if(listeners.hasOwnProperty('web')){
      index = listeners['web'].ws.sockets.indexOf(ws);
      if(listeners['web'].ws.sockets.length > 1){
        if (index !== -1) {
          before = listeners['web'].ws.sockets.slice(0, index);
          after = listeners['web'].ws.sockets.slice(index + 1);
          listeners['web'].ws.sockets = before.concat(after);
        }
      } else {
        delete listeners['web'];
      }
    }
    else if(listeners[ws.id]){
      delete listeners[ws.id];
      json.id = ws.id;
      json.method = 'disconn';
      wsCentral.terminal('',json);
    }
    console.log(listeners);
  });
});
console.log('server started',config.settings.host ,port);

wsCentral.on('broadcast',function(message){
  console.log('broadcast message', message);
  message.l.forEach(function(el,item,larray){
    if(listeners.hasOwnProperty(el)){
      listeners[el].send(JSON.stringify(message.m));
     }
   });
});

wsCentral.on('web',function(message){
  console.log('send web', message);
  listeners['web'].ws.sockets.forEach(function(element, index, array){
    console.log('>>',listeners['web'].ws.sockets.length); 
    element.send(JSON.stringify(message));
  });
});
