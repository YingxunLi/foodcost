let stageHeight;
let stageWidth;

// let currentPage = "bar"; 

const margin = { top: 120, right: 80, bottom: 100, left: 80 }; // 顶部加高

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

// 新增：顶部区域的选项
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

  // ----------- 新增顶部区域 -----------
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

  // 标题
  let title = document.createElement("button");
  title.textContent = "Healthy Diet Cost";

  title.style.marginLeft = "18px";

  title.style.fontSize = "20px";
    
  title.style.padding = "4px 0px";
  title.style.border = "none";
  title.style.background = "#FFFFFF";
  title.style.color = "#6B7C8D";
  title.style.fontWeight = "bold";

  title.style.cursor = "pointer";
  title.style.transition = "background 0.2s,color 0.2s";
  title.addEventListener("mouseenter", () => {
    title.style.color = "#6B7C8D";
    title.style.fontWeight = "bold";
  });
  title.addEventListener("mouseleave", () => {
    title.style.background = "#FFFFFF";
    title.style.color = "#E1E5E8";
  });
  title.addEventListener("click", () => {
    drawCountryCostChart();
    title.style.fontWeight = "bold";
    title.style.color = "#6B7C8D";
    affordabilityBtn.style.fontWeight = "normal";
    affordabilityBtn.style.color = "#E1E5E8";
  });

  // title.style.display = "flex";
  // title.style.alignItems = "center";

  // Affordability button
  let affordabilityBtn = document.createElement("button");
  affordabilityBtn.textContent = "Affordability";
  affordabilityBtn.style.marginLeft = "18px";
  affordabilityBtn.style.fontSize = "20px";
  affordabilityBtn.style.padding = "4px 16px";
  affordabilityBtn.style.border = "none";
  affordabilityBtn.style.background = "#FFFFFF";
  affordabilityBtn.style.color = "#E1E5E8";
  affordabilityBtn.style.cursor = "pointer";
  affordabilityBtn.style.transition = "background 0.2s,color 0.2s";
  affordabilityBtn.addEventListener("mouseenter", () => {
    affordabilityBtn.style.color = "#6B7C8D";
    affordabilityBtn.style.fontWeight = "bold";
  });
  affordabilityBtn.addEventListener("mouseleave", () => {
    affordabilityBtn.style.background = "#FFFFFF";
    affordabilityBtn.style.color = "#E1E5E8";
  });
  affordabilityBtn.addEventListener("click", () => {
    drawScatterChart();
    affordabilityBtn.style.fontWeight = "bold";
    affordabilityBtn.style.color = "#6B7C8D";
    title.style.color = "#E1E5E8";
    title.style.fontWeight = "normal";
  });
  let leftArea = document.createElement("div");
  leftArea.style.display = "flex";
  leftArea.style.alignItems = "center";
  leftArea.appendChild(title);
  leftArea.appendChild(affordabilityBtn);

