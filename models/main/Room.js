const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const roomSchema = new mongoose.Schema({

    idUser_A:mongoose.SchemaTypes.ObjectId, // primary key (khoa chinh)

    idUser_B:mongoose.SchemaTypes.ObjectId, 
    date_user_B_join:Date,

    description:String,
    dateCreated:Date,
    status:Number          
    /*  [lifeCycle_Room]
        0:Waiting (Room vua duoc khoi tao)              maxTime----> 2 hr
        1:Room is full (Room da du 2 user A & B)        maxTime----> 3s
        2:Betting time (Cho 2 player chot tien bet)     maxTime----> 10s
        3:Waiting 1 [BettingTime]--[3]--[Playing]       maxTime----> 3s
        4:Playing                                       maxTime----> 10s
        5:Waiting 2 [Playing]--[3]--[Process Result]    maxTime----> 3s
        6:Process Result                                processsResult(Server) ----> 3s - 5s
                                                        maxTime----> 5s (Thoi gian hien kq tren may khach)
        7:Closed
       -1:Cancel  
    */
});

roomSchema.plugin(AutoIncrement, {inc_field: 'roomNo'});
module.exports = mongoose.model("Room", roomSchema);