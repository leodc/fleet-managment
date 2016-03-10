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
 * 
 * DAO
 * 
 * */
module.exports = {
    insert: function (data) {
        return insertImplementation(data);
    }
};


/**
 * Insert operation
 * 
 * @data Array of the objects to be inserted on mongoDB
 * 
 * */
function insertImplementation(data){
    var response = {status: 200, text: "Inserted correctly."};
    var server = new mongodb.Server(HOST, PORT);
    var db = new mongodb.Db(DB, server);
    
    
    db.open(function (err, client) {
        if (err){
            response.status = 500;
            response.text = "Error getting the connection to MongoDB.";
            console.log(err);
            
            return response;
        }
        
        client.collection(COLLECTION).insert(data, {}, function(err, records){
            if (err){
                response.status = 500;
                response.text = "Error inserting new data to MongoDB.";
                console.log(err);
                
                return response;
            }
        });
        
    });
    
    return response;
}
