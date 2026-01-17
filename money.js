// Money Mastermind - Compact Prototype (p5.js)
// Goal: grow money to a target before day limit; includes Stocks, Mafia, Gambling.

let money = 1000;
let goal = 50000; // tweakable later
let day = 1;
let dayLimit = 30;

let currentScreen = 'menu'; // menu | stocks | mafia | gamble

// Stocks
let stocks = [];
let stockPortfolio = {};
let selectedStock = null;
let stockQtyInput = "";

// Mafia
const mafiaLocations = [
  { name: "Harbor", travelCost: 50, contraband: ["Bliss Dust", "Viper Venom", "Ocean Echo"] },
  { name: "Midtown", travelCost: 100, contraband: ["Shadow Bloom", "Viper Venom", "Iron Will Dust"] },
  { name: "Skyline", travelCost: 200, contraband: ["Crimson Haze", "Shadow Bloom", "Ocean Echo"] }
];
const contrabandRanges = {
  "Bliss Dust": [10, 50],
  "Shadow Bloom": [1000, 5000],
  "Viper Venom": [200, 800],
  "Crimson Haze": [5000, 15000],
  "Iron Will Dust": [150, 600],
  "Ocean Echo": [700, 3000]
};
let mafiaLocationIndex = 0;
let mafiaPrices = {};
let mafiaInventory = {};
let mafiaDailyBuys = 0;
let mafiaDailySells = 0;
const MAFIA_DAILY_LIMIT = 3;
const MAFIA_INV_CAP = 20; // will be enforced; can tweak

// Gambling
const gambleLocations = ["Boardwalk", "Old Town", "Neon Strip"];
let gambleLocationIndex = 0;
const GAMBLE_PLAY_CAP = 5;
let gamblePlaysToday = 0;

// Buttons tracked each frame for hit-testing
let buttons = [];