topArea.appendChild(leftArea);

  // 右侧选项
  let topOptions = document.createElement("div");
  topOptions.style.display = "flex";
  topOptions.style.gap = "24px";
  topFields.forEach(f => {
    let btn = document.createElement("button");
    btn.textContent = f.label;
    btn.style.fontSize = "15px";
    btn.style.padding = "6px 18px";
    btn.style.border = "none";
    btn.style.borderRadius = "18px";
    btn.style.background = (f.key === currentTopField) ? "#EFC5D8" : "#E1E5E8";
    btn.style.color = (f.key === currentTopField) ? "#FFFFFF" : "#6B7C8D";
    btn.style.cursor = "pointer";
    btn.style.transition = "background 0.2s,color 0.2s";
    btn.addEventListener("mouseenter", () => {
      btn.style.background = "#6B7C8D";
      btn.style.color = "#fff";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = (f.key === currentTopField) ? "#EFC5D8" : "#E1E5E8";
      btn.style.color = (f.key === currentTopField) ? "#FFFFFF" : "#6B7C8D";
    });
    btn.addEventListener("click", () => {
      const prevField = currentField;
      currentTopField = f.key;
      currentField = f.key;
      // 重新渲染顶部按钮
      Array.from(topOptions.children).forEach((b, idx) => {
        b.style.background = (topFields[idx].key === currentTopField) ? "#EFC5D8" : "#E1E5E8";
        b.style.color = (topFields[idx].key === currentTopField) ? "#FFFFFF" : "#6B7C8D";
      });
      // 重新渲染下方bar
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

  // 先移除旧的top-area
  let oldTop = document.getElementById("top-area");
  if (oldTop) oldTop.remove();
  renderer.parentNode.appendChild(topArea);

  renderCheckboxArea();

  drawCountryCostChart();
}

function renderCheckboxArea() {
  // 先移除旧的区域（如果有）
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
        const prevField = currentField;
        currentField = e.target.value;
        // 如果切换到Cost/Income/Ratio，顶部按钮也联动
        if (["Cost", "TagGNI", "Vergleich"].includes(currentField)) {
          currentTopField = currentField;
          // 重新渲染顶部按钮
          Array.from(document.querySelector("#top-area").lastChild.children).forEach((b, idx) => {
            b.style.background = (topFields[idx].key === currentTopField) ? "#EFC5D8" : "#E1E5E8";
            b.style.color = (topFields[idx].key === currentTopField) ? "#FFFFFF" : "#6B7C8D";
          });
        }
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
  document.querySelector("#renderer").innerHTML = "";

  // 每次渲染条形图时都重新生成底部复选框
  renderCheckboxArea();

  // 锁定复选框逻辑
  const isLockMode = (currentField === "TagGNI" || currentField === "Vergleich");
  document.querySelectorAll('.barfield-label').forEach(label => {
    const input = label.querySelector('input.barfield-input');
    const isCost = input.value === "Cost";
    if (isLockMode) {
      input.disabled = true;
      if (isCost) {
        label.style.color = "#EFC5D8";
        // 保持选中
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
  let maxVergleich = Math.max(...data.map(d => parseFloat(d["Vergleich"]))); // 新增

  const bars = [];

  // cost->income时，cost bar高度过渡
  if (transitionMode === "costToIncome") {
    // 先渲染 cost 柱（以 cost 最大值映射）
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

    // 强制 reflow
    void document.querySelector("#renderer").offsetHeight;

    // 过渡到 income 映射下的 cost 柱高度
    data.forEach((country, i) => {
      const cost = parseFloat(country["Cost"]);
      const barHeight = gmynd.map(cost, 0, maxIncome, 0, chartHeight);
      const yPos = margin.top + (chartHeight - barHeight);
      const bar = bars[i];
      bar.style.height = `${barHeight}px`;
      bar.style.top = `${yPos}px`;
    });

    // 过渡结束后渲染 income+cost 双柱
    setTimeout(() => {
      drawCountryCostChart();
    }, 500);

    return;
  }

  // cost->ratio时，cost bar高度过渡
  if (transitionMode === "costToRatio") {
    // 先渲染 cost 柱（以 cost 最大值映射）
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
      bar.style.backgroundColor = "#EFC5D8";
      bar.style.transition = "height 0.5s, top 0.5s";
      document.querySelector("#renderer").appendChild(bar);
      bars.push(bar);
    });

    // 强制 reflow
    void document.querySelector("#renderer").offsetHeight;

    // 过渡到 ratio 映射下的 cost 柱高度
    data.forEach((country, i) => {
      const vergleich = parseFloat(country["Vergleich"]);
      const barHeight = gmynd.map(vergleich, 0, maxVergleich, 0, chartHeight);
      const yPos = margin.top + (chartHeight - barHeight);
      const bar = bars[i];
      bar.style.height = `${barHeight}px`;
      bar.style.top = `${yPos}px`;
    });

    // 过渡结束后渲染 ratio 柱
    setTimeout(() => {
      drawCountryCostChart();
    }, 500);

    return;
  }

  // income->ratio时，income bar过渡到ratio灰色100bar，cost bar过渡到ratio粉色bar
  if (transitionMode === "incomeToRatio") {
    // 先渲染 income 页面：income bar（灰色）和 cost bar（粉色），高度都以 income 最大值映射
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
      barBg.style.backgroundColor = "#E1E5E8";
      barBg.style.position = "absolute";
      barBg.style.transition = "height 0.5s, top 0.5s";
      document.querySelector("#renderer").appendChild(barBg);
      bars.push(barBg);

      // cost bar（粉色，目标是 ratio 的 vergleich bar）
      let pinkBar = document.createElement("div");
      pinkBar.classList.add("bar", "ratio-fg");
      pinkBar.style.width = `${barWidth}px`;
      pinkBar.style.height = `${barHeightCost}px`;
      pinkBar.style.left = `${xPos}px`;
      pinkBar.style.top = `${margin.top + (chartHeight - barHeightCost)}px`;
      pinkBar.style.backgroundColor = "#EFC5D8";
      pinkBar.style.position = "absolute";
      pinkBar.style.transition = "height 0.5s, top 0.5s";
      document.querySelector("#renderer").appendChild(pinkBar);
      bars.push(pinkBar);
    });

    // 强制 reflow
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

    // 过渡结束后渲染 ratio 页面（含灰底和粉色bar）
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
      barBg.style.backgroundColor = "#E1E5E8";
      barBg.style.position = "absolute";
      barBg.style.transition = "height 0.5s, top 0.5s";
      document.querySelector("#renderer").appendChild(barBg);
      bars.push(barBg);

      // 粉色bar
      let pinkBar = document.createElement("div");
      pinkBar.classList.add("bar", "ratio-fg");
      pinkBar.style.width = `${barWidth}px`;
      pinkBar.style.height = `${barHeightPink}px`;
      pinkBar.style.left = `${xPos}px`;
      pinkBar.style.top = `${margin.top + (chartHeight - barHeightPink)}px`;
      pinkBar.style.backgroundColor = "#EFC5D8";
      pinkBar.style.position = "absolute";
      pinkBar.style.transition = "height 0.5s, top 0.5s";
      document.querySelector("#renderer").appendChild(pinkBar);
      bars.push(pinkBar);
    });

    // 强制 reflow
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
      // income柱
      let barIncome = document.createElement("div");
      barIncome.classList.add("bar", "income");
      barIncome.style.width = `${barWidth}px`;
      barIncome.style.height = `${gmynd.map(income, 0, maxIncome, 0, chartHeight)}px`;
      barIncome.style.left = `${xPos}px`;
      barIncome.style.top = `${margin.top + (chartHeight - gmynd.map(income, 0, maxIncome, 0, chartHeight))}px`;

      // cost柱（以 income 最大值映射）
      let barCost = document.createElement("div");
      barCost.classList.add("bar", "cost");
      barCost.style.width = `${barWidth}px`;
      barCost.style.height = `${gmynd.map(cost, 0, maxIncome, 0, chartHeight)}px`;
      barCost.style.left = `${xPos}px`;
      barCost.style.top = `${margin.top + (chartHeight - gmynd.map(cost, 0, maxIncome, 0, chartHeight))}px`;

      barIncome.style.zIndex = "1";
      barCost.style.zIndex = "2";

      // 交互：income
      barIncome.addEventListener('mouseenter', () => {
        tooltip.innerText = `${country["Country Name"]}: Income $${income.toFixed(2)}`;
        tooltip.style.display = "block";
        const barRect = barIncome.getBoundingClientRect();
        tooltip.style.left = `${barRect.right + 10}px`;
        tooltip.style.top = `${barRect.top}px`;
        bars.forEach(b => b.classList.remove('active', 'faded'));
        barIncome.classList.add('active');
        barIncome.style.backgroundColor = barIncome.dataset.activeColor;
        barCost.style.backgroundColor = barCost.dataset.baseColor;
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
        barCost.style.backgroundColor = barCost.dataset.baseColor;
      });

      // 交互：cost
      barCost.addEventListener('mouseenter', () => {
        tooltip.innerText = `${country["Country Name"]}: Cost $${cost}`;
        tooltip.style.display = "block";
        const barRect = barCost.getBoundingClientRect();
        tooltip.style.left = `${barRect.right + 10}px`;
        tooltip.style.top = `${barRect.top}px`;
        bars.forEach(b => b.classList.remove('active', 'faded'));
        barCost.classList.add('active');
        barCost.style.backgroundColor = barCost.dataset.activeColor;
        barIncome.style.backgroundColor = barIncome.dataset.baseColor;
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
        barIncome.style.backgroundColor = barIncome.dataset.baseColor;
      });

      document.querySelector("#renderer").appendChild(barIncome);
      document.querySelector("#renderer").appendChild(barCost);
      bars.push(barIncome, barCost);
    } else if (["Cost", "Vergleich"].includes(currentField)) {
      // Ratio页面：先画灰色底bar（100%），再画粉色bar（实际比例）
      if (currentField === "Vergleich") {
        // 灰色底bar（100%）
        let barBg = document.createElement("div");
        barBg.classList.add("bar", "ratio-bg");
        barBg.style.width = `${barWidth}px`;
        barBg.style.height = `${gmynd.map(100, 0, maxVergleich, 0, chartHeight)}px`;
        barBg.style.left = `${xPos}px`;
        barBg.style.top = `${margin.top + (chartHeight - gmynd.map(100, 0, maxVergleich, 0, chartHeight))}px`;
        barBg.style.backgroundColor = "#E1E5E8";
        barBg.style.position = "absolute";
        document.querySelector("#renderer").appendChild(barBg);
      }

      // 粉色bar
      let bar = document.createElement("div");
      bar.classList.add("bar");
      bar.style.width = `${barWidth}px`;
      bar.style.height = `${barHeight}px`;
      bar.style.left = `${xPos}px`;
      bar.style.top = `${yPos}px`;
      // 颜色统一为粉色
      bar.style.backgroundColor = "#EFC5D8";
      bar.dataset.baseColor = "#EFC5D8";
      bar.dataset.activeColor = "#FD96B3";
      bar.dataset.fadedColor = "#EFC5D8";
      bar.style.position = "absolute";

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
      // 其余字段用原有方块阵列
      let barDot = document.createElement("div");
      barDot.classList.add("bar-dot");
      barDot.style.width = `${barWidth}px`;
      barDot.style.height = `${chartHeight}px`;
      barDot.style.left = `${xPos}px`;
      barDot.style.top = `${margin.top}px`;
      barDot.style.position = "absolute";

      const squareSize = Math.max(8, Math.floor(barWidth * 0.8));
      const gapSize = 3;
      const maxSquares = Math.floor(chartHeight / (squareSize + gapSize));
      const numSquares = Math.max(1, Math.round(barHeight / chartHeight * maxSquares));

      const squares = [];
      for (let j = 0; j < numSquares; j++) {
        let sq = document.createElement("div");
        sq.classList.add("bar-dot-square");
        sq.style.backgroundColor = "#80C9BD";
        squares.push(sq);
        barDot.appendChild(sq);
      }

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

      document.querySelector("#renderer").appendChild(barDot);
      bars.push(barDot);
    }
  });
}

