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
  client.message(req.query.message, {}).then((data) => {
    console.log('Wit.ai response: ' + JSON.stringify(data));
    res.json(data)
    res.end();
  }).catch(console.error);
});
