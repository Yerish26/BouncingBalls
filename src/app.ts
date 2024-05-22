// main.ts
import { Ball } from './Ball.js';

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

async function loadAudio(url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

Promise.all([
  loadAudio("resources/collision.mp3").then(
    (buffer) => (collisionBuffer = buffer)
  ),
]);

const playSound = (buffer: AudioBuffer) => {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
};

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;

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
      balls,
      ctx,
      width,
      height,
      gravity,
      dampening,
      playSound,
      collisionBuffer
    );
    balls.push(ball);
  }
});

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
