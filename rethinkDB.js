/*
    This file contains the functionality, configuration and implementation of rethinkDB
    V 0.0.1
    Logistica
*/


/*
    MODULE DEPENDENCIES
*/
var rethink = require('rethinkdb');

/*
    RETHINKDB CONF
*/
var HOST =  "107.170.232.222";
var PORT =  28015;
var DB =    "logistica_autos";
var TABLE = "prototipo";


/*
    DAO
*/
module.exports = {
    insert: function (data) {
        return insertImplementation(data);
    },
    endTrip: function(data){
        return endTripImplementation(data);
    },
    getConnection: function(){
        return getConnectionImplementation();
    }
};


/*
*
*
*
*   DAO IMPLEMENTATIONS
*
*
*
*/
function insertImplementation(data){

    /*
        Open connection
    */
    rethink.connect({ host: HOST, port: PORT, db: DB }, function (err, conn) {
        if (err) throw err;

        /*
        Insert
        */
        var result = rethink.table(TABLE).insert(data).run(conn, function (err, result) {
            if (err) {
                console.log("Ocurrio un error durante el guardado de la información.");
                console.log("Data: ");
                console.log(JSON.stringify(data));
                console.log(err);
            }else{
                console.log(result);
            }
        });

        /*
        Close connection
        */
        conn.close(function (err) { if (err) throw err; });
        return result;
    });

}

function endTripImplementation(data){
    /*
        Open connection
    */
    rethink.connect({ host: HOST, port: PORT, db: DB }, function (err, conn) {
        if (err) throw err;

        /*
        Get Data of the trip
        */
        var result = rethink.table("prototipo").filter(r.row("properties").getField("idCar").match(idCar)).deletase({ returnChanges: true }).run(conn, function (err, result) {
            if (err) {
                console.log("Something has gone wrong :'(");
                console.log(err);
                console.log("----------------------");
            }

            //Handle data
            var data = result.changes;
            data.forEach(function (point) {
                var point_data = point.old_val;


            });
        });

        /*
        Close connection
        */
        conn.close(function (err) { if (err) throw err; })
        return result;
    });
}


function getConnectionImplementation(){
    /*
        Open connection
    */
    return rethink.connect({ host: HOST, port: PORT, db: DB });
}