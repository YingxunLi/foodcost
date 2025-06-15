let stageHeight;
let stageWidth;
const margin = { top: 120, right: 80, bottom: 100, left: 80 }; 

// ----------- Checkbox ----------- 
const fields = [
  { key: "Cost", label: "Total Cost" },
  { key: "Fruits", label: "Fruits" },
  { key: "Vegetables", label: "Vegetables" },
  { key: "Starchy Staples", label: "Starchy Staples" },
  { key: "Animal-source Foods", label: "Animal-source Foods" },
  { key: "Nuts", label: "Nuts" },
  { key: "Oils and Fats", label: "Oils and Fats" }
];
let currentField = "Cost";

// ----------- Option in der oberen rechten Ecke ----------- 
const topFields = [
  { key: "Cost", label: "Cost" },
  { key: "TagGNI", label: "Income" },
  { key: "Vergleich", label: "Ratio" }
];
let currentTopField = "Cost";

init();

function init() {
  renderer = document.querySelector('#renderer');
  stageWidth = renderer.clientWidth;
  stageHeight = renderer.clientHeight;

  let topArea = document.createElement("div");
  topArea.id = "top-area";
  topArea.style.left = `${margin.left}px`;
  topArea.style.width = `${stageWidth - margin.left - margin.right}px`;

  // ----------- Healthy Diet Cost-Button (Animation zurück) ----------- 
  let title = document.createElement("button");
  title.textContent = "Healthy Diet Cost";
  title.classList.add("top-btn", "main", "active");

  title.addEventListener("click", () => {
    //am Anfang Bar diagramm rendern
    barToScatterUltraSmoothTransition.hasEnteredScatter = false;
    barToScatterUltraSmoothTransition.currentScatterField = "Vergleich";
    barToScatterUltraSmoothTransition.prevRField = "Vergleich";
    
    //Button rechts nicht doppelt erzeugen
    let scatterTop = document.getElementById("scatter-top-btns");
    if (scatterTop) scatterTop.remove();
    
    //am Anfang nur cost aktivieren
    let topOptions = document.querySelector("#top-area > div:last-child");
    if (topOptions) {
      topOptions.style.display = "flex";
      Array.from(topOptions.children).forEach((b, idx) => {
        if (topFields[idx].key === "Cost") {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      });
    }
    
    // Reset active states
    setActiveButton(title, affordabilityBtn, overviewBtn);

    // Reset current field to Cost ⚠️
    currentField = "Cost";
    currentTopField = "Cost";

    // ob jetzt Scatterplot aktiv ist? falls ja, dann animiere zurück zu Balkendiagramm
    const dots = document.querySelectorAll(".bar-to-dot");
    if (dots.length > 0) {
      // Sortieren nach Größe
      const data = [...jsonData].sort((a, b) => parseFloat(b.TagGNI) - parseFloat(a.TagGNI));
      const chartWidth = stageWidth - margin.left - margin.right;
      const chartHeight = stageHeight - margin.top - margin.bottom;
      const gap = 6;
      const barWidth = (chartWidth - gap * (data.length - 1)) / data.length;
      const maxCost = Math.max(...data.map(d => parseFloat(d["Cost"])));

      // Animate dots back to bars
      dots.forEach((dot, i) => {
        const cost = parseFloat(data[i]["Cost"]);
        const barHeight = gmynd.map(cost, 0, maxCost, 0, chartHeight);
        const xPos = margin.left + i * (barWidth + gap);
        const yPos = margin.top + (chartHeight - barHeight);

        // Animate back to bar shape
        dot.style.width = `${barWidth}px`;
        dot.style.height = `${barHeight}px`;
        dot.style.left = `${xPos}px`;
        dot.style.top = `${yPos}px`;
        dot.style.borderRadius = "0";
      });

      // After transition, render the bar chart
      setTimeout(() => {
        drawCountryCostChart();
      }, 900);
    } else {
      drawCountryCostChart();
    }
  });

  // ----------- Affordability-Button ----------- 
  let affordabilityBtn = document.createElement("button");
  affordabilityBtn.textContent = "Affordability";
  affordabilityBtn.classList.add("top-btn", "main", "affordability", "inactive");

  affordabilityBtn.addEventListener("click", () => {
    barToScatterUltraSmoothTransition();
    setActiveButton(affordabilityBtn, title, overviewBtn);
  });

  // ----------- Overview-Button ----------- 
  let overviewBtn = document.createElement("button");
  overviewBtn.textContent = "Overview";
  overviewBtn.classList.add("top-btn", "main", "overview", "inactive");
  
  overviewBtn.addEventListener("click", () => {
    setActiveButton(overviewBtn, title, affordabilityBtn);
    drawOverviewChart();
  });

  // ----------- Container für drei Buttons ⬆️ ----------- 
  let leftArea = document.createElement("div");
  leftArea.appendChild(title);
  leftArea.appendChild(affordabilityBtn);
  leftArea.appendChild(overviewBtn);
  topArea.appendChild(leftArea);

  // ----------- Rechte Optionen-Button ----------- 
  let topOptions = document.createElement("div");
  topFields.forEach(f => {
    let btn = document.createElement("button");
    btn.textContent = f.label;
    btn.classList.add("top-btn");
    if (f.key === currentTopField) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      // Vorheriges Feld merken
      const prevField = currentField;
      currentTopField = f.key;
      currentField = f.key;
      // Obere Buttons neu rendern
      Array.from(topOptions.children).forEach((b, idx) => {
        if (topFields[idx].key === currentTopField) {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      });
      // Untere Balken neu rendern
      if (prevField === "Cost" && currentField === "TagGNI") {
        drawCountryCostChart("costToIncome");
      } else if (prevField === "Cost" && currentField === "Vergleich") {
        drawCountryCostChart("costToRatio");
      } else if (prevField === "TagGNI" && currentField === "Vergleich") {
        drawCountryCostChart("incomeToRatio");
      } else if (prevField === "Vergleich" && currentField === "Cost") {
        drawCountryCostChart("ratioToCost");
      } else if (prevField === "Vergleich" && currentField === "TagGNI") {
        drawCountryCostChart("ratioToIncome");
      } else if (prevField === "TagGNI" && currentField === "Cost") {
        drawCountryCostChart("incomeToCost");
      } else {
        drawCountryCostChart();
      }
    });
    topOptions.appendChild(btn);
  });
  topArea.appendChild(topOptions);

  // Vorherigen top-area entfernen
  let oldTop = document.getElementById("top-area");
  if (oldTop) oldTop.remove();
  renderer.parentNode.appendChild(topArea);

  renderCheckboxArea();

  drawCountryCostChart();
}