// 在文件末尾添加散点图渲染函数
function drawScatterChart() {
  document.querySelector("#renderer").innerHTML = "";
  let oldArea = document.getElementById("checkbox-area");
  if (oldArea) oldArea.remove();
  // 画布尺寸
  const data = [...jsonData];
  const chartWidth = stageWidth - margin.left - margin.right;
  const chartHeight = stageHeight - margin.top - margin.bottom;

  // 计算横纵轴范围
  const minX = Math.min(...data.map(d => parseFloat(d["TagGNI"])));
  const maxX = Math.max(...data.map(d => parseFloat(d["TagGNI"])));
  const minY = Math.min(...data.map(d => parseFloat(d["Cost"])));
  const maxY = Math.max(...data.map(d => parseFloat(d["Cost"])));
  const minR = Math.min(...data.map(d => parseFloat(d["Vergleich"])));
  const maxR = Math.max(...data.map(d => parseFloat(d["Vergleich"])));

  // 画坐标轴
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

  // 横轴标签
  let xlabel = document.createElement("div");
  xlabel.textContent = "Income (TagGNI)";
  xlabel.style.position = "absolute";
  xlabel.style.left = `${margin.left + chartWidth / 2 - 40}px`;
  xlabel.style.top = `${margin.top + chartHeight + 30}px`;
  xlabel.style.color = "#6B7C8D";
  xlabel.style.fontSize = "14px";
  document.querySelector("#renderer").appendChild(xlabel);

  // 纵轴标签
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

  // 画点
  data.forEach(d => {
    const x = gmynd.map(parseFloat(d["TagGNI"]), minX, maxX, 0, chartWidth);
    const y = gmynd.map(parseFloat(d["Cost"]), minY, maxY, chartHeight, 0);
    const r = gmynd.map(parseFloat(d["Vergleich"]), minR, maxR, 10, 32);

    let dot = document.createElement("div");
    dot.style.position = "absolute";
    dot.style.left = `${margin.left + x - r / 2}px`;
    dot.style.top = `${margin.top + y - r / 2}px`;
    dot.style.width = `${r}px`;
    dot.style.height = `${r}px`;
    dot.style.borderRadius = "50%";
    dot.style.background = "#EFC5D8";
    dot.style.opacity = "0.8";
    dot.style.boxShadow = "0 2px 8px #eee";
    dot.style.cursor = "pointer";
    dot.style.transition = "box-shadow 0.2s, opacity 0.2s";

    dot.addEventListener("mouseenter", () => {
      dot.style.opacity = "1";
      dot.style.boxShadow = "0 4px 16px #EFC5D8";
      tooltip.innerText = `${d["Country Name"]}\nIncome: $${d["TagGNI"]}\nCost: $${d["Cost"]}\nRatio: ${d["Vergleich"]}%`;
      tooltip.style.display = "block";
      tooltip.style.left = `${dot.getBoundingClientRect().right + 10}px`;
      tooltip.style.top = `${dot.getBoundingClientRect().top}px`;
    });
    dot.addEventListener("mousemove", () => {
      tooltip.style.left = `${dot.getBoundingClientRect().right + 10}px`;
      tooltip.style.top = `${dot.getBoundingClientRect().top}px`;
    });
    dot.addEventListener("mouseleave", () => {
      dot.style.opacity = "0.8";
      dot.style.boxShadow = "0 2px 8px #eee";
      tooltip.style.display = "none";
    });

    document.querySelector("#renderer").appendChild(dot);
  });
}