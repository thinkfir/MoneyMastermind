// Money Mastermind (p5.js) - Aligned with sketch.js style, with added Gambling sector
// States: mainMenu, stockMarket, mafiaWars, gambling, wallet, buySellStock, winScreen, loseScreen

// --- Core state ---
let gameMoney = 1000;
let gameDay = 1;
let MONEY_GOAL = 500000; // tweakable
let DAY_LIMIT = 100;
let currentState = 'mainMenu';
let gameMessages = [];

// --- UI buttons
let btnMainStock, btnMainMafia, btnMainGamble, btnNewGame;
let btnNextDayGlobal;
let btnBackToMain;
let btnBackToStockMarket;

// --- Stocks ---
const regions = [
  { name: "Global Exchange", stocks: ["AQUA", "NOVA", "GRIT", "ZEAL", "PRSM"] },
  { name: "Tech Hub", stocks: ["QUANT", "NEURO", "DATM", "ROBO", "SPCE"] },
  { name: "Emerging", stocks: ["AGRX", "INFR", "MINR", "TEXL", "PHRM"] }
];
let currentRegionIndex = 0;
let stocksData = {};
let playerPortfolio = {};
let stockTiles = [];
let selectedStockSymbol = null;
let buySellQuantity = "";
const STOCK_MAX_INVENTORY = 30;

// --- Mafia ---
const mafiaLocations = [
  { name: 'Harbor', contraband: ['Bliss Dust', 'Viper Venom', 'Ocean Echo'], travelCost: 200 },
  { name: 'Midtown', contraband: ['Shadow Bloom', 'Viper Venom', 'Iron Will Dust'], travelCost: 300 },
  { name: 'Skyline', contraband: ['Crimson Haze', 'Shadow Bloom', 'Ocean Echo'], travelCost: 500 },
  { name: 'Chicago', contraband: ['Bliss Dust', 'Iron Will Dust', 'Shadow Bloom'], travelCost: 250 },
  { name: 'Miami', contraband: ['Bliss Dust', 'Ocean Echo', 'Crimson Haze'], travelCost: 350 },
  { name: 'Denver', contraband: ['Starlight Shard', 'Iron Will Dust', 'Bliss Dust'], travelCost: 180 }
];
const allContrabandTypes = ['Bliss Dust', 'Shadow Bloom', 'Viper Venom', 'Crimson Haze', 'Starlight Shard', 'Iron Will Dust', 'Ocean Echo'];
let currentMafiaLocationIndex = 5; // Denver start
let mafiaContrabandPrices = {};
let mafiaPlayerInventory = {};
let mafiaDailyBuys = 0;
let mafiaDailySells = 0;
const MAFIA_MAX_INVENTORY_PER_ITEM = 30;
const MAFIA_MAX_DAILY_TRANSACTIONS = 3;
let lastMafiaPriceUpdateTime = 0;
const MAFIA_PRICE_UPDATE_INTERVAL = 15000;
let MIN_MAFIA_TRAVEL_COST;
let MAX_MAFIA_TRAVEL_COST;

// --- Gambling ---
const gambleLocations = ['Boardwalk', 'Old Town', 'Neon Strip'];
let gambleLocationIndex = 0;
const GAMBLE_PLAY_CAP = 5;
let gamblePlaysToday = 0;

// --- Layout helpers (Mafia)
let mafiaTableX, mafiaTableY, mafiaColWidth, mafiaActionColWidth, mafiaRowHeight, mafiaBtnPadding;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('game-root');
  textFont('Courier New');

  MIN_MAFIA_TRAVEL_COST = Math.min(...mafiaLocations.map(l => l.travelCost));
  MAX_MAFIA_TRAVEL_COST = Math.max(...mafiaLocations.map(l => l.travelCost));

  initializeStocks();
  initializeMafiaWars();
  setupLayout();
  setupGlobalButtons();
  addGameMessage("Welcome to Money Mastermind!");
  addGameMessage(`Reach $${MONEY_GOAL.toLocaleString()} within ${DAY_LIMIT} days!`, 'info');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupLayout();
  setupGlobalButtons();
}

// --- Layout setup
function setupLayout() {
  setupMainMenuButtons();
  setupStockMarketButtons();
  setupMafiaWarsLayoutConstants();
}

function setupGlobalButtons() {
  btnNextDayGlobal = {
    x: width * 0.78,
    y: height * 0.02 + height * 0.08,
    width: width * 0.16,
    height: height * 0.06,
    text: 'Next Day',
    color: color(80, 100, 200)
  };
  btnBackToMain = {
    x: width / 2 - (width * 0.2) / 2,
    y: height * 0.9,
    width: width * 0.2,
    height: height * 0.07,
    text: 'Main Menu',
    color: color(100, 100, 120)
  };
}

// --- Stocks init
function initializeStocks() {
  stocksData = {};
  for (const region of regions) {
    for (const symbol of region.stocks) {
      const initialPrice = parseFloat((random(50, 200)).toFixed(2));
      const dividendValue = parseFloat((initialPrice * 0.05).toFixed(2));
      const volatility = random(0.08, 0.25);
      stocksData[symbol] = { price: initialPrice, prevPrice: 0, volatility, dividend: dividendValue };
    }
  }
  playerPortfolio = {};
}

// --- Mafia init
function initializeMafiaWars() {
  mafiaPlayerInventory = {};
  allContrabandTypes.forEach(t => mafiaPlayerInventory[t] = 0);
  mafiaDailyBuys = 0;
  mafiaDailySells = 0;
  mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name);
  lastMafiaPriceUpdateTime = millis();
}