// ----------- Button verpacken ----------- 
function setActiveButton(activeBtn, ...inactiveBtns) {
  activeBtn.classList.add("active");
  activeBtn.classList.remove("inactive");
  inactiveBtns.forEach(btn => {
    btn.classList.remove("active");
    btn.classList.add("inactive");
  });
}

function renderCheckboxArea() {
  // Vorherigen Bereich entfernen (falls vorhanden)
  let oldArea = document.getElementById("checkbox-area");
  if (oldArea) oldArea.remove();

  const chartWidth = stageWidth - margin.left - margin.right;
  let checkboxArea = document.createElement("div");
  checkboxArea.id = "checkbox-area";
  checkboxArea.style.left = `${margin.left}px`;
  checkboxArea.style.top = `${stageHeight - margin.bottom + 20}px`;
  checkboxArea.style.width = `${chartWidth}px`;

  fields.forEach(f => {
    let label = document.createElement("label");
    label.classList.add("barfield-label");
    let input = document.createElement("input");
    input.type = "radio";
    input.name = "barfield";
    input.value = f.key;
    input.classList.add("barfield-input");
    if (f.key === currentField) input.checked = true;
    input.addEventListener("change", (e) => {
      if (e.target.checked) {
        // Vorheriges Feld merken
        const prevField = currentField;
        currentField = e.target.value;
        // Wenn zu Cost/Income/Ratio gewechselt wird, obere Buttons synchronisieren
        if (["Cost", "TagGNI", "Vergleich"].includes(currentField)) {
          currentTopField = currentField;
          // Obere Buttons neu rendern
          Array.from(document.querySelector("#top-area").lastChild.children).forEach((b, idx) => {
            b.style.background = (topFields[idx].key === currentTopField) ? "#FED5E1" : "#E1E5E8";
            b.style.color = (topFields[idx].key === currentTopField) ? "#FFFFFF" : "#6B7C8D";
          });
        }
        // Übergangslogik für verschiedene Felder
        if (prevField === "Cost" && currentField === "TagGNI") {
          drawCountryCostChart("costToIncome");
        } else if (prevField === "Cost" && currentField === "Vergleich") {
          drawCountryCostChart("costToRatio");
        } else if (prevField === "TagGNI" && currentField === "Vergleich") {
          drawCountryCostChart("incomeToRatio");
        } else if (prevField === "Vergleich" && currentField === "Cost") {
          drawCountryCostChart("ratioToCost");
        } else if (prevField === "Vergleich" && currentField === "TagGNI") {
          drawCountryCostChart("ratioToIncome");
        } else if (prevField === "TagGNI" && currentField === "Cost") {
          drawCountryCostChart("incomeToCost");
        } else {
          drawCountryCostChart();
        }
      }
    });
    let span = document.createElement("span");
    span.textContent = " " + f.label;
    label.appendChild(input);
    label.appendChild(span);
    checkboxArea.appendChild(label);
  });

  renderer.parentNode.appendChild(checkboxArea);
}

