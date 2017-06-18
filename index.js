console.log("Succ Load");

var express = require('express');
var app = express();

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

//Wit.ai requests
const {Wit, log} = require('node-wit');
app.get('/api/wit', function(req, res) {
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

  const client = new Wit({accessToken: process.env.witkey});
  client.message(decodeURI(req.query.message), {}).then((data) => {
    console.log('Wit.ai response: ' + JSON.stringify(data));
    app.set('json spaces', 2);
    res.json(data)
    res.end();
  }).catch(console.error);
});

//Telegream webhook handler
var bodyParser = require('body-parser');
var Discord = require('discord.io');
var bot = new Discord.Client({
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
  var ReplyText = req.body.message.reply_to_message.text

  var Msg = "<:telegram:325885123646193666> "
  if(ReplyText){Msg+=" `"+ReplyText+"`\n"}else{return;};
  if(Name){Msg+=Name};
  if(Name2){Msg+=" "+Name2};
  if(Text){Msg+=": "+Text}else{return;};

  bot.sendMessage({to:"325232154290290698", message: Msg},function(err){
    if(err){console.log(err)};
  });

});

//Listen
app.listen((process.env.PORT || 8080));
