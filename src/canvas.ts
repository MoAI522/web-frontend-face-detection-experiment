export class Canvas {
  public readonly width = 640;
  public readonly height = 480;
  private _cvMain: HTMLCanvasElement;
  private _cvOffscreen: HTMLCanvasElement;

  constructor(cvMain: HTMLCanvasElement) {
    this._cvMain = cvMain;
    this._cvMain.width = this.width;
    this._cvMain.height = this.height;
    this._cvOffscreen = document.createElement("canvas");
    this._cvOffscreen.width = this.width;
    this._cvOffscreen.height = this.height;
    document.getElementById("app")?.appendChild(this._cvOffscreen);
    window.requestAnimationFrame(() => this._updateWrapper());
  }

  private _update() {
    const osCtx = this._cvOffscreen.getContext("2d");
    const mainCtx = this._cvMain.getContext("2d");
    if (osCtx == null || mainCtx == null) return;
    const frame = osCtx.getImageData(
      0,
      0,
      this._cvOffscreen.width,
      this._cvOffscreen.height
    );
    // osCtx.putImageData(frame, 0, 0);
    mainCtx.putImageData(frame, 0, 0);
    // mainCtx.drawImage(this._cvOffscreen, 0, 0);
  }

  private _updateWrapper() {
    this._update();
    window.requestAnimationFrame(() => this._updateWrapper());
  }

  get cvOffscreen(): HTMLCanvasElement {
    return this._cvOffscreen;
  }
}
