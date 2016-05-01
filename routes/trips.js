
var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {
    var mongoDB = req.mongoDB;

    mongoDB.getCollections(function(err, collections){
        if(err){
            console.log("Error getting the collections", err);
        }else{
            var cars = [];
            
            for(var i = 0; i < collections.length; i++){
                cars.push(collections[i].name);
            }
            
            res.render('trips', {cars: cars});
        }
    });
    
});


module.exports = router;
