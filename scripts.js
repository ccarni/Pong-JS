const canvas = document.querySelector("canvas");
canvas.width = 1000;
canvas.height = 500;
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart");

class Player {
    constructor(left, top, width, height, speed) {
        this.x = left;
        this.y = top;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
    
    update(input, _canvas) {
        this.y -= input * this.speed;

        // Clamps the paddle within the bounds of the canvas
        this.y = Math.min(Math.max(this.y, 0), _canvas.height - this.height);
    }
    
    draw(_ctx) {
        _ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Ball {
    constructor(left, top, radius, speed) {
        this.x = left;
        this.y = top;
        this.radius = radius;
        this.centerX = left + radius;
        this.centerY = top + radius;
        this.speed = speed;
        this.acceleration = speed/15
        
        this.velocity = [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2]
        
        const velocityMagnitude = Math.sqrt( Math.pow(this.velocity[0], 2) + Math.pow(this.v[1], 2) );
        this.velocity[0] /= velocityMagnitude;
        this.velocity[1] /= velocityMagnitude;
        
        this.velocity[0] *= speed;
        this.velocity[1] *= speed; 
    }
    
    update(_canvas, playerOne, playerTwo) {
        this.x += this.velocity[0];
        this.y += this.velocity[1];
        
        // Vertical collisions
        if (this.y < 0) {
            this.y = 0;
            this.velocity[1] *= -1;
        }
        
        if (this.y + this.radius*2 > _canvas.height) {
            this.y = _canvas.height - this.radius*2;
            this.velocity[1] *= -1;
        }
        
        // Player collisions
        if (this.x + this.radius*2 > playerTwo.x &&
            this.x + this.radius*2 < playerTwo.x + playerTwo.width &&
            this.y + this.radius*2 > playerTwo.y &&
            this.y + this.radius*2 < playerTwo.y + playerTwo.height) {
                
            this.x = playerTwo.x - this.radius*2;
            this.velocity[0] *= -(1 + this.acceleration);
            this.velocity[1] *= 1 + this.acceleration;
                
        }
            
        if (this.x > playerOne.x &&
            this.x < playerOne.x + playerOne.width &&
            this.y + this.radius*2 > playerOne.y &&
            this.y + this.radius*2 < playerOne.y + playerOne.height) {
                
            this.x = playerOne.x + playerOne.width;
            this.velocity[0] *= -(1 + this.acceleration);
            this.velocity[1] *= 1 + this.acceleration;
        }
                
        // Horizontal collisions
        if (this.x < 0) {
            return -1;
        }
        
        if (this.x + this.radius*2 > canvas.width) {
            return 1;
        }
                
        this.centerX = this.x + this.radius;
        this.centerY = this.y + this.radius;
        
        return 0;
    }
    
    draw(_ctx) {
        _ctx.moveTo(this.centerX, this.centerY);
        _ctx.beginPath();
        _ctx.arc(this.centerX, this.centerY, this.radius, 0, 2*Math.PI, true);
        _ctx.fill();
        _ctx.closePath();
    }
    
    resetAndCenter(_canvas) {
        this.x = _canvas.width / 2 - this.radius;
        this.y = _canvas.height / 2 - this.radius;
        this.centerX = this.x + this.radius;
        this.centerY = this.y + this.radius;
        
        this.velocity = [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2]
        
        const velocityMagnitude = Math.sqrt( Math.pow(this.velocity[0], 2) + Math.pow(this.v[1], 2) );
        this.velocity[0] /= velocityMagnitude;
        this.velocity[1] /= velocityMagnitude;
        
        this.velocity[0] *= this.speed;
        this.velocity[1] *= this.speed;
    }
}

class Game {
    constructor() {
        this.playerOne = new Player(50, canvas.height / 2 - 75, 20, 150, 5);
        this.playerTwo = new Player(930, canvas.height / 2 - 75,
        20, 150, 5);
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.ball = new Ball(canvas.width / 2 - 25, canvas.height / 2 - 25, 20, 5);
        
        this.playerOneInput = 0;
        this.playerTwoInput = 0;
        window.addEventListener('keyup', (e) => {
            this.onKeyUp(e);
        });
        window.addEventListener('keydown', (e) => {
            this.onKeyDown(e);
        });
    }
    
    update() {
        const ballScoreStatus = this.ball.update(canvas, this.playerOne, this.playerTwo);
        
        if (ballScoreStatus == -1) {
            this.playerTwoScore++;
            this.ball.resetAndCenter(canvas);
        }
        
        if (ballScoreStatus == 1) {
            this.playerOneScore++;
            this.ball.resetAndCenter(canvas);
        }
        
        this.playerOne.update(this.playerOneInput, canvas);
        this.playerTwo.update(this.playerTwoInput, canvas);
    }
    
    draw() {
        // Empty black canvas
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";

        // Draw a line across the center
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.lineTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.closePath();
        
        // Draw the scores
        ctx.fillStyle = "white";
        ctx.font = "48px sans-serif"
        ctx.fillText(this.playerOneScore.toString(), canvas.width / 2 - 48, 50);
        ctx.fillText(this.playerTwoScore.toString(), canvas.width / 2 + 24, 50);
        
        this.ball.draw(ctx);

        if (this.playerOneScore > this.playerTwoScore) {
            ctx.fillStyle = "gold";
        }
        this.playerOne.draw(ctx);
        
        ctx.fillStyle = "white";
        if (this.playerTwoScore > this.playerOneScore) {
            ctx.fillStyle = "gold";
        }
        this.playerTwo.draw(ctx);
        
    }
    
    onKeyDown(e) {
        if (e.key == "w"){
            this.playerOneInput = 1;
        }
        if (e.key == "s") {
            this.playerOneInput = -1;
        }
        if (e.key == "ArrowUp") {
            this.playerTwoInput = 1;
        }
        if (e.key == "ArrowDown") {
            this.playerTwoInput = -1;
        }
    }
    
    onKeyUp(e) {
        if (e.key == "w" && this.playerOneInput > 0){
            this.playerOneInput = 0;
        }
        if (e.key == "s" && this.playerOneInput < 0) {
            this.playerOneInput = 0;
        }
        if (e.key == "ArrowUp" && this.playerTwoInput > 0) {
            this.playerTwoInput = 0;
        }
        if (e.key == "ArrowDown" && this.playerTwoInput < 0) {
            this.playerTwoInput = 0;
        }
    }
    
}

function main() {
    const game = new Game();

    gameLoopInterval = setInterval(() => {
        game.update();
        game.draw();
    }, 17);
}

let gameLoopInterval;
restartBtn.addEventListener('click', () => {
    clearInterval(gameLoopInterval);
    main();
});

main();