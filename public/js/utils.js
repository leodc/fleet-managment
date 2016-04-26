window.getRandomColor = function(){
    var rgb = [];
    for(var i = 0; i < 3; i++)
        rgb.push(Math.floor(Math.random() * 255));
    return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
};


var componentToHex = function(c){
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};