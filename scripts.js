const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart");
let gameLoopInterval;
canvas.width = 1000;
canvas.height = 500;

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
        this.originalSpeed = speed;
        this.speed = speed;

        // Get a random velocity
        this.v = [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2]
        
        // Make the velocity a unit vector
        const mag = Math.sqrt( Math.pow(this.v[0], 2) + Math.pow(this.v[1], 2) );
        this.v[0] /= mag;
        this.v[1] /= mag;
        
        // Speed up the velocity
        this.v[0] *= speed;
        this.v[1] *= speed; 
    }

    update(_canvas, playerOne, playerTwo) {
        this.x += this.v[0];
        this.y += this.v[1];

        // Vertical collisions
        if (this.y < 0) {
            this.y = 0;
            this.v[1] *= -1;
        }

        if (this.y + this.radius*2 > _canvas.height) {
            this.y = _canvas.height - this.radius*2;
            this.v[1] *= -1;
        }

        // Player collisions
        if (this.x + this.radius*2 > playerTwo.x &&
            this.x + this.radius*2 < playerTwo.x + playerTwo.width &&
            this.y + this.radius*2 > playerTwo.y &&
            this.y + this.radius*2 < playerTwo.y + playerTwo.height) {
            
            this.x = playerTwo.x - this.radius*2;
            this.centerX = this.x + this.radius;
            this.v[0] *= -1;

            this.v[0] *= 1 + this.speed/15;
            this.v[1] *= 1 + this.speed/15;

        }

        if (this.x > playerOne.x &&
            this.x < playerOne.x + playerOne.width &&
            this.y + this.radius*2 > playerOne.y &&
            this.y + this.radius*2 < playerOne.y + playerOne.height) {
            
            this.x = playerOne.x + playerOne.width;
            this.centerX = this.x + this.radius;
            this.v[0] *= -1;

            this.v[0] *= 1 + this.speed/15;
            this.v[1] *= 1 + this.speed/15;
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

    center(_canvas) {
        this.x = _canvas.width / 2 - this.radius;
        this.y = _canvas.height / 2 - this.radius;
        this.centerX = this.x + this.radius;
        this.centerY = this.y + this.radius;
        this.speed = this.originalSpeed;

        // Get a random velocity
        this.v = [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2]
        
        // Make the velocity a unit vector
        const mag = Math.sqrt( Math.pow(this.v[0], 2) + Math.pow(this.v[1], 2) );
        this.v[0] /= mag;
        this.v[1] /= mag;
        
        // Speed up the velocity
        this.v[0] *= this.speed;
        this.v[1] *= this.speed;
    }
}

class Game {
    constructor() {
        // create the players
        this.playerOne = new Player(50, canvas.height / 2 - 75, 20, 150, 5);
        this.playerTwo = new Player(930, canvas.height / 2 - 75,
        20, 150, 5);
        this.playerOneScore = 0;
        this.playerTwoScore = 0;

        this.ball = new Ball(canvas.width / 2 - 25, canvas.height / 2 - 25, 20, 5);

        this.isRunning = true;

        this.wsInput = 0;
        this.upDownInput = 0;

    }
    
    update() {
        const status = this.ball.update(canvas, this.playerOne, this.playerTwo);

        if (status == -1) {
            this.playerTwoScore++;
            this.ball.center(canvas);
        }

        if (status == 1) {
            this.playerOneScore++;
            this.ball.center(canvas);
        }

        this.playerOne.update(this.wsInput, canvas);
        this.playerTwo.update(this.upDownInput, canvas);
    }
    
    draw() {
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
        
        ctx.fillStyle = "white";
        ctx.font = "48px sans-serif"
        ctx.fillText(this.playerOneScore.toString(), canvas.width / 2 - 48, 50);
        ctx.fillText(this.playerTwoScore.toString(), canvas.width / 2 + 24, 50);

        this.ball.draw(ctx);
        // Draw the players
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
            this.wsInput = 1;
        }
        if (e.key == "s") {
            this.wsInput = -1;
        }
        if (e.key == "ArrowUp") {
            this.upDownInput = 1;
        }
        if (e.key == "ArrowDown") {
            this.upDownInput = -1;
        }
    }
    
    onKeyUp(e) {
        if (e.key == "w" && this.wsInput > 0){
            this.wsInput = 0;
        }
        if (e.key == "s" && this.wsInput < 0) {
            this.wsInput = 0;
        }
        if (e.key == "ArrowUp" && this.upDownInput > 0) {
            this.upDownInput = 0;
        }
        if (e.key == "ArrowDown" && this.upDownInput < 0) {
            this.upDownInput = 0;
        }
    }

}

function main() {
    const game = new Game();
    window.addEventListener('keyup', (e) => {
        game.onKeyUp(e);
    });
    window.addEventListener('keydown', (e) => {
        game.onKeyDown(e);
    });

    gameLoopInterval = setInterval(() => {
        game.update();
        game.draw();
    }, 17);
}

main();

restartBtn.addEventListener('click', () => {
    clearInterval(gameLoopInterval);
    main();
});