const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Ball {
  constructor(x, y, radius, mass, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = Math.random() * 4 - 2; // Random horizontal velocity
    this.dy = Math.random() * 4 - 2; // Random vertical velocity
    this.mass = mass; // simulated mass
    this.color = color;
    this.coefficientOfRestitution = 0.8; // Optional: Coefficient of Restitution (COR)
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    // Apply a constant downward force (simulated gravity)
    this.dy += 0.1; // Adjust this value for stronger/weaker gravity

    // Apply friction (slows down the ball horizontally - optional)
    this.dx *= (1 - 0.01 * this.mass); // Adjust friction coefficient

    this.x += this.dx;
    this.y += this.dy;

    // Check for collision with bottom wall (ground)
    if (this.y + this.radius >= canvas.height) {
      // Simulate momentum transfer (not a perfect bounce)
      this.dy *= -this.coefficientOfRestitution; // Reduce upward velocity on bounce based on COR
      this.dy += this.mass * 0.1; // Add some upward force based on mass
      this.y = canvas.height - this.radius; // Prevent ball from sinking into ground
    }

    // Check for collision with walls (optional)
    if (this.x + this.radius >= canvas.width || this.x - this.radius <= 0) {
      this.dx *= -1;
    }

    // Detect collision with other balls
    for (let otherBall of balls) {
      if (this !== otherBall) {
        this.handleBallCollision(otherBall);
      }
    }
  }

  handleBallCollision(otherBall) {
    const distanceX = this.x - otherBall.x;
    const distanceY = this.y - otherBall.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // Minimum distance to avoid overlap (considering radius)
    const minDistance = this.radius + otherBall.radius;

    // Check for collision based on minimum distance
    if (distance < minDistance) {
      const angle = Math.atan2(distanceY, distanceX);

      // Calculate new velocities based on collision angle, masses, and COR
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

// Create an array to store multiple balls
let balls = [];

function init() {
  // Create some initial balls with random properties
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height / 2;
    const radius = Math.random() * 10 + 5;
    const mass = Math.random() * 3 + 3; // Simulated mass variation
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

init();
animate();
