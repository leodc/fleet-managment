
var express = require('express');
var router = express.Router();


router.post('/start', function(req, res) {
    insertPoint(req,res);
});


router.post("/add", function(req,res){
    insertPoint(req,res);
});


router.post("/end", function(req, res){
    var response = { status: 500, text: "Internal error."};
    var rethinkDB = req.rethinkdb;
    var mongoDB = req.mongoDB;
    
    if( req.body !== null ){
        //{ status: 200, text: "Deleted correctly.", data: [] }
        var deleteResponse = rethinkDB.endTrip( req.body );
        console.log(deleteResponse);
        if( deleteResponse.status === 200 ){
            /**
             * Move the data out of rethinkDB to mongoDB.
             * */
             response = mongoDB.insert( deleteResponse.data );
             
             //TODO: Handle errors at the insert
             //Maybe -> insert all the data to rethinkDB
             //Or keep it until the end of timees !!! D:< !!!!! 
             console.log("MONGO");
             console.log(response);
        }
    }
    
    res.json(response);
});


module.exports = router;


function insertPoint(req, res){
    var rethinkdb = req.rethinkdb;
    
    rethinkdb.insert(req, res);
}


