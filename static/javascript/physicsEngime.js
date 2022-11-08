// For Football

// const canvas = document.getElementById('canvas');
// const ctx = canvas.getContext('2d');

const BALLZ = [];
const WALLZ = [];

let LEFT, UP, RIGHT, DOWN;
let friction = 0.0;

class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    add(v){
        return new Vector(this.x+v.x, this.y+v.y);
    }

    subtr(v){
        return new Vector(this.x-v.x, this.y-v.y);
    }

    mag(){
        return Math.sqrt(this.x**2 + this.y**2);
    }

    mult(n){
        return new Vector(this.x*n, this.y*n);
    }

    //returns a perpendicular normal vector
    normal(){
        return new Vector(-this.y, this.x).unit();
    }

    //returns a vector with same direction and 1 length
    unit(){
        if(this.mag() === 0){
            return new Vector(0,0);
        } else {
            return new Vector(this.x/this.mag(), this.y/this.mag());
        }
    }

    drawVec(start_x, start_y, n, color){
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath()
    }
    
    //returns the length of a vectors projection onto the other one
    static dot(v1, v2){
        return v1.x*v2.x + v1.y*v2.y;
    }
}

class Ball{
    constructor(x, y, r, m,maxspeed){
        this.pos  = new Vector(x,y);
        this.r = r;
        this.m = m;
        if(m==0){
            this.inv_m = 0;
        }
        else {
            this.inv_m = 1/m;
        }
        this.vel = new Vector(0,0);
        this.acc = new Vector(0,0);
        this.acceleration = 0.1;
        this.elasticity = 1;
        this.player = false;
        BALLZ.push(this);
    }
    
