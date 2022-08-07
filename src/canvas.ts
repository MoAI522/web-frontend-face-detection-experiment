import { FaceDetector } from "./face_detector";

export class Canvas {
  private _cvMain: HTMLCanvasElement;
  private _cvOffscreen: HTMLCanvasElement;
  private _faceDetector: FaceDetector;

  constructor(cvMain: HTMLCanvasElement) {
    this._cvMain = cvMain;
    this._cvOffscreen = document.createElement("canvas");
    this._cvOffscreen.width = 1280;
    this._cvOffscreen.height = 720;
    this._faceDetector = new FaceDetector();

    window.requestAnimationFrame(() => this._updateWrapper());
  }

  public async load() {
    await this._faceDetector.loadModel();
  }

  private async _update() {
    // this._cvMain.width = this._cvOffscreen.width;
    // this._cvMain.height = this._cvOffscreen.height;
    const osCtx = this._cvOffscreen.getContext("2d");
    const mainCtx = this._cvMain.getContext("2d");
    if (osCtx == null || mainCtx == null) return;
    const frame = osCtx.getImageData(
      0,
      0,
      this._cvOffscreen.width,
      this._cvOffscreen.height
    );
    mainCtx.drawImage(
      this._cvOffscreen,
      0,
      0,
      this._cvOffscreen.width,
      this._cvOffscreen.height
    );
    const boxes = await this._faceDetector.predictFaceBoxes(frame);
    boxes.forEach(([x1, y1, x2, y2, prob]) => {
      mainCtx.strokeStyle = "#00ff00";
      mainCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      mainCtx.strokeText(`prob=${prob}`, x1, y1);
    });
  }

  private _updateWrapper() {
    this._update();
    window.requestAnimationFrame(() => this._updateWrapper());
  }

  get cvOffscreen(): HTMLCanvasElement {
    return this._cvOffscreen;
  }
}