function generateMafiaPrices(locationName) {
  const prices = {};
  const loc = mafiaLocations.find(l => l.name === locationName);
  const contraband = loc ? loc.contraband : [];
  contraband.forEach(item => {
    let base; // use ranges similar to sketch
    switch (item) {
      case 'Bliss Dust': base = random(10, 50); break;
      case 'Shadow Bloom': base = random(1000, 5000); break;
      case 'Viper Venom': base = random(200, 800); break;
      case 'Crimson Haze': base = random(5000, 15000); break;
      case 'Starlight Shard': base = random(500, 2000); break;
      case 'Iron Will Dust': base = random(150, 600); break;
      case 'Ocean Echo': base = random(700, 3000); break;
      default: base = random(50, 200);
    }
    const norm = map(loc.travelCost, MIN_MAFIA_TRAVEL_COST, MAX_MAFIA_TRAVEL_COST, 0, 1);
    const vol = map(norm, 0, 1, 0.05, 0.5);
    const priceChange = base * random(-vol, vol);
    prices[item] = max(5, parseFloat((base + priceChange).toFixed(2)));
  });
  addGameMessage(`Contraband prices updated in ${locationName}.`, 'info');
  return prices;
}

// --- Draw loop
function draw() {
  background(10, 10, 20);
  drawScanlines();
  drawCanvasTitle();

  if (currentState === 'mainMenu') {
    drawMainMenu();
  } else if (currentState === 'stockMarket') {
    drawStockMarketScreen();
  } else if (currentState === 'mafiaWars') {
    drawMafiaWarsScreen();
  } else if (currentState === 'gambling') {
    drawGamblingScreen();
  } else if (currentState === 'buySellStock') {
    drawBuySellStockScreen(selectedStockSymbol);
  } else if (currentState === 'wallet') {
    drawWalletScreen();
  } else if (currentState === 'winScreen') {
    drawWinScreen();
  } else if (currentState === 'loseScreen') {
    drawLoseScreen();
  }

  if (currentState !== 'winScreen' && currentState !== 'loseScreen') {
    drawGameInfo();
    drawFadingMessages();
  }

  // Mafia timed price updates
  if (currentState === 'mafiaWars' && millis() - lastMafiaPriceUpdateTime > MAFIA_PRICE_UPDATE_INTERVAL) {
    mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name);
    lastMafiaPriceUpdateTime = millis();
  }
}

// --- Button helper
function drawButton(btn) {
  if (!btn) return;
  const radius = 8;
  fill(btn.color || color(80));
  noStroke();
  rect(btn.x, btn.y, btn.width, btn.height, radius);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(min(btn.height * 0.45, width * 0.022));
  text(btn.text || '', btn.x + btn.width / 2, btn.y + btn.height / 2);
}

// --- Visual helpers
function drawScanlines() {
  stroke(0, 255, 100, 30);
  for (let y = 0; y < height; y += 4) line(0, y, width, y);
  noStroke();
}

function setupMainMenuButtons() {
  const usableHeight = height * 0.6;
  const buttonWidth = width * 0.45;
  const buttonHeight = usableHeight * 0.12;
  const gap = usableHeight * 0.03;
  const totalButtonsHeight = 3 * buttonHeight + 2 * gap;
  const startY = (height - usableHeight) / 2 + height * 0.1 + (usableHeight - totalButtonsHeight) / 2;
  const centerX = width / 2;
  btnMainMafia = { x: centerX - buttonWidth / 2, y: startY, width: buttonWidth, height: buttonHeight, text: '🔪 Mafia Wars', color: color(220, 50, 50) };
  btnMainStock = { x: centerX - buttonWidth / 2, y: startY + buttonHeight + gap, width: buttonWidth, height: buttonHeight, text: '📈 Stock Market', color: color(50, 180, 50) };
  btnMainGamble = { x: centerX - buttonWidth / 2, y: startY + 2 * (buttonHeight + gap), width: buttonWidth, height: buttonHeight, text: '🎲 Gambling', color: color(90, 130, 220) };
  btnNewGame = { x: centerX - (buttonWidth * 0.6) / 2, y: startY + 3 * (buttonHeight + gap), width: buttonWidth * 0.6, height: buttonHeight * 0.7, text: 'Start New Game', color: color(80, 80, 80) };
}

function setupStockMarketButtons() {
  btnBackToStockMarket = { x: width / 2 - (width * 0.2) / 2, y: height * 0.9, width: width * 0.2, height: height * 0.07, text: 'Back', color: color(100, 100, 100) };
}

function setupMafiaWarsLayoutConstants() {
  mafiaTableX = width * 0.12;
  mafiaTableY = height * 0.22;
  mafiaColWidth = width * 0.16;
  mafiaActionColWidth = width * 0.2;
  mafiaRowHeight = height * 0.09;
  mafiaBtnPadding = 16;
}

// --- Game info & title
let gameCanvasTitle;
function drawCanvasTitle() {
  if (!gameCanvasTitle) {
    gameCanvasTitle = { text: 'Money Mastermind', textSize: width * 0.05, x: width / 2, y: height * 0.07 };
  }
  fill(0, 255, 120);
  textFont('monospace');
  textSize(gameCanvasTitle.textSize * 1.1);
  textAlign(CENTER, CENTER);
  drawingContext.shadowBlur = 24;
  drawingContext.shadowColor = 'lime';
  text(gameCanvasTitle.text, gameCanvasTitle.x, gameCanvasTitle.y);
  drawingContext.shadowBlur = 0;
  drawingContext.shadowColor = 'rgba(0,0,0,0)';
}

