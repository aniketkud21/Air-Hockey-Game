const chai = require('chai')
const chaiHttp = require('chai-http')

const server = require('../app')

// assertion style
chai.should()

chai.use(chaiHttp)

let token
let userId = '63681bcdc0a00ed13569df02'

describe('Air Hockey Test', ()=>{
    // Leaderboard test
    describe('GET /leaderboard',()=>{
        it('It should return leaderboard array', (done)=>{
            chai.request(server)
                .get('/leaderboard')
                .end((err,resp)=>{
                    resp.should.have.status(200)
                    resp.body.should.be.a('array')
                    resp.body.length.should.be.eq(5)
                done()
                })
        })
    })

    // Personal Stats Test
    describe('GET /personalStats',()=>{
        it('It should return personal stats object', (done)=>{
            chai.request(server)
                .get('/personalStats')
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
    describe('GET /game',()=>{
        it('It should return status code 200', (done)=>{
            chai.request(server)
                .get('/game')
                .end((err,resp)=>{
                    resp.should.have.status(200)
                done()
                })
        })
    })

    // user already exists
    describe('POST /register',()=>{
        it('It should return already exist', (done)=>{
            let credentials = {
                username: "aniket",
                password: "abcd"
            }
            chai.request(server)
                .post('/register')
                .send(credentials)
                .end((err,resp)=>{
                    resp.should.have.status(403)
                    resp.text.should.be.eq('User already exists')
                done()
                })
        })
    })

    // unauthorized
    describe('GET /lobby',()=>{
        it('It should return unauthorized', (done)=>{
            chai.request(server)
                .get('/lobby')
                .end((err,resp)=>{
                    resp.should.have.status(401)
                    resp.text.should.be.eq('Unauthorized')
                done()
                })
        })
    })
    

    // succesful login
    describe('POST /login',()=>{
        it('It should return token', (done)=>{
            let credentials = {
                username: "jayesh",
                password: "abcd"
            }
            chai.request(server)
                .post('/login')
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
    describe('GET /lobby',()=>{
        it('It should return username', (done)=>{
            chai.request(server)
                .get('/lobby')
                .set('Cookie', 'jwt='+token)
                .end((err,resp)=>{
                    resp.should.have.status(200)
                    resp.text.should.be.eq('jayesh')
                done()
                })
        })
    })

    // non existent user
    describe('POST /login',()=>{
        it('It should return User error', (done)=>{
            let credentials = {
                username: "ramesh",
                password: "abcd"
            }
            chai.request(server)
                .post('/login')
                .send(credentials)
                .end((err,resp)=>{
                    resp.should.have.status(404)
                    resp.text.should.be.eq('Cant find user')
                done()
                })
        })
    })

    // incorrect password
    describe('POST /login',()=>{
        it('It should return Password error', (done)=>{
            let credentials = {
                username: "aniket",
                password: "abcd2"
            }
            chai.request(server)
                .post('/login')
                .send(credentials)
                .end((err,resp)=>{
                    resp.should.have.status(401)
                    resp.text.should.be.eq('Incorrect Password')
                done()
                })
        })
    })
})