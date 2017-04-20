console.log("Succ Load");

var fs = require('fs');
var express = require('express');
var app = express();

//Landing Page
app.get('/', function(req, res) {
  fs.readFile('landing/landing.html',function (err, data){
        res.writeHead(200, {'Content-Length' : ""});
        res.write(data);
        res.end();
    });
});
app.listen((process.env.PORT || 8080));
