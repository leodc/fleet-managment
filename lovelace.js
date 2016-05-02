/**
 * Module Dependencies
 * */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var bodyParser = require('body-parser');
var io = require('socket.io')(http);
var rethinkdb = require("./rethinkDB.js");
var mongoDB = require("./mongoDB.js");
var pgrouting = require("./pgrouting.js");
 


/**
 * View engine
 * */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json()); //json as param support
app.use(bodyParser.urlencoded({ extended: false })); //data as param support

app.use(express.static(path.join(__dirname, 'public'))); //Make resources public
app.use('/map', express.static('public')); //Make resources public at mapa/css/xxx
app.use('/cars', express.static('public')); //Make resources public at car/css/xxx
app.use(express.static(path.join(__dirname, 'test'))); //Make test directory public... for... testing.... 



/**
 * Set rethinkDB and mongoDB... and pgrouting as a global resource.
 * Someday i'm going to optimize this @_@...
 * */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    req.rethinkdb = rethinkdb;
    req.mongoDB = mongoDB;
    req.pgrouting = pgrouting;
    req.io = io;
    
    next();
});



/**
 * Routers controllers
 * */
var indexRouter = require("./routes/router.js");
var mapaRouter = require("./routes/map.js");
var carRouter = require("./routes/car.js");
var carsRouter = require("./routes/cars.js");


app.use("/", indexRouter);
app.use("/map", mapaRouter);
app.use("/car", carRouter);
app.use("/cars", carsRouter);
 


/**
 * Socket handlers
 * */
io.on('connection', function(socket){
    
    socket.on("carsData", function(){
        mongoDB.getCollections(function(collections){
            for(var i = 0; i < collections.length; i++){
                findAndEmit(collections[i].name, socket);
            }
        });
    });
    
    socket.on("carFeatures", function(idCar) {
        mongoDB.getCollectionData({},idCar, function(err, data) {
            if(!err){
                socket.emit("carFeatures", data);
            }
        });
    });
});


function findAndEmit(idCar, socket){
    mongoDB.getCollectionData({collectionProperties: true}, idCar, function(err,data){
        if( !err ){
            var transferObject = {
                idCar: idCar,
                data: data[0]
            };
            
            socket.emit("carData", transferObject);
        }
    });
}


/**
 * 
 * Service Configuration
 * 
 * */
app.set('port', process.env.PORT || 16502);


/**
 * 
 * Start
 * 
 * */
http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  
  /**
   * 
   * RethinkDB listener.
   * When a change happens in the database it's sent through broadcasting with all the new information to the clients.
   * 
   * */
   rethinkdb.listenUpdates(io);
});
