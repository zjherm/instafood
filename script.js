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

Instagram.set('client_id', 'd7951fa482ef45848e31c4bf564fd7ac');
Instagram.set('client_secret', 'bc17e4765fa14d8ea532b091529f48b5');
Instagram.set('callback_url', 'http://instafood.herokuapp.com/endpoint');



// app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/Public'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(express.logger());

app.post('/endpoint', function (req, res) {
     var body = "";
        req.on('data', function (chunk) {
          console.log('chunk');
          console.log('this is the chunk ' + chunk);
          body += chunk;
          console.log('this is the body ' + body);
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
app.get('/', function(req, res){
      res.render('index.ejs', {
      layout:false,
      locals: { 
        someVariable: "Live Hashtags for #breakfast"
         }
      });
  });
app.get('/set_sub', function(req, res) {
  // #food subscription
    Instagram.subscriptions.subscribe({ object: 'tag', object_id: 'foodporn' });
    //Instagram.subscriptions.subscribe({ object: 'geography', lat: 32.7150, lng: 117.1625, radius: 1000 });
    console.log(Instagram.subscriptions.list());
    res.writeHead(200);
    res.end();
});
app.get('/cancel_sub', function(req, res) {
    Instagram.tags.subscriptions.unsubscribe_all();
    console.log(Instagram.subscriptions.list());
    res.writeHead(200);
    res.end();
});



function getPhoto(inf){
  inf = JSON.parse(inf); //Pasrse the JSON
  prt = inf[0]; // Grab the first object, IG sends about 20..
  console.log(prt);
  console.log("=======================BODY========================");
  Instagram.tags.recent({
    name: prt.object_id,
    complete: function(data){
        if(data[0] == null){
        }else{
          var piece = {};
          piece.img = data[0].images.standard_resolution.url;
          piece.url = data[0].link;
          piece.long = data[0].location.longitude;
          piece.lat = data[0].location.latitude;
          piece.caption = data[0].caption.text;
          piece.username = data[0].user.username;
          piece.userpic = data[0].user.profile_picture;
          piece.comments = data[0].comments.data;
          piece.tags = data[0].tags;
          io.sockets.emit('photo', piece);
        }
    }
  });
  console.log("====================END BODY=======================");
}
