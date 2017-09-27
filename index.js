console.log("Succ Load");

var express = require('express');
var app = express();
var request = require('request');
var fs = require("fs");
const download = require('image-downloader')


//Landing Page
var fs = require('fs');
app.use(express.static('landing'));
app.get('/', function(req, res) {
  fs.readFile('landing/landing.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
});

//API to post announcement
var SteamCommunity = require('steamcommunity');
var community = new SteamCommunity();
app.get('/api', function(req, res) {//Need to change this to /api/steamgcommunity

    var Data = "";

    var key = req.query.key;

    if(!key){
      res.write("Error: Key missing")
      res.end();
      return;
    };
    if(key != process.env.key){
      res.write("Error: Invalid key")
      res.end();
      return;
    };

    Data += "Succ request\n";

    var action = req.query.action
    if(!action){
      res.write(Data + "Error: Action no specified")
      res.end();
      return;
    };

    if(action == "announce"){

      community.login({
		      "accountName": process.env.l,
		      "password": process.env.p
		  }, function(err, sessionID, cookies, steamguard){
        if(err){
          console.log("Error logging in");
          console.log(err);
          res.write(Data + "Error logging in");
          res.end();
          return;
        };
        Data += "Succ logged into group\n";
        //process.env.gid
        community.getSteamGroup(decodeURI(req.query.groupid), function(err, group) {
          if(err){
            console.log("Error retreiving group");
            console.log(err);
            res.write(Data + "Error retreiving group");
            res.end();
            return;
          };
          Data += "Succ retrieved group\n";
          group.postAnnouncement(decodeURI(req.query.title), decodeURI(req.query.body), function(err){
            if(err){
              console.log("Error posting announcement");
              console.log(err);
              res.write(Data + "Error posting announcement")
              res.end();
              return;
            };
            Data += "Succ posted announcement\n";
            res.write(Data)
            res.end()
          });
        });
      });

    };

});

//Telegream webhook handler
var bodyParser = require('body-parser');
var Discord = require('discord.io');
var disbot = new Discord.Client({
  token: process.env.discordkey,
  autorun: true
});
app.use(bodyParser.json());
app.post('/api/telegramwebhook', function(req, res) {
  var token = req.query.token;
  if(!token){
    res.write("Error: Key missing")
    res.end();
    return;
  };
  if(token != process.env.telegramkey){
    console.log("Telegram Webhook Error: Invalid key")
    res.write("Error: Invalid key")
    res.end();
    return;
  };

  res.status(200);
  res.send();

  console.log("Telegram Webhook: Successful query")
  console.log(JSON.stringify(req.body))
  var Name = req.body.message.from.first_name
  var Name2 = req.body.message.from.last_name
  var Text = req.body.message.text
  var ValidReply = req.body.message.reply_to_message
  if (ValidReply) {
    var ReplyText = ValidReply.text
    var From = req.body.message.reply_to_message.from.first_name
    var From2 = req.body.message.reply_to_message.from.last_name
  }
  var Sticker = req.body.message.sticker

  if(Sticker){
    var API = "https://api.telegram.org/bot"+process.env.telegramkey
    var Args = "/getfile?file_id="+req.body.message.sticker.file_id
    request(API+Args, function (error, response, body) {
      if(error){console.log(error)}

      var Link = JSON.parse(body)
      var File = "https://api.telegram.org/file/bot"+process.env.telegramkey+"/"+Link.result.file_path

      download.image({url: File, dest:"/tmp"}).then(({ filename, image }) => {
        console.log('File saved to', filename)
        var Msg = "<:telegram:325885123646193666> **"
        if(Name){Msg+=Name};
        if(Name2){Msg+=" "+Name2};
        Msg+="**"

        disbot.uploadFile({to:"325232154290290698", file: filename, message: Msg},function(err){
          if(err){console.log(err)};
        });
      }).catch((err) => {
        throw err
      })

    });
    return;
  };

  var Msg = "<:telegram:325885123646193666> "
  if(ValidReply){
    Msg+="`"
    if(From){Msg+=From};
    if(From2){Msg+=" "+From2};
    Msg+=": "+ReplyText
    Msg+="`\n"
  };
  if(Name){Msg+="**"+Name+"**"};
  if(Name2){Msg+=" **"+Name2+"**"};
  if(Text){Msg+=": "+Text}else{return;};

  disbot.sendMessage({to:"325232154290290698", message: Msg, tts:true},function(err){
    if(err){console.log(err)};
  });

});

//Event for messages in discord

disbot.on('message', function(user, userID, channelID, message, event){

  console.log("UID: " + userID)

  if(userID == 325240477290856450){return;};

  console.log("Sending message to telegram")
  var API = "https://api.telegram.org/bot"+process.env.telegramkey
  var Args = '/sendmessage?chat_id=-112659114&parse_mode=markdown&text='+encodeURIComponent("*"+user+"*: "+message)

  request(API+Args, function (error, response, body) {
    if(error){console.log(error)}
  });

});


//Bright Spark Relay API

app.get('/api/bsrelay', function(req, res) {
  var key = req.query.key;
  if(!key){
    res.write("Error: Key missing")
    res.end();
    return;
  };
  if(key != process.env.key){
    res.write("Error: Invalid key")
    res.end();
    return;
  };

  var ChannelID = req.query.channelid;
  if(!ChannelID){
    res.write("Error: No ChannelID")
    res.end();
    return;
  };

  var Msg = req.query.message;
  if(!Msg){
    res.write("Error: No Message")
    res.end();
    return;
  };

  disbot.sendMessage({to:""+ChannelID, message: Msg, tts:false},function(err){
    if(err){console.log(err)};
  });

});

//Listen
app.listen((process.env.PORT || 8080));
