let stageHeight;
let stageWidth;
const margin = { top: 240, right: 80, bottom: 80, left: 80 };

const fields = [
  { key: "Cost", label: "Cost" },
  { key: "Fruits", label: "Fruits" },
  { key: "Vegetables", label: "Vegetables" },
  { key: "Starchy Staples", label: "Starchy Staples" },
  { key: "Animal-source Foods", label: "Animal-source Foods" },
  { key: "Nuts", label: "Nuts" },
  { key: "Oils and Fats", label: "Oils and Fats" }
];
let currentField = "Cost";

init();

function init() {
  renderer = document.querySelector('#renderer');
  stageWidth = renderer.clientWidth;
  stageHeight = renderer.clientHeight;

  // 添加复选框区域
  let checkboxArea = document.createElement("div");
  checkboxArea.id = "checkbox-area";
  // 计算chartWidth并设置宽度和定位
  const chartWidth = stageWidth - margin.left - margin.right;
  checkboxArea.style.position = "absolute";
  checkboxArea.style.left = `${margin.left}px`;
  checkboxArea.style.top = `${stageHeight - margin.bottom + 20}px`;
  checkboxArea.style.width = `${chartWidth}px`;
  checkboxArea.style.zIndex = "10";
  checkboxArea.style.display = "flex";
  checkboxArea.style.justifyContent = "space-between";

  fields.forEach(f => {
    let label = document.createElement("label");
    let input = document.createElement("input");
    input.type = "radio";
    input.name = "barfield";
    input.value = f.key;
    if (f.key === currentField) input.checked = true;
    input.addEventListener("change", (e) => {
      if (e.target.checked) {
        currentField = e.target.value;
        drawCountryCostChart();
      }
    });
    let span = document.createElement("span");
    span.textContent = " " + f.label;
    label.appendChild(input);
    label.appendChild(span);
    checkboxArea.appendChild(label);
  });

  // 先移除旧的区域（如果有）
  let oldArea = document.getElementById("checkbox-area");
  if (oldArea) oldArea.remove();
  renderer.parentNode.appendChild(checkboxArea);

  drawCountryCostChart();
}

function drawCountryCostChart() { 
  document.querySelector("#renderer").innerHTML = "";

  let tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  document.body.appendChild(tooltip);

  const data = jsonData;
  console.log("insgesamt", data.length, "Länder");

  const chartWidth = stageWidth - margin.left - margin.right;
  const chartHeight = stageHeight - margin.top - margin.bottom;
  const gap = 4;
  const barWidth = (chartWidth - gap * (data.length - 1)) / data.length;
  // 取当前字段的最大值
  const maxCost = Math.max(...data.map(d => parseFloat(d[currentField])));

  const bars = [];

  data.forEach((country, i) => {
    const cost = parseFloat(country[currentField]);
    const barHeight = gmynd.map(cost, 0, maxCost, 0, chartHeight);
    const xPos = margin.left + i * (barWidth + gap);
    const yPos = margin.top + (chartHeight - barHeight);

    if (currentField === "Cost") {
      // 传统整条bar
      let bar = document.createElement("div");
      bar.classList.add("bar");
      bar.style.width = `${barWidth}px`;
      bar.style.height = `${barHeight}px`;
      bar.style.left = `${xPos}px`;
      bar.style.top = `${yPos}px`;
      bar.style.backgroundColor = "#EFC5D8";
      bar.dataset.baseColor = "#EFC5D8";
      bar.dataset.activeColor = "#FD96B3";
      bar.dataset.fadedColor = "#EFC5D8";

      bar.addEventListener('mouseenter', () => {
        tooltip.innerText = `${country["Country Name"]}: $${cost}`;
        tooltip.style.display = "block";
        const barRect = bar.getBoundingClientRect();
        tooltip.style.left = `${barRect.right + 10}px`;
        tooltip.style.top = `${barRect.top}px`;

        bars.forEach(b => {
          b.classList.remove('active', 'faded');
          if (b !== bar) b.classList.add('faded');
        });
        bar.classList.add('active');
        bar.style.backgroundColor = bar.dataset.activeColor;
      });
      bar.addEventListener('mousemove', () => {
        const barRect = bar.getBoundingClientRect();
        tooltip.style.left = `${barRect.right + 10}px`;
        tooltip.style.top = `${barRect.top}px`;
      });
      bar.addEventListener('mouseleave', () => {
        tooltip.style.display = "none";
        bars.forEach(b => {
          b.classList.remove('active', 'faded');
          b.style.backgroundColor = b.dataset.baseColor;
        });
      });

      document.querySelector("#renderer").appendChild(bar);
      bars.push(bar);
    } else {
      // 方块阵列bar
      let barDot = document.createElement("div");
      barDot.classList.add("bar-dot");
      barDot.style.width = `${barWidth}px`;
      barDot.style.height = `${chartHeight}px`;
      barDot.style.left = `${xPos}px`;
      barDot.style.top = `${margin.top}px`;
      barDot.style.position = "absolute";

      // 计算小方块数量和gap
      const squareSize = Math.max(8, Math.floor(barWidth * 0.8));
      const gapSize = 3;
      const maxSquares = Math.floor(chartHeight / (squareSize + gapSize));
      const numSquares = Math.max(1, Math.round(barHeight / chartHeight * maxSquares));

      // 记录所有小方块用于事件处理
      const squares = [];
      for (let j = 0; j < numSquares; j++) {
        let sq = document.createElement("div");
        sq.classList.add("bar-dot-square");
        sq.style.backgroundColor = "#80C9BD";
        squares.push(sq);
        barDot.appendChild(sq);
      }

      // 事件代理到每个小方块
      squares.forEach(sq => {
        sq.addEventListener('mouseenter', () => {
          tooltip.innerText = `${country["Country Name"]}: ${cost}`;
          tooltip.style.display = "block";
          const sqRect = sq.getBoundingClientRect();
          tooltip.style.left = `${sqRect.right + 10}px`;
          tooltip.style.top = `${sqRect.top}px`;

          bars.forEach(b => {
            if (b !== barDot) {
              // 其他barDot下所有小方块都faded
              Array.from(b.children).forEach(child => {
                child.classList.remove('active');
                child.classList.add('faded');
              });
            }
          });
          squares.forEach(child => {
            child.classList.remove('faded');
            child.classList.add('active');
          });
        });
        sq.addEventListener('mousemove', () => {
          const sqRect = sq.getBoundingClientRect();
          tooltip.style.left = `${sqRect.right + 10}px`;
          tooltip.style.top = `${sqRect.top}px`;
        });
        sq.addEventListener('mouseleave', () => {
          tooltip.style.display = "none";
          bars.forEach(b => {
            Array.from(b.children).forEach(child => {
              child.classList.remove('active', 'faded');
            });
          });
        });
      });

      document.querySelector("#renderer").appendChild(barDot);
      bars.push(barDot);
    }
  });
}