function drawCountryCostChart(transitionMode) {
  let topOptions = document.querySelector("#top-area > div:last-child");
  if (topOptions) topOptions.style.display = "flex";

  document.querySelector("#renderer").innerHTML = "";

  // Bei jedem Rendern der Balkendiagramme Checkbox-Bereich neu erzeugen
  renderCheckboxArea();

  // Logik für das Sperren der Checkboxen
  const isLockMode = (currentField === "TagGNI" || currentField === "Vergleich");
  document.querySelectorAll('.barfield-label').forEach(label => {
    const input = label.querySelector('input.barfield-input');
    const isCost = input.value === "Cost";
    if (isLockMode) {
      input.disabled = true;
      if (isCost) {
        label.style.color = "#FED5E1";
        // Auswahl beibehalten
        input.checked = true;
      } else {
        label.style.color = "#E1E5E8";
        input.checked = false;
      }
    } else {
      input.disabled = false;
      label.style.color = "#333";
    }
  });

  let tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  document.body.appendChild(tooltip);

  const data = [...jsonData].sort((a, b) => parseFloat(b.TagGNI) - parseFloat(a.TagGNI));
  const chartWidth = stageWidth - margin.left - margin.right;
  const chartHeight = stageHeight - margin.top - margin.bottom;
  const gap = 6;
  const barWidth = (chartWidth - gap * (data.length - 1)) / data.length;

  let maxCost = Math.max(...data.map(d => parseFloat(d["Cost"])));
  let maxIncome = Math.max(...data.map(d => parseFloat(d["TagGNI"])));
  let maxVergleich = Math.max(...data.map(d => parseFloat(d["Vergleich"]))); // Neu

  const bars = [];

  // cost->income时，cost bar高度过渡
  if (transitionMode === "costToIncome") {
    // Zuerst cost-Balken rendern (mit cost-Maximalwert abbilden)
    data.forEach((country, i) => {
      const cost = parseFloat(country["Cost"]);
      const barHeight = gmynd.map(cost, 0, maxCost, 0, chartHeight);
      const xPos = margin.left + i * (barWidth + gap);
      const yPos = margin.top + (chartHeight - barHeight);

      let bar = document.createElement("div");
      bar.classList.add("bar", "cost");
      bar.style.width = `${barWidth}px`;
      bar.style.height = `${barHeight}px`;
      bar.style.left = `${xPos}px`;
      bar.style.top = `${yPos}px`;
      bar.style.position = "absolute";
      bar.style.transition = "height 0.5s, top 0.5s";

      document.querySelector("#renderer").appendChild(bar);
      bars.push(bar);
    });

    // Erzwinge Reflow
    void document.querySelector("#renderer").offsetHeight;

    // Übergang zu cost-Balken unter income-Anzeige
    data.forEach((country, i) => {
      const cost = parseFloat(country["Cost"]);
      const barHeight = gmynd.map(cost, 0, maxIncome, 0, chartHeight);
      const yPos = margin.top + (chartHeight - barHeight);
      const bar = bars[i];
      bar.style.height = `${barHeight}px`;
      bar.style.top = `${yPos}px`;
    });

    // Nach Übergang income+cost Doppelsäulen rendern
    setTimeout(() => {
      drawCountryCostChart();
    }, 500);

    return;
  }

  // cost->ratio时，cost bar高度过渡
  if (transitionMode === "costToRatio") {
    // Zuerst cost-Balken rendern (mit cost-Maximalwert abbilden)
    data.forEach((country, i) => {
      const cost = parseFloat(country["Cost"]);
      const barHeight = gmynd.map(cost, 0, maxCost, 0, chartHeight);
      const xPos = margin.left + i * (barWidth + gap);
      const yPos = margin.top + (chartHeight - barHeight);

      let bar = document.createElement("div");
      bar.classList.add("bar", "cost");
      bar.style.width = `${barWidth}px`;
      bar.style.height = `${barHeight}px`;
      bar.style.left = `${xPos}px`;
      bar.style.top = `${yPos}px`;
      bar.style.position = "absolute";
      bar.style.transition = "height 0.5s, top 0.5s";
      // 不再设置 backgroundColor
      document.querySelector("#renderer").appendChild(bar);
      bars.push(bar);
    });

    // Erzwinge Reflow
    void document.querySelector("#renderer").offsetHeight;

    // Übergang zu ratio-Anzeige
    data.forEach((country, i) => {
      const vergleich = parseFloat(country["Vergleich"]);
      const barHeight = gmynd.map(vergleich, 0, maxVergleich, 0, chartHeight);
      const yPos = margin.top + (chartHeight - barHeight);
      const bar = bars[i];
      bar.style.height = `${barHeight}px`;
      bar.style.top = `${yPos}px`;
    });

    // Nach Übergang ratio-Balken rendern
    setTimeout(() => {
      drawCountryCostChart();
    }, 500);

    return;
  }

  // income->ratio时，income bar过渡到ratio灰色100bar，cost bar过渡到ratio粉色bar
  if (transitionMode === "incomeToRatio") {
    // Zuerst income-Seite rendern: income-Balken (grau) und cost-Balken (rosa), beide mit income-Maximalwert abbilden
    data.forEach((country, i) => {
      const income = parseFloat(country["TagGNI"]);
      const cost = parseFloat(country["Cost"]);
      const vergleich = parseFloat(country["Vergleich"]);
      const barHeightIncome = gmynd.map(income, 0, maxIncome, 0, chartHeight);
      const barHeightCost = gmynd.map(cost, 0, maxIncome, 0, chartHeight);
      const xPos = margin.left + i * (barWidth + gap);

      // income bar（灰色，目标是 ratio 的 100% bar）
      let barBg = document.createElement("div");
      barBg.classList.add("bar", "ratio-bg");
      barBg.style.width = `${barWidth}px`;
      barBg.style.height = `${barHeightIncome}px`;
      barBg.style.left = `${xPos}px`;
      barBg.style.top = `${margin.top + (chartHeight - barHeightIncome)}px`;
      barBg.style.position = "absolute";
      barBg.style.transition = "height 0.5s, top 0.5s";
      // 不再设置 backgroundColor
      document.querySelector("#renderer").appendChild(barBg);
      bars.push(barBg);

      // cost bar（粉色，目标是 ratio 的 vergleich bar）
      let pinkBar = document.createElement("div");
      pinkBar.classList.add("bar", "ratio-fg");
      pinkBar.style.width = `${barWidth}px`;
      pinkBar.style.height = `${barHeightCost}px`;
      pinkBar.style.left = `${xPos}px`;
      pinkBar.style.top = `${margin.top + (chartHeight - barHeightCost)}px`;
      pinkBar.style.position = "absolute";
      pinkBar.style.transition = "height 0.5s, top 0.5s";
      // 不再设置 backgroundColor
      document.querySelector("#renderer").appendChild(pinkBar);
      bars.push(pinkBar);
    });

    // Erzwinge Reflow
    void document.querySelector("#renderer").offsetHeight;

    // income bar 过渡到 ratio 的 100% bar，cost bar 过渡到 ratio 的 vergleich bar
    data.forEach((country, i) => {
      // 灰色底bar
      const barHeightBg = gmynd.map(100, 0, maxVergleich, 0, chartHeight);
      const yPosBg = margin.top + (chartHeight - barHeightBg);
      const barBg = bars[i * 2];
      barBg.style.height = `${barHeightBg}px`;
      barBg.style.top = `${yPosBg}px`;

      // 粉色bar
      const vergleich = parseFloat(country["Vergleich"]);
      const barHeightPink = gmynd.map(vergleich, 0, maxVergleich, 0, chartHeight);
      const yPosPink = margin.top + (chartHeight - barHeightPink);
      const pinkBar = bars[i * 2 + 1];
      pinkBar.style.height = `${barHeightPink}px`;
      pinkBar.style.top = `${yPosPink}px`;
    });

    // Nach Übergang ratio-Seite rendern (mit grauem Hintergrund und rosa Balken)
    setTimeout(() => {
      drawCountryCostChart();
    }, 500);

    return;
  }

  // ratio->income时，灰色100bar过渡到income bar，粉色bar过渡到cost bar（以income最大值映射）
  if (transitionMode === "ratioToIncome") {
    data.forEach((country, i) => {
      const vergleich = parseFloat(country["Vergleich"]);
      const barHeightGray = gmynd.map(100, 0, maxVergleich, 0, chartHeight);
      const barHeightPink = gmynd.map(vergleich, 0, maxVergleich, 0, chartHeight);
      const xPos = margin.left + i * (barWidth + gap);

      // 灰色底bar
      let barBg = document.createElement("div");
      barBg.classList.add("bar", "ratio-bg");
      barBg.style.width = `${barWidth}px`;
      barBg.style.height = `${barHeightGray}px`;
      barBg.style.left = `${xPos}px`;
      barBg.style.top = `${margin.top + (chartHeight - barHeightGray)}px`;
      barBg.style.position = "absolute";
      barBg.style.transition = "height 0.5s, top 0.5s";
      // 不再设置 backgroundColor
      document.querySelector("#renderer").appendChild(barBg);
      bars.push(barBg);

      // 粉色bar
      let pinkBar = document.createElement("div");
      pinkBar.classList.add("bar", "ratio-fg");
      pinkBar.style.width = `${barWidth}px`;
      pinkBar.style.height = `${barHeightPink}px`;
      pinkBar.style.left = `${xPos}px`;
      pinkBar.style.top = `${margin.top + (chartHeight - barHeightPink)}px`;
      pinkBar.style.position = "absolute";
      pinkBar.style.transition = "height 0.5s, top 0.5s";
      // 不再设置 backgroundColor
      document.querySelector("#renderer").appendChild(pinkBar);
      bars.push(pinkBar);
    });

    // Erzwinge Reflow
    void document.querySelector("#renderer").offsetHeight;

    // 灰色bar过渡到income bar，粉色bar过渡到cost bar（以income最大值映射）
    data.forEach((country, i) => {
      const income = parseFloat(country["TagGNI"]);
      const cost = parseFloat(country["Cost"]);
      const barHeightIncome = gmynd.map(income, 0, maxIncome, 0, chartHeight);
      const barHeightCost = gmynd.map(cost, 0, maxIncome, 0, chartHeight);
      const yPosIncome = margin.top + (chartHeight - barHeightIncome);
      const yPosCost = margin.top + (chartHeight - barHeightCost);
      const barBg = bars[i * 2];
      const pinkBar = bars[i * 2 + 1];
      barBg.style.height = `${barHeightIncome}px`;
      barBg.style.top = `${yPosIncome}px`;
      pinkBar.style.height = `${barHeightCost}px`;
      pinkBar.style.top = `${yPosCost}px`;
    });

    setTimeout(() => {
      drawCountryCostChart();
    }, 500);

    return;
  }

  // ...existing code for data.forEach...
  data.forEach((country, i) => {
    const cost = parseFloat(country["Cost"]);
    const income = parseFloat(country["TagGNI"]);
    const vergleich = parseFloat(country["Vergleich"]);
    const fieldValue = parseFloat(country[currentField]);
    const barHeight = gmynd.map(
      fieldValue,
      0,
      currentField === "TagGNI"
        ? maxIncome
        : currentField === "Vergleich"
          ? maxVergleich
          : maxCost,
      0,
      chartHeight
    );
    const xPos = margin.left + i * (barWidth + gap);
    const yPos = margin.top + (chartHeight - barHeight);

    if (currentField === "TagGNI") {
      // income-Balken
      let barIncome = document.createElement("div");
      barIncome.classList.add("bar", "income");
      barIncome.style.width = `${barWidth}px`;
      barIncome.style.height = `${gmynd.map(income, 0, maxIncome, 0, chartHeight)}px`;
      barIncome.style.left = `${xPos}px`;
      barIncome.style.top = `${margin.top + (chartHeight - gmynd.map(income, 0, maxIncome, 0, chartHeight))}px`;
      barIncome.style.position = "absolute";

      // cost-Balken (mit income-Maximalwert abbilden)
      let barCost = document.createElement("div");
      barCost.classList.add("bar", "cost");
      barCost.style.width = `${barWidth}px`;
      barCost.style.height = `${gmynd.map(cost, 0, maxIncome, 0, chartHeight)}px`;
      barCost.style.left = `${xPos}px`;
      barCost.style.top = `${margin.top + (chartHeight - gmynd.map(cost, 0, maxIncome, 0, chartHeight))}px`;
      barCost.style.position = "absolute";

      // Interaktion: income
      barIncome.addEventListener('mouseenter', () => {
        tooltip.innerText = `${country["Country Name"]}: Income $${income.toFixed(2)}`;
        tooltip.style.display = "block";
        const barRect = barIncome.getBoundingClientRect();
        tooltip.style.left = `${barRect.right + 10}px`;
        tooltip.style.top = `${barRect.top}px`;
        barIncome.classList.add('active');
      });
      barIncome.addEventListener('mousemove', () => {
        const barRect = barIncome.getBoundingClientRect();
        tooltip.style.left = `${barRect.right + 10}px`;
        tooltip.style.top = `${barRect.top}px`;
      });
      barIncome.addEventListener('mouseleave', () => {
        tooltip.style.display = "none";
        barIncome.classList.remove('active');
        barIncome.style.backgroundColor = barIncome.dataset.baseColor;
      });

      // Interaktion: cost
      barCost.addEventListener('mouseenter', () => {
        tooltip.innerText = `${country["Country Name"]}: Cost $${cost}`;
        tooltip.style.display = "block";
        const barRect = barCost.getBoundingClientRect();
        tooltip.style.left = `${barRect.right + 10}px`;
        tooltip.style.top = `${barRect.top}px`;
        barCost.classList.add('active');
        barCost.style.backgroundColor = barCost.dataset.activeColor;
      });
      barCost.addEventListener('mousemove', () => {
        const barRect = barCost.getBoundingClientRect();
        tooltip.style.left = `${barRect.right + 10}px`;
        tooltip.style.top = `${barRect.top}px`;
      });
      barCost.addEventListener('mouseleave', () => {
        tooltip.style.display = "none";
        barCost.classList.remove('active');
        barCost.style.backgroundColor = barCost.dataset.baseColor;
      });

      document.querySelector("#renderer").appendChild(barIncome);
      document.querySelector("#renderer").appendChild(barCost);
      bars.push(barIncome, barCost);
    } else if (["Cost", "Vergleich"].includes(currentField)) {
      // Ratio-Seite: zuerst grauer Hintergrundbalken (100%), dann rosa Balken (tatsächliches Verhältnis)
      if (currentField === "Vergleich") {
        // Grauer Hintergrundbalken (100%)
        let barBg = document.createElement("div");
        barBg.classList.add("bar", "ratio-bg");
        barBg.style.width = `${barWidth}px`;
        barBg.style.height = `${gmynd.map(100, 0, maxVergleich, 0, chartHeight)}px`;
        barBg.style.left = `${xPos}px`;
        barBg.style.top = `${margin.top + (chartHeight - gmynd.map(100, 0, maxVergleich, 0, chartHeight))}px`;
        barBg.style.position = "absolute";
        // 不再设置 backgroundColor
        document.querySelector("#renderer").appendChild(barBg);
      }

      // Rosa Balken
      let bar = document.createElement("div");
      bar.classList.add("bar");
      bar.style.width = `${barWidth}px`;
      bar.style.height = `${barHeight}px`;
      bar.style.left = `${xPos}px`;
      bar.style.top = `${yPos}px`;
      bar.style.position = "absolute";
      // 不再设置 backgroundColor、borderRadius、zIndex
      bar.dataset.baseColor = "#FED5E1";
      bar.dataset.activeColor = "#FD96B3";

      bar.addEventListener('mouseenter', () => {
        let val = fieldValue;
        if (currentField === "Cost") val = `$${fieldValue}`;
        if (currentField === "Vergleich") val = `${fieldValue.toFixed(1)}%`;
        tooltip.innerText = `${country["Country Name"]}: ${val}`;
        tooltip.style.display = "block";
        const barRect = bar.getBoundingClientRect();
        tooltip.style.left = `${barRect.right + 10}px`;
        tooltip.style.top = `${barRect.top}px`;

        bars.forEach(b => {
          b.classList.remove('active');
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
          b.classList.remove('active');
          b.style.backgroundColor = b.dataset.baseColor;
        });
      });

      document.querySelector("#renderer").appendChild(bar);
      bars.push(bar);
    } else {
      // cost-Balken（灰色/半透明，底层）
      let costBar = document.createElement("div");
      costBar.classList.add("bar", "cost-background");
      costBar.style.width = `${barWidth}px`;
      const costBarHeight = gmynd.map(cost, 0, maxCost, 0, chartHeight);
      costBar.style.height = `${costBarHeight}px`;
      costBar.style.left = `${xPos}px`;
      costBar.style.top = `${margin.top + (chartHeight - costBarHeight)}px`;
      costBar.style.position = "absolute";
      document.querySelector("#renderer").appendChild(costBar);

      // 普通粉色bar（顶层）
      let bar = document.createElement("div");
      bar.classList.add("bar");
      bar.style.width = `${barWidth}px`;
      bar.style.height = `${barHeight}px`;
      bar.style.left = `${xPos}px`;
      bar.style.top = `${yPos}px`;
      bar.style.position = "absolute";
      // 不再设置 backgroundColor、borderRadius、zIndex
      bar.dataset.baseColor = "#FED5E1";
      bar.dataset.activeColor = "#FD96B3";

      bar.addEventListener('mouseenter', () => {
        tooltip.innerText = `${country["Country Name"]}: ${cost}`;
        tooltip.style.display = "block";
        const barRect = bar.getBoundingClientRect();
        tooltip.style.left = `${barRect.right + 10}px`;
        tooltip.style.top = `${barRect.top}px`;

        // 只高亮当前 bar，不影响其他 bar
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
        bar.classList.remove('active');
        bar.style.backgroundColor = bar.dataset.baseColor;
      });

      document.querySelector("#renderer").appendChild(bar);
      bars.push(bar);
    }
  });
}

