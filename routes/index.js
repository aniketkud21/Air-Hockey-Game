const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../models/user')
const Utils = require('../utils')

router.get('/', (req, res)=>{
    console.log(req.cookies['jwt'])
    console.log("get route");
    res.send("You are accessing get route")
})

router.get('/login', (req,res)=>{
    res.render('login.ejs')
})

router.get('/register', (req, res)=>{
    res.render('register.ejs')
})

router.post('/login', (req, res, next)=>{
    User.findOne({username: req.body.username})
    .then((user)=>{
        if(!user){
            return res.json({suceess: false, message:'Cant find user'})
        }
        else{
            const isValid = Utils.validatePassword(req.body.password, user.hash)
            .then((isValid)=>{
                if(isValid){
                    const tokenObject = Utils.issueJWT(user)
                    res.cookie('jwt', tokenObject.signedToken, {
                        httpOnly:true
                    })
                    res.redirect('/protected')
                    //return res.json({suceess:true, token:tokenObject.signedToken, expiresIn:tokenObject.expiresIn})
                }
                else{
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
})

router.post('/register', (req, res, next)=>{
    User.findOne({username:req.body.username})
    .then((user)=>{
        if(user){
            return res.json({suceess:true, message:"User already exists"})
        }
        else{
            Utils.genSalt()
            .then((salt)=>{
                Utils.genPassword(req.body.password, salt)
                .then((hashedPassword)=>{
                    const newUser = new User({
                        username:req.body.username,
                        salt:salt,
                        hash:hashedPassword
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
})

router.get('/protected', passport.authenticate('jwt', {session:false}), (req, res)=>{
    return res.json({suceess:true, message:"Succesffuly entered protected route"})
})

module.exports = router