function drawGameInfo() {
  const boxW = width * 0.22;
  const boxH = height * 0.24;
  const pad = width * 0.01;
  fill(30, 40, 50, 200);
  stroke(80, 100, 120, 200);
  rect(pad, pad, boxW, boxH, 8);
  noStroke();
  const textBase = height * 0.022;
  let y = pad + textBase;
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(textBase);
  text(`💰 Money: $${gameMoney.toLocaleString()}`, pad + 10, y); y += textBase * 1.4;
  text(`🗓️ Day: ${gameDay}`, pad + 10, y); y += textBase * 1.4;
  text(`📍 Location: ${gameLocationLabel()}`, pad + 10, y); y += textBase * 1.6;

  // Goal bar
  const barW = boxW - pad * 3;
  const barH = height * 0.015;
  fill(20, 20, 30);
  rect(pad + 8, y, barW, barH, 3);
  const prog = map(gameMoney, 0, MONEY_GOAL, 0, barW, true);
  fill(50, 200, 50);
  rect(pad + 8, y, prog, barH, 3);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(textBase * 0.9);
  text(`$${gameMoney.toLocaleString()}/$${MONEY_GOAL.toLocaleString()}`, pad + 8 + barW / 2, y + barH / 2);
  y += barH + textBase * 1.4;

  // Day bar
  fill(20, 20, 30);
  rect(pad + 8, y, barW, barH, 3);
  const dprog = map(gameDay, 0, DAY_LIMIT, 0, barW, true);
  fill(200, 200, 50);
  rect(pad + 8, y, dprog, barH, 3);
  fill(255);
  textAlign(CENTER, CENTER);
  text(`${gameDay}/${DAY_LIMIT} Days`, pad + 8 + barW / 2, y + barH / 2);
}

function gameLocationLabel() {
  if (currentState === 'mafiaWars') return mafiaLocations[currentMafiaLocationIndex].name;
  if (currentState === 'stockMarket') return regions[currentRegionIndex].name;
  if (currentState === 'gambling') return gambleLocations[gambleLocationIndex];
  return 'Main Menu';
}

// --- Messages
const MESSAGE_FADE_IN_DURATION = 500;
const MESSAGE_HOLD_DURATION = 2000;
const MESSAGE_FADE_OUT_DURATION = 1500;
const MESSAGE_TOTAL_DURATION = MESSAGE_FADE_IN_DURATION + MESSAGE_HOLD_DURATION + MESSAGE_FADE_OUT_DURATION;
function addGameMessage(message, type = 'info') {
  gameMessages.push({ text: message, type, timestamp: millis() });
}
function drawFadingMessages() {
  const rightEdge = width * 0.98;
  const top = height * 0.02;
  const lineH = height * 0.03;
  textSize(height * 0.02);
  textAlign(RIGHT, TOP);
  gameMessages = gameMessages.filter(msg => millis() - msg.timestamp < MESSAGE_TOTAL_DURATION);
  let y = top + height * 0.15; // lower
  for (let i = gameMessages.length - 1; i >= 0; i--) {
    const msg = gameMessages[i];
    const elapsed = millis() - msg.timestamp;
    let opacity;
    if (elapsed < MESSAGE_FADE_IN_DURATION) opacity = map(elapsed, 0, MESSAGE_FADE_IN_DURATION, 0, 255);
    else if (elapsed < MESSAGE_FADE_IN_DURATION + MESSAGE_HOLD_DURATION) opacity = 255;
    else opacity = map(elapsed - MESSAGE_FADE_IN_DURATION - MESSAGE_HOLD_DURATION, 0, MESSAGE_FADE_OUT_DURATION, 255, 0);
    let col;
    if (msg.type === 'success') col = color(72, 187, 120, opacity);
    else if (msg.type === 'error') col = color(239, 68, 68, opacity);
    else if (msg.type === 'warning') col = color(246, 173, 85, opacity);
    else col = color(226, 232, 240, opacity);
    fill(col);
    text(msg.text, rightEdge, y);
    y -= lineH;
    if (y < top) break;
  }
}

// --- Main menu
function drawMainMenu() {
  // Gradient-like overlay drawn via CSS background; here add subtle glow blocks
  fill(0, 0, 0, 40);
  rect(width * 0.1, height * 0.2, width * 0.8, height * 0.6, 16);
  // Title and buttons
  textAlign(CENTER, CENTER);
  fill(255, 220, 240);
  textSize(width * 0.05);
  text('Money Mastermind', width / 2, height * 0.3);
  textSize(width * 0.022);
  fill(180, 220, 255);
  text('Stocks, Mafia, and Gambling to get rich before time runs out.', width / 2, height * 0.36);
  drawButton(btnMainMafia);
  drawButton(btnMainStock);
  drawButton(btnMainGamble);
  drawButton(btnNewGame);
}

