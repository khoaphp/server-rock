const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema({
    token:String,
    idUser:mongoose.SchemaTypes.ObjectId, 
    dateCreated:Date,
    status:Boolean
});

module.exports = mongoose.model("Token", tokenSchema);