function setup() {
  const c = createCanvas(windowWidth, windowHeight);
  c.parent('game-root');
  textFont('Courier New');
  initStocks();
  initMafia();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function initStocks() {
  stocks = [
    makeStock('AQUA'),
    makeStock('NOVA'),
    makeStock('GRIT'),
    makeStock('ZEAL')
  ];
  stockPortfolio = {};
}

function makeStock(symbol) {
  const base = random(40, 120);
  return {
    symbol,
    price: base,
    dividend: base * 0.03,
    volatility: random(0.08, 0.22),
    prev: base
  };
}

function initMafia() {
  mafiaInventory = {};
  Object.keys(contrabandRanges).forEach(k => (mafiaInventory[k] = 0));
  refreshMafiaPrices();
  mafiaDailyBuys = 0;
  mafiaDailySells = 0;
}

function refreshMafiaPrices() {
  const loc = mafiaLocations[mafiaLocationIndex];
  loc.contraband.forEach(item => {
    const [minP, maxP] = contrabandRanges[item];
    const base = random(minP, maxP);
    const vol = map(loc.travelCost, 50, 200, 0.1, 0.45, true);
    const delta = base * random(-vol, vol);
    mafiaPrices[item] = max(5, base + delta);
  });
}

function draw() {
  background(18, 20, 28);
  buttons = [];
  drawHUD();
  drawNav();
  if (currentScreen === 'menu') drawMenu();
  if (currentScreen === 'stocks') drawStocksScreen();
  if (currentScreen === 'mafia') drawMafiaScreen();
  if (currentScreen === 'gamble') drawGambleScreen();
}

function drawHUD() {
  fill(240);
  textSize(width * 0.018);
  textAlign(LEFT, TOP);
  text(`Money: $${money.toFixed(0)}`, width * 0.03, height * 0.03);
  text(`Day: ${day}/${dayLimit}`, width * 0.03, height * 0.06);
  text(`Goal: $${goal.toLocaleString()}`, width * 0.03, height * 0.09);
}

function drawNav() {
  const navY = height * 0.02;
  const labels = [
    { k: 'menu', label: 'Menu' },
    { k: 'stocks', label: 'Stocks' },
    { k: 'mafia', label: 'Mafia' },
    { k: 'gamble', label: 'Gambling' },
    { k: 'next', label: 'Next Day' }
  ];
  let x = width * 0.3;
  const w = width * 0.12;
  const h = height * 0.05;
  labels.forEach(entry => {
    const b = { x, y: navY, w, h, label: entry.label, key: entry.k };
    drawButton(b, currentScreen === entry.k);
    buttons.push({ ...b, action: entry.k });
    x += w + width * 0.01;
  });
}

function drawMenu() {
  textAlign(CENTER, CENTER);
  fill(230);
  textSize(width * 0.04);
  text('Money Mastermind', width / 2, height * 0.3);
  textSize(width * 0.02);
  text('Build wealth via Stocks, Mafia trades, and Gambling before the day limit.', width / 2, height * 0.36);
}

function drawStocksScreen() {
  textAlign(LEFT, TOP);
  fill(230);
  textSize(width * 0.026);
  text('Stock Market', width * 0.06, height * 0.14);

  const cardW = width * 0.18;
  const cardH = height * 0.22;
  let x = width * 0.06;
  const y = height * 0.2;

  stocks.forEach(s => {
    const b = { x, y, w: cardW, h: cardH, label: s.symbol };
    const hovered = isMouseOver(b);
    fill(hovered ? 50 : 36, 46, 64);
    stroke(80, 100, 140);
    strokeWeight(2);
    rect(b.x, b.y, b.w, b.h, 12);
    noStroke();
    fill(240);
    textAlign(CENTER, TOP);
    textSize(cardW * 0.16);
    text(s.symbol, b.x + b.w / 2, b.y + b.h * 0.08);
    textSize(cardW * 0.12);
    text(`$${s.price.toFixed(2)}`, b.x + b.w / 2, b.y + b.h * 0.35);
    textSize(cardW * 0.1);
    text(`Div: $${s.dividend.toFixed(2)}`, b.x + b.w / 2, b.y + b.h * 0.55);
    text(`Owned: ${stockPortfolio[s.symbol]?.qty || 0}`, b.x + b.w / 2, b.y + b.h * 0.75);
    buttons.push({ ...b, action: 'selectStock', symbol: s.symbol });
    x += cardW + width * 0.02;
  });

  const panel = { x: width * 0.6, y: height * 0.2, w: width * 0.32, h: height * 0.22 };
  fill(32, 36, 46);
  stroke(90, 110, 140);
  rect(panel.x, panel.y, panel.w, panel.h, 10);
  noStroke();
  fill(235);
  textAlign(LEFT, TOP);
  textSize(width * 0.018);
  text('Trade', panel.x + 16, panel.y + 12);
  text(`Selected: ${selectedStock || '-'}`, panel.x + 16, panel.y + 40);
  text(`Qty: ${stockQtyInput || '(type numbers)'}`, panel.x + 16, panel.y + 68);

  const buyBtn = { x: panel.x + 16, y: panel.y + panel.h - 60, w: panel.w * 0.4, h: 40, label: 'Buy' };
  const sellBtn = { x: panel.x + panel.w * 0.55, y: panel.y + panel.h - 60, w: panel.w * 0.4, h: 40, label: 'Sell' };
  drawButton(buyBtn, true);
  drawButton(sellBtn, false);
  buttons.push({ ...buyBtn, action: 'buyStock' });
  buttons.push({ ...sellBtn, action: 'sellStock' });
}

function drawMafiaScreen() {
  textAlign(LEFT, TOP);
  fill(230);
  textSize(width * 0.026);
  text('Mafia Contraband', width * 0.06, height * 0.14);
  textSize(width * 0.018);
  text(`Daily Buys: ${mafiaDailyBuys}/${MAFIA_DAILY_LIMIT}  Sells: ${mafiaDailySells}/${MAFIA_DAILY_LIMIT}`, width * 0.06, height * 0.18);

  const tableX = width * 0.06;
  const tableY = height * 0.22;
  const rowH = height * 0.08;
  const con = mafiaLocations[mafiaLocationIndex].contraband;
  for (let i = 0; i < con.length; i++) {
    const y = tableY + i * rowH;
    const item = con[i];
    fill(38, 44, 56);
    rect(tableX, y, width * 0.48, rowH - 6, 8);
    fill(235);
    textSize(width * 0.017);
    text(item, tableX + 12, y + 8);
    text(`$${(mafiaPrices[item] || 0).toFixed(2)}`, tableX + width * 0.2, y + 8);
    text(`Owned: ${mafiaInventory[item] || 0}`, tableX + width * 0.32, y + 8);

    const buyBtn = { x: tableX + width * 0.26, y: y + rowH * 0.45, w: width * 0.1, h: rowH * 0.4, label: 'Buy' };
    const sellBtn = { x: tableX + width * 0.38, y: y + rowH * 0.45, w: width * 0.1, h: rowH * 0.4, label: 'Sell' };
    drawButton(buyBtn, true);
    drawButton(sellBtn, false);
    buttons.push({ ...buyBtn, action: 'buyContraband', item });
    buttons.push({ ...sellBtn, action: 'sellContraband', item });
  }

  // Travel buttons
  const travelY = height * 0.5;
  mafiaLocations.forEach((loc, idx) => {
    const b = { x: width * 0.06 + idx * width * 0.16, y: travelY, w: width * 0.14, h: height * 0.07, label: `${loc.name} ($${loc.travelCost})` };
    drawButton(b, idx === mafiaLocationIndex);
    buttons.push({ ...b, action: 'travelMafia', idx });
  });
}

function drawGambleScreen() {
  textAlign(LEFT, TOP);
  fill(230);
  textSize(width * 0.026);
  text('Gambling Sector', width * 0.06, height * 0.14);
  textSize(width * 0.018);
  text(`Plays today: ${gamblePlaysToday}/${GAMBLE_PLAY_CAP}`, width * 0.06, height * 0.18);

  // Location buttons
  let gx = width * 0.06;
  gambleLocations.forEach((loc, idx) => {
    const b = { x: gx, y: height * 0.22, w: width * 0.16, h: height * 0.07, label: loc };
    drawButton(b, idx === gambleLocationIndex);
    buttons.push({ ...b, action: 'gambleTravel', idx });
    gx += width * 0.18;
  });

  // Games
  const lotBtn = { x: width * 0.06, y: height * 0.35, w: width * 0.18, h: height * 0.09, label: 'Lottery ($50)' };
  const diceBtn = { x: width * 0.27, y: height * 0.35, w: width * 0.18, h: height * 0.09, label: 'Dice ($100)' };
  drawButton(lotBtn, false);
  drawButton(diceBtn, false);
  buttons.push({ ...lotBtn, action: 'lottery' });
  buttons.push({ ...diceBtn, action: 'dice' });
}

function mousePressed() {
  for (const b of buttons) {
    if (isMouseOver(b)) {
      handleAction(b);
      return;
    }
  }
}

function keyPressed() {
  if (currentScreen !== 'stocks') return;
  if (keyCode === BACKSPACE) {
    stockQtyInput = stockQtyInput.slice(0, -1);
  } else if (key >= '0' && key <= '9' && stockQtyInput.length < 5) {
    stockQtyInput += key;
  }
}

function handleAction(b) {
  if (b.action === 'menu' || b.action === 'stocks' || b.action === 'mafia' || b.action === 'gamble') {
    currentScreen = b.action;
    return;
  }
  if (b.action === 'next') {
    nextDay();
    return;
  }
  if (b.action === 'selectStock') {
    selectedStock = b.symbol;
    return;
  }
  if (b.action === 'buyStock') {
    tradeStock(true);
    return;
  }
  if (b.action === 'sellStock') {
    tradeStock(false);
    return;
  }
  if (b.action === 'buyContraband') {
    tradeContraband(b.item, 1);
    return;
  }
  if (b.action === 'sellContraband') {
    tradeContraband(b.item, -1);
    return;
  }
  if (b.action === 'travelMafia') {
    travelMafia(b.idx);
    return;
  }
  if (b.action === 'gambleTravel') {
    gambleLocationIndex = b.idx;
    return;
  }
  if (b.action === 'lottery') {
    playLottery();
    return;
  }
  if (b.action === 'dice') {
    playDice();
    return;
  }
}

function tradeStock(isBuy) {
  if (!selectedStock) return;
  const qty = int(stockQtyInput || '1');
  if (qty <= 0) return;
  const s = stocks.find(st => st.symbol === selectedStock);
  if (!s) return;
  if (isBuy) {
    const cost = s.price * qty;
    if (money < cost) return;
    money -= cost;
    if (!stockPortfolio[s.symbol]) stockPortfolio[s.symbol] = { qty: 0, avg: 0 };
    const prevCost = stockPortfolio[s.symbol].qty * stockPortfolio[s.symbol].avg;
    stockPortfolio[s.symbol].qty += qty;
    stockPortfolio[s.symbol].avg = (prevCost + cost) / stockPortfolio[s.symbol].qty;
  } else {
    if (!stockPortfolio[s.symbol] || stockPortfolio[s.symbol].qty < qty) return;
    money += s.price * qty;
    stockPortfolio[s.symbol].qty -= qty;
    if (stockPortfolio[s.symbol].qty <= 0) delete stockPortfolio[s.symbol];
  }
  stockQtyInput = "";
}

function tradeContraband(item, delta) {
  if (delta > 0 && mafiaDailyBuys >= MAFIA_DAILY_LIMIT) return;
  if (delta < 0 && mafiaDailySells >= MAFIA_DAILY_LIMIT) return;
  const price = mafiaPrices[item] || 0;
  if (delta > 0) {
    if (money < price * delta) return;
    if (mafiaInventory[item] + delta > MAFIA_INV_CAP) return;
    money -= price * delta;
    mafiaInventory[item] += delta;
    mafiaDailyBuys++;
  } else {
    const need = abs(delta);
    if (!mafiaInventory[item] || mafiaInventory[item] < need) return;
    mafiaInventory[item] -= need;
    money += price * need;
    mafiaDailySells++;
  }
}

function travelMafia(idx) {
  if (idx === mafiaLocationIndex) return;
  const cost = mafiaLocations[idx].travelCost;
  if (money < cost) return;
  money -= cost;
  mafiaLocationIndex = idx;
  refreshMafiaPrices();
}

function nextDay() {
  day++;
  // stocks update and dividends
  stocks.forEach(s => {
    s.prev = s.price;
    const drift = random(-s.volatility, s.volatility);
    s.price = max(1, s.price * (1 + drift));
  });
  let divs = 0;
  Object.keys(stockPortfolio).forEach(sym => {
    const s = stocks.find(x => x.symbol === sym);
    if (s) divs += stockPortfolio[sym].qty * s.dividend;
  });
  money += divs;

  // mafia price refresh and reset limits
  refreshMafiaPrices();
  mafiaDailyBuys = 0;
  mafiaDailySells = 0;

  // gambling daily reset
  gamblePlaysToday = 0;

  // Check day limit
  if (day > dayLimit) {
    // freeze input; minimal handling
    currentScreen = 'menu';
  }
}

function playLottery() {
  if (gamblePlaysToday >= GAMBLE_PLAY_CAP) return;
  const cost = 50;
  if (money < cost) return;
  money -= cost;
  gamblePlaysToday++;
  const roll = random();
  if (roll < 0.01) {
    money += cost * 25; // jackpot
  } else if (roll < 0.12) {
    money += cost * 4; // win
  }
}

function playDice() {
  if (gamblePlaysToday >= GAMBLE_PLAY_CAP) return;
  const cost = 100;
  if (money < cost) return;
  money -= cost;
  gamblePlaysToday++;
  if (random() < 0.48) {
    money += cost * 1.8;
  }
}

function drawButton(b, active) {
  const hovered = isMouseOver(b);
  const base = active ? color(60, 130, 80) : color(60, 70, 85);
  const hover = active ? color(70, 150, 95) : color(75, 85, 100);
  fill(hovered ? hover : base);
  noStroke();
  rect(b.x, b.y, b.w, b.h, b.h / 3);
  fill(245);
  textAlign(CENTER, CENTER);
  textSize(min(b.w, b.h) * 0.35);
  text(b.label, b.x + b.w / 2, b.y + b.h / 2);
}

function isMouseOver(r) {
  return mouseX > r.x && mouseX < r.x + r.w && mouseY > r.y && mouseY < r.y + r.h;
}