// --- Stocks drawing
function drawStockMarketScreen() {
  background(10, 12, 24);
  drawButton(btnNextDayGlobal);
  drawButton({ x: width * 0.05, y: height * 0.12, width: width * 0.14, height: height * 0.06, text: 'Wallet', color: color(60, 150, 90) });
  drawButton({ x: width * 0.21, y: height * 0.12, width: width * 0.14, height: height * 0.06, text: 'Move Region', color: color(90, 60, 150) });
  drawButton(btnBackToMain);

  // Region panel
  fill(30, 40, 60, 180);
  stroke(120, 255, 200, 80);
  strokeWeight(2);
  const regionPanelW = width * 0.6;
  const regionPanelH = height * 0.1;
  const regionPanelX = width / 2 - regionPanelW / 2;
  const regionPanelY = height * 0.18;
  rect(regionPanelX, regionPanelY, regionPanelW, regionPanelH, 16);
  noStroke();
  fill(210, 230, 200);
  textSize(width * 0.03);
  textAlign(CENTER, CENTER);
  text(regions[currentRegionIndex].name, regionPanelX + regionPanelW / 2, regionPanelY + regionPanelH / 2);

  // Tiles
  const stocksInRegion = regions[currentRegionIndex].stocks;
  const tileW = width * 0.17;
  const tileH = height * 0.18;
  const tileGapX = width * 0.015;
  const totalW = stocksInRegion.length * tileW + (stocksInRegion.length - 1) * tileGapX;
  let startX = (width - totalW) / 2;
  const startY = height * 0.32;
  stockTiles = [];
  for (let i = 0; i < stocksInRegion.length; i++) {
    const sym = stocksInRegion[i];
    const s = stocksData[sym];
    const x = startX + i * (tileW + tileGapX);
    const y = startY;
    stockTiles.push({ x, y, width: tileW, height: tileH, symbol: sym });
    fill(24, 32, 48, 220);
    stroke(120, 255, 200, 80);
    strokeWeight(2);
    rect(x, y, tileW, tileH, 10);
    noStroke();
    fill(210, 230, 200);
    textAlign(CENTER, TOP);
    textSize(tileH * 0.18);
    text(sym, x + tileW / 2, y + tileH * 0.1);
    fill(255, 230, 120);
    textSize(tileH * 0.22);
    text(`$${s.price.toFixed(2)}`, x + tileW / 2, y + tileH * 0.45);
    if (s.prevPrice !== 0) {
      const change = s.price - s.prevPrice;
      let changeColor = color(180);
      let arrow = '';
      if (change > 0) { changeColor = color(120, 255, 120); arrow = '▲ '; }
      else if (change < 0) { changeColor = color(255, 120, 120); arrow = '▼ '; }
      fill(changeColor);
      textSize(tileH * 0.13);
      text(`${arrow}${abs(change).toFixed(2)}`, x + tileW / 2, y + tileH * 0.75);
    }
  }
}

function drawBuySellStockScreen(symbol) {
  if (!symbol || !stocksData[symbol]) {
    background(0);
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Error: Stock not found!", width / 2, height / 2);
    drawButton(btnBackToStockMarket);
    return;
  }
  const stock = stocksData[symbol];
  const ownedQty = playerPortfolio[symbol] ? playerPortfolio[symbol].quantity : 0;
  background(35, 45, 60);
  fill(240, 245, 250);
  textSize(width * 0.04);
  textAlign(CENTER, TOP);
  text(`${symbol} Stock Details`, width / 2, height * 0.15);
  const detailSize = height * 0.035;
  const line = detailSize * 1.5;
  let y = height * 0.25;
  fill(255, 230, 0); textSize(detailSize); text(`Current Price: $${stock.price.toFixed(2)}`, width / 2, y);
  y += line; fill(200, 210, 220); text(`Owned: ${ownedQty}`, width / 2, y);
  y += line; fill(255, 180, 180); text(`Your Money: $${gameMoney.toLocaleString()}`, width / 2, y);
  y += line; fill(100, 255, 255); text(`Daily Dividend: $${stock.dividend.toFixed(2)} per share`, width / 2, y);

  const inputX = width / 2 - (width * 0.2) / 2;
  const inputY = height * 0.5;
  const inputW = width * 0.2;
  const inputH = height * 0.06;
  fill(30, 40, 50);
  stroke(100, 115, 130);
  rect(inputX, inputY, inputW, inputH, 8);
  noStroke();
  fill(240, 245, 250);
  textSize(width * 0.02);
  textAlign(CENTER, CENTER);
  text(buySellQuantity || 'Enter Qty', inputX + inputW / 2, inputY + inputH / 2);

  const btnBuy = { x: width * 0.35, y: height * 0.7, width: width * 0.1, height: height * 0.06, text: 'Buy', color: color(50, 180, 50) };
  const btnSell = { x: width * 0.55, y: height * 0.7, width: width * 0.1, height: height * 0.06, text: 'Sell', color: color(220, 50, 50) };
  const btnMaxSell = { x: btnSell.x + btnSell.width + 10, y: height * 0.63, width: width * 0.07, height: height * 0.04, text: 'Max', color: color(100, 100, 100) };
  const btnMaxBuy = { x: btnBuy.x - (width * 0.07 + 10), y: height * 0.63, width: width * 0.07, height: height * 0.04, text: 'Max', color: color(100, 100, 100) };
  drawButton(btnBuy); drawButton(btnSell); drawButton(btnMaxSell); drawButton(btnMaxBuy);
  drawButton(btnBackToStockMarket);
}

// --- Mafia drawing
function drawMafiaWarsScreen() {
  background(12, 8, 24);
  fill(210, 220, 180);
  textFont('Courier New');
  textSize(width * 0.045);
  textAlign(CENTER, TOP);
  text("MAFIA WARS", width / 2, height * 0.06);
  fill(180, 200, 210);
  textSize(width * 0.025);
  text(`Current Territory: ${mafiaLocations[currentMafiaLocationIndex].name}`, width / 2, height * 0.14);

  drawButton(btnNextDayGlobal);

  drawContrabandTable();
  drawLocationButtons();

  const btnBack = { x: width / 2 - (width * 0.2) / 2, y: height * 0.9, width: width * 0.2, height: height * 0.07, text: 'Main Menu', color: color(100, 100, 100) };
  drawButton(btnBack);
}

