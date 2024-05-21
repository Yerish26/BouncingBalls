// Setup canvas
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

const balls: Ball[] = [];
const gravity = 0.2;
const dampening = 0.7;
const maxBalls = 15;
let lastTime = 0;
let isPaused = false;

const AudioContextClass = (window.AudioContext ||
  (window as any).webkitAudioContext) as typeof AudioContext;
const audioContext = new AudioContextClass();
let collisionBuffer: AudioBuffer;

// Load audio files
async function loadAudio(url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

// Preload audio
Promise.all([
  loadAudio("resources/collision.mp3").then(
    (buffer) => (collisionBuffer = buffer)
  ),
]);

// Play sound using AudioContext
const playSound = (buffer: AudioBuffer) => {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
};

// Class Ball
class Ball {
  constructor(
    public x: number,
    public y: number,
    public velX: number,
    public velY: number,
    public color: string,
    public size: number
  ) {}

  // Draw method
  draw() {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  // Update method
  update(deltaTime: number) {
    this.velY += gravity * deltaTime;

    if (this.x + this.size >= width || this.x - this.size <= 0) {
      this.velX = -this.velX * dampening;
    }

    if (this.y + this.size >= height) {
      this.velY = -this.velY * dampening;
      this.y = height - this.size; // Prevent sinking below the bottom
    }

    this.x += this.velX * deltaTime;
    this.y += this.velY * deltaTime;

    // Stop ball if it's moving very slowly
    if (Math.abs(this.velY) < 0.1 && this.y + this.size >= height) {
      this.velY = 0;
    }

    this.collisionDetect();
  }

  // Collision detection
  collisionDetect() {
    balls.forEach((otherBall) => {
      if (this !== otherBall) {
        const dx = this.x - otherBall.x;
        const dy = this.y - otherBall.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + otherBall.size) {
          playSound(collisionBuffer);
          [this.velX, otherBall.velX] = [otherBall.velX, this.velX];
          [this.velY, otherBall.velY] = [otherBall.velY, this.velY];
        }
      }
    });
  }
}

// Random function
const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;

// Spawn a new ball at click location
canvas.addEventListener("click", (event) => {
  if (balls.length < maxBalls) {
    const size = random(10, 20);
    const ball = new Ball(
      event.clientX,
      event.clientY,
      random(-7, 7),
      random(-7, 7),
      `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`,
      size
    );
    balls.push(ball);
  }
});

// Remove a ball on right-click
canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    const dx = ball.x - event.clientX;
    const dy = ball.y - event.clientY;
    if (Math.sqrt(dx * dx + dy * dy) <= ball.size) {
      balls.splice(i, 1);
      break;
    }
  }
});

// Game loop function with delta time and background animation
let backgroundHue = 0;

const tick = (currentTime: number) => {
  if (isPaused) {
    lastTime = currentTime; // Update lastTime when paused
    return; // Skip updating and drawing while paused
  }

  const deltaTime = (currentTime - lastTime) / 16.666; // Normalize to 60fps
  lastTime = currentTime;

  // Animate background color
  backgroundHue = (backgroundHue + 0.5) % 360;
  ctx.fillStyle = `hsl(${backgroundHue}, 100%, 95%)`;
  ctx.fillRect(0, 0, width, height);

  balls.forEach((ball) => {
    ball.draw();
    ball.update(deltaTime);
  });

  requestAnimationFrame(tick);
};

// Pause and Resume buttons
document.getElementById("pause")?.addEventListener("click", () => {
  isPaused = true;
});

document.getElementById("resume")?.addEventListener("click", () => {
  if (isPaused) {
    isPaused = false;
    lastTime = performance.now(); // Reset lastTime to current time
    requestAnimationFrame(tick);
  }
});

requestAnimationFrame(tick);
