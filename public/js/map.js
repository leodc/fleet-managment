var mapbox = {
    idMapStreet: "imleo.o2ppnpfk",
    idMapBlack: "imleo.o439ljf3",
    token: "pk.eyJ1IjoiaW1sZW8iLCJhIjoiT0tfdlBSVSJ9.Qqzb4uGRSDRSGqZlV6koGg"
};

var layers = {};
var car_styles = {};

var controller = null;
var map;


/*
    global $
*/
$(function () {
    map = buildMap("map_realtime");
});


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


/**
 * HANDLER EVENT --  update
 * 
 * If: layer of the car does not exists is created and added to the controller 
 * Always: add new feature to the layer
 * */
window.addFeature = function(geoJSON){
    var properties = geoJSON.properties;
    var isochrone = geoJSON.isochrone;
    
    var idCar = properties.idCar;
    
    //If layer of the car does not exists       var isochrone = parseGeoJSON(data.isochrone, idCar);
    if( layers[idCar] == null ){
        car_styles[properties.idCar] = buildStyle(geoJSON);
        
        layers[idCar] = L.layerGroup();
        layers[idCar].addTo(map);

        controller.addOverlay(layers[idCar],idCar);
        
        //Notify
        $.notify("The car " + idCar + "  has started a new trip.",{position:"bottom right", className:"info"});
    }else{
        layers[idCar].clearLayers();
    }

    //Adding feature
    console.log("adding data");
    addLayer(layers[idCar], geoJSON, isochrone);
};



/**
 * 
 * HANDLER EVENT --  delete
 * 
 * Removes the layer asociated to the idCar
 * */
window.deleteLayer = function(idCar){
    console.log("removing data");
    
    controller.removeLayer(layers[idCar]);
    map.removeLayer(layers[idCar]);
    layers[idCar] = null;
    
    $.notify("The car " + idCar + "  has ended the trip.",{position:"bottom left", className:"info"});
};


function addLayer(layerGroup, geoJSON, isochrone){
    var coordinates = geoJSON.geometry.coordinates;
    var style = car_styles[geoJSON.properties.idCar];
    
    style.fillOpacity = 1;
    style.opacity = 1;
    style.stroke = true;
    
    var layer = L.circleMarker(
        L.latLng(coordinates[1], coordinates[0]),
        style
    );
    
    layerGroup.addLayer(layer);
    layer.bindPopup(buildPopup(geoJSON));
    //layer.openPopup();
    
    style.fillOpacity = 0.5;
    style.opacity = 0.5;
    style.stroke = false;
    
    for(var i = 0; i < isochrone.length; i++ ){
        coordinates = isochrone[i].coordinates;
        
        layer = L.circleMarker(
            L.latLng(coordinates[1], coordinates[0]),
            style
        );
        
        layerGroup.addLayer(layer);
    }
    
}


function buildPopup(geojson){
    var properties = geojson.properties;
    var coordinates = geojson.geometry.coordinates;
    
    var html = "<b>idCar: " + properties.idCar + "</b><br><br>";
    
    for(var i = 0; i < properties.data.length; i++){
        var data = properties.data[i];
        html += "<b>" + data[1] + ":</b> " + data[2] + "<br>";
    }
    
    
    var popup = L.popup()
                .setLatLng( coordinates )
                .setContent(html);
    
    return popup;
}


function buildStyle(data) {
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
