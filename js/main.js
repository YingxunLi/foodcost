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
  checkboxArea.style.display = "flex";
  checkboxArea.style.flexDirection = "row";
  checkboxArea.style.gap = "16px";
  checkboxArea.style.margin = "12px 0 0 0";
  checkboxArea.style.alignItems = "center";
  checkboxArea.style.position = "absolute";
  checkboxArea.style.left = `${margin.left}px`;
  checkboxArea.style.top = `${stageHeight - margin.bottom + 20}px`;
  checkboxArea.style.zIndex = "10";
  checkboxArea.style.background = "rgba(255,255,255,0.9)";
  checkboxArea.style.padding = "8px 16px";
  checkboxArea.style.borderRadius = "8px";

  fields.forEach(f => {
    let label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.cursor = "pointer";
    label.style.fontSize = "15px";
    label.style.color = "#333";
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
    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + f.label));
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


    let bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.width = `${barWidth}px`;
    bar.style.height = `${barHeight}px`;
    bar.style.left = `${xPos}px`;
    bar.style.top = `${yPos}px`;
    // bar.style.position = "absolute";

    bar.addEventListener('mouseenter', () => {
      tooltip.innerText = `${country["Country Name"]}: ${currentField === "Cost" ? "$" : ""}${cost}`;
      tooltip.style.display = "block";
      const barRect = bar.getBoundingClientRect();
      tooltip.style.left = `${barRect.right + 10}px`;
      tooltip.style.top = `${barRect.top}px`;

    
      bars.forEach(b => {
        b.classList.remove('active', 'faded');
        if (b !== bar) {
          b.classList.add('faded');
        }
      });
      bar.classList.add('active');
    });
    bar.addEventListener('mousemove', () => {
      const barRect = bar.getBoundingClientRect();
      tooltip.style.left = `${barRect.right + 10}px`;
      tooltip.style.top = `${barRect.top}px`;
    });
    bar.addEventListener('mouseleave', () => {
      tooltip.style.display = "none";
      bars.forEach(b => b.classList.remove('active', 'faded'));
    });

    document.querySelector("#renderer").appendChild(bar);
    bars.push(bar);

});
}