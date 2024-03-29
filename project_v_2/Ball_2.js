const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const rhombusHeight = 200; // Adjust for desired rhombus size
const rhombusHalfWidth = 100; // Adjust for desired rhombus size

class Ball {
  constructor(x, y, radius, mass, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = Math.random() * 4 - 2; // Random horizontal velocity
    const angle = Math.random() * Math.PI; // Random angle for initial direction
    const speed = Math.random() * 3 + 2; // Random initial speed
    this.dy = Math.sin(angle) * speed; // Vertical velocity based on angle and speed
    this.mass = mass; // simulated mass
    this.color = color;
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

    // Apply friction (slows down the ball horizontally)
    this.dx *= (1 - 0.01 * this.mass); // Adjust friction coefficient

    this.x += this.dx;
    this.y += this.dy;

    // Check for collision with bottom wall (ground)
    if (this.y + this.radius >= canvas.height) {
      // Simulate momentum transfer (not a perfect bounce)
      this.dy *= -0.7; // Reduce upward velocity on bounce
      this.dy += this.mass * 0.1; // Add some upward force based on mass
      this.y = canvas.height - this.radius; // Prevent ball from sinking into ground
    }

    // Check for collision with walls (optional)
    if (this.x + this.radius >= canvas.width || this.x - this.radius <= 0) {
      this.dx *= -1;
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
    const mass = Math.random() * 3 + 1; // Simulated mass variation
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