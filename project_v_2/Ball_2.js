const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Adjust canvas size to fit window
canvas.width = 900;
canvas.height = 700;

class Ball {
  constructor(x, y, radius, mass, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = Math.random() * 4 - 2;
    this.dy = Math.random() * 4 - 2;
    this.mass = mass;
    this.color = color;
    this.coefficientOfRestitution = 0.8;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.dy += 0.098;

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

// Add mouse click event to launch a ball
canvas.addEventListener('click', (event) => {
  const angle = Math.atan2(event.clientY - balls[0].y, event.clientX - balls[0].x);
  balls[0].launch(angle, 5); // Launch speed can be adjusted
});

init();
animate();
