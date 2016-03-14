
var express = require('express');
var router = express.Router();


router.post('/start', function(req, res) {
    console.log("New trip");
    
    insertPoint(req,res);
});


router.post("/add", function(req,res){
    console.log("Add point to trip.");
    
    insertPoint(req,res);
});


router.post("/end", function(req, res){
    console.log("End trip.");
    
    var rethinkDB = req.rethinkdb;
    var mongoDB = req.mongoDB;
    
    rethinkDB.endTrip( JSON.parse(req.body.data), mongoDB, res);
});


module.exports = router;


function insertPoint(req, res){
    var rethinkdb = req.rethinkdb;
    
    rethinkdb.insert( JSON.parse(req.body.data), res );
}
