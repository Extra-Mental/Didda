console.log("Succ Load");

var fs = require('fs');
var express = require('express');
var app = express();

//Landing Page
app.get('/', function(req, res) {
  fs.readFile('landing/landing.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
});
app.use(express.static('landing'));
//app.use(express.static('landing/'));
//app.use(express.static('landing/'));
//app.use(express.static('landing/'));
app.listen((process.env.PORT || 8080));
