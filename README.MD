# Socket Test.

###  1.0 Configuration. 

#####  1.1 Server Settings.

file: config.js.

This is set up to point to a mongoLab db... it has some data in it and will work out of the box, so might be easier.

```
exports.settings = {
  host : "localhost",
  port : 8080,
  mongoDB :{
    host: "***mongo",
    port: ***,
    db: "***",
    options: {
      auto_reconnect: true
    },
    username: "**",
    password: "**"
  }
};

/*
 DB Setup
 *
  db.createCollection('messages');
  db.createCollection('channels');
  db.messages.insert({'request':'foo','message':{'test':'test'}});
  db.channels.insert({'channel':'A','listeners':[]});
  db.channels.ensureIndex({channel:1});
  db.messages.ensureIndex({request:1});
*/
```
##### 1.2 Client.

file: static/js/cms.js

```
/**** Configs *****/
  serverName = 'localhost';
  serverPort = 8080;
/***********************/
```


#### 2.0 Messages

#####2.1 Format

######2.1.1 Send

	uid : the user id  *required for all requests.
	method  : the method to be called
	

######2.1.2 Receive

e:  will contain 0 or 1
	
receive (success)

```
{"e":0,"method":"xyz","uid":"44"}
```
receive (fail)

(see footnote 2)

```
{"e":1,"m":"method doesn't exist"}
```


#####2.2 Socket Connection and Usage Sequence.

######2.2.1 Open connection.

response

```
{"e":0,"method":"init"}
```

######2.2.1 Validate connection.

send

```
{"uid":"44","method":"conn"}
```
receive (success) e = 0

```
{"e":0,"method":"conn","uid":"44"}
```
receive (fail) e = 1

```
{"e":1,"m":"method doesn't exist"}
```

#####2.3 Custom Messages.

(see footnote 1)

Messages are added and removed via a UI. Use the add messages button to create messages, these are stored in the table and retrieved, following a successful conn with a uid, via requests over sockets to the server.

All custom request methods use get. (I might change this to use method name in the table column and some simple indicator to identify the request as a get from the database.)

Example. 

{"uid":"44","method":"get","request":"foo"}

where uid is the user id the conn was made with. 

Response will be 

{"e":0,"method":"foo","messages":{"test":"test"}}

#####2.3 Broadcasts.

(see foot note 1)

Taking the json from the custom messages table message column but using the broadcast button on the smae row or by clicking the create broadcast button. A modal window will appear allowing the creation of a new broadcast message. A broadcast message requires a message (textarea) and a channel(dropdown).

######2.3.1 Creating Broadcasts

A broadcast message will be sent out over a channel. Channels are subscribed to and unsubscribed to. (see 2.3.3)

If the broadcast button from the table was clicked the message field of the modal will be pre-populated with the JSON from the corresponding message column. If the new broadcast button is clicked its a blank sheet.

The channel is selected (or a new one created)
The JSON is present or inserted it can be amended

######2.3.2 Broadcast tool.

On the click of the new broadcast button in the create broadcast a new block appears in the Broadcast tools columm, comprising of a header, textarea with editable JSON text, a close button, a ping button, an editable text field for milli-seconds (pre-populated with 10000 ms) and a spin button.

######Header.

The selected Channel appears in the head of the broadcast box.
The JSON is 

######Textarea.

Contains JSON (this JSON is editable so in between pings and spin cycles values in the JSON can be altered to simulate real live changing data)

######Close button.

Kills the broadcast tool, (also removes an active spin for the channel)

######Ping button.

On click will broadcast to the selected channel the JSON in the textarea.

###### Textbox milliseconds / Spin button

Textbox contains the number of milliseconds, defaulted to 10000ms, the value inserted here will be used to determine the interval used between messages when the spin option is used.

Spin used a setInterval to automatically send out messages to the selected channel. The spin can be stopped and the interval cleared by clicking the stop button.


######2.3.3 Subscribe Unsubscribe

Channels can be sub scribed or unsubscribed to.

######Subscribe

To subscribe - method = sub and channel = to the required channel.

example.

request:

{"uid":"44", "method":"sub", "channel" :"D"}

successful response. (messages from this channel will now be received)

{"e":0,"method":"sub","channel":"D"}

unsuccessful response. (e=1)

{"e":1,"method":"sub","channel":"D"}

######Unubscribe

To unubscribe - method = unsub and channel = to the required channel.

example.

request:

{"uid":"44", "method":"unsub", "channel" :"D"}

successful response. (messages from this channel will now nolonger be recieved)

{"e":0,"method":"unsub","channel":"D"}

unsuccessful response.

{"e":1,"method":"unsub","channel":"D"}


### Footer

note 1. If there is a JSON format issue in inserting/modify JSON values... I haven't set up error messages for this, so... nothing will happen you just won't be able to proceed.

note 2. In customer messages unless you include e:0 ir e:1 it won't be in the message you receive.

note 3. On some errors there is, at the top left of the page an error div, that will appear from time to time. Had plans for it for Errors but haven't gotten to it yet.

