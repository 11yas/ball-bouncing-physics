const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Adjust canvas size to fit window
canvas.width = 900;
canvas.height = 700;

let gravity = 0.98; // Initial gravity value
let coefficientOfElasticity = 0.6; // Initial coefficient of elasticity

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
    // Apply gravitational force (F = m * g)
    const gravitationalForce = this.mass * gravity;

    // Calculate acceleration components (F = m * a)
    const accelerationX = 0; // Assume no external force in the x-direction
    const accelerationY = gravitationalForce / this.mass;

    // Update velocity using the acceleration (v = u + at)
    this.dx += accelerationX;
    this.dy += accelerationY;

    // Update position using the velocity (s = ut + 0.5 * a * t^2)
    this.x += this.dx;
    this.y += this.dy;

    // Handle collisions with walls
    if (this.y + this.radius >= canvas.height) {
        this.dy *= -this.coefficientOfRestitution; // Reverse velocity and apply restitution
        this.dy += gravitationalForce / this.mass; // Apply gravitational force
        this.y = canvas.height - this.radius; // Adjust position to prevent ball from sinking into the ground
    }

    if (this.x + this.radius >= canvas.width || this.x - this.radius <= 0) {
        this.dx *= -1; // Reverse horizontal velocity to simulate wall collision
    }

    // Check for collisions with other balls
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
    const distanceX = otherBall.x - this.x;
    const distanceY = otherBall.y - this.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    const minDistance = this.radius + otherBall.radius;

    if (distance < minDistance) {
        // Calculate unit normal vector
        const normalX = distanceX / distance;
        const normalY = distanceY / distance;

        // Calculate relative velocity components along normal vector
        const relativeVelocityX = otherBall.dx - this.dx;
        const relativeVelocityY = otherBall.dy - this.dy;
        const relativeVelocityNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;

        // If balls are moving towards each other (relative velocity along normal vector is negative)
        if (relativeVelocityNormal < 0) {
            // Calculate impulse (change in momentum)
            const impulse = -2 * relativeVelocityNormal / (this.mass + otherBall.mass);

            // Update velocities based on impulse and mass
            this.dx -= impulse * otherBall.mass * normalX;
            this.dy -= impulse * otherBall.mass * normalY;
            otherBall.dx += impulse * this.mass * normalX;
            otherBall.dy += impulse * this.mass * normalY;
        }
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
  const radius = 15;
  const mass = Math.random() * 10 + 5; // Simulated mass variation
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
    const radius = 15;
    const mass = Math.random() * 10 + 5;
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
    ball.launch(angle, 15); // Launch speed can be adjusted
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
