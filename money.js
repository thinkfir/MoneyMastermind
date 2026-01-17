// Money Mastermind Prototype (p5.js)
// Goal: Grow a small starting fund by trading locations and stocks over a short timeline.

let money = 500;
let day = 1;
let maxDays = 30;
let goal = 20000;

// Locations and their volatility multipliers
const locations = [
  { name: "Harbor", fee: 50, risk: 0.6 },
  { name: "Midtown", fee: 100, risk: 1.0 },
  { name: "Skyline", fee: 200, risk: 1.4 }
];
let currentLocation = 0;

// Mafia contraband list and per-location availability
const contrabandTypes = ["Bliss Dust", "Shadow Bloom", "Viper Venom", "Crimson Haze", "Iron Will Dust", "Ocean Echo"];
const mafiaLocations = [
  { name: "Harbor", contraband: ["Bliss Dust", "Viper Venom", "Ocean Echo"], travelCost: 50 },
  { name: "Midtown", contraband: ["Shadow Bloom", "Viper Venom", "Iron Will Dust"], travelCost: 100 },
  { name: "Skyline", contraband: ["Crimson Haze", "Shadow Bloom", "Ocean Echo"], travelCost: 200 }
];
let mafiaPrices = {};
let mafiaInventory = {};
let lastMafiaUpdate = 0;
const MAFIA_UPDATE_MS = 12000;

// Stock tickers and base prices
const tickers = [
  { symbol: "AQUA", base: 40 },
  { symbol: "NOVA", base: 60 },
  { symbol: "GRIT", base: 25 }
];
let prices = {};
let owned = {};

// UI state
let selectedStock = null;
let inputQty = "";

