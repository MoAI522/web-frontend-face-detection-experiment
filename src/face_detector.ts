import * as _ort from "onnxruntime-web";
import ultrafacePretrained from "./version-RFB-320.onnx?url";

type TResult = {
  boxes: _ort.TypedTensor<"float32">;
  scores: _ort.TypedTensor<"float32">;
};

export class FaceDetector {
  private session: ort.InferenceSession | null;

  constructor() {
    this.session = null;
  }

  public async loadModel() {
    this.session = await ort.InferenceSession.create(ultrafacePretrained);
  }

  public async predictFaceBoxes(frame: ImageData): Promise<number[][]> {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (ctx == null) return [];
    ctx.putImageData(frame, 0, 0, 0, 0, canvas.width, canvas.height);
    const resized = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const organized: number[] = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 240; j++) {
        for (let k = 0; k < 320; k++) {
          const v = resized[j * 320 * 3 + k * 3 + i];
          organized.push((v - 127) / 128);
        }
      }
    }
    const pre = new Float32Array(organized);
    const tensor = new ort.Tensor("float32", pre, [1, 3, 240, 320]);
    const feeds = { input: tensor };
    const results = (await this.session?.run(feeds)) as TResult;
    if (results == undefined) return [];

    const confidences: number[][][] = this._convArray(
      results.scores.data,
      results.scores.dims
    );
    const boxes: number[][][] = this._convArray(
      results.boxes.data,
      results.boxes.dims
    );
    console.log(confidences);
    const boxPosProbs = this._interpret(
      frame.width,
      frame.height,
      confidences[0],
      boxes[0],
      0.065
    );

    return boxPosProbs;
  }

  private _convArray(
    data: Float32Array,
    dims: readonly number[]
  ): number[][][] {
    const ret: number[][][] = [];
    for (let i = 0; i < dims[0]; i++) {
      ret.push([]);
      for (let j = 0; j < dims[1]; j++) {
        ret[i].push([]);
        for (let k = 0; k < dims[2]; k++) {
          ret[i][j].push(data[i * dims[1] * dims[2] + j * dims[2] + k]);
        }
      }
    }
    return ret;
  }

  private _interpret(
    width: number,
    height: number,
    confidences: number[][],
    boxes: number[][],
    probThreshold: number
  ) {
    const mask = confidences.map((v) => v[1] > probThreshold);
    const probs = confidences.filter((v, i) => mask[i]).map((v) => v[1]);
    if (probs.length == 0) return [];
    const boxProbs = boxes
      .filter((v, i) => mask[i])
      .map((v, i) => [
        v[0] * width,
        v[1] * height,
        v[2] * width,
        v[3] * height,
        probs[i],
      ]);
    return boxProbs;
  }
}
