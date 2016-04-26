
var express = require('express');
var router = express.Router();


router.all('*', function (req, res, next) {
    var geojson = JSON.parse(req.body.data);
    
    var coordinates = geojson.geometry.coordinates;
    
    req.pgrouting.snapTogrid(coordinates[0], coordinates[1], function(err, result){
        if(err){
            console.log("Error snaping to grid", err);
        }else{
            coordinates[0] = result.rows[0].x;
            coordinates[1] = result.rows[0].y;
            
            geojson.isochrone = result.rows[0].id;
        }
        
        req.body.data = geojson;
        next();
    });
    
});


router.post('/start', function(req, res) {
    req.rethinkdb.insert(res, req.body.data);
});


router.post("/add", function(req,res){
    req.rethinkdb.insert(res, req.body.data);
});


router.post("/end", function(req, res){
    var rethinkDB = req.rethinkdb;
    var mongoDB = req.mongoDB;
    
    rethinkDB.endTrip( req, res, req.body.data, mongoDB);
});


module.exports = router;