function setup() {
  const c = createCanvas(windowWidth, windowHeight);
  c.parent("game-root");
  textFont("Courier New");
  initPrices();
  initMafia();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function initPrices() {
  prices = {};
  tickers.forEach(t => {
    prices[t.symbol] = t.base * random(0.7, 1.3);
  });
}

function advanceDay() {
  day++;
  // Adjust prices based on location risk
  tickers.forEach(t => {
    const vol = locations[currentLocation].risk;
    const drift = random(-0.2, 0.25) * vol;
    let next = max(1, prices[t.symbol] * (1 + drift));
    prices[t.symbol] = next;
  });
  // Passive interest (small)
  money += money * 0.01;
  // Refresh mafia prices on day advance
  refreshMafiaPrices();
}

function buy(symbol, qty) {
  qty = int(qty);
  if (!qty || qty < 1) return;
  const cost = prices[symbol] * qty;
  if (money < cost) return;
  money -= cost;
  owned[symbol] = (owned[symbol] || 0) + qty;
}

function sell(symbol, qty) {
  qty = int(qty);
  if (!qty || qty < 1) return;
  if (!owned[symbol] || owned[symbol] < qty) return;
  const rev = prices[symbol] * qty;
  money += rev;
  owned[symbol] -= qty;
  if (owned[symbol] <= 0) delete owned[symbol];
}

function moveLocation(idx) {
  if (idx === currentLocation) return;
  const fee = mafiaLocations[idx].travelCost;
  if (money < fee) return;
  money -= fee;
  currentLocation = idx;
  refreshMafiaPrices();
}

function keyPressed() {
  if (!selectedStock) return;
  if (keyCode === BACKSPACE) {
    inputQty = inputQty.slice(0, -1);
  } else if (keyCode === ENTER) {
    buy(selectedStock, inputQty);
    inputQty = "";
  } else if (key >= '0' && key <= '9' && inputQty.length < 4) {
    inputQty += key;
  }
}

function mousePressed() {
  // Buttons
  const btnAdvance = buttonRect(width * 0.8, height * 0.08, width * 0.15, height * 0.06);
  if (over(btnAdvance)) {
    advanceDay();
    return;
  }

  // Location buttons
  for (let i = 0; i < locations.length; i++) {
    const r = buttonRect(width * 0.08, height * 0.2 + i * (height * 0.1), width * 0.18, height * 0.08);
    if (over(r)) {
      moveLocation(i);
      return;
    }
  }

  // Stock cards
  const startX = width * 0.3;
  const startY = height * 0.25;
  const cardW = width * 0.18;
  const cardH = height * 0.2;
  const gap = width * 0.025;
  for (let i = 0; i < tickers.length; i++) {
    const x = startX + i * (cardW + gap);
    const y = startY;
    const r = { x, y, w: cardW, h: cardH };
    if (over(r)) {
      selectedStock = tickers[i].symbol;
      inputQty = "";
      return;
    }
  }

  // Buy/Sell buttons
  if (selectedStock) {
    const buyBtn = buttonRect(width * 0.35, height * 0.6, width * 0.12, height * 0.06);
    const sellBtn = buttonRect(width * 0.53, height * 0.6, width * 0.12, height * 0.06);
    if (over(buyBtn)) {
      buy(selectedStock, inputQty || 1);
      inputQty = "";
      return;
    }
    if (over(sellBtn)) {
      sell(selectedStock, inputQty || 1);
      inputQty = "";
      return;
    }
  }
}

function draw() {
  background(16, 18, 24);
  drawHeader();
  drawMafia();
  drawStocks();
  drawSelectedPanel();
  drawGoal();
  if (millis() - lastMafiaUpdate > MAFIA_UPDATE_MS) {
    refreshMafiaPrices();
    lastMafiaUpdate = millis();
  }
}

function drawHeader() {
  fill(232, 238, 247);
  textSize(width * 0.03);
  textAlign(LEFT, TOP);
  text("Money Mastermind", width * 0.04, height * 0.04);

  textSize(width * 0.016);
  text(`Day ${day}/${maxDays}`, width * 0.04, height * 0.08);
  text(`Cash: $${money.toFixed(0)}`, width * 0.04, height * 0.11);
  text(`Location: ${mafiaLocations[currentLocation].name}`, width * 0.04, height * 0.14);

  const btnAdvance = buttonRect(width * 0.8, height * 0.08, width * 0.15, height * 0.06);
  drawButton(btnAdvance, "Next Day");
}

function drawLocations() {
  textSize(width * 0.018);
  textAlign(LEFT, CENTER);
  for (let i = 0; i < mafiaLocations.length; i++) {
    const r = buttonRect(width * 0.08, height * 0.2 + i * (height * 0.1), width * 0.18, height * 0.08);
    const active = i === currentLocation;
    drawButton(r, `${mafiaLocations[i].name} ($${mafiaLocations[i].travelCost})`, active);
  }
}

function drawStocks() {
  const startX = width * 0.32;
  const startY = height * 0.52;
  const cardW = width * 0.16;
  const cardH = height * 0.18;
  const gap = width * 0.02;

  textAlign(CENTER, CENTER);
  for (let i = 0; i < tickers.length; i++) {
    const x = startX + i * (cardW + gap);
    const y = startY;
    const r = { x, y, w: cardW, h: cardH };
    const sym = tickers[i].symbol;
    const price = prices[sym];
    const qty = owned[sym] || 0;
    const active = sym === selectedStock;
    drawCard(r, sym, price, qty, active);
  }
}

function drawSelectedPanel() {
  const panel = { x: width * 0.05, y: height * 0.42, w: width * 0.22, h: height * 0.5 };
  fill(30, 36, 46);
  stroke(90, 110, 130);
  strokeWeight(2);
  rect(panel.x, panel.y, panel.w, panel.h, 10);
  noStroke();

  textAlign(LEFT, TOP);
  fill(228);
  textSize(width * 0.018);
  text("Mafia Trades", panel.x + 16, panel.y + 14);

  const tableY = panel.y + height * 0.07;
  const rowH = height * 0.06;
  const con = mafiaLocations[currentLocation].contraband;
  for (let i = 0; i < con.length; i++) {
    const item = con[i];
    const y = tableY + i * rowH;
    fill(240);
    textSize(width * 0.014);
    text(item, panel.x + 16, y);
    text(`$${(mafiaPrices[item] || 0).toFixed(2)}`, panel.x + panel.w * 0.55, y);
    text(`Owned: ${mafiaInventory[item] || 0}`, panel.x + panel.w * 0.55, y + rowH * 0.45);

    const buyBtn = buttonRect(panel.x + panel.w * 0.05, y + rowH * 0.45, panel.w * 0.32, rowH * 0.35);
    const sellBtn = buttonRect(panel.x + panel.w * 0.4, y + rowH * 0.45, panel.w * 0.32, rowH * 0.35);
    if (over(buyBtn)) {
      handleMafiaTrade(item, 1);
    }
    if (over(sellBtn)) {
      handleMafiaTrade(item, -1);
    }
    drawButton(buyBtn, "Buy", true);
    drawButton(sellBtn, "Sell", false);
  }
}

function drawGoal() {
  const barX = width * 0.3;
  const barY = height * 0.78;
  const barW = width * 0.5;
  const barH = height * 0.03;
  fill(38, 42, 48);
  rect(barX, barY, barW, barH, barH / 2);
  const progress = constrain((money - 500) / (goal - 500), 0, 1);
  fill(70, 170, 70);
  rect(barX, barY, barW * progress, barH, barH / 2);
  fill(240);
  textAlign(CENTER, CENTER);
  textSize(width * 0.015);
  text(`Goal: $${money.toFixed(0)} / $${goal}`, barX + barW / 2, barY + barH / 2);
}

function drawButton(rectObj, label, active = false) {
  const { x, y, w, h } = rectObj;
  const hovered = over(rectObj);
  const base = active ? color(60, 130, 80) : color(60, 70, 85);
  const hover = active ? color(70, 150, 95) : color(75, 85, 100);
  fill(hovered ? hover : base);
  noStroke();
  rect(x, y, w, h, h / 2);
  fill(245);
  textAlign(CENTER, CENTER);
  textSize(min(w, h) * 0.35);
  text(label, x + w / 2, y + h / 2);
}

function drawCard(rectObj, sym, price, qty, active) {
  const { x, y, w, h } = rectObj;
  const hovered = over(rectObj);
  const base = active ? color(60, 110, 160) : color(44, 50, 60);
  const hover = active ? color(70, 130, 180) : color(58, 64, 74);
  fill(hovered ? hover : base);
  noStroke();
  rect(x, y, w, h, 12);
  fill(242);
  textSize(w * 0.16);
  textAlign(CENTER, TOP);
  text(sym, x + w / 2, y + h * 0.12);
  textSize(w * 0.12);
  text(`$${price.toFixed(2)}`, x + w / 2, y + h * 0.45);
  textSize(w * 0.1);
  text(`Owned: ${qty}`, x + w / 2, y + h * 0.72);
}

function buttonRect(x, y, w, h) {
  return { x, y, w, h };
}

function over(r) {
  return mouseX > r.x && mouseX < r.x + r.w && mouseY > r.y && mouseY < r.y + r.h;
}

// Mafia helpers
function initMafia() {
  contrabandTypes.forEach(c => (mafiaInventory[c] = 0));
  refreshMafiaPrices();
  lastMafiaUpdate = millis();
}

function refreshMafiaPrices() {
  const loc = mafiaLocations[currentLocation];
  const baseMinMax = {
    "Bliss Dust": [10, 50],
    "Shadow Bloom": [1000, 5000],
    "Viper Venom": [200, 800],
    "Crimson Haze": [5000, 15000],
    "Iron Will Dust": [150, 600],
    "Ocean Echo": [700, 3000]
  };
  loc.contraband.forEach(item => {
    const range = baseMinMax[item];
    const base = random(range[0], range[1]);
    const vol = map(loc.travelCost, 50, 200, 0.08, 0.4, true);
    const delta = base * random(-vol, vol);
    mafiaPrices[item] = max(5, base + delta);
  });
}

function handleMafiaTrade(item, deltaQty) {
  const price = mafiaPrices[item] || 0;
  if (deltaQty > 0) {
    const cost = price * deltaQty;
    if (money < cost) return;
    money -= cost;
    mafiaInventory[item] = (mafiaInventory[item] || 0) + deltaQty; // BUG: no cap
  } else {
    const need = abs(deltaQty);
    if (!mafiaInventory[item] || mafiaInventory[item] < need) return;
    money += price * need;
    mafiaInventory[item] -= need;
  }
}
