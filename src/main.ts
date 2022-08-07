import { Camera } from "./camera";
import { Canvas } from "./canvas";
import "./index.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="bg-red-500">
    <canvas id="cv_main" width="640px" height="480px"></canvas>
  </div>
`;

const init = async () => {
  const camera = new Camera();
  await camera.initializeCamera();
  if (!camera.available) {
    window.alert(
      "カメラへのアクセスがキャンセルされました。処理を中止します。"
    );
    return;
  }
  const cvMain = document.getElementById("cv_main") as HTMLCanvasElement;
  if (cvMain == null) return;
  const canvas = new Canvas(cvMain);
  camera.canvas = canvas.cvOffscreen;
};
window.onload = init;
