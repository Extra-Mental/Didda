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

    if(!key){return res.write("Unsucc")};
    if(key != process.env.key){return res.write("Unsucc")};

    Data += "Succ request\n";

    var action = req.query.action
    if(!action){return res.write(Data + "Action no specified")};

    if(action == "announce"){

      community.login({
		      "accountName": process.env.l,
		      "password": process.env.p
		  }, function(err, sessionID, cookies, steamguard){
        if(err){
          console.log("Error logging in");
          console.log(err);
          res.write(Data + "Error logging in");
          return;
        };
        Data += "Succ logged into group\n";
        //process.env.gid
        community.getSteamGroup("diddabot", function(err, group) {
          if(err){
            console.log("Error retreiving group");
            console.log(err);
            res.write(Data + "Error retreiving group");
            return;
          };
          Data += "Succ retrieved group\n";
          group.postAnnouncement("Test", "Hello", function(err){
            if(err){
              console.log("Error posting announcement");
              console.log(err);
              res.write(Data + "Error posting announcement")
              return;
            };
            Data += "Succ posted announcement\n";
          });
        });
        res.write(Data)
      });

    };

});

app.listen((process.env.PORT || 8080));
