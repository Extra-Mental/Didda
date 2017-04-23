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


//API to post announcement
app.get('/steamgroupapi', function(req, res) {

    var Data = "";

    var key = req.query.key;

    if(!key){
      res.write("Unsucc")
      res.end();
      return;
    };
    if(key != process.env.key){
      res.write("Unsucc")
      res.end();
      return;
    };

    Data += "Succ request\n";

    var action = req.query.action
    if(!action){
      res.write(Data + "Action no specified")
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
        community.getSteamGroup("diddabot", function(err, group) {
          if(err){
            console.log("Error retreiving group");
            console.log(err);
            res.write(Data + "Error retreiving group");
            res.end();
            return;
          };
          Data += "Succ retrieved group\n";
          group.postAnnouncement(req.query.heading, req.query.body, function(err){
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

app.listen((process.env.PORT || 8080));
