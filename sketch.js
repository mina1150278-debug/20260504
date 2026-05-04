let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let stars = []; // 儲存星星位置

function gotFaces(results) {
  faces = results;
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  // 隱藏原始的 HTML 影片元件，只顯示在畫布上
  capture.hide();

  // 初始化 FaceMesh (採用 ml5 v1 推薦格式以消除警告)
  faceMesh = ml5.faceMesh(options, () => {
    faceMesh.detectStart(capture, gotFaces);
  });

  // 預先產生星星的隨機位置（比例值 0~1）
  for (let i = 0; i < 150; i++) {
    stars.push({ x: random(1), y: random(1) });
  }
}

function draw() {
  background('#e7c6ff');

  // 顯示學號與姓名
  push();
  fill(0);
  textSize(20);
  textAlign(LEFT, TOP);
  text("414730464吳昀臻", 10, 10);
  pop();

  let vW = windowWidth * 0.5;
  let vH = windowHeight * 0.5;
  let x = (windowWidth - vW) / 2;
  let y = (windowHeight - vH) / 2;

  // 檢查攝影機是否正常運作
  if (capture.width === 0) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("正在啟動攝影機，若長時間未顯示請檢查權限設定...", windowWidth / 2, windowHeight / 2);
    return;
  }

  push();
  // 將座標點移動到影像區域的右上角，準備進行左右翻轉
  translate(x + vW, y);
  scale(-1, 1);
  // 繪製影像
  image(capture, 0, 0, vW, vH);

  // 若偵測到臉部，則繪製指定編號的連線
  if (faces.length > 0 && capture.width > 0) {
    let face = faces[0];
    let sX = vW / capture.width;
    let sY = vH / capture.height;
    let silhouette = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];

    // --- 1. 繪製覆蓋影像區域的黑色背景與星星 ---
    fill(0);
    noStroke();
    rect(0, 0, vW, vH); // 在影像區域塗黑

    fill(255); // 白色星星
    for (let s of stars) {
      circle(s.x * vW, s.y * vH, 2);
    }

    // --- 2. 使用 erase 挖掉臉部區域，露出下方的攝影機影像 ---
    erase();
    beginShape();
    for (let i of silhouette) {
      let p = face.keypoints[i];
      vertex(p.x * sX, p.y * sY);
    }
    endShape(CLOSE);
    noErase();

    // --- 3. 繪製原本的紅色特徵線 ---
    // 定義兩組要連線的點位編號
    let paths = [
      [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
      [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184],
      // 左側眼外圈 (包含 247)
      [247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 226, 130, 247],
      // 左側眼內圈 (包含 246)
      [246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7, 33, 246],
      // 右側眼外圈 (包含 467)
      [467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 446, 359, 467],
      // 右側眼內圈 (包含 466)
      [466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249, 263, 466],
      // 臉部最外層輪廓 (Silhouette)
      [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 
       377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10]
    ];
    
    stroke(255, 0, 0); // 紅色線條
    strokeWeight(1);   // 粗細為 1
    noFill();

    // --- 設定霓虹燈發光效果 ---
    drawingContext.shadowBlur = 15;          // 模糊程度，數值越大發光範圍越廣
    drawingContext.shadowColor = color(255, 0, 0); // 陰影顏色，設定為紅色產生發光感

    // 遍歷所有路徑進行繪製
    for (let points of paths) {
      for (let i = 0; i < points.length - 1; i++) {
        let p1 = face.keypoints[points[i]];
        let p2 = face.keypoints[points[i + 1]];
        line(p1.x * sX, p1.y * sY, p2.x * sX, p2.y * sY);
      }
    }

    // 重置陰影設定，避免影響到其他繪製動作
    drawingContext.shadowBlur = 0;
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
