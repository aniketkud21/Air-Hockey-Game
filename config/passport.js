const JWTStrategy = require('passport-jwt').Strategy
const User = require('../models/user')

require('dotenv').config()

const cookieExtractor = (req,res)=>{
    var token = null
    if(req && req.cookies){
        token = req.cookies['jwt']
    }
    return token
}
//console.log(cookieExtractor);

const options = {
    jwtFromRequest : cookieExtractor,
    secretOrKey : process.env.PRIV_KEY
}

module.exports = (passport)=>{
    passport.use(new JWTStrategy(options, (jwt_payload, done)=>{

        User.findOne({_id:jwt_payload.sub})
        .then((user)=>{
            if(user){
                return done(null, user)
            }
            else{
                return done(null, false)
            }
        })
        .catch((err)=>{
            return done(err, false)
        })
    }))
}