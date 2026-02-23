let gridWidth = 30; 
let gridHeight = 30;
let gameStarted = false;
let isGameOver = false;
let startingSegments = 5; 
let xStart = 2; 
let yStart = 15;
let direction = 'right';
let segments = [];
let score = 0;
let highScore = 0;
let fruits = []; 
let particles = [];
let walls = []; //
let colors = {};
let cellSize; 
let offsetX, offsetY; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(10); 
  // il serpente si muove a 10 frame al secondo (ho aumentato la velocità)
  textAlign(CENTER, CENTER);
  calculateLayout(); //dimensioni e posizionamento del quadrato di gioco (griglia)
  pickNewPalette(); //colori neon 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateLayout();
}

function calculateLayout() {
  // Ho portato da 0.45 a 0.65 per rendere il quadrato più grande
  let gameSize = min(windowWidth, windowHeight) * 0.65; 
  cellSize = gameSize / gridWidth;
  
  // Ho centrato il qaudrato orizzontalmente
  offsetX = (windowWidth - (gridWidth * cellSize)) / 2;
  
  // Ho centrato il quadrato verticalment
  offsetY = windowHeight * 0.42 - (gridHeight * cellSize) / 2; 
}

function pickNewPalette() {
  const palettes = [
    { name: "ULTRA_VIOLET", bg: [40, 0, 100], snk: [220, 255, 0], fru: [255, 50, 50], wal: [70, 0, 180] },    
    { name: "CYBER_PUNK", bg: [0, 20, 60], snk: [255, 0, 150], fru: [0, 255, 255], wal: [0, 50, 130] },   
    { name: "NUCLEAR_SPRING", bg: [0, 50, 20], snk: [150, 255, 0], fru: [255, 150, 0], wal: [0, 100, 40] }
  ];
  colors = random(palettes);
}

function createMaze() { // Creato muri e ostacoli
  walls = [];
  let numberOfObstacles = 7; 
  for (let n = 0; n < numberOfObstacles; n++) {
    let startX = floor(random(14, gridWidth - 5)); 
    let startY = floor(random(5, gridHeight - 5));
    let len = floor(random(3, 8)); 
    let isVertical = random() > 0.5;
    for (let i = 0; i < len; i++) {
      let wallX = isVertical ? startX : startX + i;
      let wallY = isVertical ? startY + i : startY;
      if (wallX < gridWidth && wallY < gridHeight && wallX > 12) {
        walls.push(createVector(wallX, wallY));
      }
    }
  }
}

function draw() { //disegna tutto
  clear(); 
  
  push();
    translate(offsetX, offsetY);
    fill(colors.bg);
    noStroke();
    rect(0, 0, gridWidth * cellSize, gridHeight * cellSize);
    scale(cellSize);
    
    stroke(255, 255, 255, 15);
    strokeWeight(0.005);
    for (let i = 0; i <= gridWidth; i++) line(i, 0, i, gridHeight);
    for (let j = 0; j <= gridHeight; j++) line(0, j, gridWidth, j);

    if (gameStarted || isGameOver || particles.length > 0) {
      push();
        translate(0.5, 0.5);
        showWalls();
        handleParticles();
        if (gameStarted) {
          showFruits();
          showSegments();
          updateSegments();
          checkForCollision();
          checkForFruitCollision();
        }
      pop();
    }
  pop();

  if (!gameStarted && !isGameOver && particles.length === 0) {//schermata iniziale
    showStartScreen();
  } else if (isGameOver) {
    displayGameOverText();
  }
}

function showWalls() { //disegna muri
  fill(colors.wal); 
  noStroke();
  rectMode(CENTER);
  for (let w of walls) {
    rect(w.x, w.y, 0.9, 0.9, 0.1);
  }
}

function showStartScreen() {//schermata iniziale con titolo e istruzioni
  noStroke();
  fill(colors.snk);
  textSize(cellSize * 2.5); 
  text('NEON GLITCH', width / 2, offsetY + (gridHeight * cellSize) / 2 - 20);
  textSize(cellSize * 1.2);
  fill(255, 180);
  text('CLICCA PER INIZIARE', width / 2, offsetY + (gridHeight * cellSize) / 2 + 30);
}

