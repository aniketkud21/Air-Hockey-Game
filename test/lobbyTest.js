const chai = require('chai')
const chaiHttp = require('chai-http')
const io = require('socket.io-client')
var socketUrl = 'http://localhost:3000';
var options = {  
  transports: ['websocket'],
  'force new connection': true
};

const server = require('../app')

// assertion style
chai.should()

chai.use(chaiHttp)

let userId1 = '637a327d8f09ccf53cd037fe'
let userId2 = '637a381df64f8eee66db0b36'
let token

describe('Air Hockey Test', ()=>{

    describe('Test1: Chat functionality',()=>{
        it('Should be able to send and recieve message', (done)=>{
            const client1 = io.connect(socketUrl)
            client1.on('connect', ()=>{
                client1.emit('new-user-joined', (userId1) )
                const client2 = io.connect(socketUrl,options)
                client2.on('connect',()=>{
                    client2.emit('new-user-joined', (userId2) )
                    client1.emit('send-message', "Test string")
                    client2.on('receive-message', (res)=>{
                        chai.expect(res.message).to.equal('Test string')
                        done()
                    })
                })
            })
        })
    })

    // user already exists
    describe('Test2: Registration',()=>{
        it('Should return User already exists', (done)=>{
            let credentials = {
                username: "aniket",
                password: "abcd"
            }
            chai.request(server)
                .post('/test/register')
                .send(credentials)
                .end((err,resp)=>{
                    resp.should.have.status(403)
                    resp.text.should.be.eq('User already exists')
                done()
                })
        })
    })

    // non existent user
    describe('Test3: Login Username',()=>{
        it('Should return Cant find user', (done)=>{
            let credentials = {
                username: "ramesh",
                password: "abcd"
            }
            chai.request(server)
                .post('/test/login')
                .send(credentials)
                .end((err,resp)=>{
                    resp.should.have.status(404)
                    resp.text.should.be.eq('Cant find user')
                done()
                })
        })
    })

     // incorrect password
     describe('Test4: Login Password',()=>{
        it('Should return Incorrect Password', (done)=>{
            let credentials = {
                username: "aniket",
                password: "abcd2"
            }
            chai.request(server)
                .post('/test/login')
                .send(credentials)
                .end((err,resp)=>{
                    resp.should.have.status(401)
                    resp.text.should.be.eq('Incorrect Password')
                done()
                })
        })
    })

    // unauthorized
    describe('Test5: Unauthorized access',()=>{
        it('Should return unauthorized', (done)=>{
            chai.request(server)
                .get('/test/lobby')
                .end((err,resp)=>{
                    resp.should.have.status(401)
                    resp.text.should.be.eq('Unauthorized')
                done()
                })
        })
    })

    // succesful login
    describe('Test6: Successful access',()=>{
        it('Should return authorization token', (done)=>{
            let credentials = {
                username: "nigga",
                password: "nigga"
            }
            chai.request(server)
                .post('/test/login')
                .send(credentials)
                .end((err,resp)=>{
                    resp.should.have.status(200)
                    resp.body.should.be.a('object')
                    resp.body.should.have.property('signedToken')
                    resp.body.should.have.property('expiresIn')
                    token = resp.body.signedToken
                done()
                })
        })
    })

    // return username
    describe('Test7: Username on successful login',()=>{
        it('Should return correct username', (done)=>{
            chai.request(server)
                .get('/test/lobby')
                .set('Cookie', 'jwt='+token)
                .end((err,resp)=>{
                    resp.should.have.status(200)
                    resp.text.should.be.eq('jayesh')
                done()
                })
        })
    })

    // Leaderboard test
    describe('Test8: Leaderboard',()=>{
        it('Should return leaderboard array', (done)=>{
            chai.request(server)
                .get('/test/leaderboard')
                .end((err,resp)=>{
                    resp.should.have.status(200)
                    resp.body.should.be.a('array')
                    resp.body.length.should.be.eq(5)
                done()
                })
        })
    })

    // Personal Stats Test
    describe('Test9: Personal Stats',()=>{
        it('Should return personal stats object', (done)=>{
            chai.request(server)
                .get('/test/personalStats')
                .set('Cookie', 'jwt='+token)
                .end((err,resp)=>{
                    resp.should.have.status(200)
                    resp.body.should.be.a('object')
                    resp.body.should.have.property('username')
                    resp.body.should.have.property('games')
                    resp.body.should.have.property('wins')
                    resp.body.should.have.property('loss')
                    resp.body.should.have.property('points')
                done()
                })
        })
    })    

    // Game Test
    describe('Test10: Game',()=>{
        it('Should successfully enter in game', (done)=>{
            chai.request(server)
                .get('/test/game')
                .end((err,resp)=>{
                    resp.should.have.status(200)
                done()
                })
        })
    })
})