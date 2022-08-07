import { Camera } from "./camera";
import { Canvas } from "./canvas";
import "./index.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="bg-gray-500">
    <canvas id="cv_main" width="1280px" height="720px"></canvas>
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
  await canvas.load();
  camera.canvas = canvas.cvOffscreen;
};
window.onload = init;
