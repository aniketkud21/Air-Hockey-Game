const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

require('dotenv').config()
const PRIV_KEY = process.env.PRIV_KEY

const genSalt = async()=>{
    const salt = await bcrypt.genSalt(10)
    return salt
}

const genPassword = async (password, salt)=>{
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
}

const validatePassword = async (password, hashedPassword)=>{
    const isValid = await bcrypt.compare(password, hashedPassword)
    return isValid
}

const issueJWT = (user)=>{
    const _id = user._id
    const expiresIn = '1d'

    const payload = {
        sub: _id,
        iat: Date.now()
    }

    const signedToken = jsonwebtoken.sign(payload,PRIV_KEY,{expiresIn:expiresIn})

    return {
        signedToken: signedToken,
        expiresIn: expiresIn
    }
}

module.exports.genSalt = genSalt
module.exports.genPassword = genPassword
module.exports.validatePassword = validatePassword
module.exports.issueJWT = issueJWT