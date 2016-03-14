/**
 * 
 * This file contains the functionality, configuration and implementation of mongoDB.
 * v1
 * PwC D&A[Lovelace]
 * 
 * */


/**
 * 
 * Module Dependencies
 * 
 * */
var mongodb = require('mongodb');


/**
 * 
 * MongoDB conf
 * 
 * */
var HOST = "107.170.232.222";
var PORT = 27017;
var DB = "lovelace";
var COLLECTION = "trips";


/**
 * Insert operation
 * 
 * @data Array of the objects to be inserted on mongoDB
 * 
 * */
var insert = function(data, callback){
    var server = new mongodb.Server(HOST, PORT);
    var db = new mongodb.Db(DB, server);
    
    
    db.open(function (err, client) {
        if (err){
            err.connection = true;
            callback(err, null);
        }
        
        client.collection(COLLECTION).insert(data, {}, function(err, records){
            if (err){
                err.inserting = true;
                callback(err, null);
            }
            
            callback(null, records);
        });
        
    });
};


/**
 * 
 * DAO
 * 
 * */
module.exports = {
    insert: insert
};