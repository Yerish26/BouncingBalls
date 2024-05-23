import { Ball } from "./modules/Ball.js";
import { initCanvas } from "./modules/canvasUtils.js";
import { loadAudio, playSound } from "./modules/audioUtils.js";
import { removeBall } from "./modules/eventHandlers.js";
import { random } from "./modules/utils.js";

const { canvas, ctx, width, height } = initCanvas();
const balls: Ball[] = [];
const gravity = 0.2;
const dampening = 0.7;
const maxBalls = 15;
let lastTime = 0;
let isPaused = false;

let collisionBuffer: AudioBuffer;

loadAudio("resources/collision.mp3").then((buffer) => {
  collisionBuffer = buffer;
});

canvas.addEventListener("click", (event) => {
  if (balls.length < maxBalls) {
    const size = random(10, 20);
    const ball = new Ball(
      event.clientX,
      event.clientY,
      random(-7, 7),
      random(-7, 7),
      `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`,
      size,
      {
        balls,
        ctx,
        width,
        height,
        gravity,
        dampening,
        playSound,
        collisionBuffer,
      }
    );
    balls.push(ball);
  }
});

canvas.addEventListener("contextmenu", (event) => {
  removeBall(event, balls);
});

let backgroundHue = 0;

const tick = (currentTime: number) => {
  if (isPaused) {
    lastTime = currentTime;
    return;
  }

  const deltaTime = (currentTime - lastTime) / 16.666;
  lastTime = currentTime;

  backgroundHue = (backgroundHue + 0.5) % 360;
  ctx.fillStyle = `hsl(${backgroundHue}, 100%, 95%)`;
  ctx.fillRect(0, 0, width, height);

  balls.forEach((ball) => {
    ball.draw();
    ball.update(deltaTime);
  });

  requestAnimationFrame(tick);
};

document.getElementById("pause")?.addEventListener("click", () => {
  isPaused = true;
});

document.getElementById("resume")?.addEventListener("click", () => {
  if (isPaused) {
    isPaused = false;
    lastTime = performance.now();
    requestAnimationFrame(tick);
  }
});

requestAnimationFrame(tick);
