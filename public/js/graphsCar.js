window.parallelBar = function(features){
    d3.parcoords()("#graphContainer").data(features)
        .composite("darken")
        .color(window.getRandomColor())
        .brushMode("1D-axes")  // enable brushing
        .interactive()
        .createAxes().reorderable()
        .render();
};

/*
    global d3
*/