function displayGameOverText() {//schermata di game over con punteggio
  noStroke();
  fill(255);
  textSize(cellSize * 3);
  text('GAME OVER', width / 2, offsetY + (gridHeight * cellSize) / 2 - 20);
  textSize(cellSize * 1.5);
  text(`Score: ${score}`, width / 2, offsetY + (gridHeight * cellSize) / 2 + 20);
  fill(colors.snk);
  textSize(cellSize * 1.2);
  text('CLICCA PER RICOMINCIARE', width / 2, offsetY + (gridHeight * cellSize) / 2 + 50);
}

function startGame() { //stato del gioco
  pickNewPalette(); 
  createMaze(); 
  isGameOver = false;
  score = 0;
  direction = 'right';
  particles = [];
  segments = [];
  fruits = [];
  for (let x = 0; x < startingSegments; x++) {
    segments.push(createVector(xStart + startingSegments - 1 - x, yStart));
  }
  spawnFruit(); 
  gameStarted = true;
  loop();
}

function updateSegments() { //aggiorna la posizione del serpente
  let head = segments[0].copy();
  if (direction === 'right') head.x++;
  if (direction === 'left') head.x--;
  if (direction === 'up') head.y--;
  if (direction === 'down') head.y++; 
  segments.unshift(head); //aggiunge la testa
  segments.pop();//rimuove la coda (a meno che non mangia il frutto, in quel caso il serpente cresce)
}

function showSegments() {
  noStroke();
  rectMode(CENTER);
  for (let i = 0; i < segments.length; i++) {
    let seg = segments[i];
    let wobble = sin(frameCount * 0.5 + i * 0.8) * 0.05; //effetto di oscillazione (il serpente vibra leggermente)
    let c = color(colors.snk);
    c.setAlpha(map(i, 0, segments.length, 255, 150));
    fill(c);
    rect(seg.x + wobble, seg.y + wobble, 0.9, 0.9, 0.2);
    if (i === 0) {
      fill(255); 
      let eyeSize = 0.15;
      let offset = 0.22;
      let eyeX = (direction === 'right') ? 0.25 : (direction === 'left' ? -0.25 : 0);
      let eyeY = (direction === 'down') ? 0.25 : (direction === 'up' ? -0.25 : 0);
      rect(seg.x + eyeX + (eyeY != 0 ? -offset : 0), seg.y + eyeY + (eyeX != 0 ? -offset : 0), eyeSize, eyeSize);
      rect(seg.x + eyeX + (eyeY != 0 ? offset : 0), seg.y + eyeY + (eyeX != 0 ? offset : 0), eyeSize, eyeSize);
    }
  }
}

function spawnFruit() {
  let valid = false;
  let newFruit;
  while (!valid) { 
    newFruit = {
      pos: createVector(floor(random(gridWidth)), floor(random(gridHeight))), 
      type: random() > 0.85 ? 'rare' : random(['apple', 'pear', 'orange'])// 15% di possiblità di trovare un frutto raro che vale 5 punti invece di 1 (frutti normali)
    };
    valid = true;
    for (let w of walls) if (newFruit.pos.x === w.x && newFruit.pos.y === w.y) valid = false;
    for (let s of segments) if (newFruit.pos.x === s.x && newFruit.pos.y === s.y) valid = false;
    for (let f of fruits) if (newFruit.pos.x === f.pos.x && newFruit.pos.y === f.pos.y) valid = false;
  }
  fruits.push(newFruit);
}

