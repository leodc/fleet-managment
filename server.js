/**
 * 
 * Module Dependencies
 * 
 * */
 var express = require('express');
 var app = express();
 var http = require('http').Server(app);
 var io = require('socket.io')(http);
 var rethink = require("rethinkdb");
 var path = require('path');
 var bodyParser = require('body-parser');



/**
 * 
 * View engine
 * 
 * */
 
 app.set('views', path.join(__dirname, 'views'));
 app.set('view engine', 'jade');
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: false }));
 app.use(express.static(path.join(__dirname, 'public')));
 app.use('/mapa', express.static('public'));



/**
 * 
 * Routers controllers
 * 
 * */
 var mapaRouter = require("./routes/map.js");
 var indexRouter = require("./routes/router.js");
 
 app.use("/mapa", mapaRouter);
 app.use("/", indexRouter);


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
});




/**
 * RETHINKDB
 * */
 
/**
 * Configuration
 * */
var HOST =  "107.170.232.222";
var PORT =  28015;
var DB =    "logistica_autos";
var TABLE = "prototipo";

/**
 * Broadcasting
 * */
rethink.connect({ host: HOST, port: PORT, db: DB }, function (err, conn) {
    if (err) {
        console.log("error en la conexión");
    }
    
    console.log("Iniciado y a la escucha.");

    rethink.table(TABLE).changes().run(conn, function (err, cursor) {
        if (err) throw err;
        cursor.on("data", function (data) {
            io.emit('update_realtime', JSON.stringify(data));
        });
    });
});