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
        MAIN
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
     * 
     * HANDLER EVENT --  update
     * 
     * If: layer of the car does not exists is created and added to the controller 
     * Always: add new feature to the layer
     * 
     * */
    function addFeature(data){
        var geoJSON = JSON.parse(data.data).new_val;
        if( geoJSON != null ){
            var properties = geoJSON.properties;
            var idCar = properties.idCar;
            
            var isochrone = parseGeoJSON(data.isochrone, idCar);
    
            //If layer of the car does not exists
            if( layers[idCar] == null ){
                car_styles[geoJSON.properties.idCar] = buildStyle(geoJSON);
                
                layers[idCar] = L.layerGroup();
                layers[idCar].addTo(map);

                controller.addOverlay(layers[idCar],idCar);
                $.notify("The car " + idCar + "  has started a new trip.",{position:"bottom right", className:"info"});
            }

            //Adding feature
            console.log("adding data");
            addLayer(layers[idCar], geoJSON, false);
            addLayer(layers[idCar], isochrone, true);
        }else{
            geoJSON = JSON.parse(data.data).old_val;

            console.log("removing");
            map.removeLayer(layers[idCar]);
            layers[idCar] = null;
            $.notify("The car " + idCar + "  has ended the trip.",{position:"bottom left", className:"info"});
        }
        
    }
    
    function addLayer(layerGroup, geoJSON, isochronic){
        if( !isochronic ){
            addNormalLayer(layerGroup, geoJSON);
        }else{
            addIsochronicLayer(layerGroup, geoJSON);
        }
    }
    
    
    function addNormalLayer(layerGroup, geoJSON){
        var coordinates = geoJSON.geometry.coordinates;
        var style = car_styles[geoJSON.properties.idCar];
        
        var layer = L.circleMarker(
            L.latLng(coordinates[1], coordinates[0]),
            style
        );
        
        layer.bindPopup(buildPopup(geoJSON.properties));
        layerGroup.addLayer(layer);
    }
    
    function addIsochronicLayer(layerGroup, geoJSON){
        var coordinates_array = geoJSON.geometry.coordinates;
            var style = car_styles[geoJSON.properties.idCar];
            style.fillOpacity = 0.1;
            style.opacity = 0.1;
            style.stroke = false;
            
            for(var i = 0; i < coordinates_array.length; i++ ){
                var coordinates = coordinates_array[i];
                
                var layer = L.circleMarker(
                    L.latLng(coordinates[1], coordinates[0]),
                    style
                );
                
                layerGroup.addLayer(layer);
            }
    }
    
    
    function parseGeoJSON(isochrone, idCar){
        var geom_iso = JSON.parse(isochrone);
        
        
        var geojson = {};
        geojson.type = "Feature";
        
        geojson.geometry = {};
        geojson.geometry.type = geom_iso.type;
        geojson.geometry.coordinates = geom_iso.coordinates[0];
        
        geojson.properties = {};
        geojson.properties.idCar = idCar;
        
        return geojson;
    }


    function buildPopup(properties){
        var html = "<b>Car: " + properties.idCar + "</b><br><br>";
        html += "<b>Speed: </b>" + properties.speed + "<br>";
        html += "<b>Air Temperature: </b>" + properties.air_temperature + "<br>";
        html += "<b>Engine Oil Temperature: </b>" + properties.engine_oil_temperature + "<br>";
        html += "<b>Fuel Level: </b>" + properties.fuel_level + "<br>";

        return html;
    }


    function buildStyle(data) {
        var colorStroke = "#FFFFFF";

        var aux = {
            stroke: true,
            color: colorStroke,
            weight: 2,
            fill: true,
            fillColor: getRandomColor(),
            opacity:1,
            fillOpacity: 1,
            radius: 6
        };

        return aux;
    }

function getRandomColor(){
    var rgb = [];

    for(var i = 0; i < 3; i++)
        rgb.push(Math.floor(Math.random() * 255));

    return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}