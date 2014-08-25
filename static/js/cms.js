YUI()
  .use('panel', 'node', 'event', 'event-delegate', 'datatable',
    'datatable-paginator', 'tabview', 'escape', 'plugin', function (Y) {
      Y.on("domready", function () {
        var serverName, serverPort, dt, table, timers = {};
        
        /**** Configs *****/
          serverName = 'localhost';
          serverPort = 8080;
        /***********************/

        function mkTable(data) {
          document.getElementById('dtable').innerHTML = "";
          var columns;
          columns = [{
            key: '_id',
            label: '_id ',
            allowHTML: true,
            formatter: function (o) {
              return '<div id="' + o.data._id + '">' + o.data._id +'</div>';
            }
          }, {
            key: 'request',
            label: 'Method'
          }, {
            key: 'message',
            label: 'Message',
            formatter: function (o) {
              return '<textarea cols=50 rows=8 id=ta"'+o.data._id+'">'+JSON.stringify(o.data.message)+'</textarea>';
            },
            allowHTML: true,
            width: '400px'
          }, {
            key: 'send',
            allowHTML: true, // to avoid HTML escaping
            label: '   ',
            formatter: '<input type="button" value="Broadcast"/>'
          }, {
            key: 'delete',
            allowHTML: true, // to avoid HTML escaping
            label: 'Delete',
            formatter: '<input type="button" value="Delete"/>'
          }];
          table = new Y.DataTable({
            columnset: columns,
            recordset: data
          });
          table.render('#dtable');
          table.set('rowsPerPage', 10);
          table.set('paginatorLocation', ['header', 'footer']);
          table.delegate("click", function (e) {
            var obj = {}, rs = e.target.get('_id'),
              target = e.currentTarget,
              rec = table.getRecord(e.target);
            obj._id = rec.get('_id');
            //obj.nodeid = target._node.parentNode.id;
            obj.uid = 'web';
            obj.method = 'rm';
            //rowIndex = Y.Node.getDOMNode(e.currentTarget.get("parentNode")).rowIndex;
            // obj.rowIndex = rowIndex
            //table.removeRow(rowIndex);
            //table.removeRow(obj.rowIndex);
            removeMsg(obj);
            //table.removeRow(target._node.parentNode.id);
            //rowIndex = Y.Node.getDOMNode(e.currentTarget.get("parentNode")).rowIndex;
            //console.log(rowIndex)
          }, ".yui3-datatable-col-delete", dt);
          table.delegate("click", function (e) {
            var msg = {}, rec = table.getRecord(e.target);
            msg._id = rec.get('_id');
            msg.request = rec.get('request');
            msg.message = rec.get('message');
            mkSocketMsg(msg);
            //m
          }, ".yui3-datatable-col-send", dt);
          return table;
        }

        function mkSelect(data) {
          var i, selectOptions = document.createElement("select");
          selectOptions.id = 'selectchanneloptions';
          for (i = 0; i < data.length; i++) {
            selectOptions.appendChild(addToSelect(data[i]));
          }
          document.getElementById('selectchannel').appendChild(selectOptions);
        }

        function addToSelect(data) {
          var opt = document.createElement('option')
          opt.value = data._id;
          opt.innerHTML = data.channel;
          return opt;
        }
        //sockets
        var redSocket = new WebSocket('ws://'+serverName+':'+serverPort, 'protocolOne');
        redSocket.onopen = function (event) {
          var msg = {
            "uid": "web",
            "method": "conn",
            "s": "1"
          };
          redSocket.send(JSON.stringify(msg));
        };
        redSocket.onmessage = function (event) {
          console.log(event.data);
          try {
            socketHandler(JSON.parse(event.data));
          } catch (ex) {
            console.log(ex);
          }
        }

        function socketHandler(data) {
          console.log('socketHandler', data);
          var opt, msg;
          if (+(data.e) === 0) {
            switch (data.method) {
            case 'init':
              break;
            case 'conn':
              msg = {
                "method": "fetch",
                "uid": "web"
              };
              redSocket.send(JSON.stringify(msg));
              break;
            case 'fetch':
              console.log(data);
              table = mkTable(data.messages);
              mkSelect(data.channels);
              break;
            case 'am':
              console.log(data);
              if (data.hasOwnProperty('channel')) {
                opt = addToSelect(data);
                document.getElementById('selectchanneloptions').appendChild(opt);
                document.getElementById('newchannel').style.display = "none";
                document.getElementById('newchannelValue').value = "";
              } else {
                table.addRow({
                  _id: data._id,
                  request: data.request,
                  message: data.message
                });
              }
              break;
            case 'rm':
              document.getElementById(data.id).parentNode.parentNode.style.display = 'none'
              break;
            default:
              document.getElementById('errorwatch').style.display = 'inline';
              document.getElementById('error').innerHTML = 'default ' + data.method;
              break;
            }
          } else {
            document.getElementById('errorwatch').style.display = 'inline';
            document.getElementById('error').innerHTML = data.method;
          }
        }
        //Panel Stuff
        var panel = new Y.Panel({
          srcNode: '#panelContent',
          headerContent: 'Add A New Message',
          width: 400,
          zIndex: 5,
          centered: true,
          modal: true,
          visible: false,
          render: true,
          plugins: [Y.Plugin.Drag]
        });
        panel.addButton({
          value: 'Add Message',
          section: Y.WidgetStdMod.FOOTER,
          action: function (e) {
            e.preventDefault();
            addMsg();
          }
        });
        panel.addButton({
          value: 'Cancel',
          section: Y.WidgetStdMod.FOOTER,
          action: function (e) {
            e.preventDefault();
            Y.one('#message').set('value', '');
            Y.one('#name').set('value', '');
            panel.hide();
          }
        });
        //Panel Stuff
        var bcPanel = new Y.Panel({
          srcNode: '#panelCast',
          headerContent: 'Add a Broadcast',
          width: 500,
          zIndex: 5,
          centered: true,
          modal: true,
          visible: false,
          render: true,
          plugins: [Y.Plugin.Drag]
        });
        bcPanel.addButton({
          value: 'Add Broadcast',
          section: Y.WidgetStdMod.FOOTER,
          action: function (e) {
            e.preventDefault();
            createBroadcast();
          }
        });
        bcPanel.addButton({
          value: 'Cancel',
          section: Y.WidgetStdMod.FOOTER,
          action: function (e) {
            e.preventDefault();
            bcPanel.hide();
          }
        });

        function addMsg() {
          var msg = {};
          msg.uid = 'web';
          msg.method = 'am';
          msg.message = JSON.parse(Y.one('#message').get('value'));
          msg.request = Y.one('#name').get('value');
          redSocket.send(JSON.stringify(msg));
          panel.hide();
        }

        function removeMsg(msg) {
          redSocket.send(JSON.stringify(msg));
        }

        function createBroadcast() {
          var ider, textarea, ping, close, spinner, tinput, tbtn, divc, divcT, div0,
            fragment = document.createDocumentFragment(),
            div = document.createElement('div'),
            e = document.getElementById("selectchanneloptions"),
            channel = e.options[e.selectedIndex].text;
          ider = getId();
          div.id = 'bcdiv_' + ider;
          fragment.appendChild(div);
          divc = document.createElement('div');
          divc.id = 'channel_' + ider;
          divcT = document.createTextNode('Channel ' + channel);
          divc.appendChild(divcT);
          div.className = 'broadcaster';
          textarea = document.createElement('textarea');
          textarea.name = 'post';
          textarea.maxLength = '5000';
          textarea.cols = '40';
          textarea.rows = '5';
          textarea.value = document.getElementById('bcmessage').value;
          textarea.id = 'bcta_' + ider
          ping = document.createElement('input');
          ping.type = 'button';
          ping.value = 'ping';
          ping.className = 'bcping'
          ping.id = 'bcp_' + ider;
          close = document.createElement('input');
          close.type = 'button';
          close.value = 'close';
          close.className = 'bcclose'
          close.id = 'bcc_' + ider;
          tinput = document.createElement('input');
          tinput.type = 'text';
          tinput.value = 10000;
          tinput.id = 'tinput_' + ider;
          tbtn = document.createElement('input');
          tbtn.type = 'button';
          tbtn.value = 'ms spin';
          tbtn.className = 'bctbtn'
          tbtn.id = 'bctb_' + ider;
          div0 = document.createElement('div');
          div.appendChild(divc);
          div.appendChild(textarea);
          div0.appendChild(close);
          div0.appendChild(ping);
          div0.appendChild(tinput);
          div0.appendChild(tbtn);
          div.appendChild(div0);
          document.getElementById('bctools').appendChild(div);
          bcPanel.hide();
          document.getElementById('bcmessage').value = '';
        }
        Y.delegate('click', function (e) {
          var el_Id, el_Cls, el = e.target.get('id'),
            msg, val;
          switch (el) {
          case 'addmsg':
            panel.show();
            break;
          case 'addbc':
            bcPanel.show();
            break;
          case 'addchannel':
            document.getElementById('newchannel').style.display = 'block';
            break;
          case 'csendchannel':
            document.getElementById('newchannel').style.display = 'none';
            document.getElementById('newchannelValue').value = '';
            break;
          case 'sendchannel':
            val = document.getElementById('newchannelValue').value;
            if (val !== '') {
              msg = {};
              msg.uid = 'web';
              msg.method = 'am';
              msg.channel = val;
              redSocket.send(JSON.stringify(msg));
            }
            break;
          default:
            el_Cls = e.target.get('className');
            el_Id = e.target.get('id')
              .split('_')[1]
            switch (el_Cls) {
            case 'bcclose':
              bcClose(el_Id);
              break;
            case 'bcping':
              bcPing(el_Id);
              break;
            case 'bctbtn':
              bcTimer(el_Id);
              break;
            default:
              break;
            }
            break;
          }
        }, '#container', 'input[type=button]');

        function bcPing(coreId) {
          redSocket.send(JSON.stringify(mkBeep(coreId)));
        }

        function bcClose(coreId) {
          var div = document.getElementById('bcdiv_' + coreId);
          if (timers.hasOwnProperty(coreId)) {
            clearInterval(timers[coreId])
            delete timers[coreId];
          }
          document.getElementById('bctools').removeChild(div);
        }

        function bcTimer(coreId) {
          mkTimer(coreId);
        }

        function mkBeep(coreId) {
          var msg = {};
          msg.method = 'beep';
          msg.uid = 'web';
          msg.message = JSON.parse(document.getElementById('bcta_' + coreId).value);
          msg.channel = document.getElementById('channel_' + coreId).innerHTML.split(' ')[1];
          return msg;
        }

        function mkTimer(coreId) {
          var timerVal;
          if (timers.hasOwnProperty(coreId)) {
            clearInterval(timers[coreId])
            delete timers[coreId];
            document.getElementById('bctb_' + coreId)
              .value = 'ms spin';
            document.getElementById('tinput_' + coreId)
              .disabled = 'false';
          } else {
            // timer field
            timerVal = document.getElementById('tinput_' + coreId)
              .value;
            //create an entry in the timer obj
            timers[coreId] = setInterval(function () {
              bcPing(coreId);
            }, timerVal);
            document.getElementById('bctb_' + coreId).value = 'stop';
            document.getElementById('tinput_' + coreId).disabled = 'true';
          }
        }

        function mkSocketMsg(data) {
          /*tab = new Y.Tab({
        label: data.request,
        content: '<div><textarea cols="30" rows="10" id="">'+JSON.stringify(data.message)+'</textarea></div>'
      });
      tabview.add(tab);
      console.log(tab);*/
          document.getElementById('bcmessage').value = JSON.stringify(data.message);
          bcPanel.show();
        }
        //unique id maker
        var getId = (function () {
          var incrementingId = 0;
          return function () {
            return incrementingId++;
          };
        }());
      });
    });
