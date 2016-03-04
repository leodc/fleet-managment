/*
    MODULE DEPENDENCIES
*/
var express = require('express');
var app = express();
var http = require('http').Server(app);


/*
    WEB SERVICE LISTENING PORT
*/
var LISTENING_PORT = 16502;


/*
    APP CONFIG
*/
app.set('port', process.env.PORT || LISTENING_PORT);
app.use(express.static('./client'));


/*
    START THE WS
*/
http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/*
    Controller
*/
app.get("/", function (request, response) {
    response.render("/index.html");
});

