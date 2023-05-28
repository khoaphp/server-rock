var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

//blockchain
app.use("/web3", express.static(__dirname + "/node_modules/web3.js-browser/build/"));

var fs = require("fs");
var server = require("http").Server(app);
var io = require("socket.io")(server);
app.io = io;

server.listen(process.env.PORT || 3000);

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

var mongoose = require("mongoose");

// config
const config = {
    "dbMongo":{
        "server":"",
        "username":"",
        "password":"",
        "dbName":""
    }
}

const dbString = "mongodb+srv://"+config.dbMongo.username+":"+config.dbMongo.password+"@"+config.dbMongo.server+"/"+config.dbMongo.dbName+"?retryWrites=true&w=majority";
console.log(dbString);
mongoose.connect(dbString, {useNewUrlParser:true, useUnifiedTopology:true}, function(err){
    if(err){ console.log(err); console.log("Mongo connected error"); }
    else{ 
        console.log("Mongo is connected successfully"); 
        require("./routes/Main")(app);
    }
});