// ----------- Affordability ----------- 
function barToScatterUltraSmoothTransition() {
  // richtopOptions entfernen
  let topOptions = document.querySelector("#top-area > div:last-child");
  if (topOptions) topOptions.style.display = "none";

  // checkbox entfernen
  document.querySelector("#renderer").innerHTML = "";
  let oldArea = document.getElementById("checkbox-area");
  if (oldArea) oldArea.remove();

  // neue buttons erstellen
  const scatterFields = [
    { key: "Vergleich", label: "Ratio" },
    { key: "Percent cannot afford", label: "Unaffordability" },
    { key: "Unterernährung", label: "Malnutrition" }
  ];

  // protection
  if (!barToScatterUltraSmoothTransition.currentScatterField) {
    barToScatterUltraSmoothTransition.currentScatterField = "Vergleich";
    barToScatterUltraSmoothTransition.prevRField = "Vergleich";
  }
  let currentScatterField = barToScatterUltraSmoothTransition.currentScatterField;

  if (typeof barToScatterUltraSmoothTransition.hasEnteredScatter === "undefined") {
    barToScatterUltraSmoothTransition.hasEnteredScatter = false;
  }

  // scatter top area erstellen
  let scatterTop = document.createElement("div");
  scatterTop.style.display = "flex";
  scatterTop.style.gap = "18px";
  scatterTop.style.zIndex = "30";
  scatterTop.id = "scatter-top-btns";

  // drei Schaltflächen erstellen
  scatterFields.forEach(f => {
    let btn = document.createElement("button");
    btn.textContent = f.label;
    btn.classList.add("top-btn");
    if (f.key === currentScatterField) btn.classList.add("active");
    btn.addEventListener("mouseenter", () => btn.classList.add("active"));
    btn.addEventListener("mouseleave", () => {
      if (barToScatterUltraSmoothTransition.currentScatterField !== f.key) btn.classList.remove("active");
    });

    btn.addEventListener("click", () => {
      barToScatterUltraSmoothTransition.prevRField = barToScatterUltraSmoothTransition.currentScatterField;
      barToScatterUltraSmoothTransition.currentScatterField = f.key;
      Array.from(scatterTop.children).forEach((b, idx) => {
        if (scatterFields[idx].key === f.key) {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      });
      barToScatterUltraSmoothTransition.hasEnteredScatter = true;
      barToScatterUltraSmoothTransition();
    });
    scatterTop.appendChild(btn);
  });

  // old area entfernen
  let oldScatterTop = document.getElementById("scatter-top-btns");
  if (oldScatterTop) oldScatterTop.remove();
  document.querySelector("#top-area").appendChild(scatterTop);

  // Daten vorbereiten
  const data = [...jsonData].sort((a, b) => parseFloat(b.TagGNI) - parseFloat(a.TagGNI));
  const chartWidth = stageWidth - margin.left - margin.right;
  const chartHeight = stageHeight - margin.top - margin.bottom;
  const gap = 6;
  const barWidth = (chartWidth - gap * (data.length - 1)) / data.length;

  // X / Y 
  const minX = Math.min(...data.map(d => parseFloat(d["TagGNI"])));
  const maxX = Math.max(...data.map(d => parseFloat(d["TagGNI"])));
  const minY = Math.min(...data.map(d => parseFloat(d["Cost"])));
  const maxY = Math.max(...data.map(d => parseFloat(d["Cost"])));

  // min / max
  const rField = barToScatterUltraSmoothTransition.currentScatterField || "Vergleich";
  const minR = Math.min(...data.map(d => parseFloat(d[rField])));
  const maxR = Math.max(...data.map(d => parseFloat(d[rField])));

  // 绘制X轴
let axisX = document.createElement("div");
axisX.style.position = "absolute";
axisX.style.left = `${margin.left}px`;
axisX.style.top = `${margin.top + chartHeight}px`;
axisX.style.width = `${chartWidth}px`;
axisX.style.height = "1px";
axisX.style.background = "#bbb";
axisX.style.display = "none"; // 初始隐藏
axisX.id = "axis-x";
document.querySelector("#renderer").appendChild(axisX);

// 绘制Y轴
let axisY = document.createElement("div");
axisY.style.position = "absolute";
axisY.style.left = `${margin.left}px`;
axisY.style.top = `${margin.top}px`;
axisY.style.width = "1px";
axisY.style.height = `${chartHeight}px`;
axisY.style.background = "#bbb";
axisY.style.display = "none"; // 初始隐藏
axisY.id = "axis-y";
document.querySelector("#renderer").appendChild(axisY);

// X轴标签
let xlabel = document.createElement("div");
xlabel.textContent = "Income (TagGNI)";
xlabel.style.position = "absolute";
xlabel.style.left = `${margin.left + chartWidth / 2 - 40}px`;
xlabel.style.top = `${margin.top + chartHeight + 30}px`;
xlabel.style.color = "#6B7C8D";
xlabel.style.fontSize = "14px";
xlabel.style.display = "none"; // 初始隐藏
xlabel.id = "axis-x-label";
document.querySelector("#renderer").appendChild(xlabel);

// Y轴标签
let ylabel = document.createElement("div");
ylabel.textContent = "Cost";
ylabel.style.position = "absolute";
ylabel.style.left = `${margin.left - 50}px`;
ylabel.style.top = `${margin.top + chartHeight / 2 - 30}px`;
ylabel.style.transform = "rotate(-90deg)";
ylabel.style.transformOrigin = "left top";
ylabel.style.color = "#6B7C8D";
ylabel.style.fontSize = "14px";
ylabel.style.display = "none"; // 初始隐藏
ylabel.id = "axis-y-label";
document.querySelector("#renderer").appendChild(ylabel);


  // tooltip
  let tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  document.body.appendChild(tooltip);

  // 只在第一次 bar->scatter 时执行动画，后续切换仅变大小
  if (!barToScatterUltraSmoothTransition.hasEnteredScatter) {
    // 先画bar，后变成dot
    let barDots = [];
    let startStates = [];
    let endStates = [];
    data.forEach((country, i) => {
      const cost = parseFloat(country["Cost"]);
      const barHeight = gmynd.map(cost, 0, Math.max(...data.map(d => parseFloat(d["Cost"]))), 0, chartHeight);
      const xPos = margin.left + i * (barWidth + gap);
      const yPos = margin.top + (chartHeight - barHeight);

      // 目标位置和大小
      const logMinX = Math.log10(minX);
      const logMaxX = Math.log10(maxX);
      const logMinY = Math.log10(minY);
      const logMaxY = Math.log10(maxY);

      const x = gmynd.map(Math.log10(parseFloat(country["TagGNI"])), logMinX, logMaxX, 0, chartWidth);
      const y = gmynd.map(Math.log10(parseFloat(country["Cost"])), logMinY, logMaxY, chartHeight, 0);
      const r = gmynd.map(parseFloat(country[rField]), minR, maxR, 20, 160);

      let bar = document.createElement("div");
      bar.classList.add("bar", "bar-to-dot");
      bar.style.width = `${barWidth}px`;
      bar.style.height = `${barHeight}px`;
      bar.style.left = `${xPos}px`;
      bar.style.top = `${yPos}px`;
      bar.style.position = "absolute";
      bar.style.cursor = "pointer";
      bar.style.transition = "width 0.9s cubic-bezier(0.4, 0, 0.2, 1), height 0.9s cubic-bezier(0.4, 0, 0.2, 1), left 0.9s cubic-bezier(0.4, 0, 0.2, 1), top 0.9s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.9s cubic-bezier(0.4, 0, 0.2, 1)";
      document.querySelector("#renderer").appendChild(bar);
      barDots.push(bar);

      // 记录起始和目标状态
      bar.style.transition = "none";
      void bar.offsetHeight;  // 强制reflow
      bar.style.transition = "width 0.9s cubic-bezier(0.4, 0, 0.2, 1), height 0.9s cubic-bezier(0.4, 0, 0.2, 1), left 0.9s cubic-bezier(0.4, 0, 0.2, 1), top 0.9s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.9s cubic-bezier(0.4, 0, 0.2, 1)";
      startStates.push({
        width: barWidth,
        height: barHeight,
        left: xPos,
        top: yPos,
        borderRadius: 0
      });
      endStates.push({
        width: r,
        height: r,
        left: margin.left + x - r / 2,
        top: margin.top + y - r / 2,
        borderRadius: r
      });
    });

    // 绑定交互
    data.forEach((country, i) => {
      let bar = barDots[i];
      bar.onmouseenter = () => {
        document.getElementById("axis-x").style.display = "";
        document.getElementById("axis-y").style.display = "";
        document.getElementById("axis-x-label").style.display = "";
        document.getElementById("axis-y-label").style.display = "";

        bar.classList.add("active");
        let rLabel = "";
        if (rField === "Vergleich") rLabel = `Ratio: ${country["Vergleich"]}%`;
        else if (rField === "Percent cannot afford") rLabel = `Unaffordability: ${country["Percent cannot afford"]}%`;
        else if (rField === "Unterernährung") rLabel = `Malnutrition: ${country["Unterernährung"]}%`;
        tooltip.innerText = `${country["Country Name"]}\nIncome: $${country["TagGNI"]}\nCost: $${country["Cost"]}\n${rLabel}`;
        tooltip.style.display = "block";
        tooltip.style.left = `${bar.getBoundingClientRect().right + 10}px`;
        tooltip.style.top = `${bar.getBoundingClientRect().top}px`;
      };
      bar.onmousemove = () => {
        tooltip.style.left = `${bar.getBoundingClientRect().right + 10}px`;
        tooltip.style.top = `${bar.getBoundingClientRect().top}px`;
      };
      bar.onmouseleave = () => {
        document.getElementById("axis-x").style.display = "none";
        document.getElementById("axis-y").style.display = "none";
        document.getElementById("axis-x-label").style.display = "none";
        document.getElementById("axis-y-label").style.display = "none";

        bar.classList.remove("active");
        tooltip.style.display = "none";
      };
    });

    // 强制reflow，确保动画生效
    void document.querySelector("#renderer").offsetHeight;

    // 设置目标状态，触发动画
    barDots.forEach((bar, i) => {
      const e = endStates[i];
      bar.style.width = `${e.width}px`;
      bar.style.height = `${e.height}px`;
      bar.style.left = `${e.left}px`;
      bar.style.top = `${e.top}px`;
      bar.style.borderRadius = `${e.borderRadius}px`;
    });

    // 标记已进入scatter
    barToScatterUltraSmoothTransition.hasEnteredScatter = true;
    return;
  }

  // 已在scatter页面，切换字段时仅变大小
  const existingDots = document.querySelectorAll(".bar-to-dot");

  // 重新绘制所有散点，带动画，仅变大小
  let dots = [];
  let prevRField = barToScatterUltraSmoothTransition.prevRField || rField;
  const prevMinR = Math.min(...data.map(d => parseFloat(d[prevRField])));
  const prevMaxR = Math.max(...data.map(d => parseFloat(d[prevRField])));
  data.forEach((country, i) => {
    const logMinX = Math.log10(minX);
    const logMaxX = Math.log10(maxX);
    const logMinY = Math.log10(minY);
    const logMaxY = Math.log10(maxY);

    const x = gmynd.map(Math.log10(parseFloat(country["TagGNI"])), logMinX, logMaxX, 0, chartWidth);
    const y = gmynd.map(Math.log10(parseFloat(country["Cost"])), logMinY, logMaxY, chartHeight, 0);

    // 上一次的半径
    const prevR = gmynd.map(parseFloat(country[prevRField]), prevMinR, prevMaxR, 20, 160);
    // 目标半径
    const r = gmynd.map(parseFloat(country[rField]), minR, maxR, 20, 160);

    let dot = document.createElement("div");
    dot.classList.add("bar", "bar-to-dot");
    dot.style.position = "absolute";
    dot.style.left = `${margin.left + x - prevR / 2}px`;
    dot.style.top = `${margin.top + y - prevR / 2}px`;
    dot.style.width = `${prevR}px`;
    dot.style.height = `${prevR}px`;
    dot.style.cursor = "pointer";
    dot.style.borderRadius = `50%`;
    dot.style.transition = "width 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1), left 0.6s cubic-bezier(0.4, 0, 0.2, 1), top 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    document.querySelector("#renderer").appendChild(dot);
    dots.push({ dot, x, y, prevR, r });
  });

  // 绑定交互
  data.forEach((country, i) => {
    let bar = dots[i].dot;
    bar.onmouseenter = () => {
      bar.style.opacity = "1";
      let rLabel = "";
      if (rField === "Vergleich") rLabel = `Ratio: ${country["Vergleich"]}%`;
      else if (rField === "Percent cannot afford") rLabel = `Unaffordability: ${country["Percent cannot afford"]}%`;
      else if (rField === "Unterernährung") rLabel = `Malnutrition: ${country["Unterernährung"]}%`;
      tooltip.innerText = `${country["Country Name"]}\nIncome: $${country["TagGNI"]}\nCost: $${country["Cost"]}\n${rLabel}`;
      tooltip.style.display = "block";
      tooltip.style.left = `${bar.getBoundingClientRect().right + 10}px`;
      tooltip.style.top = `${bar.getBoundingClientRect().top}px`;
    };
    bar.onmousemove = () => {
      tooltip.style.left = `${bar.getBoundingClientRect().right + 10}px`;
      tooltip.style.top = `${bar.getBoundingClientRect().top}px`;
    };
    bar.onmouseleave = () => {
      bar.style.opacity = "0.8";
      tooltip.style.display = "none";
    };
  });

  // 强制reflow
  void document.querySelector("#renderer").offsetHeight;

  // 更新目标尺寸
  dots.forEach(({ dot, x, y, r }) => {
    dot.style.width = `${r}px`;
    dot.style.height = `${r}px`;
    dot.style.left = `${margin.left + x - r / 2}px`;
    dot.style.top = `${margin.top + y - r / 2}px`;
  });

  // 记录字段
  if (barToScatterUltraSmoothTransition.prevRField !== rField) {
    barToScatterUltraSmoothTransition.prevRField = rField;
  }
}


// ----------- Overview Chart ----------- 
function drawOverviewChart() {
  document.querySelector("#renderer").innerHTML = "";
  let oldArea = document.getElementById("checkbox-area");
  if (oldArea) oldArea.remove();
    
  // left Button löschen
  let topArea = document.getElementById("top-area");
  if (topArea && topArea.children.length > 1) {
    topArea.removeChild(topArea.lastChild);
  }

  const chartWidth = stageWidth - margin.left - margin.right;
  const chartHeight = stageHeight - margin.top - margin.bottom;

  // Daten & Bereich
  const data = [...jsonData].sort((a, b) => parseFloat(b.TagGNI) - parseFloat(a.TagGNI));
  const minCost = Math.min(...data.map(d => parseFloat(d["Cost"])));
  const maxCost = Math.max(...data.map(d => parseFloat(d["Cost"])));
  const minIncome = Math.min(...data.map(d => parseFloat(d["TagGNI"])));
  const maxIncome = Math.max(...data.map(d => parseFloat(d["TagGNI"])));
  const minUnter = Math.min(...data.map(d => parseFloat(d["Unterernährung"])));
  const maxUnter = Math.max(...data.map(d => parseFloat(d["Unterernährung"])));

    const minCostArea = Math.PI * 50 * 50;
  const maxCostArea = Math.PI * 160 * 160;
  const minIncomeArea = Math.PI * 80 * 80;
  const maxIncomeArea = Math.PI * 200 * 200;
  const minUnterArea = Math.PI * 10 * 10;
  const maxUnterArea = Math.PI * 30 * 30;

  // Position
  const nodes = data.map((country, i) => {
    const cost = parseFloat(country.Cost);
    const income = parseFloat(country.TagGNI);
    const unter = parseFloat(country.Unterernährung);
    const ratio = parseFloat(country.Vergleich);
    
    // original radius calculation
    let rCost = Math.sqrt(gmynd.map(cost, minCost, maxCost, minCostArea, maxCostArea) / Math.PI);
    let rIncome = Math.sqrt(gmynd.map(income, minIncome, maxIncome, minIncomeArea, maxIncomeArea) / Math.PI);
    let rUnter = Math.sqrt(gmynd.map(unter, minUnter, maxUnter, minUnterArea, maxUnterArea) / Math.PI);

    // garantieren, dass der Bodenkreis größer ist
    if (ratio > 50 && rCost <= rIncome) {
      [rCost, rIncome] = [Math.max(rCost, rIncome + 8), Math.min(rCost - 8, rIncome)];
    } else if (ratio < 50 && rIncome <= rCost) {
      [rIncome, rCost] = [Math.max(rIncome, rCost + 8), Math.min(rIncome - 8, rCost)];

    } // 8 kann verändert werden, um den Abstand zu erhöhen

    // X Y Achse
    // const xBase = gmynd.map(income, minIncome, maxIncome, margin.left, margin.left + chartWidth);
    // const x = xBase + (Math.random() - 0.5) * 40; //40 kann verandert werden, um die Streuung zu erhöhen
    // const y = margin.top + Math.random() * chartHeight;

    // //log
    const logMinIncome = Math.log10(minIncome);
    const logMaxIncome = Math.log10(maxIncome);
    const xBase = gmynd.map(Math.log10(income), logMinIncome, logMaxIncome, margin.left, margin.left + chartWidth);
    const x = xBase + (Math.random() - 0.5) * 40; 
    const y = margin.top + Math.random() * chartHeight;

    return {
      country,
      // rCost: gmynd.map(cost, minCost, maxCost, 50, 160),
      // rIncome: gmynd.map(income, minIncome, maxIncome, 80, 200),
      // rUnter: gmynd.map(unter, minUnter, maxUnter, 10, 30),
      
      // rCost: Math.sqrt(gmynd.map(cost, minCost, maxCost, minCostArea, maxCostArea) / Math.PI),
      // rIncome: Math.sqrt(gmynd.map(income, minIncome, maxIncome, minIncomeArea, maxIncomeArea) / Math.PI),
      // rUnter: Math.sqrt(gmynd.map(unter, minUnter, maxUnter, minUnterArea, maxUnterArea) / Math.PI),
      rCost,
      rIncome,
      rUnter,
      x,
      y
      
      //falls random:
      //x: margin.left + Math.random() * chartWidth,
      //y: margin.top + Math.random() * chartHeight
    };
  });

  // Vermeidung von Überlappungen durch Kraftfeldsimulation
  function simulate(nodes, iterations = 300) {
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        let n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          let n2 = nodes[j];
          let dx = n2.x - n1.x;
          let dy = n2.y - n1.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          let minDist = (n1.rCost + n2.rCost) / 2 + 8;
          if (dist < minDist && dist > 0) {
            let move = (minDist - dist) / 2;
            let mx = (dx / dist) * move;
            let my = (dy / dist) * move;
            n1.x -= mx;
            n1.y -= my;
            n2.x += mx;
            n2.y += my;
          }
        }
        // nicht aus dem Chartbereich heraus
        n1.x = Math.max(margin.left + n1.rCost / 2, Math.min(margin.left + chartWidth - n1.rCost / 2, n1.x));
        n1.y = Math.max(margin.top + n1.rCost / 2, Math.min(margin.top + chartHeight - n1.rCost / 2, n1.y));
      }
    }
  }
  simulate(nodes, 300);

  // tooltip
  let tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  document.body.appendChild(tooltip);

  // Kreise
  nodes.forEach(node => {
    const d = node.country;
    const ratio = parseFloat(d.Vergleich);

    // Group Container
    let group = document.createElement("div");
    group.style.position = "absolute";
    group.style.left = `${node.x}px`;
    group.style.top = `${node.y}px`;
    group.style.transform = "translate(-50%, -50%)";
    group.style.cursor = "pointer";
    group.style.width = `${node.rIncome * 1.1}px`;
    group.style.height = `${node.rIncome * 1.1}px`;

    if (ratio < 50) {
      // income > cost, zeichen income Kreis vor cost Kreis
      let incomeCircle = document.createElement("div");
      incomeCircle.className = "overview-circle-green";
      incomeCircle.style.width = incomeCircle.style.height = `${node.rIncome}px`;
      incomeCircle.style.left = incomeCircle.style.top = "50%";
      incomeCircle.style.transform = "translate(-50%, -50%)";
      group.appendChild(incomeCircle);

      let costCircle = document.createElement("div");
      costCircle.className = "overview-circle-white";
      costCircle.style.width = costCircle.style.height = `${node.rCost}px`;
      costCircle.style.left = costCircle.style.top = "50%";
      costCircle.style.transform = "translate(-50%, -50%)";
      group.appendChild(costCircle);
    } else {
      // income < cost, zeichen cost Kreis vor income Kreis
      let costCircle = document.createElement("div");
      costCircle.className = "overview-circle-pink";
      costCircle.style.width = costCircle.style.height = `${node.rCost}px`;
      costCircle.style.left = costCircle.style.top = "50%";
      costCircle.style.transform = "translate(-50%, -50%)";
      group.appendChild(costCircle);

      let incomeCircle = document.createElement("div");
      incomeCircle.style.width = incomeCircle.style.height = `${node.rIncome}px`;
      incomeCircle.className = "overview-circle-white";
      incomeCircle.style.left = incomeCircle.style.top = "50%";
      incomeCircle.style.transform = "translate(-50%, -50%)";
      group.appendChild(incomeCircle);
    }

    // Unterernährung
    let underCircle = document.createElement("div");
    underCircle.className = "overview-circle-unter";
    underCircle.style.width = underCircle.style.height = `${node.rUnter}px`;
    underCircle.style.left = underCircle.style.top = "50%";
    underCircle.style.transform = "translate(-50%, -50%)";
    group.appendChild(underCircle);

    // tooltip Interaktion
    group.addEventListener("mouseenter", (event) => {
      tooltip.innerHTML = `${d["Country Name"]}<br>Income (GNI): ${d.TagGNI}<br>Cost: ${d.Cost}<br>Undernourishment: ${d.Unterernährung}<br>Ratio: ${ratio.toFixed(1)}%`;
      tooltip.style.display = "block";
      tooltip.style.left = `${event.clientX + 15}px`;
      tooltip.style.top = `${event.clientY + 15}px`;
    });
    group.addEventListener("mousemove", (event) => {
      tooltip.style.left = `${event.clientX + 15}px`;
      tooltip.style.top = `${event.clientY + 15}px`;
    });
    group.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });

    document.querySelector("#renderer").appendChild(group);
  });
}