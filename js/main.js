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

  // chartWidth und chartHeight definieren den Inhaltsbereich
  const chartWidth = stageWidth - margin.left - margin.right;
  const chartHeight = stageHeight - margin.top - margin.bottom - 60; // 60 ist der Abstand zwischen Balken und Checkbox + Checkbox-Höhe

  // Erstelle Chart- und Checkbox-Container
  let chartArea = document.createElement("div");
  chartArea.id = "chart-area";
  chartArea.style.position = "absolute";
  chartArea.style.left = `${margin.left}px`;
  chartArea.style.top = `${margin.top}px`;
  chartArea.style.width = `${chartWidth}px`;
  chartArea.style.height = `${chartHeight}px`;
  chartArea.style.zIndex = "1";
  chartArea.style.pointerEvents = "none"; // Balken selbst kann auf Events reagieren

  let checkboxArea = document.createElement("div");
  checkboxArea.id = "checkbox-area";
  checkboxArea.style.position = "absolute";
  checkboxArea.style.left = `${margin.left}px`;
  checkboxArea.style.top = `${margin.top + chartHeight + 24}px`; // 24 ist der Abstand zwischen Balken und Checkbox
  checkboxArea.style.width = `${chartWidth}px`;
  checkboxArea.style.zIndex = "10";
  checkboxArea.style.display = "flex";
  checkboxArea.style.justifyContent = "space-between";
  checkboxArea.style.pointerEvents = "auto";

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

  // Entferne alte Bereiche (falls vorhanden)
  let oldChart = document.getElementById("chart-area");
  if (oldChart) oldChart.remove();
  let oldArea = document.getElementById("checkbox-area");
  if (oldArea) oldArea.remove();

  renderer.appendChild(chartArea);
  renderer.appendChild(checkboxArea);

  drawCountryCostChart();
}

function drawCountryCostChart() { 
  // Nur den Chart-Bereich leeren
  let chartArea = document.getElementById("chart-area");
  chartArea.innerHTML = "";

  let tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  document.body.appendChild(tooltip);

  const data = jsonData;
  console.log("insgesamt", data.length, "Länder");

  const chartWidth = stageWidth - margin.left - margin.right;
  const chartHeight = stageHeight - margin.top - margin.bottom - 60; // Konsistent mit init
  const gap = 4;
  const barWidth = (chartWidth - gap * (data.length - 1)) / data.length;
  // Maximalwert des aktuellen Feldes ermitteln
  const maxCost = Math.max(...data.map(d => parseFloat(d[currentField])));

  const bars = [];

  data.forEach((country, i) => {
    const cost = parseFloat(country[currentField]);
    const barHeight = gmynd.map(cost, 0, maxCost, 0, chartHeight);
    const xPos = i * (barWidth + gap);
    const yPos = chartHeight - barHeight;

    if (currentField === "Cost") {
      // Traditioneller voller Balken
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
      bar.style.position = "absolute";

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

      chartArea.appendChild(bar);
      bars.push(bar);
    } else {
      // Balken als Array von Quadraten
      let barDot = document.createElement("div");
      barDot.classList.add("bar-dot");
      barDot.style.width = `${barWidth}px`;
      barDot.style.height = `${chartHeight}px`;
      barDot.style.left = `${xPos}px`;
      barDot.style.top = `0px`;
      barDot.style.position = "absolute";

      // Anzahl der Quadrate und Abstand berechnen
      const squareSize = Math.max(8, Math.floor(barWidth * 0.8));
      const gapSize = 3;
      const maxSquares = Math.floor(chartHeight / (squareSize + gapSize));
      const numSquares = Math.max(1, Math.round(barHeight / chartHeight * maxSquares));

      // Alle Quadrate für Event-Handling speichern
      const squares = [];
      for (let j = 0; j < numSquares; j++) {
        let sq = document.createElement("div");
        sq.classList.add("bar-dot-square");
        sq.style.backgroundColor = "#80C9BD";
        squares.push(sq);
        barDot.appendChild(sq);
      }

      // Event-Delegation für jedes Quadrat
      squares.forEach(sq => {
        sq.addEventListener('mouseenter', () => {
          tooltip.innerText = `${country["Country Name"]}: ${cost}`;
          tooltip.style.display = "block";
          const sqRect = sq.getBoundingClientRect();
          tooltip.style.left = `${sqRect.right + 10}px`;
          tooltip.style.top = `${sqRect.top}px`;

          bars.forEach(b => {
            if (b !== barDot) {
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

      chartArea.appendChild(barDot);
      bars.push(barDot);
    }
  });
}