    // Drawing the ball on canvas (Refer canvas mdn docs)
    drawBall(){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    // Used to just visualize the vel and acc of the ball
    display(){
        this.vel.drawVec(550, 400, 10, "green");
        this.acc.unit().drawVec(550, 400, 50, "blue");
        ctx.beginPath();
        ctx.arc(550, 400, 50, 0, 2*Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }

    reposition(){
        this.acc = this.acc.unit().mult(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-friction);
        this.pos = this.pos.add(this.vel);
    }
}

class Wall{
    constructor(x1,y1,x2,y2){
        this.start = new Vector(x1,y1)
        this.end = new Vector(x2,y2)
        WALLZ.push(this)
    }
    
    drawWall(){
        ctx.beginPath()
        ctx.moveTo(this.start.x, this.start.y)
        ctx.lineTo(this.end.x, this.end.y)
        ctx.strokeStyle = "black"
        ctx.stroke()
        ctx.closePath()
    }

    wallUnit(){
        return this.end.subtr(this.start).unit()
    }
}

function closestPoint(b,w){
    let ballWallStart = w.start.subtr(b.pos)
    if(Vector.dot(ballWallStart, w.wallUnit()) > 0){
        return w.start
    }

    let ballWallEnd = b.pos.subtr(w.end)
    if(Vector.dot(ballWallEnd, w.wallUnit()) > 0){
        return w.end
    }

    let closestDist = Vector.dot(ballWallStart, w.wallUnit())
    let closestVec = w.wallUnit().mult(closestDist)
    return w.start.subtr(closestVec)
}

function collisionDetectionBW(b,w){
    if(b.r >= closestPoint(b,w).subtr(b.pos).mag()){
        return true;
    }
    else{
        return false;
    }
}

function penetrationResolutionBW(b,w){
    let dist = b.pos.subtr(closestPoint(b,w))
    let depth = b.r - dist.mag()
    let depthRes = dist.unit().mult(depth)

    b.pos = b.pos.add(depthRes)
}

function collisionResolutionBW(b,w){
    let normal = b.pos.subtr(closestPoint(b,w)).unit()
    let sepVel = Vector.dot(normal, b.vel)
    let newSepVel = -sepVel*b.elasticity
    let sepVelDiff = newSepVel - sepVel

    b.vel = b.vel.add(normal.mult(sepVelDiff))
}

// returns if 2 balls collide
function collisionDetection(b1,b2){
    let dist = b2.pos.subtr(b1.pos).mag()
    if(b1.r + b2.r >= dist){
        return true
    }
    else{
        return false
    }
}

function penetrationResolution(b1,b2){
    let dist = b1.pos.subtr(b2.pos)
    let depth = b1.r + b2.r - dist.mag() 
    let depthRes = dist.unit().mult(depth/b1.inv_m + b2.inv_m)
    b1.pos = b1.pos.add(depthRes.mult(b1.inv_m))
    b2.pos = b2.pos.add(depthRes.mult(-b2.inv_m))
}

function collisionResolution(b1,b2){
    let normal = b1.pos.subtr(b2.pos).unit();
    let relVel = b1.vel.subtr(b2.vel);
    let sepVel = Vector.dot(relVel,normal)
    let newSepVel = -sepVel*Math.min(b1.elasticity, b2.elasticity)

    let sepVelDiff = newSepVel -sepVel
    let impulse = sepVelDiff/(b1.inv_m + b2.inv_m)
    let impulseVec = normal.mult(impulse)

    b1.vel = b1.vel.add(impulseVec.mult(b1.inv_m))
    b2.vel = b2.vel.add(impulseVec.mult(-b2.inv_m))
}

function keyControl(b){
    canvas.addEventListener('keydown', function(e){
        if(e.code === "ArrowLeft"){
            LEFT = true;
        }
        if(e.code === "ArrowUp"){
            UP = true;
        }
        if(e.code === "ArrowRight"){
            RIGHT = true;
        }
        if(e.code === "ArrowDown"){
            DOWN = true;
        }
    });
    
    canvas.addEventListener('keyup', function(e){
        if(e.code === "ArrowLeft"){
            LEFT = false;
        }
        if(e.code === "ArrowUp"){
            UP = false;
        }
        if(e.code === "ArrowRight"){
            RIGHT = false;
        }
        if(e.code === "ArrowDown"){
            DOWN = false;
        }
    });
    
    if(LEFT){
        b.acc.x = -b.acceleration;
    }
    if(UP){
        b.acc.y = -b.acceleration;
    }
    if(RIGHT){
        b.acc.x = b.acceleration;
    }
    if(DOWN){
        b.acc.y = b.acceleration;
    }
    if(!LEFT && !RIGHT){
        b.acc.x = 0;
    }
    if(!UP && !DOWN){
        b.acc.y = 0;
    }
}

function gameLogic(){}

// refer request animation frame mdn docs
// new ball is created 60 times per sec
function renderLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    BALLZ.forEach((b, index) => {
        b.drawBall();
        if (b.player){
            keyControl(b);
        }

        WALLZ.forEach((w)=>{
            if(collisionDetectionBW(b,w)){
                penetrationResolutionBW(b,w)
                collisionResolutionBW(b,w)
                ctx.fillText("Collision" , 550, 400, 50)
            }
        })
        
        for(let i=index+1; i<BALLZ.length; i++){
            if(collisionDetection(BALLZ[index], BALLZ[i])){
                penetrationResolution(BALLZ[index], BALLZ[i])
                collisionResolution(BALLZ[index], BALLZ[i])
                //ctx.fillText("Collision" , 550, 400, 50)
            }
        }
        b.display();
        b.reposition();
    })
    WALLZ.forEach((w)=>{
        w.drawWall();
    })
    
    
    //closestPoint(Ball1,Wall1).subtr(Ball1.pos).drawVec(Ball1.pos.x, Ball1.pos.y, 1, "green")
    
    
}
function mainLoop(){
    renderLoop();
    gameLogic();
    requestAnimationFrame(mainLoop);
}

// let Ball1 = new Ball(200, 200, 30, 2);
// //let Ball2 = new Ball(400, 400, 20, 0);
// let Wall1 = new Wall(50, 150, 200, 250)
// // let Ball3 = new Ball(320, 250, 15);
// // let Ball4 = new Ball(450, 340, 25);
// // let Ball5 = new Ball(600, 50, 10);
// // let Ball6 = new Ball(470, 250, 20);

// let edge1 = new Wall(0, 0, canvas.clientWidth, 0);
// let edge2 = new Wall(canvas.clientWidth, 0, canvas.clientWidth, canvas.clientHeight);
// let edge3 = new Wall(canvas.clientWidth, canvas.clientHeight, 0, canvas.clientHeight);
// let edge4 = new Wall(0, canvas.clientHeight, 0, 0);

// Ball1.player = true;

//requestAnimationFrame(mainLoop);