function drawContrabandTable() {
  const tableX = mafiaTableX;
  const tableY = mafiaTableY;
  const colWidth = mafiaColWidth;
  const actionColWidth = mafiaActionColWidth;
  const rowHeight = mafiaRowHeight;
  const padding = mafiaBtnPadding;
  const currentContrabandTypes = mafiaLocations[currentMafiaLocationIndex].contraband;
  fill(40, 40, 40, 200); noStroke();
  rect(tableX, tableY, colWidth * 3 + actionColWidth, rowHeight, 8, 8, 0, 0);
  fill(255, 230, 0); textSize(height * 0.03); textAlign(CENTER, CENTER);
  text("Contraband", tableX + colWidth * 0.5, tableY + rowHeight / 2);
  text("Price", tableX + colWidth * 1.5, tableY + rowHeight / 2);
  text("Owned", tableX + colWidth * 2.5, tableY + rowHeight / 2);
  text("Actions", tableX + colWidth * 2.5 + actionColWidth / 2, tableY + rowHeight / 2);
  for (let i = 0; i < currentContrabandTypes.length; i++) {
    const item = currentContrabandTypes[i];
    const y = tableY + rowHeight * (i + 1);
    fill(20, 20, 20, 180);
    rect(tableX, y, colWidth * 3 + actionColWidth, rowHeight);
    fill(240); textSize(height * 0.022);
    text(item, tableX + colWidth * 0.5, y + rowHeight / 2);
    text(`$${mafiaContrabandPrices[item].toFixed(2)}`, tableX + colWidth * 1.5, y + rowHeight / 2);
    text(mafiaPlayerInventory[item], tableX + colWidth * 2.3, y + rowHeight / 2);
    const buyW = actionColWidth * 0.45; const buyH = rowHeight * 0.4;
    const btnX = tableX + colWidth * 2.5 + (actionColWidth - (buyW * 2 + padding / 2)) / 2;
    drawButton({ x: btnX, y: y + rowHeight / 2 - buyH / 2, width: buyW, height: buyH, text: 'Buy', color: color(0) });
    drawButton({ x: btnX + buyW + padding / 2, y: y + rowHeight / 2 - buyH / 2, width: buyW, height: buyH, text: 'Sell', color: color(0) });
  }
  noFill(); stroke(100, 100, 100); strokeWeight(1);
  rect(tableX, tableY, colWidth * 3 + actionColWidth, rowHeight * (currentContrabandTypes.length + 1), 8);
}

function drawLocationButtons() {
  const locBtnWidth = width * 0.13;
  const locBtnHeight = height * 0.09;
  const locGapX = width * 0.015;
  const locStartY = height * 0.82;
  fill(240, 245, 250);
  textSize(width * 0.018);
  textAlign(CENTER, BOTTOM);
  text("Travel to:", width / 2, locStartY - (locBtnHeight * 0.3));
  const totalW = mafiaLocations.length * locBtnWidth + (mafiaLocations.length - 1) * locGapX;
  const locStartX = width / 2 - totalW / 2;
  for (let i = 0; i < mafiaLocations.length; i++) {
    const loc = mafiaLocations[i];
    const btn = { x: locStartX + i * (locBtnWidth + locGapX), y: locStartY, width: locBtnWidth, height: locBtnHeight, text: null, color: i === currentMafiaLocationIndex ? color(50, 180, 50) : color(80, 80, 150) };
    drawButton(btn);
    fill(255); textSize(locBtnHeight * 0.35); textAlign(CENTER, CENTER);
    text(loc.name, btn.x + btn.width / 2, btn.y + btn.height * 0.3);
    fill(255, 230, 0); textSize(locBtnHeight * 0.25);
    text(`$${loc.travelCost}`, btn.x + btn.width / 2, btn.y + btn.height * 0.7);
  }
}

// --- Gambling
function drawGamblingScreen() {
  background(14, 12, 30);
  fill(240, 245, 250);
  textSize(width * 0.032);
  textAlign(CENTER, TOP);
  text("GAMBLING HALL", width / 2, height * 0.08);
  textSize(width * 0.02);
  text(`Plays today: ${gamblePlaysToday}/${GAMBLE_PLAY_CAP}`, width / 2, height * 0.13);

  // Locations
  const locW = width * 0.18;
  const locH = height * 0.08;
  const gap = width * 0.02;
  const totalW = gambleLocations.length * locW + (gambleLocations.length - 1) * gap;
  let startX = width / 2 - totalW / 2;
  const y = height * 0.2;
  for (let i = 0; i < gambleLocations.length; i++) {
    const b = { x: startX + i * (locW + gap), y, width: locW, height: locH, text: gambleLocations[i], color: i === gambleLocationIndex ? color(80, 180, 80) : color(80, 100, 140) };
    drawButton(b);
  }

  // Games
  const lotBtn = { x: width * 0.25, y: height * 0.4, width: width * 0.22, height: height * 0.12, text: 'Lottery ($50)', color: color(245, 158, 11) };
  const diceBtn = { x: width * 0.53, y: height * 0.4, width: width * 0.22, height: height * 0.12, text: 'Dice ($100)', color: color(90, 130, 220) };
  drawButton(lotBtn); drawButton(diceBtn);
}

