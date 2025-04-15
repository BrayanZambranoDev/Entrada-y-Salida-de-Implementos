let mysql = require("mysql");
let conexion1 =  mysql.createConnection ({
    host:"localhost",
    database :"mercadeo",
    user: "root",
    password:"root",
});

conexion.connect(function(err) {

    if(err){
        
    throw err;
    
    }else
    
    console.log("conexion exitosa");
    
    });
