var shoe = require('shoe');
var stream = shoe('/sock');

stream.on('data',function(buf) {
//  document.body.textContent += buf;
//console.log(buf, '\n\r');
  var el = document.createElement('div');
  el.innerHTML = buf;
  document.getElementById('stream').appendChild(el);
});
