
var express = require('express');
var router = express.Router();


router.post('/start/:idcar/:data', function(req, res) {
    var idCar = req.params.idcar;
    var data = req.params.data;
    
    console.log(idCar);
    console.log(data);
    
    res.send(data);
});


module.exports = router;
