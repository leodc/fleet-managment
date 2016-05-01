
/**
 * Dependencies
 * */
var rethink = require('rethinkdb');
var pgrouting = require("./pgrouting.js");
var gju = require('geojson-utils');


/**
 * RethinkDB Conf
 * */
var HOST =  "107.170.232.222";
var PORT =  28015;
var DB =    "lovelace_rdb";
var TABLE = "pwc_test";



/**
 * Listener
 * 
 * @io -> socket to broadcast new information
 * */
var listenUpdates = function(io){
    var connection = getConnection();
    if( 'undefined' !== typeof connection.text ){
        return connection;
    }
    
    connection.then(function(conn){
        rethink.table(TABLE).changes().run(conn, function (err, cursor) {
            if (err) 
                throw err;
            
            cursor.on("data", function (data) {
                //It's a new value
                if(data.new_val){
                    var geojson = data.new_val;
                    var coordinates = geojson.geometry.coordinates;
                    
                    if( geojson.isochrone ){
                        pgrouting.getIsochrone(coordinates[0], coordinates[1], geojson.isochrone, 20, function(err, result){
                            geojson.isochrone = [];
                            if(err){
                                console.log("Error getting the isochrone", err);
                            }else{
                                for(var i = 0; i < result.rows.length; i++){
                                    geojson.isochrone.push( JSON.parse(result.rows[i].st_asgeojson) );
                                }
                            }
                            
                            io.emit('update_realtime', geojson);
                        });
                    }else{
                        geojson.isochrone = [];
                        io.emit('update_realtime', geojson);
                    }
                }
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
var insert = function(res, geojson){
    var connection = getConnection();
    if( 'undefined' !== typeof connection.text ){
        return connection;
    }
    
    connection.then(function(conn){
        
        rethink.table(TABLE).insert(geojson).run(conn).then(function (result) {
            closeConnection(conn);
            res.json( {status: 200, text: "Inserted correctly."} );
        }).error(function(err){
            console.log(err);
            closeConnection(conn);
            res.json( {status: 500, text: "Error inserting the data."} );
        });
    });
};



/**
 * This method removes all the trip points of the car in rethinkDB.
 * 
 * @data Last point of the trip 
 * */
var endTrip = function(req, res, last_point, mongoDB){
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
        var idCar = last_point.properties.idCar;
        rethink.db(DB).table(TABLE).filter(rethink.row("properties").getField("idCar").match(idCar))
            .orderBy(rethink.row("properties").getField("date")).delete({returnChanges: true}).run(conn).then(function(result){
                
                
            var mongoDocument = {
                features: getOldFeatures(result, last_point),
                route: last_point.properties.route
            };
            mongoDocument.properties = buildProperties(mongoDocument.features, last_point);
            
            /**
             * Move the data out of rethinkDB into mongoDB.
             * */
            mongoDB.insert( idCar, mongoDocument, function(err, data){
                if(err){
                    console.log("Error in the transaction with mongoDB: ", err);
                    defaultResponse.text = "Error in the transaction with mongoDB.";
                }else{
                    defaultResponse.status = 200;
                    defaultResponse.text = "Trip ended correctly.";
                }
                
                req.io.emit('delete_realtime', idCar);
                
                //TODO: Handle errors at the insert
                //Maybe -> insert all the data to rethinkDB
                //Or keep it in cache until the end of timees !!! D:< !!!!! jk
                res.json(defaultResponse);
            });
        }).error(function(err){
            console.log("Error running the query: ", err);
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


function getOldFeatures(result, last_point){
    var features = [];
    
    for( var i = 0; i < result.changes.length; i++ ){
        var aux = result.changes[i].old_val;
        
        delete aux.isochrone;
        delete aux.id;
        features.push(aux);
    }
    
    features.push(last_point);
    
    return features;
}



function buildProperties(features, last_point){
    var properties = {
        distance: 0,
        total_time: last_point.properties.date - features[0].properties.date,
        stop_time: 0
    };
    
    for( var i = 0; i < features.length - 1; i++ ){
        properties.distance += gju.pointDistance(features[i].geometry, features[i + 1].geometry);
        
        if(features[i].properties.data["rpm"] === 0)
            properties.stop_time++;
    }
    
    properties.stop_time = (properties.stop_time - 1) * 5;
    
    return properties;
}


/**
 * DAO
 * */
module.exports = {
    insert: insert,
    endTrip: endTrip,
    listenUpdates: listenUpdates
};
