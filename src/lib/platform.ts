// Where offscreen canvases come from. The browser uses <canvas> elements; the server
// renderer swaps in @napi-rs/canvas via setCanvasFactory() before drawing anything.

export interface CanvasLike {
  width: number;
  height: number;
  getContext(type: '2d'): CanvasRenderingContext2D | null;
}

type Factory = (width: number, height: number) => CanvasLike;

let factory: Factory = (width, height) => {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  return c;
};

export function setCanvasFactory(f: Factory) {
  factory = f;
}

export const createCanvas = (width: number, height: number) => factory(width, height);