// --- Wallet
function drawWalletScreen() {
  background(45, 55, 70);
  fill(240, 245, 250);
  textSize(width * 0.03);
  textAlign(CENTER, TOP);
  text("Your Portfolio", width / 2, height * 0.12);
  const colW = width * 0.12;
  const tableY = height * 0.2;
  const rowH = height * 0.05;
  const totalW = colW * 6;
  const startX = width / 2 - totalW / 2;
  fill(35, 45, 60, 220); stroke(80, 95, 110); strokeWeight(1);
  rect(startX - 10, tableY - rowH * 0.8, totalW + 20, (Object.keys(playerPortfolio).length + 1) * rowH + rowH * 0.6, 8);
  noStroke(); fill(255, 230, 0); textSize(height * 0.023); textAlign(CENTER, CENTER);
  text("Symbol", startX + colW * 0.5, tableY);
  text("Quantity", startX + colW * 1.5, tableY);
  text("Avg. Price", startX + colW * 2.5, tableY);
  text("Current Value", startX + colW * 3.5, tableY);
  text("P/L", startX + colW * 4.5, tableY);
  text("Daily Dividend", startX + colW * 5.5, tableY);
  let y = tableY + rowH; let row = 0;
  for (const sym in playerPortfolio) {
    const item = playerPortfolio[sym]; const s = stocksData[sym]; if (!s) continue;
    const currentValue = item.quantity * s.price;
    const profitLoss = currentValue - (item.quantity * item.avgPrice);
    const dailyDiv = item.quantity * s.dividend;
    fill(row % 2 === 0 ? color(50, 60, 75, 180) : color(45, 55, 70, 180));
    rect(startX - 10, y - rowH * 0.5, totalW + 20, rowH, 0);
    fill(240, 245, 250); textSize(height * 0.018);
    text(sym, startX + colW * 0.5, y);
    text(item.quantity, startX + colW * 1.5, y);
    text(`$${item.avgPrice.toFixed(2)}`, startX + colW * 2.5, y);
    text(`$${currentValue.toFixed(2)}`, startX + colW * 3.5, y);
    fill(profitLoss > 0 ? color(50, 220, 100) : profitLoss < 0 ? color(220, 80, 80) : color(180));
    text(`$${profitLoss.toFixed(2)}`, startX + colW * 4.5, y);
    fill(100, 255, 255);
    text(`$${dailyDiv.toFixed(2)}`, startX + colW * 5.5, y);
    y += rowH; row++;
  }
  drawButton(btnBackToStockMarket);
}

// --- Win/Lose
function drawWinScreen() {
  background(20, 50, 30);
  fill(100, 255, 100);
  textFont('monospace'); textSize(width * 0.08); textAlign(CENTER, CENTER);
  drawingContext.shadowBlur = 30; drawingContext.shadowColor = 'lime';
  text("YOU WON!", width / 2, height * 0.3);
  drawingContext.shadowBlur = 0; drawingContext.shadowColor = 'rgba(0,0,0,0)';
  fill(240, 245, 250); textSize(width * 0.025);
  text(`Reached $${MONEY_GOAL.toLocaleString()}!`, width / 2, height * 0.45);
  text(`Final Money: $${gameMoney.toLocaleString()}`, width / 2, height * 0.52);
  text(`Days: ${gameDay}`, width / 2, height * 0.59);
  const playAgainBtn = { x: width / 2 - (width * 0.25) / 2, y: height * 0.75, width: width * 0.25, height: height * 0.08, text: 'Play Again', color: color(50, 180, 50) };
  drawButton(playAgainBtn);
}

function drawLoseScreen() {
  background(50, 20, 20);
  fill(255, 100, 100);
  textFont('monospace'); textSize(width * 0.08); textAlign(CENTER, CENTER);
  drawingContext.shadowBlur = 30; drawingContext.shadowColor = 'red';
  text("GAME OVER", width / 2, height * 0.3);
  drawingContext.shadowBlur = 0; drawingContext.shadowColor = 'rgba(0,0,0,0)';
  fill(240, 245, 250); textSize(width * 0.025);
  text(`Goal not reached in ${DAY_LIMIT} days.`, width / 2, height * 0.45);
  text(`Final Money: $${gameMoney.toLocaleString()}`, width / 2, height * 0.52);
  text(`Days Played: ${gameDay}`, width / 2, height * 0.59);
  const playAgainBtn = { x: width / 2 - (width * 0.25) / 2, y: height * 0.75, width: width * 0.25, height: height * 0.08, text: 'Play Again', color: color(180, 50, 50) };
  drawButton(playAgainBtn);
}

