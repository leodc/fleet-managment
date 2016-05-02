window.addCarPanel = function(data){
    var html = '<div class="content"><div class="col-lg-4"><div class="panel panel-default"><div class="panel-heading"><h3 class="panel-title"><i class="fa fa-long-arrow-right fa-fw"></i>' + data.idCar + '</h3>';
    html += '</div><div class="panel-body">';
    html += 'Distancia recorrida: ' + data.data.distance + ' (m) <br>';
    html += 'Tiempo total: ' + data.data.total_time + ' (s)<br>';
    html += 'Tiempo detenido (rpm=0): ' + data.data.stop_time + ' (s)<br>';
    html += '<div id="morris-donut-chart"></div><div class="text-right"><a target="_blank" href="' + data.idCar + '">Ver detalles <i class="fa fa-arrow-circle-right"></i></a></div></div></div></div>';
    
    $("#panelContainer").append(html);
};

$(function(){
    window.socket.emit("carsData");
});



/*
    global $
*/