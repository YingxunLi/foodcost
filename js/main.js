let stageHeight;
let stageWidth;
const margin = { top: 120, right: 80, bottom: 100, left: 80 }; // Oberer Rand erhöht

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

  // ----------- Neuer oberer Bereich -----------
  let topArea = document.createElement("div");
  topArea.id = "top-area";
  topArea.style.position = "absolute";
  topArea.style.left = `${margin.left}px`;
  topArea.style.top = `30px`;
  topArea.style.width = `${stageWidth - margin.left - margin.right}px`;
  topArea.style.height = "60px";
  topArea.style.display = "flex";
  topArea.style.justifyContent = "space-between";
  topArea.style.alignItems = "center";
  topArea.style.zIndex = "20";
  topArea.style.pointerEvents = "auto";

  // Titel
  let title = document.createElement("button");
  title.textContent = "Healthy Diet Cost";
  title.classList.add("top-btn", "main", "active");

  title.addEventListener("mouseenter", () => {
    title.classList.add("active");
    title.classList.remove("inactive");
  });
  title.addEventListener("mouseleave", () => {
    if (!title.classList.contains("active")) {
      title.classList.remove("inactive");
    }
  });
  title.addEventListener("click", () => {
    drawCountryCostChart();
    title.classList.add("active");
    title.classList.remove("inactive");
    affordabilityBtn.classList.remove("active");
    affordabilityBtn.classList.add("inactive");
  }); 

  // Affordability-Button
  let affordabilityBtn = document.createElement("button");
  affordabilityBtn.textContent = "Affordability";
  affordabilityBtn.classList.add("top-btn", "main", "affordability", "inactive");
  affordabilityBtn.addEventListener("mouseenter", () => {
    affordabilityBtn.classList.add("active");
    affordabilityBtn.classList.remove("inactive");
  });
  affordabilityBtn.addEventListener("mouseleave", () => {
    affordabilityBtn.classList.add("inactive");
    if (!affordabilityBtn.classList.contains("active")) {
      affordabilityBtn.classList.add("inactive");
    }
  });
  affordabilityBtn.addEventListener("click", () => {
    barToScatterUltraSmoothTransition();
    affordabilityBtn.classList.add("active");
    affordabilityBtn.classList.remove("inactive");
    title.classList.remove("active");
    title.classList.add("inactive");
  });

  let leftArea = document.createElement("div");
  leftArea.style.display = "flex";
  leftArea.style.alignItems = "center";
  leftArea.appendChild(title);
  leftArea.appendChild(affordabilityBtn);

  topArea.appendChild(leftArea);

  // Rechte Optionen
  let topOptions = document.createElement("div");
  topOptions.style.display = "flex";
  topOptions.style.gap = "24px";
  topFields.forEach(f => {
    let btn = document.createElement("button");
    btn.textContent = f.label;
    btn.classList.add("top-btn");
    if (f.key === currentTopField) {
      btn.classList.add("active");
    }
    btn.addEventListener("mouseenter", () => {
      btn.classList.add("active");
    });
    btn.addEventListener("mouseleave", () => {
      if (topFields.find(tf => tf.key === currentTopField).label !== btn.textContent) {
        btn.classList.remove("active");
      }
    });
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

function renderCheckboxArea() {
  // Vorherigen Bereich entfernen (falls vorhanden)
  let oldArea = document.getElementById("checkbox-area");
  if (oldArea) oldArea.remove();

  const chartWidth = stageWidth - margin.left - margin.right;
  let checkboxArea = document.createElement("div");
  checkboxArea.id = "checkbox-area";
  checkboxArea.style.position = "absolute";
  checkboxArea.style.left = `${margin.left}px`;
  checkboxArea.style.top = `${stageHeight - margin.bottom + 20}px`;
  checkboxArea.style.width = `${chartWidth}px`;
  checkboxArea.style.zIndex = "10";
  checkboxArea.style.display = "flex";
  checkboxArea.style.justifyContent = "space-between";

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
        // 只高亮当前 bar，不影响其他 bar
        barIncome.classList.add('active');
        barIncome.style.backgroundColor = barIncome.dataset.activeColor;
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

function barToScatterUltraSmoothTransition() {
  let topOptions = document.querySelector("#top-area > div:last-child");
  if (topOptions) topOptions.style.display = "none";

  document.querySelector("#renderer").innerHTML = "";
  let oldArea = document.getElementById("checkbox-area");
  if (oldArea) oldArea.remove();

  // ----------- 新增：右上角切换按钮 -----------
  const scatterFields = [
    { key: "Vergleich", label: "Ratio" },
    { key: "Percent cannot afford", label: "Unaffordability" },
    { key: "Unterernährung", label: "Malnutrition" }
  ];
  // 保持切换状态
  if (!barToScatterUltraSmoothTransition.currentScatterField) {
    barToScatterUltraSmoothTransition.currentScatterField = "Vergleich";
  }
  let currentScatterField = barToScatterUltraSmoothTransition.currentScatterField;

  // 标记是否已进入scatter页面
  if (typeof barToScatterUltraSmoothTransition.hasEnteredScatter === "undefined") {
    barToScatterUltraSmoothTransition.hasEnteredScatter = false;
  }

  // 按钮区域
  let scatterTop = document.createElement("div");
  scatterTop.style.display = "flex";
  scatterTop.style.gap = "18px";
  scatterTop.style.zIndex = "30";
  scatterTop.id = "scatter-top-btns";

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
      barToScatterUltraSmoothTransition.currentScatterField = f.key;
      // 刷新按钮激活状态
      Array.from(scatterTop.children).forEach((b, idx) => {
        if (scatterFields[idx].key === f.key) {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      });
      // 仅切换散点大小，不再执行bar到dot动画
      barToScatterUltraSmoothTransition.hasEnteredScatter = true;
      barToScatterUltraSmoothTransition();
    });
    scatterTop.appendChild(btn);
  });
  // 先移除旧的
  let oldScatterTop = document.getElementById("scatter-top-btns");
  if (oldScatterTop) oldScatterTop.remove();
  document.querySelector("#top-area").appendChild(scatterTop);

  const data = [...jsonData].sort((a, b) => parseFloat(b.TagGNI) - parseFloat(a.TagGNI));
  const chartWidth = stageWidth - margin.left - margin.right;
  const chartHeight = stageHeight - margin.top - margin.bottom;
  const gap = 6;
  const barWidth = (chartWidth - gap * (data.length - 1)) / data.length;

  const minX = Math.min(...data.map(d => parseFloat(d["TagGNI"])));
  const maxX = Math.max(...data.map(d => parseFloat(d["TagGNI"])));
  const minY = Math.min(...data.map(d => parseFloat(d["Cost"])));
  const maxY = Math.max(...data.map(d => parseFloat(d["Cost"])));

  // 新增：根据当前按钮选择的字段决定散点大小
  const rField = barToScatterUltraSmoothTransition.currentScatterField || "Vergleich";
  const minR = Math.min(...data.map(d => parseFloat(d[rField])));
  const maxR = Math.max(...data.map(d => parseFloat(d[rField])));

  // Achsen zeichnen
  let axisX = document.createElement("div");
  axisX.style.position = "absolute";
  axisX.style.left = `${margin.left}px`;
  axisX.style.top = `${margin.top + chartHeight}px`;
  axisX.style.width = `${chartWidth}px`;
  axisX.style.height = "1px";
  axisX.style.background = "#bbb";
  document.querySelector("#renderer").appendChild(axisX);

  let axisY = document.createElement("div");
  axisY.style.position = "absolute";
  axisY.style.left = `${margin.left}px`;
  axisY.style.top = `${margin.top}px`;
  axisY.style.width = "1px";
  axisY.style.height = `${chartHeight}px`;
  axisY.style.background = "#bbb";
  document.querySelector("#renderer").appendChild(axisY);

  // X-Achsen-Beschriftung
  let xlabel = document.createElement("div");
  xlabel.textContent = "Income (TagGNI)";
  xlabel.style.position = "absolute";
  xlabel.style.left = `${margin.left + chartWidth / 2 - 40}px`;
  xlabel.style.top = `${margin.top + chartHeight + 30}px`;
  xlabel.style.color = "#6B7C8D";
  xlabel.style.fontSize = "14px";
  document.querySelector("#renderer").appendChild(xlabel);

  // Y-Achsen-Beschriftung
  let ylabel = document.createElement("div");
  ylabel.textContent = "Cost";
  ylabel.style.position = "absolute";
  ylabel.style.left = `${margin.left - 50}px`;
  ylabel.style.top = `${margin.top + chartHeight / 2 - 30}px`;
  ylabel.style.transform = "rotate(-90deg)";
  ylabel.style.transformOrigin = "left top";
  ylabel.style.color = "#6B7C8D";
  ylabel.style.fontSize = "14px";
  document.querySelector("#renderer").appendChild(ylabel);

  // tooltip
  let tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  document.body.appendChild(tooltip);

  // 只在第一次 bar->scatter 时执行动画，后续切换仅变大小
  if (!barToScatterUltraSmoothTransition.hasEnteredScatter) {
    // Zuerst Balken zeichnen
    let barDots = [];
    let startStates = [];
    let endStates = [];
    data.forEach((country, i) => {
      const cost = parseFloat(country["Cost"]);
      const barHeight = gmynd.map(cost, 0, Math.max(...data.map(d => parseFloat(d["Cost"]))), 0, chartHeight);
      const xPos = margin.left + i * (barWidth + gap);
      const yPos = margin.top + (chartHeight - barHeight);

      // 目标
      const logMinX = Math.log10(minX);
      const logMaxX = Math.log10(maxX);
      const logMinY = Math.log10(minY);
      const logMaxY = Math.log10(maxY);

      const x = gmynd.map(Math.log10(parseFloat(country["TagGNI"])), logMinX, logMaxX, 0, chartWidth);
      const y = gmynd.map(Math.log10(parseFloat(country["Cost"])), logMinY, logMaxY, chartHeight, 0);
      // 新增：r 根据当前字段
      const r = gmynd.map(parseFloat(country[rField]), minR, maxR, 20, 160);

      let bar = document.createElement("div");
      bar.classList.add("bar", "bar-to-dot");
      // 不再设置 backgroundColor、opacity、borderRadius，全部交由CSS
      bar.style.width = `${barWidth}px`;
      bar.style.height = `${barHeight}px`;
      bar.style.left = `${xPos}px`;
      bar.style.top = `${yPos}px`;
      bar.style.position = "absolute";
      bar.style.cursor = "pointer";
      document.querySelector("#renderer").appendChild(bar);
      barDots.push(bar);

      startStates.push({
        width: barWidth,
        height: barHeight,
        left: xPos,
        top: yPos,
        borderRadius: 8
      });
      endStates.push({
        width: r,
        height: r,
        left: margin.left + x - r / 2,
        top: margin.top + y - r / 2,
        borderRadius: r / 2
      });
    });

    // 绑定交互，动画过程中也能响应
    data.forEach((country, i) => {
      let bar = barDots[i];
      bar.onmouseenter = () => {
        bar.style.opacity = "1";
        // tooltip内容根据当前字段显示
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
        bar.style.opacity = "0.2";
        tooltip.style.display = "none";
      };
    });

    // 动画插值
    let duration = 900; // ms
    let startTime = null;
    function animate(now) {
      if (!startTime) startTime = now;
      let t = Math.min(1, (now - startTime) / duration);
      // easeInOutCubic
      t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      for (let i = 0; i < barDots.length; i++) {
        let s = startStates[i], e = endStates[i], bar = barDots[i];
        bar.style.width = (s.width + (e.width - s.width) * t) + "px";
        bar.style.height = (s.height + (e.height - s.height) * t) + "px";
        bar.style.left = (s.left + (e.left - s.left) * t) + "px";
        bar.style.top = (s.top + (e.top - s.top) * t) + "px";
        bar.style.borderRadius = (s.borderRadius + (e.borderRadius - s.borderRadius) * t) + "px";
      }
      if (t < 1) {
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);

    // 标记已进入scatter
    barToScatterUltraSmoothTransition.hasEnteredScatter = true;
    return;
  }

  // 已在scatter页面，切换字段时仅变大小
  // 先移除旧的散点
  document.querySelectorAll(".bar-to-dot").forEach(el => el.remove());

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
    // 不再设置 backgroundColor、opacity、borderRadius，全部交由CSS
    dot.style.position = "absolute";
    dot.style.left = `${margin.left + x - prevR / 2}px`;
    dot.style.top = `${margin.top + y - prevR / 2}px`;
    dot.style.width = `${prevR}px`;
    dot.style.height = `${prevR}px`;
    dot.style.cursor = "pointer";
    document.querySelector("#renderer").appendChild(dot);
    dots.push({dot, x, y, prevR, r});
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

  // 动画插值，仅变大小
  let duration = 600;
  let startTime = null;
  function animateDotSize(now) {
    if (!startTime) startTime = now;
    let t = Math.min(1, (now - startTime) / duration);
    t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    for (let i = 0; i < dots.length; i++) {
      let {dot, x, y, prevR, r} = dots[i];
      let curR = prevR + (r - prevR) * t;
      dot.style.width = `${curR}px`;
      dot.style.height = `${curR}px`;
      dot.style.left = `${margin.left + x - curR / 2}px`;
      dot.style.top = `${margin.top + y - curR / 2}px`;
      dot.style.borderRadius = `${curR / 2}px`;
    }
    if (t < 1) {
      requestAnimationFrame(animateDotSize);
    }
  }
  requestAnimationFrame(animateDotSize);

  // 记录当前字段，供下次切换用
  barToScatterUltraSmoothTransition.prevRField = rField;
}