function showFruits() {
  noStroke();
  rectMode(CENTER); 
  let pulse = 1.0 + sin(frameCount * 0.6) * 0.15;
  let pSize = 0.3 * pulse; 

  for (let f of fruits) {
    let x = f.pos.x;
    let y = f.pos.y;

    if (f.type === 'apple') { 
      fill(255, 60, 60); 
      rect(x, y, pSize*2.8, pSize*2.5, 0.2); 
      fill(100, 200, 50); 
      rect(x, y - pSize*1.6, pSize*0.8, pSize);
    } 
    else if (f.type === 'pear') {
      fill(160, 255, 60); 
      rect(x, y + pSize/2, pSize*3, pSize*2, 0.4);
      rect(x, y - pSize/2, pSize*1.8, pSize*2.2, 0.4);
      fill(80, 150, 0); 
      rect(x + pSize/2, y - pSize*1.8, pSize*0.8, pSize);
    } 
    else if (f.type === 'orange') {
      fill(255, 140, 0); 
      rect(x, y, pSize*3, pSize*3, 0.8); 
      fill(0, 180, 0); 
      rect(x, y - pSize*1.6, pSize*1.2, pSize*0.6, 0.2);
    } 
    else if (f.type === 'rare') {
      let c = (frameCount % 4 < 2) ? color(255) : color(0, 230, 255);
      fill(c);
      rect(x, y - pSize*0.5, pSize*3, pSize*1.5, 0.1); 
      rect(x, y + pSize*0.8, pSize*1.5, pSize*2, 0.1); 
    }
  }
}

function checkForFruitCollision() { 
  let head = segments[0];
  for (let i = fruits.length - 1; i >= 0; i--) {
    if (head.x === fruits[i].pos.x && head.y === fruits[i].pos.y) {
      score += (fruits[i].type === 'rare' ? 5 : 1);
      for (let p = 0; p < 15; p++) particles.push(new Particle(fruits[i].pos.x, fruits[i].pos.y, colors.fru));
      segments.push(segments[segments.length - 1].copy()); // fa crescere il serpente di 1 segmento ogni volta che mangia un frutto
      fruits.splice(i, 1);
      spawnFruit();
      if (score % 4 === 0 && fruits.length < 3) spawnFruit(); // ogni 4 punti, c'è la possibilità di far spawnare un frutto extra (anche 3 frutti contemporaneamente)
    }
  }
}

function checkForCollision() {
  let head = segments[0]; //game over se la testa del serpente tocca i bordi, un muro o ses tesso
  if (head.x >= gridWidth || head.x < 0 || head.y >= gridHeight || head.y < 0) return gameOver();
  for (let w of walls) if (head.x === w.x && head.y === w.y) return gameOver();
  for (let i = 1; i < segments.length; i++) if (segments[i].x === head.x && segments[i].y === head.y) return gameOver();
}

function gameOver() { //il serpente quando muore esplode in particelle
  for (let seg of segments) for (let i = 0; i < 3; i++) particles.push(new Particle(seg.x, seg.y, colors.snk));
  if (score > highScore) highScore = score;
  gameStarted = false;
  isGameOver = true;
}

function mousePressed() { if (!gameStarted) startGame(); }//cliccando sullo schermo si avvia il gioco (o riavvia se è game over)

function handleParticles() { //gestisce l'animazione delle particelle del serpente qaundo muore
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) particles.splice(i, 1);
  }
}

class Particle { 
  constructor(x, y, col) {
    this.x = x; this.y = y; 
    this.vx = random(-0.8, 0.8); this.vy = random(-0.8, 0.8);
    this.alpha = 255; this.col = col; //le particelle svaniscono gradualmente (alpha diminuisce)
  }
  finished() { return this.alpha < 0; }
  update() { this.x += this.vx; this.y += this.vy; this.alpha -= 10; }
  show() {
    noStroke();
    let c = color(this.col); c.setAlpha(this.alpha);
    fill(c); rect(this.x, this.y, 0.15, 0.15);
  }
}

function keyPressed() { //controlli con le frecce
  if (keyCode === LEFT_ARROW && direction !== 'right') direction = 'left';
  if (keyCode === RIGHT_ARROW && direction !== 'left') direction = 'right';
  if (keyCode === UP_ARROW && direction !== 'down') direction = 'up';
  if (keyCode === DOWN_ARROW && direction !== 'up') direction = 'down';
}