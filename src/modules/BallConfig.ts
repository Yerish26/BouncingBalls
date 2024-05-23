import { Ball } from "./Ball";

export interface BallConfig {
  balls: Ball[];
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  gravity: number;
  dampening: number;
  playSound: (buffer: AudioBuffer) => void;
  collisionBuffer: AudioBuffer;
}
