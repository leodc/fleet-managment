    var mapbox = {
        idMapStreet: "imleo.o2ppnpfk",
        idMapBlack: "imleo.o439ljf3",
        token: "pk.eyJ1IjoiaW1sZW8iLCJhIjoiT0tfdlBSVSJ9.Qqzb4uGRSDRSGqZlV6koGg"
    }

    var layers = {};
    
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


    /*
            HANDLER EVENT --  update

            If: layer of the car does not exists is created and added to the controller
            Always: add new feature to the layer
    */
    function addFeature(data){
        var geoJSON = JSON.parse(data).new_val;
        if( geoJSON != null ){
            
            var properties = geoJSON.properties;

            var idCar = properties.idCar;
    
            //If layer of the car does not exists
            if( layers[idCar] == null ){
                layers[idCar] = L.layerGroup();
                layers[idCar].addTo(map);

                controller.addOverlay(layers[idCar],idCar);
                $.notify("The car " + idCar + "  has started a new trip.",{position:"bottom right", className:"info"});
            }

            //Adding feature
            console.log("adding data");
            addLayer(layers[idCar], geoJSON);
        }else{
            geoJSON = JSON.parse(data).old_val;

            if( geoJSON.properties.terminate ){
                console.log("removing");
                map.removeLayer(layers[idCar]);
                layers[idCar] = null;
                $.notify("The car " + idCar + "  has ended the trip.",{position:"bottom left", className:"info"});
            }
        }
        
    }



    function addLayer(layerGroup, geoJSON){
        var coordinates = geoJSON.geometry.coordinates;
        var style = buildStyle(geoJSON.properties);

        var layer = L.circleMarker(
                L.latLng(coordinates[1], coordinates[0]),
                style
            );
        layer.bindPopup(buildPopup(geoJSON.properties));

        layerGroup.addLayer(layer);
    }


    function buildPopup(properties){
        html = "<b>Car: " + properties.idCar + "</b><br><br>";
        html += "<b>Speed: </b>" + properties.speed + "<br>";
        html += "<b>Air Temperature: </b>" + properties.air_temperature + "<br>";
        html += "<b>Engine Oil Temperature: </b>" + properties.engine_oil_temperature + "<br>";
        html += "<b>Fuel Level: </b>" + properties.fuel_level + "<br>";

        return html;
    }


    function buildStyle(data) {
        var colors = {
            aveo001: "#779ECB",
            aveo002: "#77DD77",
            aveo003: "#FFB347",
            aveo004: "#DEA5A4"
        };

        var colorStroke = "#FFFFFF";

        if (data.rpm > 2500 || data.acel > 0.5 || data.temp > 60) {
            colorStroke = "#C23B22";
        }

        var aux = {
            stroke: true,
            color: colorStroke,
            weight: 2,
            fill: true,
            fillColor: colors[data.idCar],
            opacity:1,
            fillOpacity: 1,
            radius: 6
        };

        return aux;
    }
