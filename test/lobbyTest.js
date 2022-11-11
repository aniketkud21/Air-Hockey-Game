let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../app')

// Assertion style
chai.should()

chai.use(chaiHttp)

describe('lobby api', ()=>{
    describe('GET /lobby', ()=>{
        it("It should return leaderboard array", (done)=>{
            chai.request(server)
                .get('/lobby')
                .end((err,resp)=>{
                    resp.should.have.status(200)
                    resp.body.should.be.a('object')
                done()
                })
        })
    })
})