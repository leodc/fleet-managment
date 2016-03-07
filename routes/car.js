
var express = require('express');
var router = express.Router();


router.post('/start/:idCar/:data', function(req, res) {
    var idCar = req.params.idCar;
    var data = req.params.data;
    
    console.log(idCar);
    console.log(data);
    
    res.send(data);
});


module.exports = router;