// --- Interaction
function mousePressed() {
  if (currentState === 'mainMenu') {
    if (isMouseOver(btnMainMafia)) setGameState('mafiaWars');
    else if (isMouseOver(btnMainStock)) setGameState('stockMarket');
    else if (isMouseOver(btnMainGamble)) setGameState('gambling');
    else if (isMouseOver(btnNewGame)) resetGame();
  } else if (currentState === 'stockMarket') {
    if (isMouseOver(btnNextDayGlobal)) { advanceDay(); return; }
    if (isMouseOver(btnBackToMain)) { setGameState('mainMenu'); return; }
    for (const tile of stockTiles) {
      if (isMouseOver(tile)) { selectedStockSymbol = tile.symbol; setGameState('buySellStock'); buySellQuantity = ""; return; }
    }
  } else if (currentState === 'buySellStock') {
    const btnBuy = { x: width * 0.35, y: height * 0.7, width: width * 0.1, height: height * 0.06 };
    const btnSell = { x: width * 0.55, y: height * 0.7, width: width * 0.1, height: height * 0.06 };
    const btnMaxSell = { x: btnSell.x + btnSell.width + 10, y: height * 0.63, width: width * 0.07, height: height * 0.04 };
    const btnMaxBuy = { x: btnBuy.x - (width * 0.07 + 10), y: height * 0.63, width: width * 0.07, height: height * 0.04 };
    if (isMouseOver(btnBuy)) { buyStock(selectedStockSymbol, int(buySellQuantity)); buySellQuantity = ""; }
    else if (isMouseOver(btnSell)) { sellStock(selectedStockSymbol, int(buySellQuantity)); buySellQuantity = ""; }
    else if (isMouseOver(btnBackToStockMarket)) { setGameState('stockMarket'); }
    else if (isMouseOver(btnMaxSell)) { buySellQuantity = (playerPortfolio[selectedStockSymbol] ? playerPortfolio[selectedStockSymbol].quantity : 0).toString(); }
    else if (isMouseOver(btnMaxBuy)) { const p = stocksData[selectedStockSymbol].price; buySellQuantity = p > 0 ? Math.floor(gameMoney / p).toString() : "0"; }
  } else if (currentState === 'mafiaWars') {
    if (isMouseOver(btnNextDayGlobal)) { advanceDay(); return; }
    for (let i = 0; i < mafiaLocations.length; i++) {
      const locBtn = { x: width * 0.12 + i * (width * 0.13 + width * 0.015), y: height * 0.82, width: width * 0.13, height: height * 0.09 };
      if (isMouseOver(locBtn)) { handleTravel(mafiaLocations[i].name); return; }
    }
    // Quick buy/sell row buttons
    const currentContraband = mafiaLocations[currentMafiaLocationIndex].contraband;
    for (let i = 0; i < currentContraband.length; i++) {
      const y = mafiaTableY + mafiaRowHeight * (i + 1);
      const buyBtn = { x: mafiaTableX + mafiaColWidth * 2.5 + (mafiaActionColWidth - (mafiaActionColWidth * 0.45 * 2 + mafiaBtnPadding / 2)) / 2, y: y + mafiaRowHeight / 2 - mafiaRowHeight * 0.4 / 2, width: mafiaActionColWidth * 0.45, height: mafiaRowHeight * 0.4 };
      const sellBtn = { x: buyBtn.x + buyBtn.width + mafiaBtnPadding / 2, y: buyBtn.y, width: buyBtn.width, height: buyBtn.height };
      if (isMouseOver(buyBtn)) { handleBuySellContraband(currentContraband[i], 'buy', 1); return; }
      if (isMouseOver(sellBtn)) { handleBuySellContraband(currentContraband[i], 'sell', 1); return; }
    }
    // Back button
    const btnBack = { x: width / 2 - (width * 0.2) / 2, y: height * 0.9, width: width * 0.2, height: height * 0.07 };
    if (isMouseOver(btnBack)) { setGameState('mainMenu'); return; }
  } else if (currentState === 'gambling') {
    const lotBtn = { x: width * 0.25, y: height * 0.4, width: width * 0.22, height: height * 0.12 };
    const diceBtn = { x: width * 0.53, y: height * 0.4, width: width * 0.22, height: height * 0.12 };
    if (isMouseOver(lotBtn)) { playLottery(); return; }
    if (isMouseOver(diceBtn)) { playDice(); return; }
  } else if (currentState === 'winScreen' || currentState === 'loseScreen') {
    const playAgainBtn = { x: width / 2 - (width * 0.25) / 2, y: height * 0.75, width: width * 0.25, height: height * 0.08 };
    if (isMouseOver(playAgainBtn)) { resetGame(); loop(); }
  }
}

function keyPressed() {
  if (currentState === 'buySellStock') {
    if (keyCode === BACKSPACE) buySellQuantity = buySellQuantity.substring(0, buySellQuantity.length - 1);
    else if (key >= '0' && key <= '9' && buySellQuantity.length < 5) buySellQuantity += key;
  }
}

function isMouseOver(button) {
  return mouseX > button.x && mouseX < button.x + button.width && mouseY > button.y && mouseY < button.y + button.height;
}

// --- State helpers
function setGameState(newState) {
  currentState = newState;
  if (newState === 'mainMenu') gameLocation = "Main Menu";
  else if (newState === 'stockMarket') gameLocation = regions[currentRegionIndex].name;
  else if (newState === 'mafiaWars') { gameLocation = mafiaLocations[currentMafiaLocationIndex].name; lastMafiaPriceUpdateTime = millis(); }
  else if (newState === 'gambling') gameLocation = gambleLocations[gambleLocationIndex];
}

function resetGame() {
  gameMoney = 1000;
  gameDay = 1;
  gameLocation = "Main Menu";
  gameMessages = [];
  initializeStocks();
  playerPortfolio = {};
  initializeMafiaWars();
  setGameState('mainMenu');
  addGameMessage("Game reset. Welcome back!");
  addGameMessage(`Reach $${MONEY_GOAL.toLocaleString()} within ${DAY_LIMIT} days!`, 'info');
}

// --- Game progression
function advanceDay() {
  gameDay++;
  // stocks update
  for (const symbol in stocksData) {
    stocksData[symbol].prevPrice = stocksData[symbol].price;
    let change = stocksData[symbol].price * stocksData[symbol].volatility * random(-1, 1);
    stocksData[symbol].price = parseFloat((stocksData[symbol].price + change).toFixed(2));
    if (stocksData[symbol].price < 1) stocksData[symbol].price = 1;
  }
  // dividends
  let totalDiv = 0;
  for (const sym in playerPortfolio) {
    const owned = playerPortfolio[sym];
    const sd = stocksData[sym];
    if (sd) totalDiv += owned.quantity * sd.dividend;
  }
  if (totalDiv > 0) { gameMoney += totalDiv; addGameMessage(`Received $${totalDiv.toFixed(2)} in dividends!`, 'success'); }
  // reset mafia limits & refresh prices
  mafiaDailyBuys = 0; mafiaDailySells = 0; mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name);
  // reset gambling plays
  gamblePlaysToday = 0;
  addGameMessage(`Advanced to Day ${gameDay}.`);
  if (gameMoney >= MONEY_GOAL) { addGameMessage(`You win!`, 'success'); setGameState('winScreen'); noLoop(); }
  else if (gameDay > DAY_LIMIT) { addGameMessage(`Time's up!`, 'error'); setGameState('loseScreen'); noLoop(); }
}

