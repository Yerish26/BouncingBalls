export function initCanvas() {
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => resizeCanvas(canvas));

  return { canvas, ctx, width, height };
}

export function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
