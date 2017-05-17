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

var apiai = require('apiai');
app.get('/api/apiai', function(req, res) {
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

  var apiaiapp = apiai(''+process.env.apiaikey);
  var request = apiaiapp.textRequest(decodeURI(req.query.message), {
    sessionId: req.query.id
  });
  request.on('response', function(response) {
      console.log('Api.ai response:\n' + response);
      app.set('json spaces', 2);
      res.json(response)
      res.end();
  });
  request.on('error', function(error) {
    console.log("API AI ERROR");
    console.log(error);
  });
  request.end();

});


//TEst-----------------------------------------------------------------------------------
require('es6-promise').polyfill();

var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var urlParse  = require('url').parse;
var googleTTS = require('google-tts-api');

function downloadFile (url, dest) {
  return new Promise(function (resolve, reject) {
    var info = urlParse(url);
    var httpClient = info.protocol === 'https:' ? https : http;
    var options = {
      host: info.host,
      path: info.path,
      headers: {
        'user-agent': 'WHAT_EVER'
      }
    };

    httpClient.get(options, function(res) {
      // check status code
      if (res.statusCode !== 200) {
        reject(new Error('request to ' + url + ' failed, status code = ' + res.statusCode + ' (' + res.statusMessage + ')'));
        return;
      }

      var file = fs.createWriteStream(dest);
      file.on('finish', function() {
        // close() is async, call resolve after close completes.
        file.close(resolve);
      });
      file.on('error', function (err) {
        // Delete the file async. (But we don't check the result)
        fs.unlink(dest);
        reject(err);
      });

      res.pipe(file);
    })
    .on('error', function(err) {
      reject(err);
    })
    .end();
  });
}

// start
googleTTS('hello')
.then(function (url) {
  console.log(url); // https://translate.google.com/translate_tts?...

  var dest = path.resolve(__dirname, 'hello.mp3'); // file destination
  console.log('Download to ' + dest + ' ...');

  return downloadFile(url, dest);
})
.then(function () {
  console.log('Download success');
})
.catch(function (err) {
  console.error(err.stack);
});




//Listen
app.listen((process.env.PORT || 8080));
