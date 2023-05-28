const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    
    // Metamask
    accountOwner:String, // Vi mm cua user

    username:String,
    password:String,

    email:String,
    randomNumber:String,
    email_active:Boolean,   // true da acitve, false chua active

    type:Number, //  0 Client, 1 Administrator

    status:Number,      // 1 active, 0 block

    dateCreated:Date,

    currentPoint:Number,
    point_deposit_blockchain:Number, // tien user da nap
    point_deposit_bank:Number, // tien user da nap
    point_withdraw_blockchain:Number,
    point_withdraw_bank:Number,

    bet_volume:Number, //    tong tien da cuoc
    bet_win:Number,
    bet_lose:Number,

    current_socketId:String

});

module.exports = mongoose.model("User", userSchema);