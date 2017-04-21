console.log("Succ Load");

var fs = require('fs');
var express = require('express');
var app = express();

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
    res.write("Succ");
    res.write("Key: " + req.query.key);
    res.write("Action: " + req.query.action);
    res.end();
});

app.listen((process.env.PORT || 8080));
