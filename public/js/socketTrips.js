/*global io*/
window.socket = io();
/*
socket.on('update_realtime', function (data) {

});


socket.on('delete_realtime', function (idCar) {
    
});*/


window.socket.on('carData', function(data){
    window.addCarPanel(data);
});