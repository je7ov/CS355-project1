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
let img;
let YCanvas;
let CbCanvas;
let CrCanvas;

window.onload = () => {
  img = document.getElementById('image');
  YCanvas = document.getElementById('Y');
  CbCanvas = document.getElementById('Cb');
  CrCanvas = document.getElementById('Cr');

  YCanvas.width = img.width;
  YCanvas.height = img.height;
  CbCanvas.width = img.width;
  CbCanvas.height = img.height;
  CrCanvas.width = img.width;
  CrCanvas.height = img.height;

  const YContext = YCanvas.getContext('2d');
  const CbContext = CbCanvas.getContext('2d');
  const CrContext = CrCanvas.getContext('2d');

  YContext.drawImage(img, 0, 0, YCanvas.width, YCanvas.height);
  let imgData = YContext.getImageData(0, 0, YCanvas.width, YCanvas.height);
  let YCbCrData = [
    [],
    [],
    []
  ];

  loadYCbCrData(imgData, YCbCrData);

  for (let i = 0; i < imgData.width; i++) {
    for (let j = 0; j < imgData.height; j++) {
      const Y = YCbCrData[0][i + j * imgData.width];
      setPixelXY(imgData, i, j, [Y, Y, Y, 255]);
    }
  }

  YContext.putImageData(imgData, 0, 0);

  for (let i = 0; i < imgData.width; i++) {
    for (let j = 0; j < imgData.height; j++) {
      const Cb = YCbCrData[1][i + j * imgData.width];
      setPixelXY(imgData, i, j, [Cb, Cb, Cb, 255]);
    }
  }

  CbContext.putImageData(imgData, 0, 0);

  for (let i = 0; i < imgData.width; i++) {
    for (let j = 0; j < imgData.height; j++) {
      const Cr = YCbCrData[2][i + j * imgData.width];
      setPixelXY(imgData, i, j, [Cr, Cr, Cr, 255]);
    }
  }

  CrContext.putImageData(imgData, 0, 0);

  // console.log(YCbCrData[0]);
  // console.log('offsetting data');
  offsetData(YCbCrData, true);
  // console.log(YCbCrData[0]);
  // console.log('transforming data');
  transformData(YCbCrData, imgData.width, imgData.height, true);
  // console.log(YCbCrData[0]);
  // console.log('quantizing data');
  quantizeData(YCbCrData, imgData.width, imgData.height);
  // console.log(YCbCrData[0]);
  // console.log('unquantizing data');
  unquantizeData(YCbCrData, imgData.width, imgData.height);
  // console.log(YCbCrData[0]);
  // console.log('untransforming data');
  transformData(YCbCrData, imgData.width, imgData.height, false);
  // console.log(YCbCrData[0]);
  // console.log('offsetting data back');
  offsetData(YCbCrData, false);
  // console.log(YCbCrData[0]);

  for (let i = 0; i < imgData.width; i++) {
    for (let j = 0; j < imgData.height; j++) {
      const Y = YCbCrData[0][i + j * imgData.width];
      setPixelXY(imgData, i, j, [Y, Y, Y, 255]);
    }
  }

  YContext.putImageData(imgData, 0, 0);

  for (let i = 0; i < imgData.width; i++) {
    for (let j = 0; j < imgData.height; j++) {
      const Cb = YCbCrData[1][i + j * imgData.width];
      setPixelXY(imgData, i, j, [Cb, Cb, Cb, 255]);
    }
  }

  CbContext.putImageData(imgData, 0, 0);

  for (let i = 0; i < imgData.width; i++) {
    for (let j = 0; j < imgData.height; j++) {
      const Cr = YCbCrData[2][i + j * imgData.width];
      setPixelXY(imgData, i, j, [Cr, Cr, Cr, 255]);
    }
  }

  CrContext.putImageData(imgData, 0, 0);

  loadRGBData(imgData, YCbCrData);
  CrContext.putImageData(imgData, 0, 0);
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
  // for (let j = 0; j < imgData.height; j++) {
  //   let rowY = [];
  //   let rowCb = [];
  //   let rowCr = [];
  //   for (let i = 0; i < imgData.width; i++) {
  //     const p = getPixelXY(imgData, i, j);
  //     rowY.push(0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]);
  //     rowCb.push(-0.168736 * p[0] + -0.331264 * p[1] + 0.5 * p[2] + 128);
  //     rowCr.push(0.5 * p[0] + -0.418688 * p[1] + -0.081312 * p[2] + 128);
  //   }
  //   YCbCrData[0].push(rowY);
  //   YCbCrData[1].push(rowCb);
  //   YCbCrData[2].push(rowCr);
  // }
  // console.log(YCbCrData[0]);
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
    p[1] = (YCbCrData[0][i] - 0.344136) * (YCbCrData[1][i] - 128) * (YCbCrData[2][i] - 128);
    p[2] = (YCbCrData[0][i] + 1.772) * (YCbCrData[1][i] - 128);
    setPixel(imgData, i, p);
  }
}

function offsetData(YCbCrData, forwards) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < YCbCrData[i].length; j++) {
      YCbCrData[i][j] += forwards ? -127 : 127;
    }
  }
}

// function transformData(YCbCrData, width, height) {
//   for (let n = 0; n < 3; n++) {
//     for (let k = 0; k < 2; k++) {
//       for (let y = 0; y < height; y += 8) {
//         for (let x = 0; x < width; x += 8) {
//           let matrix = [];
//           for (let j = 0; j < 8; j++) {
//             let row = [];
//             for (let i = 0; i < 8; i++) {
//               row.push(YCbCrData[n][x + i][y + j]);
//             }
//             matrix.push(row);
//           }
//           console.log(math.multiply(U, matrix));
//         }
//       }
//     }
//   }
// }

function transformData(YCbCrData, width, height, forwards) {
  let multResult;
  for (let n = 0; n < 3; n++) {
    for (let k = 0; k < 2; k++) {
      multResult = [];
      for (let y = 0; y < height; y += 8) {
        for (let x = 0; x < width; x += 8) {
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              let sum = 0;
              for (let m = 0; m < 8; m++) {
                if (k === 0) {
                  const index = (x + j) + (y + m) * height;
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
              multResult.push(sum);
            }
          }
        }
      }
      // console.log(multResult);
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

// matrixMult3x3(
//   [1, 2, 3,
//     2, 3, 4,
//     3, 4, 5
//   ],
//   [3, 2, 1,
//     2, 3, 1,
//     4, 2, 3
//   ]
// )

function matrixMult3x3(m1, m2) {
  let result = [];
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 3; i++) {
      let sum = 0;
      for (let m = 0; m < 3; m++) {
        const index1 = m + j * 3;
        const index2 = i + m * 3;
        sum += m1[index1] * m2[index2];
      }
      result.push(sum);
    }
  }
}