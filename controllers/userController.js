const User = require('../models/user')
const Utils = require('../utils')
const jwt = require('jsonwebtoken')

class Users{
    getLoginPage = (req,res)=>{
        res.render('login.ejs', {message: req.flash('error_msg')})
    }
    
    getRegisterPage = (req, res)=>{
        res.render('register.ejs', {message: req.flash('error_msg')})
    }
    
    verifyLogin = (req, res, next)=>{
        User.findOne({username: req.body.username})
        .then((user)=>{
            if(!user){
                req.flash('error_msg', 'Incorrect Username' )
                res.redirect('/login')
                //return res.json({suceess: false, message:'Cant find user'})
            }
            else{
                const isValid = Utils.validatePassword(req.body.password, user.hash)
                .then((isValid)=>{
                    if(isValid){
                        const tokenObject = Utils.issueJWT(user)
                        res.cookie('jwt', tokenObject.signedToken, {
                            httpOnly:true
                        })
                        res.redirect('/lobby')
                        //return res.json({suceess:true, token:tokenObject.signedToken, expiresIn:tokenObject.expiresIn})
                    }
                    else{
                        req.flash('error_msg', 'Incorrect password' )
                        res.redirect('/login')
                        //return res.json({suceess: true, message:"Incorrect password"})
                    }
                })
                .catch((err)=>{
                    next(err)
                })
            }
        })
        .catch((err)=>{
            next(err)
            //return res.json({suceess:false, message:err})
        })
    }
    
    registerNewUser = (req, res, next)=>{
        User.findOne({username:req.body.username})
        .then((user)=>{
            if(user){
                req.flash('error_msg', 'User already exists' )
                res.redirect('/register')
                //return res.json({suceess:true, message:"User already exists"})
            }
            else{
                Utils.genSalt()
                .then((salt)=>{
                    Utils.genPassword(req.body.password, salt)
                    .then((hashedPassword)=>{
                        const newUser = new User({
                            username:req.body.username,
                            salt:salt,
                            hash:hashedPassword,
                            games:req.body.games,
                            wins:req.body.wins,
                            loss:req.body.loss,
                            points:req.body.points
                        })
                        
                        try {
                            newUser.save()
                            .then((user)=>{
                                res.redirect('/login')
                                //res.json({suceess:true, user:user})
                            })
                        } catch (error) {
                            res.redirect('/register')
                            //res.json({suceess:false, message:error})
                        }
                    })
                })
            }
        })
        .catch((err)=>{
            next(err)
            //res.json({suceess:false, message:err})
        })
    }

    getUserId(cookieVal){
        const decodedjwt = jwt.decode(cookieVal, {complete:true})
        return decodedjwt.payload.sub
    }
}

class Game{
    playGame =(req,res)=>{
        res.render('game.ejs')
    }

    quitGame = (req,res)=>{
        console.log("Quitting the game");
        res.redirect('/lobby')
    }
}

class Chat{
    sendMessage(socket, message, onlineUsers){    
        socket.broadcast.emit('receive-message', {message: message, name:onlineUsers[socket.id].username})
    }
}

class GameLobby{

    constructor(){
        this.userObj = new Users()
        this.leaderboardObj = new LeaderBoard()
    }
    lobby = async (req,res)=>{
        const cookieVal = req.cookies['jwt']
        let userId = this.userObj.getUserId(cookieVal)
        const scoreList = await this.leaderboardObj.displayScore()
        console.log(scoreList);
        const personalScore = await this.leaderboardObj.displayPersonalScore(userId)
        console.log(personalScore);
        res.render('lobby.ejs', {userId:userId, personalScore:personalScore, scoreList:scoreList})
        
    }

    logout = (req,res)=>{
        res.cookie('jwt', '', {maxAge:1})
        res.redirect('/login')
    }
}

class LeaderBoard{
    displayScore(){
        return User.find({points:{$exists:true}},null,{sort:{points:-1}})
        // let sortedTable = User.find({points:{$exists:true}}).sort({points:-1})
        // console.log(sortedTable);
    }

    displayPersonalScore(userId){
        return User.findById(userId)
        // User.findById(userId)
        // .then((user)=>{
        //     console.log(user);
        //     return user
        // }) 
    }
}


module.exports = {Users, GameLobby, Game, Chat, LeaderBoard}