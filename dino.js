// Images
const dinoPNG = new Image();
dinoPNG.src = "assets/dino.png";
const cactusPNG = new Image();
cactusPNG.src = "assets/cactus.png";
const birdPNG = new Image();
birdPNG.src = "assets/bird.png";
const duckPNG = new Image();
duckPNG.src = "assets/duck.png";
const background = new Image()
background.src = "assets/background.png"

let jump = new Audio()
jump.src = "assets/jump.mp3"
jump.load()

let passed = new Audio()
passed.src = "assets/passed.mp3"
passed.load()
passed.volume = 0.6

let gameOverAudio = new Audio()
gameOverAudio.src = "assets/gameover.mp3"
gameOverAudio.load()

// Board
let board;
let boardWidth = 800;
let boardHeight = 250;
let context;
let gameOver = false;
let score = 0;
let gameStart = false;
let highestScore = 0
let count = 0
background.onload = ()=>{
  context.drawImage(background, 0, 0, boardWidth, boardHeight)
  requestAnimationFrame(update);
}


// Dino
let dinoHeight = 60;
let dinoWidth = 60;
let dinoX = boardWidth / 8.5;
let dinoY = boardHeight / 2;
let dino = {
  height: dinoHeight,
  width: dinoWidth,
  x: dinoX,
  y: dinoY,
};

// Cactus
let cactusArray = [];
let cactusWidth = 25;
let cactusHeight = 35;
let cactusX = boardWidth - cactusWidth;
let cactusY = boardHeight / 1.8;

//bird
let birdArray = []
let birdWidth = 45
let birdHeight = 30
let birdX = boardWidth - birdWidth
let birdY = boardHeight / (Math.random() * (3 - 2) + 2)

// Physics
let velocityX = -2;
let jumpVelocity = 0;
let gravity = 0.2;
let isJumping = false;
let addCactusSpeed = 1500;
let addBirdSpeed = 3500;


let isHeld
let cactusInterval
let birdInterval
let time = 1
let timer

window.onload = function () {
  board = document.querySelector(".board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");
  
  context.strokeStyle = "gray";
  context.lineWidth = 2;
  context.drawImage(background, 0, 0, boardWidth, boardHeight)

  // Draw initial road
  context.beginPath();
  context.moveTo(0, board.height / 1.5);
  context.lineTo(board.width, board.height / 1.5);
  context.stroke();
  
  // Dino image
  if (dinoPNG.complete) {
    context.drawImage(dinoPNG, dino.x, dino.y, dino.width, dino.height);
  }

  context.font = "15px 'Press Start 2P'"
  context.fillStyle = "white"
  let text = "Press Enter to start !"
  let textWidth = context.measureText(text).width
  context.fillText(text, (boardWidth-textWidth)/2, boardHeight/2)
  document.addEventListener("keydown", (e)=>{
    if(e.code == "Enter" && count == 0){
      // Start the game loop
      timer = setInterval(()=>{
        //increase difficulty
        // console.log(`Velocityx : ${velocityX}`)
        // console.log(`cactus : ${addCactusSpeed}`)
        // console.log(`bird : ${addBirdSpeed}`)
  if(time % 10 == 0 && velocityX > -6){
    velocityX -= 0.5
    clearInterval(cactusInterval)
    clearInterval(birdInterval)
    cactusInterval = setInterval(placeCactus, addCactusSpeed);
    birdInterval = setInterval(placeBird, addBirdSpeed);
    
    if(addCactusSpeed > 1000)
      addCactusSpeed -= 200
    if(addBirdSpeed > 1500)
    addBirdSpeed -= 250
  }
        time++
      }, 1000)
      
      requestAnimationFrame(update);
      gameStart = true
      cactusInterval = setInterval(placeCactus, addCactusSpeed); // Add a new cactus
      birdInterval = setInterval(placeBird, addBirdSpeed); // Add a new bird 
      document.addEventListener("keydown", moveDino);
      count++
    }
  })
};
   
