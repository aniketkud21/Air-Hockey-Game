const express = require('express')
const router = express.Router()

const passport = require('passport')

const User = require('../models/user')
const Utils = require('../utils')
const jwt = require('jsonwebtoken')

let id = '63681bcdc0a00ed13569df02'

router.get('/', (req, res)=>{
    //console.log(req.cookies['jwt'])
    console.log("get route");
    res.send("You are accessing get route")
})

router.get('/login', (req,res)=>{
    res.render('login.ejs', {message: req.flash('error_msg')})
})

router.get('/register', (req, res)=>{
    res.render('register.ejs', {message: req.flash('error_msg')})
})

router.post('/login', (req, res, next)=>{
    User.findOne({username: req.body.username})
    .then((user)=>{
        if(!user){
            req.flash('error_msg', 'Cant find user' )
            res.status(404).send('Cant find user')
            //res.redirect('/login')
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
                    res.send(tokenObject)
                    //res.redirect('/lobby')
                    //return res.json({suceess:true, token:tokenObject.signedToken, expiresIn:tokenObject.expiresIn})
                }
                else{
                    req.flash('error_msg', 'Incorrect password' )
                    res.status(401).send('Incorrect Password')
                    //res.redirect('/login')
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
})

router.post('/register', (req, res, next)=>{
    User.findOne({username:req.body.username})
    .then((user)=>{
        if(user){
            req.flash('error_msg', 'User already exists' )
            res.status(403).send('User already exists')
            //res.redirect('/register')
            //res.json({suceess:true, message:"User already exists"})
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
                    })
                    
                    try {
                        newUser.save()
                        .then((user)=>{
                            res.send(user)
                            //res.redirect('/login')
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
})

router.get('/lobby', passport.authenticate('jwt', {session:false}), (req,res)=>{
    const decodedjwt = jwt.decode(req.cookies['jwt'], {complete:true})
    let username
    User.findById(decodedjwt.payload.sub)
    .then((user)=>{
        username = user.username;
        res.send(username)
        //res.render('lobby.ejs', {userId: decodedjwt.payload.sub, username:username})
    })
})

router.get('/leaderboard', (req,res)=>{
    User.find({points:{$exists:true}}, null, {sort:{points:-1}})
    .then((resp)=>{
        res.send(resp)
    })
    .catch((err)=>{
        res.send(err)
    })
})

router.get('/personalStats', (req,res)=>{
    User.findById(id)
    .then((user)=>{
        res.send(user)
    })
    .catch((err)=>{
        res.send(err)
    })
})

router.get('/game', (req,res)=>{
    res.render('game.ejs')
})

router.get('/protected', passport.authenticate('jwt', {session:false}), (req, res)=>{
    return res.json({suceess:true, message:"Succesffuly entered protected route"})
})

module.exports = router