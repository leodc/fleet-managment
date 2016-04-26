
/**
 * Dependencies
 * */
 var pg = require('pg');


/**
 * PostgreSQL Config
 * */
 var HOST = "107.170.232.222";
 var PORT = 5432;
 var USER = "lovelace_pgrouting";
 var PASSWORD = "lovelace_pgrouting_pass";
 var DATABASE = "osm_cdmx";
 var CONNECTION_STRING = "postgres://" + USER + ":" + PASSWORD + "@" + HOST + "/" + DATABASE;
 

/**
 * This method gets the closest point between a OpenStreetMap network and one point.
 * The returned point it's contained in the network.
 * 
 * @lat Latitude of the point.
 * @lng Longitude of the point.
 * 
 * */
var snapTogrid = function(lat, lng, callback){
    var query = "SELECT ST_X(geom) as x, ST_Y(geom) as y, id FROM getClosestPointAndTarget(" + lat + "," + lng + ")";
    
    pg.connect(CONNECTION_STRING, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        
        client.query(query, [], function(err, result) {
            done();     //call `done()` to release the client back to the pool
            callback(err, result); 
        });
    });
};


/**
 * This method gets all the possible geographical positions that one car could take in a given time.
 * 
 * @lat Latitude of the point
 * @lng Longitude of the point
 * @time_m Time in minutes
 * 
 * */
 var getIsochrone = function(lat, lng, target_id, time_m, callback){
    var query = "SELECT ST_AsGeoJSON(the_geom) FROM ways_vertices_pgr JOIN (\
                    SELECT * FROM pgr_drivingDistance('SELECT gid as id, source::int4, target::int4, cost_s::float8 as cost FROM ways', " + target_id + "," + time_m + ", true, false)) AS network ON ways_vertices_pgr.id = network.id1";
    
    pg.connect(CONNECTION_STRING, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        
        client.query(query, [], function(err, result) {
            done();     //call `done()` to release the client back to the pool
            callback(err, result); 
        });
    });
};


/**
 * DAO
 * */
module.exports = {
    getIsochrone: getIsochrone,
    snapTogrid: snapTogrid
};






/*
CREATE TYPE public.closest_vertex AS
   (geom public.geometry,
    id integer);




CREATE OR REPLACE FUNCTION public.getclosestpointandtarget(numeric,
    numeric)
  RETURNS closest_vertex AS
$BODY$ DECLARE result_record closest_vertex;
  BEGIN
    SELECT target, the_geom as geom
      INTO result_record.id, result_record.geom 
      FROM ways ORDER by the_geom <-> ST_SetSRID(ST_MakePoint($1, $2),4326) limit 1;

    SELECT ST_ClosestPoint(ST_SetSRID(ST_MakePoint($1, $2),4326), result_record.geom) INTO result_record.geom;
    RETURN result_record;
  END; $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
*/