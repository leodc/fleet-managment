/*global io*/
var socket = io();

socket.on('update_realtime', function (data) {
    window.addFeature(data);
});


socket.on('delete_realtime', function (idCar) {
    setTimeout(function(){
        window.deleteLayer(idCar);
    }, 1500);
});