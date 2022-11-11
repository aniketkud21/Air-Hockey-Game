const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let player1 = new Ball(80,270,30,10,1)
player1.score=0;
player1.color = "blue"
let player2 = new Ball(540,270,30,10,1)
player2.score=0;
player2.color = "green"
let football = new Ball(320,270,15,5,1)
football.color = "red"
buildStadium()

ctx.font = "30px Arial"

function gameLogic(){
    if(football.pos.x<45){
        changeGameState(player2)
    }
    if(football.pos.x>595){
        changeGameState(player1)
    }
    ctx.fillText(player1.score, 20,30)
    ctx.fillText(player2.score,600,30)

    if(player1.score==3 || player2.score==3){
        gameOver()
    }
}

function changeGameState(player){
    player.score++;

    player1.setPosition(80,270,0)
    player1.vel.set(0,0)

    player2.setPosition(540,270,0)
    player2.vel.set(0,0)
    
    football.setPosition(320,270,0)
    football.vel.set(0,0)
}

function gameOver(){
    ctx.fillText("GAME OVER", 250,30)
    player1.setPosition(80,270,0)
    player1.vel.set(0,0)

    player2.setPosition(540,270,0)
    player2.vel.set(0,0)
    
    football.setPosition(320,270,0)
    football.vel.set(0,0)
}

userInput1(player2)
userInput2(player1)
requestAnimationFrame(mainLoop)

function buildStadium(){
    new Wall(60, 80, 580, 80);
    new Wall(60, 460, 580, 460);

    new Wall(60, 80, 60, 180);
    new Wall(60, 460, 60, 360);
    new Wall(580, 80, 580, 180);
    new Wall(580, 460, 580, 360);

    new Wall(50, 360, 10, 360);
    new Wall(0, 360, 0, 180);
    new Wall(10, 180, 50, 180);
    new Wall(590, 360, 630, 360);
    new Wall(640, 360, 640, 180);
    new Wall(630, 180, 590, 180);
}