function update() {
  
  if(gameOver){
    gameOverAudio.play()
    return;
  }
  
  if(gameStart){
    score = score+0.05
    if((Math.floor(score)) % 100 == 0 && (Math.floor(score))!=0)
      passed.play()
  }
  
  // Clear the canvas
  context.clearRect(0, 0, boardWidth, boardHeight);
  
  context.drawImage(background, 0, 0, boardWidth, boardHeight)
  //show score
  if(score == 100) console.log(score)
  context.font = "15px 'Press Start 2P'"
  context.fillStyle = "white"
  context.fillText(`${Math.floor(score)}`, boardWidth/1.1, boardHeight/5)
  if(localStorage.getItem("hs") == null)
  context.fillText(`HI ${0}`, (boardWidth/1.1)-200, boardHeight/5)
  else
  context.fillText(`HI ${localStorage.getItem("hs")}`, (boardWidth/1.1)-200, boardHeight/5)
  
  // Redraw the road
  context.beginPath();
  context.moveTo(0, board.height / 1.5);
  context.lineTo(board.width, board.height / 1.5);
  context.stroke();
  
  // Draw the Dino
  if(dino.y == dinoY) gravity = 0.2
  dino.y += jumpVelocity;
  if (dino.y < dinoY) {
    jumpVelocity += gravity;
  } else {
    dino.y = dinoY;
    jumpVelocity = 0;
    isJumping = false;
  }
  if(isHeld){
  context.drawImage(duckPNG, dino.x, dino.y, dino.width, dino.height);
  }else{
    context.drawImage(dinoPNG, dino.x, dino.y, dino.width, dino.height);
  }

  // Draw and update all cacti
  for (let i = 0; i < cactusArray.length; i++) {
    let cactus = cactusArray[i];
    cactus.x += velocityX; // Move the cactus left
    context.drawImage(
      cactus.img,
      cactus.x,
      cactus.y,
      cactus.width,
      cactus.height
    );
    if(detectCollision(dino,cactus,10)){
      gameOver = true;
      gameOverAudio.play()
      gameOVerText()
      highestScore = Math.floor(Math.max(localStorage.getItem("hs"), score))
      localStorage.setItem("hs", highestScore)
      gameStart = false;
      return;
    }
  }
  // Draw and update all birds
  for (let i = 0; i < birdArray.length; i++) {
    let bird = birdArray[i];
    bird.x += velocityX; // Move the cactus left
    context.drawImage(
      bird.img,
      bird.x,
      bird.y,
      bird.width,
      bird.height
    );
    if(!isHeld){
      if(detectCollision(dino,bird,12)){
        gameOver = true;
        gameOverAudio.play()
        gameOVerText()
        highestScore = Math.floor(Math.max(localStorage.getItem("hs"), score))
        localStorage.setItem("hs", highestScore)
        gameStart = false;
        return;
      }
    }
  }

  // Remove off-screen cacti
  while (
    cactusArray.length > 0 &&
    cactusArray[0].x + cactusArray[0].width < 0
  ) {
    cactusArray.shift();
  }
  requestAnimationFrame(update);
}

function placeCactus() {
  if(gameOver) return
  let randomX = cactusX + Math.random() * 200 + 100; // Random position offset
  let valid = true;

  for (let obstacle of [...cactusArray, ...birdArray]) {
    if (Math.abs(obstacle.x - randomX) < 150) { // Minimum gap of 150px
      valid = false;
      break;
    }
  }

  let randomCactusHeight = [35,60]
  let randomCactusWidth = [25,35]
  let randomSelected = Math.floor(Math.random()*2)
  if (valid) {
    let cactus = {
      img: cactusPNG,
      x: randomX,
      y: cactusY - (randomSelected*20),
      width: randomCactusWidth[randomSelected],
      height: randomCactusHeight[randomSelected],
      passed: false
    };
    cactusArray.push(cactus);
  }
}

function placeBird() {
  if(gameOver) return
  let randomX = birdX + Math.random() * 300 + 150; // Random position offset
  let randomY = boardHeight / (Math.random() * (3 - 2) + 2) // Random height
  let valid = true;
  // (Math.random() * (3 - 2) + 2);
  for (let obstacle of [...cactusArray, ...birdArray]) {
    if (Math.abs(obstacle.x - randomX) < 150) { // Minimum gap of 150px
      valid = false;
      break;
    }
  }

  if (valid) {
    let bird = {
      img: birdPNG,
      x: randomX,
      y: randomY,
      width: birdWidth,
      height: birdHeight,
      passed: false
    };
    birdArray.push(bird);
  }
}

function moveDino(e) {
  if(gameOver) return
  if ((e.code == "Space" || e.code == "ArrowUp") && !isJumping) {
    //jump
    jump.play()
    jumpVelocity = -7;
    isJumping = true;
  }
  if(e.code == "ArrowDown"){
    gravity = 0.8;
    isHeld = true;
  }
  document.addEventListener("keyup",(e)=>{
    if(e.code=="ArrowDown"){
      isHeld = false
    }
  })
}

function detectCollision(object1, object2, padding){
  return(object1.x + padding < object2.x + object2.width &&
    object1.x + object1.width - padding > object2.x &&
    object1.y + padding < object2.y + object2.height &&
    object1.y + object1.height - padding > object2.y);
}

function gameOVerText(){
  highestScore = Math.max(highestScore, score);
  highestScore = Math.max(highestScore, localStorage.getItem("hs"));
  localStorage.setItem("hs", highestScore);
  context.font = "15px 'Press Start 2P'"
  context.fillStyle = "white"
  let text = "Game Over !"
  let textWidth = context.measureText(text).width
  context.fillText(text, (boardWidth-textWidth)/2, boardHeight/2)

  clearInterval(cactusInterval)
  clearInterval(birdInterval)
  clearInterval(timer)
  // gameOverAudio.load()
  time = 0
  count = 0
  cactusArray = []
  birdArray = []
  score = 0
  gameOver = false
  gameStart = false
  velocityX = -2
  addCactusSpeed = 1500;
  addBirdSpeed = 3500;
}