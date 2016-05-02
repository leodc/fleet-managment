
var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {
    res.render('carsGlobal');
});

router.get('/:idCar', function (req, res, next) {
    res.render('car',{
        idCar: req.params.idCar
    });
});


module.exports = router;
