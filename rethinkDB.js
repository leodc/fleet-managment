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
 * Listener
 * 
 * @io -> socket to broadcast new information
 * */
var listenUpdates = function(io){
    getConnection().then(function(conn){
        rethink.table(TABLE).changes().run(conn, function (err, cursor) {
            if (err) throw err;
            cursor.on("data", function (data) {
                io.emit('update_realtime', JSON.stringify(data));
            });
        });
    });
};



/**
 * 
 * Insert
 * 
 * @data Point to add
 * @return Object with the HTTP status of the call and a message for the client.
 * 
 * */
var insert = function(data, res){
    var response = {status: 0, text: ""};
    var connection = getConnection();
    if( 'undefined' !== typeof connection.text ){
        return connection;
    }
    
    connection.then(function(conn){
        rethink.table(TABLE).insert(data).run(conn).then(function (result) {
            closeConnection(conn);
            response.status = 200;
            response.text = "Inserted corrrectly.";
            
            console.log("Inserted: " + JSON.stringify(data));
            
            res.json( response );
        }).error(function(err){
            closeConnection(conn);
            response.status = 500;
            response.text = "Error inserting the data.";
            console.log(err);
            
            res.json( response );
        });
    });
};



/**
 * 
 * This method removes all the trip points of the car in rethinkDB.
 * 
 * @data Last trip point
 * @return Array with all the trip points
 * 
 * */
var endTrip = function(data, mongoDB, res){
    var defaultResponse = { status: 500, text: "Error getting the information from rethinkDB."};
    
    var connection = getConnection();
    if( 'undefined' !== typeof connection.text ){
        defaultResponse.text = "Error getting the connection.";
        res.json(defaultResponse);
    }
    
    connection.then(function(conn){
        /**
         * Getting data of the trip
         * */
        var idCar = data.properties.idCar;
        rethink.db(DB).table(TABLE).filter(rethink.row("properties").getField("idCar").match(idCar))
            .orderBy(rethink.row("properties").getField("date")).delete({returnChanges: true}).run(conn).then(function(result){
                
                /**
                 * Move the data out of rethinkDB into mongoDB.
                 * */
                mongoDB.insert( result.changes, function(err, data){
                    if(err){
                        console.log("Error: ");
                        console.log(err);
                        defaultResponse.text = "Error in the transaction with mongoDB.";
                        
                        res.json(defaultResponse);
                    }
                    
                    defaultResponse.status = 200;
                    defaultResponse.text = "Trip ended correctly.";
                    console.log("Trip ended correctly.");
                    console.log("Trip: " + JSON.stringify(data));
                    
                    //TODO: Handle errors at the insert
                    //Maybe -> insert all the data to rethinkDB
                    //Or keep it in cache until the end of timees !!! D:< !!!!! 
                    
                    res.json(defaultResponse);
                });
                
            }).error(function(err){
                console.log("Error running the query: " + err);
                res.json(defaultResponse);
            });
        });
};


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


/**
 * 
 * DAO
 * 
 * */
module.exports = {
    insert: insert,
    endTrip: endTrip,
    listenUpdates: listenUpdates
};