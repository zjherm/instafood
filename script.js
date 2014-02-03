var util = require('util'),
  http = require('http'),
  express = require('express'),
  ejs = require('ejs'),
  app = express(),
  Instagram = require('instagram-node-lib');

//Listen on port 3000
var port = process.env.PORT || 3000;
var server = app.listen(port);
var io = require('socket.io').listen(server);

//This is required to work on Heroku; it defaults to long polling; actual web-sockets not supported
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

Instagram.set('client_id', '70393263f72f44cc9a3ef9786a4d389f');
Instagram.set('client_secret', 'fa2725e2a08a4158bad297f35b5c6bec');
Instagram.set('callback_url', 'http://instafood.herokuapp.com/endpoint');


app.use(express.static(__dirname + '/app'));
app.set('views', __dirname + '/views/');
app.engine('html', require('ejs').renderFile);

app.use(express.logger());

app.post('/endpoint', function (req, res) {
     var body = "";
        req.on('data', function (chunk) {
          console.log('chunk');
          body += chunk;
        });
        req.on('end', function () {
          console.log('end');
          getPhoto(body);
          res.writeHead(200);
          res.end();
        });
});

app.get('/endpoint', function (req, res){
    Instagram.subscriptions.handshake(req, res); 
});

app.get('/', function(req, res) {
    Instagram.subscriptions.subscribe({ object: 'tag', object_id: 'fun' });
    console.log(Instagram.subscriptions.list());

});
function getPhoto(body){
  console.log("=======================BODY========================");
  console.log(body);
  console.log("====================END BODY=======================");
}