/*var Addable = function(config) {
        Addable.superclass.constructor.apply(this, arguments);
    };

    Addable.NAME = 'addableTabs';
    Addable.NS = 'addable';

    Y.extend(Addable, Y.Plugin.Base, {
        ADD_TEMPLATE: '<li class="yui3-tab" title="add a tab">' +
                    '<a class="yui3-tab-label yui3-tab-add">+</a></li>',

        initializer: function(config) {
            var tabview = this.get('host');
            tabview.after('render', this.afterRender, this);
            tabview.get('contentBox')
                .delegate('click', this.onAddClick, '.yui3-tab-add', this);
        },

        getTabInput: function() {
            var tabview = this.get('host');
            return {
                label: Y.Escape.html(window.prompt('label:', 'new tab')),
                content: '<p>' + Y.Escape.html(window.prompt('content:', 'new content')) + '</p>',
                index: Number(window.prompt('index:', tabview.size()))
            }
        },

        afterRender: function(e) {
            var tabview = this.get('host');
            tabview.get('contentBox').one('> ul').append(this.ADD_TEMPLATE);
        },

        onAddClick: function(e) {
            e.stopPropagation();
            var tabview = this.get('host');
                //input = this.getTabInput();
            //tabview.add(input, input.index);
            mkSocketMsg({request:'new',message:''})
        }
    });

    var Removeable = function(config) {
        Removeable.superclass.constructor.apply(this, arguments);
    };

    Removeable.NAME = 'removeableTabs';
    Removeable.NS = 'removeable';

    Y.extend(Removeable, Y.Plugin.Base, {
        REMOVE_TEMPLATE: '<a class="yui3-tab-remove" title="remove tab">x</a>',

        initializer: function(config) {
            var tabview = this.get('host'),
                cb = tabview.get('contentBox');

            cb.addClass('yui3-tabview-removeable');
            cb.delegate('click', this.onRemoveClick, '.yui3-tab-remove', this);

            // Tab events bubble to TabView
            tabview.after('tab:render', this.afterTabRender, this);
        },

        afterTabRender: function(e) {
            // boundingBox is the Tab's LI
            e.target.get('boundingBox').append(this.REMOVE_TEMPLATE);
        },

        onRemoveClick: function(e) {
            e.stopPropagation();
            var tab = Y.Widget.getByNode(e.target);
            tab.remove();
        }
    });

    var tabview = new Y.TabView({
      plugins: [Addable, Removeable]
    });
    tabview.render('#socketmessages');
*/
