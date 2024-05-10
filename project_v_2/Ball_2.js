const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Adjust canvas size to fit window
canvas.width = 900;
canvas.height = 700;

let gravity = 0.98; // Initial gravity value
let coefficientOfElasticity = 0.7; // Initial coefficient of elasticity
let frictionCoefficient = 0.05; // Initial friction coefficient

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
        this.isFloating = false;
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

        // Apply friction
        const frictionalForceX = this.dx * frictionCoefficient / 50;
        this.dx -= frictionalForceX;

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

        // Ensure the ball doesn't go below a minimum speed threshold (optional)
        if (Math.abs(this.dx) < 0.001) {
            this.dx = 0; // Stop the ball if its velocity becomes too small
        }

        if (waterTank.isBallInWater(this)) {
            this.isFloating = true;
            this.dy *= 0.5; // Reduce vertical velocity upon entering water (optional)
        } else {
            this.isFloating = false;
        }

        // Update ball properties based on floating state
        if (this.isFloating) {
            // Apply buoyancy force (counteracts some gravity)
            this.dy -= 0.2 * gravity; // Adjust buoyancy force as needed
        }

        // Check for collisions with basketball net
        if (basketballNet.checkBallCollision(this)) {
            this.isFloating = false; // Reset floating state if previously floating
            basketballNet.isBallInside = true; // Set net flag to indicate ball inside
            
            // Optional actions on ball entering net (e.g., sound effect, animation)
            console.log("Ball scored!"); // Placeholder for now

            // Remove the ball from the simulation (or teleport it outside)
            const ballIndex = balls.indexOf(this);
            if (ballIndex !== -1) {
                balls.splice(ballIndex, 1);
            }
        } else {
            basketballNet.isBallInside = false; // Reset net flag if ball leaves
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

class WaterTank {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isBallInWater(ball) {
        const ballCenterX = ball.x;
        const ballCenterY = ball.y;
        const ballRadius = ball.radius;

        // Check if the ball's center is within the water tank's boundaries
        return (ballCenterX >= this.x &&
            ballCenterX <= this.x + this.width &&
            ballCenterY >= this.y &&
            ballCenterY <= this.y + this.height - ballRadius); // Account for radius when checking bottom boundary
    }
}

class BasketballNet {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isBallInside = false; // Flag to track ball inside the net
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw additional net details (optional)
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 3, this.y + this.height);
        ctx.lineTo(this.x + this.width / 3, this.y + this.height * 2 / 3);
        ctx.lineTo(this.x + this.width * 2 / 3, this.y + this.height * 2 / 3);
        ctx.lineTo(this.x + this.width * 2 / 3, this.y + this.height);
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }

    checkBallCollision(ball) {
        const ballCenterX = ball.x;
        const ballCenterY = ball.y;
        const ballRadius = ball.radius;

        // Check if the ball's center is within the net's boundaries
        return (ballCenterX >= this.x &&
            ballCenterX <= this.x + this.width &&
            ballCenterY >= this.y &&
            ballCenterY <= this.y + this.height);
    }
}




class Wave {
    constructor(x, amplitude, wavelength, speed) {
      this.x = x;
      this.amplitude = amplitude;
      this.wavelength = wavelength;
      this.speed = speed;
    }
  
    update() {
      this.x += this.speed;
    }
  
    getY(canvasWidth) {
      const normalizedX = this.x % this.wavelength / this.wavelength;
      const angle = normalizedX * Math.PI * 2;
      return this.amplitude * Math.sin(angle) + canvasHeight / 2; // Center wave vertically
    }
  }
  
  // Create an array of waves with different properties
  const waves = [
    new Wave(0, 10, 100, 1),
    new Wave(50, 5, 50, 2),
  ];
  
  function drawWater(canvasWidth, canvasHeight) {
    const waterGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    waterGradient.addColorStop(0, 'lightblue');
    waterGradient.addColorStop(0.7, 'blue');
    waterGradient.addColorStop(1, 'darkblue');
    ctx.fillStyle = waterGradient;
  
    // Adjust Y position based on wave function for each wave
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);
    for (let x = 0; x <= canvasWidth; x++) {
      let waveY = canvasHeight;
      for (const wave of waves) {
        waveY = Math.min(waveY, wave.getY(canvasWidth));
      }
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.closePath();
    ctx.fill();
  }




const waterTank = new WaterTank(canvas.width / 3, canvas.height / 2, canvas.width / 3, canvas.height / 3, 'lightblue');
const basketballNet = new BasketballNet(canvas.width - canvas.width / 5, canvas.height / 3, canvas.width / 10, canvas.height / 5, 'orange');

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
    waterTank.draw();
    basketballNet.draw();

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

const applyFrictionBtn = document.getElementById('applyFrictionBtn');
applyFrictionBtn.addEventListener('click', () => {
    const newFriction = parseFloat(document.getElementById('frictionInput').value);
    if (!isNaN(newFriction) && newFriction >= 0 && newFriction <= 1) {
        frictionCoefficient = newFriction;
    } else {
        console.error("Invalid friction coefficient. Please enter a value between 0 and 1.");
    }
});

init();
animate();
