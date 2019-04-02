const header = document.getElementById('header');
const maxHeight = 300;
const minHeight = 100;
const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const maxTitle = 3;
const minTitle = 1.6;
const maxSubtitle = 1.17;
const minSubtitle = 0.9;
const maxMargin = 1;
const minMargin = 0.2;

adjustHeader();
window.addEventListener('scroll', () => {
  adjustHeader();
})
displayMatrices();

function displayMatrices() {
  const original = [
    [80, 123, 75, 135, 125, 46, 78, 76],
    [63, 67, 69, 119, 109, 58, 84, 43],
    [70, 60, 68, 80, 63, 77, 68, 126],
    [61, 75, 98, 116, 91, 42, 124, 243],
    [58, 58, 86, 77, 59, 57, 146, 206],
    [118, 63, 57, 90, 58, 70, 124, 131],
    [125, 80, 78, 161, 87, 74, 124, 191],
    [100, 96, 76, 113, 66, 87, 112, 122],
  ];

  const divider = [
    [16, 11, 10, 16, 24, 40, 51, 60],
    [12, 12, 14, 19, 26, 58, 60, 55],
    [14, 13, 16, 24, 40, 57, 69, 56],
    [14, 17, 22, 29, 51, 87, 80, 62],
    [18, 22, 37, 56, 68, 109, 103, 77],
    [24, 35, 55, 64, 81, 104, 113, 92],
    [49, 64, 78, 87, 103, 121, 120, 101],
    [72, 92, 95, 98, 112, 100, 103, 99]
  ];

  const transformed = [
    [19.56, -9.37, -4.15, -2.92, 25.54, -6.63, 4.58, 2.70],
    [129.80, 103.32, -117.45, 83.73, 53.15, -82.14, 89.80, 143.25],
    [231.28, -201.53, 98.77, -13.72, -48.11, 90.27, -136.48, 185.91],
    [2.35, 9.75, -4.97, 3.16, 0.17, -9.99, 4.60, -5.35],
    [2.14, -6.92, 4.32, -1.97, 6.40, -13.80, 1.29, 1.36],
    [1.12, 28.81, 0.29, -32.52, 12.57, 4.64, -33.97, 18.48],
    [-16.98, 4.27, 22.21, 7.53, -5.94, -25.39, -0.86, 15.29],
    [-29.79, 81.26, 12.55, -91.87, 93.13, -11.88, -82.77, 25.45]
  ];

  const quantized = [
    [1, -1, -0, -0, 1, -0, 0, 0],
    [11, 9, -8, 4, 2, -1, 1, 3],
    [17, -16, 6, -1, -1, 2, -2, 3],
    [0, 1, -0, 0, 0, -0, 0, -0],
    [0, -0, 0, -0, 0, -0, 0, 0],
    [0, 1, 0, -1, 0, 0, -0, 0],
    [-0, 0, 0, 0, -0, -0, -0, 0],
    [-0, 1, 0, -1, 1, -0, -1, 0]
  ];

  displayMatrix(original, document.getElementById('original-matrix'));
  displayMatrix(offset(original), document.getElementById('offset-matrix'));
  displayMatrix(divider, document.getElementById('divider-matrix'));
  displayMatrix(transformed, document.getElementById('transform-matrix'));
  displayMatrix(quantized, document.getElementById('quantized-matrix'));
}

function offset(matrix) {
  const offset = [];
  for (let j = 0; j < 8; j++) {
    let row = [];
    for (let i = 0; i < 8; i++) {
      row.push(matrix[i][j] - 127);
    }
    offset.push(row);
  }
  return offset;
}

function displayMatrix(matrix, container) {
  let div;
  let classList;
  for (let j = 0; j < 8; j++) {
    classList = 'bar-left';
    if (j === 0) {
      classList += ' bar-top';
    } else if (j === 7) {
      classList += ' bar-bottom';
    }

    div = document.createElement('div');
    div.setAttribute('class', classList);
    container.appendChild(div);

    for (let i = 0; i < 8; i++) {
      div = document.createElement('div');
      div.innerHTML = matrix[i][j];
      container.appendChild(div);
    }

    classList = 'bar-right';
    if (j === 0) {
      classList += ' bar-top';
    } else if (j === 7) {
      classList += ' bar-bottom';
    }
    div = document.createElement('div');
    div.setAttribute('class', classList)
    container.appendChild(div);
  }
}

function adjustHeader() {
  // calculate height of header based on scroll position
  let height = maxHeight - window.scrollY;
  if (height < minHeight) {
    height = minHeight;
  }

  header.style.height = height + "px";

  // change styling of text in header according to height
  const titleSize = map(height, minHeight, maxHeight, minTitle, maxTitle);
  title.style.fontSize = titleSize + "em";
  const subtitleSize = map(height, minHeight, maxHeight, minSubtitle, maxSubtitle);
  subtitle.style.fontSize = subtitleSize + "em";
  const subtitleMargin = map(height, minHeight, maxHeight, minMargin, maxMargin);
  subtitle.style.margin = subtitleMargin + "em";
}

// maps a value from one range to another range
function map(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}