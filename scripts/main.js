const dividerArr = [
  16, 11, 10, 16, 24, 40, 51, 60,
  12, 12, 14, 19, 26, 58, 60, 55,
  14, 13, 16, 24, 40, 57, 69, 56,
  14, 17, 22, 29, 51, 87, 80, 62,
  18, 22, 37, 56, 68, 109, 103, 77,
  24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101,
  72, 92, 95, 98, 112, 100, 103, 99
];
let U = initializeU();
let img = document.getElementById('image');
let YCanvas = document.getElementById('Y');
let CbCanvas = document.getElementById('Cb');
let CrCanvas = document.getElementById('Cr');
let dctCanvas = document.getElementById('dct');
let finalCanvas = document.getElementById('final');

async function JPEGCompress() {
  YCanvas.width = img.width;
  YCanvas.height = img.height;
  CbCanvas.width = img.width;
  CbCanvas.height = img.height;
  CrCanvas.width = img.width;
  CrCanvas.height = img.height;
  dctCanvas.width = img.width;
  dctCanvas.height = img.height;
  finalCanvas.width = img.width;
  finalCanvas.height = img.height;

  const YContext = YCanvas.getContext('2d');
  const CbContext = CbCanvas.getContext('2d');
  const CrContext = CrCanvas.getContext('2d');
  const dctContext = dctCanvas.getContext('2d');
  const finalContext = finalCanvas.getContext('2d');


  YContext.drawImage(img, 0, 0, YCanvas.width, YCanvas.height);

  let imgData = YContext.getImageData(0, 0, YCanvas.width, YCanvas.height);
  let YCbCrData = [
    [],
    [],
    []
  ];

  loadYCbCrData(imgData, YCbCrData);

  offsetData(YCbCrData, true);
  transformData(YCbCrData, imgData.width, imgData.height, true);

  for (let j = 0; j < imgData.height; j++) {
    for (let i = 0; i < imgData.width; i++) {
      const Y = YCbCrData[0][i + j * imgData.width];
      setPixelXY(imgData, i, j, [Y, Y, Y, 255]);
    }
  }

  dctContext.putImageData(imgData, 0, 0);

  quantizeData(YCbCrData, imgData.width, imgData.height);
  unquantizeData(YCbCrData, imgData.width, imgData.height);
  transformData(YCbCrData, imgData.width, imgData.height, false);
  offsetData(YCbCrData, false);

  for (let j = 0; j < imgData.height; j++) {
    for (let i = 0; i < imgData.width; i++) {
      const Y = YCbCrData[0][i + j * imgData.width];
      setPixelXY(imgData, i, j, [Y, Y, Y, 255]);
    }
  }

  YContext.putImageData(imgData, 0, 0);

  for (let j = 0; j < imgData.height; j++) {
    for (let i = 0; i < imgData.width; i++) {
      const Cb = YCbCrData[1][i + j * imgData.width];
      setPixelXY(imgData, i, j, [Cb, Cb, Cb, 255]);
    }
  }

  CbContext.putImageData(imgData, 0, 0);

  for (let j = 0; j < imgData.height; j++) {
    for (let i = 0; i < imgData.width; i++) {
      const Cr = YCbCrData[2][i + j * imgData.width];
      setPixelXY(imgData, i, j, [Cr, Cr, Cr, 255]);
    }
  }

  CrContext.putImageData(imgData, 0, 0);

  loadRGBData(imgData, YCbCrData);
  finalContext.putImageData(imgData, 0, 0);
}

function getPixel(imgData, index) {
  return imgData.data.subarray(index * 4, index * 4 + 4);
}

function getPixelXY(imgData, x, y) {
  return getPixel(imgData, x + y * imgData.width);
}

function setPixel(imgData, index, pixelData) {
  imgData.data.set(pixelData, index * 4);
}

function setPixelXY(imgData, x, y, pixelData) {
  setPixel(imgData, x + y * imgData.width, pixelData);
}

function initializeU() {
  let U = [];
  for (let i = 0; i < 8; i++) {
    let row = [];
    for (let j = 0; j < 8; j++) {
      if (i == 0) {
        row[j] = Math.sqrt(2) / 4;
      } else {
        const coeff = (1 + (2 * j)) * i;
        row[j] = Math.cos(coeff * Math.PI / 16) / 2;
      }
    }
    U.push(row);
  }
  return U;
}

function loadYCbCrData(imgData, YCbCrData) {
  for (let i = 0; i < imgData.width * imgData.height; i++) {
    const p = getPixel(imgData, i);
    YCbCrData[0][i] = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
    YCbCrData[1][i] = -0.168736 * p[0] + -0.331264 * p[1] + 0.5 * p[2] + 128;
    YCbCrData[2][i] = 0.5 * p[0] + -0.418688 * p[1] + -0.081312 * p[2] + 128;
  }
}

