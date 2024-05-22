// Ball.ts
export class Ball {
    constructor(
      public x: number,
      public y: number,
      public velX: number,
      public velY: number,
      public color: string,
      public size: number,
      private balls: Ball[],
      private ctx: CanvasRenderingContext2D,
      private width: number,
      private height: number,
      private gravity: number,
      private dampening: number,
      private playSound: (buffer: AudioBuffer) => void,
      private collisionBuffer: AudioBuffer
    ) {}
  
    draw() {
      this.ctx.save();
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetX = 3;
      this.ctx.shadowOffsetY = 3;
      this.ctx.beginPath();
      this.ctx.fillStyle = this.color;
      this.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.restore();
    }
  
    update(deltaTime: number) {
      this.velY += this.gravity * deltaTime;
  
      if (this.x + this.size >= this.width || this.x - this.size <= 0) {
        this.velX = -this.velX * this.dampening;
      }
  
      if (this.y + this.size >= this.height) {
        this.velY = -this.velY * this.dampening;
        this.y = this.height - this.size; // Prevent sinking below the bottom
      }
  
      this.x += this.velX * deltaTime;
      this.y += this.velY * deltaTime;
  
      if (Math.abs(this.velY) < 0.1 && this.y + this.size >= this.height) {
        this.velY = 0;
      }
  
      this.collisionDetect();
    }
  
    collisionDetect() {
      this.balls.forEach((otherBall) => {
        if (this !== otherBall) {
          const dx = this.x - otherBall.x;
          const dy = this.y - otherBall.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
  
          if (distance < this.size + otherBall.size) {
            this.playSound(this.collisionBuffer);
            [this.velX, otherBall.velX] = [otherBall.velX, this.velX];
            [this.velY, otherBall.velY] = [otherBall.velY, this.velY];
          }
        }
      });
    }
  }
  