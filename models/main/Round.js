const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const roundSchema = new mongoose.Schema({
    idRoom:mongoose.SchemaTypes.ObjectId,

    betAmount:Number,

    userA_itemChosen:Number, // 0: Rock, 1: Scissor, 2: Paper
    userA_result:Number,

    userB_itemChosen:Number,
    userB_result:Number,

    dateCreated:Date,
    status:Number   /* 
        0:Room vua duoc khoi tao
        2:Betting time (Cho 2 player chot tien bet)     maxTime----> 10s
        3:Waiting 1 [BettingTime]--[3]--[Playing]       maxTime----> 3s
        4:Playing                                       maxTime----> 10s
        5:Waiting 2 [Playing]--[3]--[Process Result]    maxTime----> 3s
        6:Process Result                                processsResult(Server) ----> 3s - 5s
                                                        maxTime----> 5s (Thoi gian hien kq tren may khach)
        7:Done
       -1:Cancel  
    */
});

roundSchema.plugin(AutoIncrement, {inc_field: 'roundNo'});
module.exports = mongoose.model("Round", roundSchema);