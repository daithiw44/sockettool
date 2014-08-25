function Listener (socket, user_id){
  var _this = this;
  _this.ws = {};
  _this.ws.sockets = [];
  _this.ws.sockets.push(socket);
  _this.ws.user_id = user_id;
};

exports.Listener = Listener;
