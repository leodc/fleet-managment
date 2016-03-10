/**
 * 
 * This file contains the functionality, configuration and implementation of rethinkDB.
 * v1
 * PwC D&A[Lovelace]
 * 
 * */


/**
 * 
 * Module Dependencies
 * 
 * */
var rethink = require('rethinkdb');

/**
 * 
 * RethinkDB conf
 * 
 * */
var HOST =  "107.170.232.222";
var PORT =  28015;
var DB =    "logistica_autos";
var TABLE = "prototipo";


/**
 * 
 * DAO
 * 
 * */
module.exports = {
    insert: function (req, res) {
        return insertImplementation(req, res);
    },
    endTrip: function(data){
        return endTripImplementation(data);
    },
    listenUpdates: function(io){
        return listenUpdatesImplementation(io);
    }
};



/**
 * 
 * This method removes all the trip points of the car in rethinkDB.
 * 
 * @data Last trip point
 * @return Array with all the trip points
 * 
 * */
function insertImplementation(req, res){
    var data = JSON.parse(req.body.data);
    
    var connection = getConnection();
    if( 'undefined' !== typeof connection.text ){
        return connection;
    }
    
    connection.then(function(conn){
        rethink.table(TABLE).insert(data).run(conn, function (err, result) {
            closeConnection(conn);
            var status_aux;
            var text_aux;
            
            if (err){
                status_aux = 500;
                text_aux = "Error inserting the data.";
                console.log(err);
            }
            
            if( result.inserted > 0 ){
                status_aux = 200;
                text_aux = "Inserted corrrectly.";
            }
            
            res.status(status_aux);
            res.json( {status: status_aux, text: text_aux} )
        });
    });
}



/**
 * 
 * This method removes all the trip points of the car in rethinkDB.
 * 
 * @data Last trip point
 * @return Array with all the trip points
 * 
 * */
function endTripImplementation(data){
    var response = { status: 200, text: "Deleted correctly.", data: [] };
    
    var connection = getConnection();
    if( 'undefined' !== typeof connection.text ){
        return connection;
    }
    
    connection.then(function(conn){
        /**
         * Getting data of the trip
         * */
        var idCar = data.properties.idCar;
        rethink.db(DB).table(TABLE).filter(rethink.row("properties").getField("idCar").match(idCar))
                        .orderBy(rethink.row("properties").getField("date")).delete({returnChanges: true}).run(conn, function (err, result) {
            
            if (err){
                response.status = 500;
                response.text = "Error getting the information.";
                response.data.push(data);
                console.log(err);
                
                return response;
            }
            
            response.data = result.changes;
            response.data.push(data);
            
            return response;
        });
    });
    
    
    return response;
}


function getConnection(){
    /*
        Open connection
    */
    var promise = rethink.connect({ host: HOST, port: PORT, db: DB });
    promise.error(function(error) {
        return {status: 500, text: "Error getting the connection to rethinkDB."};
    });
    
    return promise;
}


function closeConnection(conn){
    conn.close(function (err) {
        if (err) 
            throw err; 
    });
}


function listenUpdatesImplementation(io){
    getConnection().then(function(conn){
        rethink.table(TABLE).changes().run(conn, function (err, cursor) {
            if (err) throw err;
            cursor.on("data", function (data) {
                io.emit('update_realtime', JSON.stringify(data));
            });
        });
    });
}