function loadRGBData(imgData, YCbCrData) {
  for (let i = 0; i < imgData.width * imgData.height; i++) {
    const p = getPixel(imgData, i);
    p[0] = YCbCrData[0][i] + 1.402 * (YCbCrData[2][i] - 128);
    p[1] = YCbCrData[0][i] - 0.344136 * (YCbCrData[1][i] - 128) - 0.714136 * (YCbCrData[2][i] - 128);
    p[2] = YCbCrData[0][i] + 1.772 * (YCbCrData[1][i] - 128);
    setPixel(imgData, i, p);
  }
}

function offsetData(YCbCrData, forwards) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < YCbCrData[i].length; j++) {
      if (forwards) {
        YCbCrData[i][j] = YCbCrData[i][j] - 127;
      } else {
        YCbCrData[i][j] = Math.min(Math.max(Math.round(YCbCrData[i][j] + 127), 0), 255);
      }
    }
  }
}

function transformData(YCbCrData, width, height, forwards) {
  let multResult;
  for (let n = 0; n < 3; n++) {
    for (let k = 0; k < 2; k++) {
      multResult = new Array(YCbCrData[0].length);
      for (let y = 0; y < height; y += 8) {
        for (let x = 0; x < width; x += 8) {
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              let sum = 0;
              for (let m = 0; m < 8; m++) {
                if (k === 0) {
                  const index = (y + m) * width + (x + j);
                  if (forwards) {
                    sum += U[i][m] * YCbCrData[n][index];
                  } else {
                    sum += U[m][i] * YCbCrData[n][index];
                  }
                } else {
                  const index = (x + m) + (y + i) * width;
                  if (forwards) {
                    sum += YCbCrData[n][index] * U[j][m];
                  } else {
                    sum += YCbCrData[n][index] * U[m][j];
                  }
                }
              }
              const index = (x + j) + (y + i) * width;
              multResult[index] = sum;
            }
          }
        }
      }
      YCbCrData[n] = multResult;
    }
  }
}

function quantizeData(YCbCrData, width, height) {
  for (let y = 0; y < height; y += 8) {
    for (let x = 0; x < width; x += 8) {
      for (let j = 0; j < 8; j++) {
        for (let i = 0; i < 8; i++) {
          const loc = (i + x) + (j + y) * width;
          const dividerLoc = i + j * 8;
          for (let k = 0; k < 3; k++) {
            YCbCrData[k][loc] = Math.round(YCbCrData[k][loc] / dividerArr[dividerLoc]);
          }
        }
      }
    }
  }
}

function unquantizeData(YCbCrData, width, height) {
  for (let y = 0; y < height; y += 8) {
    for (let x = 0; x < width; x += 8) {
      for (let j = 0; j < 8; j++) {
        for (let i = 0; i < 8; i++) {
          const loc = (i + x) + (j + y) * width;
          const dividerLoc = i + j * 8;
          for (let k = 0; k < 3; k++) {
            YCbCrData[k][loc] = YCbCrData[k][loc] * dividerArr[dividerLoc];
          }
        }
      }
    }
  }
}

const demoButtons = Array.from(document.getElementsByClassName('demo-btn'));
for (let [i, btn] of demoButtons.entries()) {
  btn.onclick = () => demoButtonClick(i);
}
const demoImages = Array.from(document.getElementsByClassName('demo-img'));

const lionImg = './images/lion-small.jpg';
const landscapeImg = './images/landscape-small.jpg';
const bokehImg = './images/bokeh-blur-small.jpg';
const starryNightImg = './images/starry-night-small.jpg';
let activeIndex = -1;

function demoButtonClick(index) {
  switch (demoButtons[index].textContent) {
    case 'Lion':
      demoButtonClicked(index, lionImg);
      break;
    case 'Landscape':
      demoButtonClicked(index, landscapeImg);
      break;
    case 'Bokeh':
      demoButtonClicked(index, bokehImg);
      break;
    case 'Starry Night':
      demoButtonClicked(index, starryNightImg);
      break;
    default:
      console.log('image not supported');
  }
}

function demoButtonClicked(index, newImg) {
  if (activeIndex !== index) {
    img.setAttribute('src', newImg);
    clearCanvases();
    showAll();
    setTimeout(JPEGCompress, 100);
  } else {
    img.setAttribute('src', '');
    hideAll();
  }
  setActive(index);
}

function showAll() {
  for (image of demoImages) {
    image.setAttribute('class', 'demo-img');
  }
}

function hideAll() {
  for (image of demoImages) {
    image.setAttribute('class', 'demo-img hide');
  }
}

function setActive(clicked) {
  let classes = demoButtons[clicked].getAttribute('class');
  if (activeIndex === clicked) {
    demoButtons[clicked].setAttribute('class', 'demo-btn');
    activeIndex = -1;
  } else {
    classes += ' active';
    demoButtons[clicked].setAttribute('class', classes);
    if (activeIndex >= 0)
      demoButtons[activeIndex].setAttribute('class', 'demo-btn');
    activeIndex = clicked;
  }
}

function clearCanvases() {
  clearCanvas(YCanvas);
  clearCanvas(CbCanvas);
  clearCanvas(CrCanvas);
  clearCanvas(dctCanvas);
  clearCanvas(finalCanvas);
}

function clearCanvas(canvas) {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}