import { Ball } from "./Ball.js";

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;

export function addBall(
  event: MouseEvent,
  balls: Ball[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gravity: number,
  dampening: number,
  playSound: (buffer: AudioBuffer) => void,
  collisionBuffer: AudioBuffer
) {
  if (balls.length < 15) {
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
}

export function removeBall(event: MouseEvent, balls: Ball[]) {
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
}
