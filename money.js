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
  const fee = locations[idx].fee;
  if (money < fee) return;
  money -= fee;
  currentLocation = idx;
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
  drawLocations();
  drawStocks();
  drawSelectedPanel();
  drawGoal();
}

function drawHeader() {
  fill(232, 238, 247);
  textSize(width * 0.03);
  textAlign(LEFT, TOP);
  text("Money Mastermind", width * 0.04, height * 0.04);

  textSize(width * 0.016);
  text(`Day ${day}/${maxDays}`, width * 0.04, height * 0.08);
  text(`Cash: $${money.toFixed(0)}`, width * 0.04, height * 0.11);
  text(`Location: ${locations[currentLocation].name}`, width * 0.04, height * 0.14);

  const btnAdvance = buttonRect(width * 0.8, height * 0.08, width * 0.15, height * 0.06);
  drawButton(btnAdvance, "Next Day");
}

function drawLocations() {
  textSize(width * 0.018);
  textAlign(LEFT, CENTER);
  for (let i = 0; i < locations.length; i++) {
    const r = buttonRect(width * 0.08, height * 0.2 + i * (height * 0.1), width * 0.18, height * 0.08);
    const active = i === currentLocation;
    drawButton(r, `${locations[i].name} ($${locations[i].fee})`, active);
  }
}

function drawStocks() {
  const startX = width * 0.3;
  const startY = height * 0.25;
  const cardW = width * 0.18;
  const cardH = height * 0.2;
  const gap = width * 0.025;

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
  const panel = { x: width * 0.3, y: height * 0.48, w: width * 0.5, h: height * 0.22 };
  fill(28, 32, 40);
  stroke(90, 110, 130);
  strokeWeight(2);
  rect(panel.x, panel.y, panel.w, panel.h, 10);
  noStroke();

  textAlign(LEFT, TOP);
  fill(228);
  textSize(width * 0.018);
  if (!selectedStock) {
    text("Select a stock card to trade.", panel.x + 20, panel.y + 20);
    return;
  }

  const price = prices[selectedStock].toFixed(2);
  const qty = owned[selectedStock] || 0;
  text(`Trading ${selectedStock} — Price $${price}`, panel.x + 20, panel.y + 20);
  text(`Owned: ${qty}`, panel.x + 20, panel.y + 50);

  text(`Qty: ${inputQty || "(type or use buttons)"}`, panel.x + 20, panel.y + 80);

  const actionY = panel.y + panel.h - height * 0.1;
  const buyBtn = buttonRect(width * 0.35, actionY, width * 0.12, height * 0.06);
  const sellBtn = buttonRect(width * 0.53, actionY, width * 0.12, height * 0.06);
  drawButton(buyBtn, "Buy", true);
  drawButton(sellBtn, "Sell", false);
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
