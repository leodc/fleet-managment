/**
 * Module Dependencies
 * */
var mongodb = require('mongodb');


/**
 * MongoDB conf
 * */
var HOST = "107.170.232.222";
var PORT = 27017;
var DB = "lovelace_test";
var COLLECTION = "cars";


/**
 * Insert operation
 * 
 * @data Array of the objects to be inserted on mongoDB
 * */
var insert = function(idCar, data, callback){
    updateCollectionProperties(idCar, data, function(err, db, client, collection){
        if(err){
            console.log("Error updating the collection properties of: " + collection, err);
        }

        client.collection(idCar).insert(data, {}, function(err, records){
            db.close();
            callback(err, records);
        });
    });
};


/**
 * Updates the collection properties of the car: new_collection.properties.idCar
 * */
var updateCollectionProperties = function(collection, last_trip, callback){
    var server = new mongodb.Server(HOST, PORT);
    var db = new mongodb.Db(DB, server);
    
    db.open(function (err, client) {
        if (err){
            callback(err, db, client, null);
        }
        
        var idCar = collection;
        
        client.collection(idCar).findOne({ collectionProperties: true }, function(err, propertiesDocument){
            if(err){
                console.log("Error getting the properties object.", err);
            }
            
            var collectionProperties = propertiesDocument;
            if(!propertiesDocument){
                collectionProperties = {
                    collectionProperties: true,
                    distance: 0,
                    total_time: 0,
                    stop_time: 0
                };
            }
            
            collectionProperties.distance += last_trip.properties.distance;
            collectionProperties.total_time += last_trip.properties.total_time;
            collectionProperties.stop_time += last_trip.properties.stop_time;
            
            client.collection(idCar).findOneAndReplace({ collectionProperties: true }, collectionProperties, {upsert: true}, function(err, result){
                callback(err,db,client,result);
            });
        });
    });
};


var getCollections =  function(callback){
    var server = new mongodb.Server(HOST, PORT);
    var db = new mongodb.Db(DB, server);
    
    db.open(function (err, client) {
        if (err){
            console.log("Error ", err);
        }
        
        db.listCollections().toArray(function(err, collectionsNames){
            db.close();
            callback(err, collectionsNames);
        });
    });
};


var getCollectionData = function(collection, callback){
    var server = new mongodb.Server(HOST, PORT);
    var db = new mongodb.Db(DB, server);
    
    db.open(function (err, client) {
        if (err){
            console.log("Error ", err);
        }
        
        client.collection(collection).find().toArray(function(err, result){
            db.close();
            callback(err,result);
        });
    });
};


/**
 * 
 * DAO
 * 
 * */
module.exports = {
    insert: insert,
    getCollections: getCollections,
    getCollectionData: getCollectionData
};
