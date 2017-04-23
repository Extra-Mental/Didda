console.log("Succ Load");

var fs = require('fs');
var express = require('express');
var app = express();
var SteamCommunity = require('steamcommunity');
var community = new SteamCommunity();

//Landing Page
app.use(express.static('landing'));
app.get('/', function(req, res) {
  fs.readFile('landing/landing.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
});

app.get('/steamgroupapi', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});

    var key = req.query.key;

    if(!key){return res.write("Unsucc")};
    if(key != process.env.key){return res.write("Unsucc")};

    res.write("Succ\n");
    res.end();

    var action = req.query.action
    if(!action){return res.write("Action no specified")};

    if(action == "announce"){

      community.login({
		      "accountName": process.env.l,
		      "password": process.env.p
		  }, function(err, sessionID, cookies, steamguard){
        if(err){
          console.log(err);
          res.write("Error logging in");
          res.end();
          return;
        };
        res.write("Succ logged into group\n");
        res.end();
        //process.env.gid
        community.getSteamGroup("103582791458054568", function(err, group) {
          console.log(err);
          group.postAnnouncement("Test", "Hello", function(err){
            console.log(err);
          });
        });

      });

    };
});

app.listen((process.env.PORT || 8080));
