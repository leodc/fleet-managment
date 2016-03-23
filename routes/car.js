
var express = require('express');
var router = express.Router();


router.post('/start', function(req, res) {
    var geojson = JSON.parse(req.body.data);
    var coordinates = geojson.geometry.coordinates;
    
    req.pgrouting.snapTogrid(coordinates[0], coordinates[1], function(err, result){
        if(err){
            console.log("Error snaping to grid");
            console.log(err);
        }else{
            coordinates[0] = result.rows[0].x;
            coordinates[1] = result.rows[0].y;
        }
        
        insertPoint(req, res, geojson);
    });
});


router.post("/add", function(req,res){
    var geojson = JSON.parse(req.body.data);
    var coordinates = geojson.geometry.coordinates;
    
    req.pgrouting.snapTogrid(coordinates[0], coordinates[1], function(err, result){
        if(err){
            console.log("Error snaping to grid");
            console.log(err);
        }else{
            coordinates[0] = result.rows[0].x;
            coordinates[1] = result.rows[0].y;
        }
        
        insertPoint(req, res, geojson);
    });
    
});


router.post("/end", function(req, res){
    var rethinkDB = req.rethinkdb;
    var mongoDB = req.mongoDB;
    
    var geojson = JSON.parse(req.body.data);
    var coordinates = geojson.geometry.coordinates;
    
    req.pgrouting.snapTogrid(coordinates[0], coordinates[1], function(err, result){
        if(err){
            console.log("Error snaping to grid");
            console.log(err);
        }else{
            coordinates[0] = result.rows[0].x;
            coordinates[1] = result.rows[0].y;
        }
        
        rethinkDB.endTrip( geojson, mongoDB, res);
    });
});


function insertPoint(req, res, geojson){
    var rethinkdb = req.rethinkdb;
    
    rethinkdb.insert( geojson, res);
}

module.exports = router;