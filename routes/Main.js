//Models
var User = require("../models/User");
var Token = require("../models/Token");

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const secretString = "*(asdasd7921hkjsdhkjasd";

var urlRPC = "";
const Web3 = require('web3');
const web3 = new Web3(urlRPC);

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var privateKey = "*(&";

const botTele_Token = "";
const botTele_Name = "";
const userTeleId_naprut = ""; // tele nhan deposit/withdraw

module.exports = function(app){

    app.post("/register", function(req, res){
        if(!req.body.username || !req.body.password || !req.body.email){
            res.json({result:0, message:"Lack of parameters"});
        }else{
            // check username/email
            var un = req.body.username.trim();
            var em = req.body.email.trim();
            var pw = req.body.password;
            if(un.length<=5 || em.length<=5 || pw.length<=5){
                res.json({result:0, message:"Wrong parameters"});
            }else{
                User.find({$or:[{username:un}, {email:em}]}, function(err, users){
                    if(err || users.length>0){
                        res.json({result:0, message:"Username/email is not availble"});
                    }else{
                        bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash(pw, salt, function(err, hash) {
                                if(err){
                                    res.json({result:0, message:"Hash password error"});
                                }else{
                                    var newUser = new User({
                                        username:un,
                                        password:hash,

                                        email:em,
                                        email_active:false,   // true da acitve, false chua active

                                        type:0, //  0 Client, 1 Administrator

                                        status:1,      // 1 active, 0 block

                                        dateCreated:Date.now(),

                                        currentPoint:0,
                                        point_deposit_blockchain:0, // tien user da nap
                                        point_deposit_bank:0, // tien user da nap
                                        point_withdraw_blockchain:0,
                                        point_withdraw_bank:0,

                                        bet_volume:0, //    tong tien da cuoc
                                        bet_win:0,
                                        bet_lose:0
                                    });
                                    newUser.save(function(e){
                                        if(e){
                                            res.json({result:0, message:"Save user error"});
                                        }else{
                                            res.json({result:1, message:"User has been registered successfully."});
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            }
        }
    });

    app.post("/login", function(req, res){
        if(!req.body.username || !req.body.password){
            res.json({result:0, message:"Lack of parameters"});
        }else{
            // check username/email
            var un = req.body.username.trim();
            var pw = req.body.password;
   
            User.findOne({username:un}, function(err, user){
                if(err){
                    res.json({result:0, message:"User info error"});
                }else{
                    if(user==null){ 
                        res.json({result:0, message:"Username is not availble"});
                    }else{
                        bcrypt.compare(pw, user.password, function(err, res2) {
                            if(err || res2===false){
                                res.json({result:0, message:"Wrong password"});
                            }else{
                                
                                user.password = "***";
                                jwt.sign({data:user}, secretString, { expiresIn: '72h' }, function(err2, token){
                                    if(err2){
                                        console.log(err2);
                                        res.json({result:0, message:"Token created error"});
                                    }else{
                                        var newToken = new Token({
                                            token:token,
                                            idUser:user._id, 
                                            dateCreated:Date.now(),
                                            status:true
                                        });
                                        newToken.save(function(e3){
                                            if(e3){
                                                res.json({result:0, message:"Token saved error"});
                                            }else{
                                                res.json({result:1, token:token});
                                            }
                                        });
                                    }
                                });

                            }
                        });
                    }
                }
            });
            
        }
    });

    app.post("/verifyToken", function(req, res){
        if(!req.body.token){
            res.json({result:0, message:"Lack of parameters"});
        }else{
            Token.findOne({token:req.body.token, status:true}, function(e, token){
                if(e || token==null){
                    res.json({result:0, message:"Token is not exist"});
                }else{
                    jwt.verify(req.body.token, secretString, function(err, decoded) {
                        if(err || decoded==undefined){
                            res.json({result:0, message:"Token is invalid"});
                        }else{
                            res.json({result:1, userInfo:decoded});
                        }
                    });
                }
            });
        }
    });

    var authenticationUser = function(hash,rand, token){
        return new Promise((resolve, reject)=>{
            if(hash.length>0 && rand.length>0){   
                let key = web3.eth.accounts.recover(rand,hash).toLowerCase();
                User.findOne({account:key}, function(e, u){
                    if(e || u==null){
                        resolve({result:0, message:"Wrong user info in db"});
                    }else{
                        resolve({result:1, userData:u});
                    }
                });
            }else if(token.length>0){
                jwt.verify(token, privateKey, function(err, decoded) {
                    if(err || decoded==undefined){
                        resolve({result:0, message:"Wrong token"});
                    }else{
                        User.findById(decoded.data._id, function(e, u){
                            if(e || u==null){
                                resolve({result:0, message:"Wrong user info in db"});
                            }else{
                                resolve({result:1, userData:u});
                            }
                        });
                        
                    }
                }); 
            }else{
                resolve({result:0, message:"Invalid parameters"});
            }
        });
    }

    app.post("/newDeposit_TokenABC", function(req, res){
        if(!req.body.hash){
            res.json({result:0, message:"Wrong parameters"});
        }else{
            checkHash(req.body.hash, res);
        }
    });

    function checkHash(hash, res){
        hash = hash.toLowerCase();
        DepositTransaction.findOne({transactionHash:hash}, function(e, h){
            if(e){
                res.json({result:0, message:"Transaction hash check in database error"});
            }else if(h!=null){
                res.json({result:0, message:"Transaction is already processed"});
            }else{
                setTimeout(()=>{
                    web3.eth.getTransactionReceipt(hash).then((data)=>{
                        console.log(data);
                        if(data!=null){
                            if(data.to.toLowerCase()==DepositTokenABC_Address.toLowerCase()){
                                if(data.status==true){
                                    web3.eth.getTransaction(hash).then((data)=>{
                                        var input = web3.eth.abi.decodeParameters(
                                            // ERC20 transfer method args
                                            [{"internalType":"string","name":"idPlayer","type":"string"},{"internalType":"uint256","name":"amountToken","type":"uint256"}],
                                            `0x${data.input.substring(10)}`
                                        )
                                        //console.log(input.idPlayer);
                                        //console.log(web3.utils.fromWei(input.amountToken, 'ether'));
                                        var idUser = input.idPlayer;
                                        var amount = web3.utils.fromWei(input.amountToken, 'ether');
                                        
                                        User.findByIdAndUpdate(idUser, {$inc:{point_current:amount, point_deposit:amount}}, function(e, user){
                                            var newDep = new DepositTransaction({
                                                transactionHash:hash,
                                                transactionResult:true, 
                                                idUser:idUser,
                                                tokenAmount:amount, // change to ether already
                                                typeToken:1, // 1 TokenABC, 2 BUSD
                                                from:data.from,
                                                dateDeposit:Date.now()
                                            });
                                            if(e){
                                                newDep.pointAdded = false;
                                            }else{
                                                newDep.pointAdded = true;
                                            }
                                            newDep.save(function(e3){

                                                //Telegram
                                                let username = typeof user.account != 'undefined' ? user.account : user.username;
                                                let text = '💚💚💚 Deposit: Người dùng '+ username +', số tiền ' + amount  + ' TokenABC';
                                                axios.get(encodeURI('https://api.telegram.org/bot'+botTele_Token+'/sendMessage?chat_id='+userTeleId_naprut+'&text='+"" + text))
                                                    .then(function (response) {
                                                        console.log(response);
                                                    })
                                                    .catch(function (error) {});
                                                
                        

                                                res.json({result:1, message:"Deposit is successfully"});
                                            });
                                        });
        
                        
                                    });
                                }else if(data.status == false){
                                    var newDep = new DepositTransaction({
                                        transactionHash:hash,
                                        transactionResult:false, // KO DEPOSIT
                                        idUser:null,
                                        tokenAmount:0, 
                                        typeToken:1, 
                                        dateDeposit:Date.now()
                                    });
                                    newDep.save(function(e3){
                                        res.json({result:0, message:"Deposit is failed"});
                                    });
                                }else{ // ko xac dinh dc status
                                    var newDep = new DepositTransaction({
                                        transactionHash:hash,
                                        transactionResult:false,
                                        typeToken:1, 
                                    });
                                    newDep.save(function(e3){
                                        res.json({result:0, message:"Deposit is failed"});
                                    });
                                }
                            }else if(data.to.toLowerCase()==DepositBUSD_Address.toLowerCase()){
                                if(data.status==true){
                                    web3.eth.getTransaction(hash).then((data)=>{
                                        var input = web3.eth.abi.decodeParameters(
                                            // ERC20 transfer method args
                                            [{"internalType":"string","name":"idPlayer","type":"string"},{"internalType":"uint256","name":"amountToken","type":"uint256"}],
                                            `0x${data.input.substring(10)}`
                                        )
                                        //console.log(input.idPlayer);
                                        //console.log(web3.utils.fromWei(input.amountToken, 'ether'));
                                        var idUser = input.idPlayer;
                                        var amount = web3.utils.fromWei(input.amountToken, 'ether');
                                        
                                        User.findByIdAndUpdate(idUser, {$inc:{point_current:amount, point_deposit:amount}}, function(e, user){
                                            var newDep = new DepositTransaction({
                                                transactionHash:hash,
                                                transactionResult:true, 
                                                idUser:idUser,
                                                tokenAmount:amount, // change to ether already
                                                typeToken:2, // 1 TokenABC, 2 BUSD
                                                dateDeposit:Date.now()
                                            });
                                            if(e){
                                                newDep.pointAdded = false;
                                            }else{
                                                newDep.pointAdded = true;
                                            }
                                            newDep.save(function(e3){
                                                //Log Admin
                                                Helper.logAdmin(idUser, 6,  1, amount,'Nạp tiền vào tài khoản');

                                                //Telegram
                                                let username = typeof user.account != 'undefined' ? user.account : user.username;
                                                //let text = 'Người dùng '+ username +' vừa Deposit: ' + amount  + ' TokenABC';
                                                let text = '💚💚💚 Deposit: Người dùng '+ username +', số tiền ' + amount  + ' TokenABC';

                                                axios.get(encodeURI('https://api.telegram.org/bot'+botTele_Token+'/sendMessage?chat_id='+userTeleId_naprut+'&text='+"" + text))
                                                    .then(function (response) {
                                                        console.log(response);
                                                    })
                                                    .catch(function (error) {});

                                                res.json({result:1, message:"Deposit is successfully"});
                                            });
                                        });
        
                        
                                    });
                                }else if(data.status == false){
                                    var newDep = new DepositTransaction({
                                        transactionHash:hash,
                                        transactionResult:false, // KO DEPOSIT
                                        idUser:input.idPlayer,
                                        tokenAmount:0, // change to ether already
                                        typeToken:2, // 
                                        dateDeposit:Date.now()
                                    });
                                    newDep.save(function(e3){
                                        res.json({result:0, message:"Deposit is failed"});
                                    });
                                }else{ // ko xac dinh dc status
                                    var newDep = new DepositTransaction({
                                        transactionHash:hash,
                                        transactionResult:false,
                                        typeToken:2, // 
                                    });
                                    newDep.save(function(e3){
                                        res.json({result:0, message:"Deposit is failed"});
                                    });
                                }
                            }else{
                                res.json({result:0, message:"Cool down man, please."});
                            }
                        }else{
                            res.json({result:0, message:"Transaction check error, please contact supporter."});
                        }
                    });
                }, 10*1000);
            }
        });
        
    }

}