// --- Stocks trading
function buyStock(symbol, qty) {
  qty = int(qty); if (qty <= 0 || isNaN(qty)) { addGameMessage("Enter a valid quantity.", 'error'); return; }
  const stock = stocksData[symbol];
  const cost = stock.price * qty;
  const owned = playerPortfolio[symbol] ? playerPortfolio[symbol].quantity : 0;
  if (gameMoney < cost) { addGameMessage("Not enough money to buy!", 'error'); return; }
  if (owned + qty > STOCK_MAX_INVENTORY) { addGameMessage(`Cannot hold more than ${STOCK_MAX_INVENTORY} shares.`, 'error'); return; }
  gameMoney -= cost;
  if (!playerPortfolio[symbol]) playerPortfolio[symbol] = { quantity: 0, avgPrice: 0 };
  const oldCost = playerPortfolio[symbol].quantity * playerPortfolio[symbol].avgPrice;
  playerPortfolio[symbol].quantity += qty;
  playerPortfolio[symbol].avgPrice = (oldCost + cost) / playerPortfolio[symbol].quantity;
  addGameMessage(`Bought ${qty} ${symbol} for $${cost.toFixed(2)}.`, 'success');
}

function sellStock(symbol, qty) {
  qty = int(qty); if (qty <= 0 || isNaN(qty)) { addGameMessage("Enter a valid quantity.", 'error'); return; }
  if (!playerPortfolio[symbol] || playerPortfolio[symbol].quantity < qty) { addGameMessage("Not enough shares to sell!", 'error'); return; }
  const stock = stocksData[symbol];
  const revenue = stock.price * qty;
  gameMoney += revenue;
  playerPortfolio[symbol].quantity -= qty;
  if (playerPortfolio[symbol].quantity === 0) delete playerPortfolio[symbol];
  addGameMessage(`Sold ${qty} ${symbol} for $${revenue.toFixed(2)}.`, 'success');
}

// --- Mafia trading
function handleBuySellContraband(item, type, quantity) {
  quantity = int(quantity);
  if (quantity <= 0 || isNaN(quantity)) { addGameMessage("Enter a valid quantity.", 'error'); return; }
  if (type === 'buy') {
    if (mafiaDailyBuys >= MAFIA_MAX_DAILY_TRANSACTIONS) { addGameMessage(`Daily buy limit reached.`, 'error'); return; }
  } else {
    if (mafiaDailySells >= MAFIA_MAX_DAILY_TRANSACTIONS) { addGameMessage(`Daily sell limit reached.`, 'error'); return; }
  }
  const price = mafiaContrabandPrices[item];
  if (!price) { addGameMessage(`Cannot trade ${item} here.`, 'error'); return; }
  const currentInv = mafiaPlayerInventory[item] || 0;
  const cost = price * quantity;
  if (type === 'buy') {
    if (gameMoney < cost) { addGameMessage("Not enough money!", 'error'); return; }
    if (currentInv + quantity > MAFIA_MAX_INVENTORY_PER_ITEM) { addGameMessage(`Max ${MAFIA_MAX_INVENTORY_PER_ITEM} of ${item}.`, 'error'); return; }
    gameMoney -= cost; mafiaPlayerInventory[item] += quantity; mafiaDailyBuys++; addGameMessage(`Bought ${quantity} ${item} for $${cost.toFixed(2)}.`, 'success');
  } else {
    if (currentInv < quantity) { addGameMessage(`Not enough ${item} to sell.`, 'error'); return; }
    const rev = price * quantity; gameMoney += rev; mafiaPlayerInventory[item] -= quantity; mafiaDailySells++; addGameMessage(`Sold ${quantity} ${item} for $${rev.toFixed(2)}.`, 'success');
  }
}

function handleTravel(newLocationName) {
  const loc = mafiaLocations.find(l => l.name === newLocationName); if (!loc) { addGameMessage("Invalid location.", 'error'); return; }
  if (loc.name === mafiaLocations[currentMafiaLocationIndex].name) { addGameMessage("Already here.", 'warning'); return; }
  if (gameMoney < loc.travelCost) { addGameMessage("Not enough money to travel!", 'error'); return; }
  gameMoney -= loc.travelCost; currentMafiaLocationIndex = mafiaLocations.indexOf(loc); mafiaContrabandPrices = generateMafiaPrices(loc.name); addGameMessage(`Traveled to ${loc.name} for $${loc.travelCost}.`, 'info');
}

// --- Gambling actions
function playLottery() {
  if (gamblePlaysToday >= GAMBLE_PLAY_CAP) { addGameMessage("Daily play cap reached.", 'warning'); return; }
  const cost = 50; if (gameMoney < cost) { addGameMessage("Not enough money.", 'error'); return; }
  gameMoney -= cost; gamblePlaysToday++;
  const roll = random();
  if (roll < 0.01) { gameMoney += cost * 25; addGameMessage("Jackpot!", 'success'); }
  else if (roll < 0.12) { gameMoney += cost * 4; addGameMessage("You won!", 'info'); }
  else addGameMessage("No win this time.", 'warning');
}

function playDice() {
  if (gamblePlaysToday >= GAMBLE_PLAY_CAP) { addGameMessage("Daily play cap reached.", 'warning'); return; }
  const cost = 100; if (gameMoney < cost) { addGameMessage("Not enough money.", 'error'); return; }
  gameMoney -= cost; gamblePlaysToday++;
  if (random() < 0.48) { gameMoney += cost * 1.8; addGameMessage("Dice win!", 'success'); }
  else addGameMessage("Dice loss.", 'warning');
}
