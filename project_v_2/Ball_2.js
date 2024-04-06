const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Adjust canvas size to fit window
canvas.width = 900;
canvas.height = 700;

let gravity = 0.098; // Initial gravity value
let coefficientOfElasticity = 0.8; // Initial coefficient of elasticity

class Ball {
  constructor(x, y, radius, mass, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = Math.random() * 4 - 2;
    this.dy = Math.random() * 4 - 2;
    this.mass = mass;
    this.color = color;
    this.coefficientOfRestitution = coefficientOfElasticity; // Use the global coefficientOfElasticity variable
    this.isDraggable = false;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.fillStyle = 'white'; // Set text color to white
    ctx.font = '12px Arial'; // Set font size and type
    ctx.textAlign = 'center'; // Center align the text
    ctx.fillText(this.mass.toFixed(1), this.x, this.y + 4); // Display mass inside the ball
  }

  update() {
    this.dy += gravity; // Use the global gravity variable

    this.dx *= (1 - 0.01 * this.mass);

    this.x += this.dx;
    this.y += this.dy;

    if (this.y + this.radius >= canvas.height) {
      this.dy *= -this.coefficientOfRestitution;
      this.dy += this.mass * 0.1;
      this.y = canvas.height - this.radius;
    }

    if (this.x + this.radius >= canvas.width || this.x - this.radius <= 0) {
      this.dx *= -1;
    }

    for (let otherBall of balls) {
      if (this !== otherBall) {
        this.handleBallCollision(otherBall);
      }
    }
  }

  launch(angle, launchSpeed) {
    this.dx = launchSpeed * Math.cos(angle);
    this.dy = launchSpeed * Math.sin(angle);
  }

  handleBallCollision(otherBall) {
    const distanceX = this.x - otherBall.x;
    const distanceY = this.y - otherBall.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    const minDistance = this.radius + otherBall.radius;

    if (distance < minDistance) {
      const angle = Math.atan2(distanceY, distanceX);

      const tempDx = this.dx;
      const tempDy = this.dy;
      const massRatio = this.mass / otherBall.mass;
      this.dx = otherBall.dx * massRatio + (1 + massRatio) * tempDx * Math.cos(angle) - tempDy * Math.sin(angle) * this.coefficientOfRestitution;
      this.dy = otherBall.dy * massRatio + (1 + massRatio) * tempDy * Math.sin(angle) + tempDx * Math.cos(angle) * this.coefficientOfRestitution;
      otherBall.dx = tempDx * massRatio - (1 + massRatio) * otherBall.dx * Math.cos(angle) + otherBall.dy * Math.sin(angle) * this.coefficientOfRestitution;
      otherBall.dy = tempDy * massRatio - (1 + massRatio) * otherBall.dy * Math.sin(angle) - otherBall.dx * Math.cos(angle) * this.coefficientOfRestitution;
    }
  }
}

const addBallButton = document.getElementById('addBallButton');

addBallButton.addEventListener('click', addNewBall);

function addNewBall() {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Randomize ball properties
  const x = Math.random() * canvasWidth;
  const y = Math.random() * canvasHeight / 2; // Start in the top half
  const radius = Math.random() * 10 + 5;
  const mass = Math.random() * 3 + 1; // Simulated mass variation
  const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

  // Create a new ball object
  const newBall = new Ball(x, y, radius, mass, color);

  // Add the new ball to the balls array
  balls.push(newBall);
}

let balls = [];

function init() {
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height / 2;
    const radius = Math.random() * 10 + 10;
    const mass = Math.random() * 3 + 3;
    const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
    balls.push(new Ball(x, y, radius, mass, color));
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let ball of balls) {
    ball.update();
    ball.draw();
  }

  requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', mouseDownHandler);
canvas.addEventListener('mousemove', mouseMoveHandler);
canvas.addEventListener('mouseup', mouseUpHandler);

let startX, startY, selectedBallIndex;

function mouseDownHandler(event) {
  startX = event.clientX;
  startY = event.clientY;

  // Find the ball that is being clicked
  selectedBallIndex = balls.findIndex(ball => {
    const dx = ball.x - startX;
    const dy = ball.y - startY;
    return Math.sqrt(dx * dx + dy * dy) < ball.radius;
  });

  if (selectedBallIndex !== -1) {
    balls[selectedBallIndex].isDraggable = true;
  }
}

function mouseMoveHandler(event) {
  if (selectedBallIndex !== undefined && balls[selectedBallIndex].isDraggable) {
    const offsetX = event.clientX - startX;
    const offsetY = event.clientY - startY;
    balls[selectedBallIndex].x += offsetX;
    balls[selectedBallIndex].y += offsetY;
    startX = event.clientX;
    startY = event.clientY;
    animate(); // Redraw the canvas after moving the ball
  }
}

function mouseUpHandler(event) {
  if (selectedBallIndex !== undefined && balls[selectedBallIndex].isDraggable) {
    balls[selectedBallIndex].isDraggable = false;
  }
  selectedBallIndex = undefined;
}

canvas.addEventListener('click', launchAllBalls);

function launchAllBalls(event) {
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  for (let ball of balls) {
    const angle = Math.atan2(mouseY - ball.y, mouseX - ball.x);
    ball.launch(angle, 8); // Launch speed can be adjusted
  }
}

const applyGravityBtn = document.getElementById('applyGravityBtn');
applyGravityBtn.addEventListener('click', () => {
  const newGravity = parseFloat(document.getElementById('gravityInput').value);
  if (!isNaN(newGravity)) {
    gravity = newGravity;
  }
});

// Update coefficient of elasticity when the Apply Elasticity button is clicked
const applyElasticityBtn = document.getElementById('applyElasticityBtn');
applyElasticityBtn.addEventListener('click', () => {
  const newElasticity = parseFloat(document.getElementById('elasticityInput').value);
  if (!isNaN(newElasticity)) {
    coefficientOfElasticity = newElasticity;
    // Update coefficient of restitution for all balls
    for (let ball of balls) {
      ball.coefficientOfRestitution = newElasticity;
    }
  }
});

init();
animate();
