/**
 * POSTGRESQL CONFIG
 * */
 var HOST = "dadevop.com";
 var PORT = 5432;
 var USER = "lovelace_pgrouting";
 var PASSWORD = "lovelace_pgrouting_pass";
 var DATABASE = "osm";
 
 var pg = require('pg');
 var conString = "postgres://" + USER + ":" + PASSWORD + "@" + HOST + "/" + DATABASE;
 
/**
 * Select operation
 * 
 * @lat 
 * @lng
 * 
 * */
var getIsochrone = function(lat, lng, callback){
 var ISO_QUERY = "SELECT ST_AsGeoJSON(ST_MakePolygon(ST_ForceClosed((SELECT ST_MakeLine(f.geom) as geom FROM (SELECT geom_vertex as geom FROM osm_2po_vertex JOIN (SELECT * FROM pgr_drivingDistance('SELECT id, source, target, cost FROM osm_2po_4pgr',(SELECT id from osm_2po_vertex ORDER by geom_vertex <-> ST_GeometryFromText('POINT( " + lat + " " + lng + ")',4326) limit 1), 0.02, true, false )) AS network ON osm_2po_vertex.id = network.id1) as f))))";
 
 pg.connect(conString, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query(ISO_QUERY, [], function(err, result) {
    //call `done()` to release the client back to the pool
    done();

    if(err) {
     callback(err, null); 
    }
    
    callback(null, result);
  });
});
};


/**
 * 
 * DAO
 * 
 * */
module.exports = {
    getIsochrone: getIsochrone
};