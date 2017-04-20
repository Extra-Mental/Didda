console.log("Succ Load");


var express = require('express');
var app = express();

//Landing Page
app.set('port', (process.env.PORT || 8080))
app.get('/', function(req, res) {
  fs.readFile('landing/landing.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
});
app.listen(app.get('port'));
