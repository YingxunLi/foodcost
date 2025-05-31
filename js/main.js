let stageHeight;
let stageWidth;
const margin = { top: 240, right: 80, bottom: 80, left: 80 };

init();

function init() {
  renderer = document.querySelector('#renderer');
  stageWidth = renderer.clientWidth;
  stageHeight = renderer.clientHeight;

  // prepareData();
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
  const maxCost = Math.max(...data.map(d => parseFloat(d.Cost)));

  const bars = [];

  data.forEach((country, i) => {
    const cost = parseFloat(country.Cost);
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
      tooltip.innerText = `${country["Country Name"]}: $${cost}`;
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


function init() {
  let renderer;
  renderer = document.querySelector('#renderer');
  stageWidth = renderer.clientWidth;
  stageHeight = renderer.clientHeight;

  drawCountryCostChart();
}