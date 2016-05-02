var mapbox = {
    idMapStreet: "imleo.o2ppnpfk",
    idMapBlack: "imleo.o439ljf3",
    token: "pk.eyJ1IjoiaW1sZW8iLCJhIjoiT0tfdlBSVSJ9.Qqzb4uGRSDRSGqZlV6koGg"
};

var controller = null;
var map;


/*
    global $
*/
window.startMap = function(idCar, height){
    $("#"+idCar).css("width","100%");
    $("#"+idCar).css("height",height);
    map = buildMap(idCar);
};


/*
*
*   MAP
*
*/
function buildMap(id_map) {
    /*global L*/
    var layerStreet = L.tileLayer('https://api.tiles.mapbox.com/v4/' + mapbox.idMapStreet + '/{z}/{x}/{y}.png?access_token=' + mapbox.token, {
        maxZoom: 18,
        minZoom: 3,
        attribution: 'PwC México',
        id: mapbox.idMapStreet,
        accessToken: mapbox.token
    });


    var layerBlack = L.tileLayer('https://api.tiles.mapbox.com/v4/' + mapbox.idMapBlack + '/{z}/{x}/{y}.png?access_token=' + mapbox.token, {
        maxZoom: 18,
        minZoom: 3,
        attribution: 'PwC México',
        id: mapbox.idMapBlack,
        accessToken: mapbox.token
    });


    var map = L.map(id_map, {
        /*Options*/
        layers: [layerStreet, layerBlack]
    }).setView([19.4284700, -99.1276600], 12); 


    /*
        Layer Controller
    */
    var baseMaps = {
        "Streets": layerStreet,
        "Black": layerBlack
    };

    var overlayMaps = {};


    controller = L.control.layers(baseMaps, overlayMaps);
    controller.addTo(map);


    return map;
}


window.addLayer = function(features){
    var routeLayer = L.layerGroup().addTo(map);
    controller.addOverlay(routeLayer, features[0].properties.route);
    
    var style = buildStyle();
    
    for(var i = 0; i < features.length; i++){
        var geoJSON = features[i];
        var coordinates = geoJSON.geometry.coordinates;
        
        var layer = L.circleMarker(
            L.latLng(coordinates[1], coordinates[0]),
            style
        );
        
        routeLayer.addLayer(layer);
        layer.bindPopup(buildPopup(geoJSON));
    }
};


function buildPopup(geojson){
    var properties = geojson.properties;
    var coordinates = geojson.geometry.coordinates;
    
    //var html = "<b>idCar: " + properties.idCar + "</b><br><br>";
    var html = "";
    
    for(var i = 0; i < properties.data.length; i++){
        var data = properties.data[i];
        html += "<b>" + data[1] + ":</b> " + data[2] + "<br>";
    }
    
    
    var popup = L.popup()
                .setLatLng( coordinates )
                .setContent(html);
    
    return popup;
}


function buildStyle() {
    var colorStroke = "#FFFFFF";

    var aux = {
        stroke: true,
        color: colorStroke,
        weight: 2,
        fill: true,
        fillColor: window.getRandomColor(),
        opacity:1,
        fillOpacity: 1,
        radius: 6
    };

    return aux;
}
