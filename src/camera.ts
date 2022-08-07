export class Camera {
  public readonly fps: number = 30;
  private _available: boolean;
  private _video: HTMLVideoElement | null;
  private _canvas: HTMLCanvasElement | null;

  constructor() {
    this._available = false;
    this._video = null;
    this._canvas = null;
    window.requestAnimationFrame(() => this._updateWrapper());
  }

  public async initializeCamera() {
    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this._available = true;
    } catch (err) {
      console.error(err);
      this._available = false;
      return;
    }

    this._video = document.createElement("video");
    this._video.srcObject = stream;
    this._video.onloadedmetadata = () => this._video?.play();
  }

  set canvas(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  private _update() {
    if (this._canvas == null) return;
    const ctx = this._canvas.getContext("2d");
    if (this._video == null || ctx == null) return;
    ctx.drawImage(this._video, 0, 0, this._canvas.width, this._canvas.height);
  }

  private _updateWrapper() {
    this._update();
    window.requestAnimationFrame(() => this._updateWrapper());
  }

  get available(): boolean {
    return this._available;
  }
}
