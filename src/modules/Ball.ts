import { BallConfig } from "./BallConfig";

export class Ball {
  private collisionState = new Map<Ball, boolean>();

  constructor(
    public x: number,
    public y: number,
    public velX: number,
    public velY: number,
    public color: string,
    public size: number,
    private config: BallConfig
  ) {}

  draw() {
    const { ctx } = this.config;
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

  update(deltaTime: number) {
    const { width, height, gravity, dampening } = this.config;
    this.velY += gravity * deltaTime;

    if (this.x + this.size >= width || this.x - this.size <= 0) {
      this.velX = -this.velX * dampening;
    }

    if (this.y + this.size >= height) {
      this.velY = -this.velY * dampening;
      this.y = height - this.size;
    }

    this.x += this.velX * deltaTime;
    this.y += this.velY * deltaTime;

    if (Math.abs(this.velY) < 0.1 && this.y + this.size >= height) {
      this.velY = 0;
    }

    this.collisionDetect();
  }

  collisionDetect() {
    const { balls, playSound, collisionBuffer } = this.config;

    balls.forEach((otherBall) => {
      if (this !== otherBall) {
        const dx = this.x - otherBall.x;
        const dy = this.y - otherBall.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const isColliding = distance < this.size + otherBall.size;

        if (isColliding && !this.collisionState.get(otherBall)) {
          playSound(collisionBuffer);
          [this.velX, otherBall.velX] = [otherBall.velX, this.velX];
          [this.velY, otherBall.velY] = [otherBall.velY, this.velY];
          this.collisionState.set(otherBall, true);
          otherBall.collisionState.set(this, true);
        } else if (!isColliding) {
          this.collisionState.set(otherBall, false);
          otherBall.collisionState.set(this, false);
        }
      }
    });
  }
}
