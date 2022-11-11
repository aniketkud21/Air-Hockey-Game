const express = require('express')
const router = express.Router()

const passport = require('passport')

const {Users, GameLobby, Game, LeaderBoard} = require('../controllers/userController')
const user = new Users()
const gameLobby = new GameLobby()
const game = new Game()
const leaderboard = new LeaderBoard()

router.get('/login', user.getLoginPage )

router.get('/register',user.getRegisterPage)

router.post('/login', user.verifyLogin )

router.post('/register', user.registerNewUser)

router.get('/lobby', gameLobby.lobby)
   
router.get('/game', passport.authenticate('jwt', {session:false}), game.playGame)

router.get('/logout', passport.authenticate('jwt', {session:false}), gameLobby.logout)

router.get('/quitGame', passport.authenticate('jwt',{session:false}), game.quitGame)

router.get('/leaderboard', leaderboard.displayScore)

// router.get('personalStats', )

module.exports = router