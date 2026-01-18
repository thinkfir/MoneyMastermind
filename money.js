// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 MONEY MASTERMIND - COMPLETE GAME CODE EXPLANATION 🎮
// ═══════════════════════════════════════════════════════════════════════════════
//
// WHAT IS THIS GAME?
// ──────────────────
// Money Mastermind is a strategy/trading game where you try to earn $500,000 within
// 100 in-game days. You have THREE ways to make money:
//   1. 📈 STOCK MARKET: Buy low, sell high. Stocks change price daily.
//   2. 🔪 MAFIA WARS: Trade contraband (illegal goods) across different cities.
//   3. 🎰 LOTTERY: Gamble money for high-risk/high-reward payouts.
//
// HOW THE CODE IS ORGANIZED:
// ──────────────────────────
// TOP SECTION (Lines 1-200):
//   - Game state variables (money, day, location, etc.)
//   - Constants (goals, limits, settings)
//   - Animation configuration
//
// MIDDLE SECTION (Lines 200-1500):
//   - p5.js setup() and draw() functions (the game loop)
//   - Mouse/keyboard input handling
//   - Animation functions (buttons, particles, transitions)
//   - Background drawing (gradients, shapes, grids)
//   - Title and button drawing
//
// GAME LOGIC SECTION (Lines 1500-2500):
//   - Stock market: initialization, buying, selling, price updates
//   - Mafia wars: location travel, contraband trading, random events
//   - Lottery: betting, winning/losing
//   - Day advancement: collecting dividends, checking win/lose conditions
//
// DRAWING SECTION (Lines 2500-3100):
//   - Screen displays for each game area
//   - UI elements (wallet, move region, buy/sell)
//   - Win/lose screens
//   - Message display system
//
// KEY VARIABLES YOU NEED TO KNOW:
// ────────────────────────────────
// gameMoney ..................... Player's current cash
// gameDay ....................... Current in-game day (1-100)
// currentGameState .............. Which screen is shown (mainMenu, stockMarket, etc.)
// playerPortfolio ............... Stocks player owns
// mafiaPlayerInventory .......... Contraband player owns
// stocksData .................... All stock prices, volatility, dividends
// mafiaContrabandPrices ......... Prices of illegal items
// gameMessages .................. Popup notifications
//
// THE GAME LOOP (HOW IT WORKS):
// ─────────────────────────────
// 1. setup() runs ONCE when page loads
//    - Creates canvas
//    - Initializes all game data
//    - Shows main menu
//
// 2. draw() runs 60 TIMES PER SECOND
//    - Draws background with animations
//    - Draws current screen based on gameState
//    - Updates particle effects
//    - Displays messages
//
// 3. When player clicks something:
//    - mousePressed() detects the click
//    - Checks which button was clicked
//    - Calls appropriate function (buyStock, playLottery, etc.)
//    - Updates game state
//    - Next draw() shows new screen
//
// 4. When player clicks "Next Day":
//    - advanceDay() is called
//    - Day counter increases
//    - Dividends are paid out
//    - Prices update
//    - Check if player won/lost
//
// BEGINNER TIPS:
// ──────────────
// • Look for comments that say "WHAT:", "WHY:", "HOW:" - these explain each section
// • Variables with CAPITAL_LETTERS are constants (don't change)
// • Variables with lowercase are data that changes during gameplay
// • "const" = never changes,  "let" = can change
// • { } = object/container, [ ] = array/list
// • => is shorthand for a mini function
// • Math: price * quantity = total cost, revenue / quantity = price per unit
//
// KEYBOARD SHORTCUT FOR READING:
// ──────────────────────────────
// Use Ctrl+F to search for:
//   "function " to find all functions
//   "const " to find all constants
//   "WHAT:" to find explanations
//   "for (" to find loops
//
// ═══════════════════════════════════════════════════════════════════════════════

// Money Mastermind core loop
// - p5.js drives rendering via setup()/draw(); anime.js handles micro-animations
// - Game is a finite state machine: main menu → feature screens (mafia, stocks, lottery, wallet)
// - Three mini-systems share the same currency and day counter; reaching MONEY_GOAL before DAY_LIMIT wins
// - Messages and animations are centralized to keep UI feedback consistent across states

// Game state variables
let gameMoney = 1000;
let gameDay = 1;
let gameLocation = "Main Menu"; // Start at the main menu
let gameMessages = []; // Each message will be {text: "...", type: "...", timestamp: millis()}

// Game state management
let currentGameState = 'mainMenu'; // 'mainMenu', 'mafiaWars', 'stockMarket', 'lottery', 'wallet', 'moveRegion', 'buySellStock', 'winScreen', 'loseScreen'
let selectedStockSymbol = null; // Used for the 'buySellStock' state
let buySellQuantity = ""; // String for simulated text input quantity (for stocks)

// Variables for main menu buttons (their positions and sizes)
// Each button object stores: x, y (top-left corner), width, height, text label, and color
let btnMafiaWars, btnStockMarket, btnLottery, btnNewGame;

// Variables for Canvas-drawn game title
// Stores the title's text, size, position, and color for rendering with glow effects
let gameCanvasTitle;

// Constants for fading messages
// These control how long game messages appear on screen
const MESSAGE_FADE_IN_DURATION = 500;   // Time for message to become visible (in ms)
const MESSAGE_HOLD_DURATION = 2000;    // Time message stays fully visible (in ms)
const MESSAGE_FADE_OUT_DURATION = 1500; // Time for message to fade away (in ms)
// Total duration combines all three phases: fade in + hold + fade out
const MESSAGE_TOTAL_DURATION = MESSAGE_FADE_IN_DURATION + MESSAGE_HOLD_DURATION + MESSAGE_FADE_OUT_DURATION;

const MESSAGE_MAX_DISPLAY_HEIGHT_FACTOR = 0.05; // Percentage of canvas height for message area
const MESSAGE_LINE_HEIGHT_FACTOR = 0.03; // Percentage of canvas height for each message line

// Constant for blinking effect (not currently used but kept for reference)
const BLINK_INTERVAL = 700; // milliseconds for one phase (e.g., 700ms on, 700ms off)

// --- Stock Market Variables ---
// Regions are geographic areas with different stocks available
// Each region has a name and an array of stock symbols players can trade
const regions = [
    { name: "Global Exchange", stocks: ["AURAX", "CYBRP", "ENRGY", "FINCO", "HYGEN"] },
    { name: "Tech Innovations Hub", stocks: ["QUANT", "NEURO", "DATAM", "ROBOS", "SPACEX"] },
    { name: "Emerging Markets League", stocks: ["AGROX", "INFRA", "MINEF", "TEXLA", "PHARM"] },
    { name: "European Financial Core", stocks: ["LUXOR", "PRISM", "VANGU", "ALPHO", "ZETAO"] },
    { name: "Asian Growth Nexus", stocks: ["KRYPT", "ZENIT", "DYNMC", "NEXUS", "OMEGA"] },
    { name: "Latin American Ventures", stocks: ["SOLAR", "RAINF", "HARVST", "TRADE", "BRIGHT"] }
];
let currentRegionIndex = 0; // Tracks which region the player is currently viewing (0 = Global Exchange)

// Stores stock data: { symbol: { price: float, prevPrice: float, volatility: float, history: [] } }
// Each stock has current/previous price, volatility (how much it can change), and price history
let stocksData = {};
// Player's portfolio: { symbol: { quantity: int, avgPrice: float } }
// Tracks how many shares of each stock the player owns and at what average price
let playerPortfolio = {};

// Max inventory for stocks
// Players can hold at most 30 shares of any single stock to prevent hoarding
const STOCK_MAX_INVENTORY = 30;

// Buttons specific to stock market screen
let btnNextDay, btnMoveRegion, btnWallet; // UI controls for stock market interactions
let stockTiles = []; // Array of objects for clickable stock tiles (one tile per stock symbol)

// Buttons for navigation across screens
let btnBackToStockMarket; // Return to stock market from buy/sell or wallet screen
let btnBackToMain; // Declared globally to return to main menu from any screen

// --- Mafia Wars Variables ---
// Possible contraband types available across all locations
// Each location only has 3 of these 7 types available at any time
const allContrabandTypes = ['Bliss Dust', 'Shadow Bloom', 'Viper Venom', 'Crimson Haze', 'Starlight Shard', 'Iron Will Dust', 'Ocean Echo'];

// Mafia locations available for travel
// Each location has different contraband types and a travel cost
// Higher travel cost = higher volatility for prices but more profit potential
const mafiaLocations = [
    { name: 'New York', contraband: ['Crimson Haze', 'Shadow Bloom', 'Viper Venom'], travelCost: 500 },
    { name: 'Los Angeles', contraband: ['Starlight Shard', 'Viper Venom', 'Bliss Dust'], travelCost: 450 },
    { name: 'Chicago', contraband: ['Bliss Dust', 'Iron Will Dust', 'Shadow Bloom'], travelCost: 300 },
    { name: 'Miami', contraband: ['Bliss Dust', 'Ocean Echo', 'Crimson Haze'], travelCost: 400 },
    { name: 'Houston', contraband: ['Shadow Bloom', 'Crimson Haze', 'Viper Venom'], travelCost: 250 },
    { name: 'Denver', contraband: ['Starlight Shard', 'Iron Will Dust', 'Bliss Dust'], travelCost: 200 }
];

let currentMafiaLocationIndex = 0; // Will be set to Denver's index in initializeMafiaWars
let mafiaContrabandPrices = {}; // { 'Bliss Dust': 20, 'Shadow Bloom': 2000, ... } - current prices per location
let mafiaPlayerInventory = {}; // { 'Bliss Dust': 0, 'Shadow Bloom': 5, ... } - player's contraband quantities
let selectedContraband = null; // Currently selected contraband for buy/sell operations
let lastMafiaPriceUpdateTime = 0; // Timestamp for last Mafia price update
const MAFIA_PRICE_UPDATE_INTERVAL = 15000; // Refresh prices every 15 seconds (simulating real-time trading)

// Max inventory for contraband
// Players can hold at most 30 units of each contraband type
const MAFIA_MAX_INVENTORY_PER_ITEM = 30;

// Min and max travel costs for volatility calculation (extracted from the mafiaLocations array)
let MIN_MAFIA_TRAVEL_COST;
let MAX_MAFIA_TRAVEL_COST;


// Global variables for Mafia Wars table layout (CONSISTENTLY DEFINED HERE)
let mafiaTableX, mafiaTableY, mafiaColWidth, mafiaActionColWidth, mafiaRowHeight, mafiaBtnPadding;

// Mafia Daily Transaction Limits
// Players can only buy and sell a limited number of times per day to create strategy
const MAFIA_MAX_DAILY_TRANSACTIONS = 3; // Max 3 transactions (buys and sells combined) per day
let mafiaDailyBuys = 0; // Tracks number of buy transactions today
let mafiaDailySells = 0; // Tracks number of sell transactions today

// --- Lottery Variables ---
// Three lottery locations with different risk/reward profiles
// Higher travel cost to location = better odds and higher payouts
const lotteryLocations = [
    // Higher travel cost -> higher chance to win and higher payouts
    { name: 'Boardwalk', minBet: 50, maxBet: 5000, odds: 0.30, travelCost: 0 },
    { name: 'OldTown', minBet: 100, maxBet: 10000, odds: 0.40, travelCost: 500 },
    { name: 'Neon Strip', minBet: 200, maxBet: 20000, odds: 0.50, travelCost: 2000 }
];
let currentLotteryLocationIndex = 0; // Tracks which lottery location player is at (0 = Boardwalk)
let lotteryBetAmount = ""; // Player's current bet amount (string for text input)
let lotteryLastResult = null; // { won: bool, amount: number, message: string } - last lottery result
let lotteryLastResultTime = 0; // When the last result was generated
const LOTTERY_RESULT_DISPLAY_DURATION = 3000; // Show lottery result for 3 seconds

// Lottery buttons
let btnLotteryLocation = []; // Array of location buttons
let btnLotteryBet; // Button to place bet
let btnLotteryBackToMain; // Back button

// Game Goal and Day Limit
// Player wins by reaching the money goal within the day limit
const MONEY_GOAL = 500000; // Player needs to earn $500,000 to win
const DAY_LIMIT = 100;    // Player has 100 in-game days to reach the goal

// --- Global UI Elements ---
let btnAdvanceDayGlobal; // Global button for advancing day

// --- Anime.js Animation Variables ---
// These track active animations for title, buttons, money changes, and particles
let titleGlowTimeline; // Timeline for the pulsing title glow effect
let buttonHoverTimeline; // Timeline for button hover animations
let moneyChangeTimeline; // Timeline for money display animations
let transitionTimeline; // Timeline for screen transitions
let particleAnimations = []; // Array of active particle effects on screen

// Button animation state tracking
let buttonAnimationStates = {}; // Tracks animation state (scale, shadow) for each button
let screenTransitionAlpha = 0; // Controls fade in/out opacity for screen transitions

// Animation configuration
// Defines duration and easing functions for different animation types
const ANIMATION_CONFIG = {
    buttonHover: {
        duration: 400, // Time for button hover effect
        easing: 'easeInOutQuad' // Smooth ease in and out
    },
    buttonClick: {
        duration: 600, // Time for button click response
        easing: 'easeOutElastic(1, .5)' // Bouncy elastic effect
    },
    titleGlow: {
        duration: 2000, // Time for full glow cycle
        easing: 'easeInOutSine' // Smooth wave-like effect
    },
    moneyChange: {
        duration: 800, // Time for money number animation
        easing: 'easeOutElastic(1, .6)' // Elastic bounce effect
    },
    transition: {
        duration: 600, // Time for screen transitions
        easing: 'easeInOutQuart' // Smooth cubic ease
    },
    particleBurst: {
        duration: 1200, // Time for particle effects to fade
        easing: 'easeOutCubic' // Decelerate particles
    },
    screenEntry: {
        duration: 700, // Time for new screen to appear
        easing: 'easeOutCubic' // Smooth entry
    },
    elementSlide: {
        duration: 500, // Time for sliding elements
        easing: 'easeOutQuad' // Smooth deceleration
    }
};

// p5.js setup function - runs once when the sketch starts
// This initializes the canvas, all game data, and displays the main menu
function setup() {
    // Create a canvas that fills the entire browser window
    const canvas = createCanvas(windowWidth, windowHeight);
    // Attach the p5 canvas to the HTML container div with id="game-container"
    canvas.parent('game-container');

    // Initialize Min/Max Mafia Travel Costs for price volatility calculations
    // Extract all travel costs from mafiaLocations and find the smallest and largest
    MIN_MAFIA_TRAVEL_COST = Math.min(...mafiaLocations.map(loc => loc.travelCost));
    MAX_MAFIA_TRAVEL_COST = Math.max(...mafiaLocations.map(loc => loc.travelCost));

    // Initialize stock market data (prices, volatility, history for all stocks)
    initializeStocks();

    // Initialize Mafia Wars (locations, prices, player inventory, daily limits)
    initializeMafiaWars();

    // Initialize Lottery (locations, current location, bet amount, result)
    initializeLottery();

    // Display welcome messages to the player
    addGameMessage("Welcome to Money Mastermind!");
    addGameMessage(`Reach $${MONEY_GOAL.toLocaleString()} within ${DAY_LIMIT} days!`, 'info');

    // Setup all visual elements that are drawn on the canvas
    setupCanvasTitle(); // Position and configure the game title with glow effects
    initializeTitleGlow(); // Start the pulsing title glow animation
    setupMainMenuButtons(); // Calculate positions for main menu buttons
    setupStockMarketButtons(); // Calculate positions for stock market buttons
    setupLotteryButtons(); // Calculate positions for lottery buttons
    setupGlobalUIButtons(); // Setup universal buttons like "Next Day"
    setupMafiaWarsLayoutConstants(); // Calculate positions for Mafia Wars table layout
    animateStateTransition(); // Play screen entry animation

    // Set initial game state to main menu (display the menu)
    setGameState(currentGameState);
}

// p5.js draw function - runs continuously after setup() (60 times per second)
// This is the game's main loop that renders everything to the screen
function draw() {
    // --- FUTURISTIC COSMIC THEME ---
    // Create a gradient background that goes from dark blue at top to darker blue at bottom
    for (let y = 0; y < height; y += 2) {
        // Map y position (0 to height) to a percentage (0 to 1)
        let inter = map(y, 0, height, 0, 1);
        // Interpolate color: blend the top color with the bottom color based on y position
        let c = lerpColor(color(5, 8, 25), color(15, 20, 40), inter);
        // Draw a horizontal line with the blended color
        stroke(c);
        line(0, y, width, y);
    }
    noStroke(); // Stop drawing strokes after gradient is complete

    // Animated scanlines - horizontal lines that flicker like old TV static
    // Opacity varies based on frameCount so they pulse/flicker
    stroke(0, 255, 100, 15 + 15 * sin(frameCount * 0.02));
    for (let y = 0; y < height; y += 4) {
        line(0, y, width, y); // Draw horizontal scanline
    }
    noStroke();

    // Subtle grid overlay - vertical and horizontal lines for cyber feel
    stroke(0, 150, 100, 8); // Semi-transparent green lines
    strokeWeight(0.5); // Very thin lines
    // Vertical lines
    for (let x = 0; x < width; x += 80) {
        line(x, 0, x, height);
    }
    // Horizontal lines
    for (let y = 0; y < height; y += 80) {
        line(0, y, width, y);
    }
    noStroke();

    // Always draw the game title at the top of every screen
    drawCanvasTitle();

    // Draw any active particle effects (burst effects from button clicks, money changes, etc)
    drawParticleEffects();

    // Draw different content based on current game state
    // Each state has its own drawing function
    if (currentGameState === 'mainMenu') {
        drawMainMenu(); // Show main menu with 4 buttons
    } else if (currentGameState === 'mafiaWars') {
        drawMafiaWarsScreen(); // Show mafia contraband trading table
    } else if (currentGameState === 'stockMarket') {
        drawStockMarketScreen(); // Show stock tiles and market info
    } else if (currentGameState === 'lottery') {
        drawLotteryScreen(); // Show lottery locations and betting interface
    }
    else if (currentGameState === 'wallet') {
        drawWalletScreen(); // Show player portfolio details
    } else if (currentGameState === 'moveRegion') {
        drawMoveRegionScreen(); // Show region selection for stock market
    } else if (currentGameState === 'buySellStock') {
        drawBuySellStockScreen(selectedStockSymbol); // Show buy/sell interface for selected stock
    } else if (currentGameState === 'winScreen') {
        drawWinScreen(); // Show victory screen
    } else if (currentGameState === 'loseScreen') {
        drawLoseScreen(); // Show defeat screen
    }

    // Always draw game info (money, day, goal) and messages on top, UNLESS on win/lose screen
    if (currentGameState !== 'winScreen' && currentGameState !== 'loseScreen') {
        drawGameInfo(); // Display money, day count, and progress bar at left
        drawFadingMessages(); // Display recent game messages with fade effects on right
    }

    // Special case: draw illegal wallet screen if applicable
    if (currentGameState === 'illegalWallet') {
        drawIllegalWalletScreen();
    }
}

// Resize canvas when browser window changes size
function windowResized() {
    // Resize the p5 canvas to match the new window dimensions
    resizeCanvas(windowWidth, windowHeight);
    
    // Recalculate positions for ALL drawn elements since canvas size changed
    // This ensures everything stays properly positioned and sized
    setupCanvasTitle(); // Recalculate title position
    setupMainMenuButtons(); // Recalculate main menu button positions
    setupStockMarketButtons(); // Recalculate stock market button positions
    setupLotteryButtons(); // Recalculate lottery button positions
    setupGlobalUIButtons(); // Recalculate universal button positions (like "Next Day")
    setupMafiaWarsLayoutConstants(); // Recalculate mafia table positions and dimensions
}

// Handle mouse clicks - p5.js calls this automatically when user clicks
function mousePressed() {
    // Log click position and current state for debugging
    console.log('Mouse pressed at:', mouseX, mouseY, 'Current state:', currentGameState);
    
    // Check which game state we're in and handle button clicks accordingly
    if (currentGameState === 'mainMenu') {
        // In main menu: check if any of the 4 main buttons were clicked
        console.log('Checking main menu buttons...');
        console.log('btnMafiaWars:', btnMafiaWars);
        console.log('btnStockMarket:', btnStockMarket);
        console.log('btnLottery:', btnLottery);
        
        // Check if player clicked Mafia Wars button
        if (isMouseOver(btnMafiaWars)) {
            console.log('Clicked Mafia Wars!');
            animateButtonClick(btnMafiaWars); // Play click animation
            setGameState('mafiaWars'); // Switch to mafia wars screen
        } 
        // Check if player clicked Stock Market button
        else if (isMouseOver(btnStockMarket)) {
            console.log('Clicked Stock Market!');
            animateButtonClick(btnStockMarket);
            setGameState('stockMarket'); // Switch to stock market screen
        } 
        // Check if player clicked Lottery button
        else if (isMouseOver(btnLottery)) {
            console.log('Clicked Lottery!');
            animateButtonClick(btnLottery);
            setGameState('lottery'); // Switch to lottery screen
        }
        // Check if player clicked New Game button
        else if (isMouseOver(btnNewGame)) {
            console.log('Clicked New Game!');
            animateButtonClick(btnNewGame);
            resetGame(); // Reset all game data and return to main menu
        }
    } else if (currentGameState === 'stockMarket') {
        if (isMouseOver(btnNextDay)) {
            animateButtonClick(btnNextDay);
            advanceDay();
        } else if (isMouseOver(btnMoveRegion)) {
            animateButtonClick(btnMoveRegion);
            setGameState('moveRegion');
        } else if (isMouseOver(btnWallet)) {
            animateButtonClick(btnWallet);
            setGameState('wallet');
        } else if (isMouseOver(btnBackToMain)) {
            animateButtonClick(btnBackToMain);
            setGameState('mainMenu');
        } else {
            // Check for stock tile clicks
            for (let i = 0; i < stockTiles.length; i++) {
                if (isMouseOver(stockTiles[i])) {
                    animateButtonClick(stockTiles[i]);
                    selectedStockSymbol = stockTiles[i].symbol;
                    setGameState('buySellStock');
                    buySellQuantity = ""; // Clear quantity input
                    break;
                }
            }
        }
    } else if (currentGameState === 'illegalWallet') {
        const btnBack = { x: width * 0.02, y: height * 0.92, width: width * 0.18, height: height * 0.06 };
        if (isMouseOver(btnBack)) {
            animateButtonClick(btnBack);
            setGameState('mafiaWars');
        }
    } else if (currentGameState === 'wallet') {
        if (isMouseOver(btnBackToStockMarket)) {
            animateButtonClick(btnBackToStockMarket);
            setGameState('stockMarket');
        }
    } else if (currentGameState === 'moveRegion') {
        // Handle region selection buttons
        for (let i = 0; i < regions.length; i++) {
            const regionBtn = {
                x: width / 2 - (width * 0.45) / 2,
                y: height * 0.25 + i * (height * 0.08 + height * 0.02),
                width: width * 0.45,
                height: height * 0.08,
            };
            if (isMouseOver(regionBtn)) {
                animateButtonClick(regionBtn);
                if (i !== currentRegionIndex) {
                    changeRegion(i);
                } else {
                    addGameMessage(`Already in ${regions[i].name}.`, 'warning');
                }
                break;
            }
        }
        if (isMouseOver(btnBackToStockMarket)) {
            animateButtonClick(btnBackToStockMarket);
            setGameState('stockMarket');
        }
    } else if (currentGameState === 'buySellStock') {
        const btnBuy = { x: width * 0.35, y: height * 0.7, width: width * 0.1, height: height * 0.06 };
        const btnSell = { x: width * 0.55, y: height * 0.7, width: width * 0.1, height: height * 0.06 };
        const btnMaxBuy = { x: btnBuy.x - (width * 0.07 + 10), y: height * 0.63, width: width * 0.07, height: height * 0.04 };
        const btnMaxSell = { x: btnSell.x + btnSell.width + 10, y: height * 0.63, width: width * 0.07, height: height * 0.04 };

        if (isMouseOver(btnBuy)) {
            animateButtonClick(btnBuy);
            buyStock(selectedStockSymbol, int(buySellQuantity));
            buySellQuantity = "";
        } else if (isMouseOver(btnSell)) {
            animateButtonClick(btnSell);
            sellStock(selectedStockSymbol, int(buySellQuantity));
            buySellQuantity = "";
        } else if (isMouseOver(btnBackToStockMarket)) {
            animateButtonClick(btnBackToStockMarket);
            setGameState('stockMarket');
        } else if (isMouseOver(btnMaxSell)) {
            animateButtonClick(btnMaxSell);
            buySellQuantity = (playerPortfolio[selectedStockSymbol] ? playerPortfolio[selectedStockSymbol].quantity : 0).toString();
        } else if (isMouseOver(btnMaxBuy)) {
            animateButtonClick(btnMaxBuy);
            const stockPrice = stocksData[selectedStockSymbol].price;
            if (stockPrice > 0) {
                buySellQuantity = Math.floor(gameMoney / stockPrice).toString();
            } else {
                buySellQuantity = "0";
            }
        }
    } else if (currentGameState === 'mafiaWars') {
        // GLOBAL NEXT DAY BUTTON CHECK (now located consistently on the right side below messages)
        if (isMouseOver(btnAdvanceDayGlobal)) {
            animateButtonClick(btnAdvanceDayGlobal);
            advanceDay();
            return;
        }

        // Mafia Wars button interactions (Back to Main Menu)
        const btnBackToMainMafia = { x: width / 2 - (width * 0.2) / 2, y: height * 0.92, width: width * 0.2, height: height * 0.07 };
        if (isMouseOver(btnBackToMainMafia)) {
            animateButtonClick(btnBackToMainMafia);
            setGameState('mainMenu');
            return;
        }

        // Location buttons (now on a single line)
        const locBtnWidth = width * 0.13;
        const locBtnHeight = height * 0.08;
        const locGapX = width * 0.015;
        const locY = height * 0.82;

        // Calculate start X to center all 6 buttons on one line
        const totalLocButtonsWidth = mafiaLocations.length * locBtnWidth + (mafiaLocations.length - 1) * locGapX;
        const locStartX = width / 2 - totalLocButtonsWidth / 2;

        for (let i = 0; i < mafiaLocations.length; i++) {
            const loc = mafiaLocations[i];
            const btnX = locStartX + i * (locBtnWidth + locGapX);
            const btnY = locY;

            const btnRect = { x: btnX, y: btnY, width: locBtnWidth, height: locBtnHeight };
            
            if (isMouseOver(btnRect)) {
                animateButtonClick(btnRect);
                handleTravel(loc.name);
                return;
            }
        }

        // Buy/Sell buttons (quick buy/sell 1 for each row)
        const buyBtnWidth = mafiaActionColWidth * 0.45;
        const buyBtnHeight = mafiaRowHeight * 0.4;
        const btnXOffset = mafiaTableX + mafiaColWidth * 2.5 + (mafiaActionColWidth - (buyBtnWidth * 2 + mafiaBtnPadding / 2)) / 2;

        const currentContrabandTypes = mafiaLocations[currentMafiaLocationIndex].contraband;
        for (let i = 0; i < currentContrabandTypes.length; i++) {
            const item = currentContrabandTypes[i];
            const yPos = mafiaTableY + mafiaRowHeight * (i + 1);

            const buyBtn = {
                x: btnXOffset,
                y: yPos + mafiaRowHeight / 2 - buyBtnHeight / 2,
                width: buyBtnWidth,
                height: buyBtnHeight
            };
            const sellBtn = {
                x: btnXOffset + buyBtnWidth + mafiaBtnPadding / 2,
                y: yPos + mafiaRowHeight / 2 - buyBtnHeight / 2,
                width: buyBtnWidth,
                height: buyBtnHeight
            };

            if (isMouseOver(buyBtn)) {
                animateButtonClick(buyBtn);
                selectedContraband = item;
                handleBuySellContraband(item, 'buy', 1);
                selectedContraband = null;
                return;
            } else if (isMouseOver(sellBtn)) {
                animateButtonClick(sellBtn);
                selectedContraband = item;
                handleBuySellContraband(item, 'sell', 1);
                selectedContraband = null;
                return;
            }
        }

        // Removed all explicit quantity buy/sell buttons and input field interaction
    } else if (currentGameState === 'lottery') {
        // Global next day button
        if (isMouseOver(btnAdvanceDayGlobal)) {
            animateButtonClick(btnAdvanceDayGlobal);
            advanceDay();
            return;
        }

        // Location selection buttons (charge travel cost when changing locations)
        for (let btn of btnLotteryLocation) {
            if (isMouseOver(btn)) {
                animateButtonClick(btn);
                if (btn.index !== currentLotteryLocationIndex) {
                    const newLoc = lotteryLocations[btn.index];
                    const cost = newLoc.travelCost || 0;
                    if (cost > 0) {
                        if (gameMoney < cost) {
                            addGameMessage(`Not enough money to travel. Need $${cost.toLocaleString()}.`, 'warning');
                            return;
                        }
                        gameMoney -= cost;
                        addGameMessage(`Traveled to ${newLoc.name} for $${cost.toLocaleString()}.`, 'info');
                    }
                }
                currentLotteryLocationIndex = btn.index;
                return;
            }
        }

        // Bet button
        if (isMouseOver(btnLotteryBet)) {
            animateButtonClick(btnLotteryBet);
            playLottery(lotteryBetAmount);
            return;
        }

        // Back to main menu
        if (isMouseOver(btnLotteryBackToMain)) {
            animateButtonClick(btnLotteryBackToMain);
            setGameState('mainMenu');
            return;
        }
    } else if (currentGameState === 'winScreen' || currentGameState === 'loseScreen') {
        const playAgainBtn = {
            x: width / 2 - (width * 0.25) / 2,
            y: height * 0.75,
            width: width * 0.25,
            height: height * 0.08,
            text: 'Play Again',
            color: color(50, 180, 50)
        };
        if (isMouseOver(playAgainBtn)) {
            resetGame();
            loop(); // Resume draw loop
        }
    }
}

function keyPressed() {
    // Stock buy/sell quantity input (remains as this is for stock market)
    if (currentGameState === 'buySellStock') {
        if (keyCode === BACKSPACE) {
            buySellQuantity = buySellQuantity.substring(0, buySellQuantity.length - 1);
        } else if (key >= '0' && key <= '9' && buySellQuantity.length < 5) { // Limit input length
            buySellQuantity += key;
        }
    }
    // Lottery bet amount input
    else if (currentGameState === 'lottery') {
        if (keyCode === BACKSPACE) {
            lotteryBetAmount = lotteryBetAmount.substring(0, lotteryBetAmount.length - 1);
        } else if (key >= '0' && key <= '9' && lotteryBetAmount.length < 6) { // Limit input length
            lotteryBetAmount += key;
        }
    }
    // Removed Mafia Wars explicit quantity input handling
}

// Helper function to check if mouse position is over a button rectangle
// This is used to detect clicks on buttons since p5 doesn't have native button objects
function isMouseOver(button) {
    // Check if mouseX is within the button's left and right edges
    // AND if mouseY is within the button's top and bottom edges
    // If both conditions are true, the mouse is over the button
    return mouseX > button.x && mouseX < button.x + button.width &&
           mouseY > button.y && mouseY < button.y + button.height;
}

// Mafia input focus helper - now unused for the main UI but kept for general reference if re-introduced
let mafiaInputFocused = false;

// Handle mouse release - called when player releases a mouse button
// Often used for drag-and-drop or click completion, though this game uses mousePressed instead
function mouseReleased() {
    // This function is called after a mouse click completes
    // We don't need it for simple button clicks, so it's left empty
}

// --- Animation Functions using Anime.js ---

// Create glowing effect for title using anime.js
// This makes the title pulse with a breathing glow effect
function initializeTitleGlow() {
    // If an old timeline is running, pause it to start fresh
    if (titleGlowTimeline) titleGlowTimeline.pause();
    
    // Create a new timeline that loops continuously
    titleGlowTimeline = anime.timeline({
        autoplay: true, // Start animation immediately
        loop: true // Loop the animation forever
    });
    
    // Add animation: increase shadow strength from 4 to 8 over 1 second
    titleGlowTimeline.add({
        targets: { shadowStrength: 4 }, // Start at 4
        shadowStrength: 8, // End at 8
        duration: 1000, // Takes 1 second
        easing: 'easeInOutSine' // Smooth wave-like motion
    })
    // Add animation: decrease shadow strength from 8 back to 4 over 1 second
    // The '-=1000' means this starts at the same time as the previous animation
    .add({
        targets: { shadowStrength: 8 }, // Start at 8
        shadowStrength: 4, // End at 4
        duration: 1000,
        easing: 'easeInOutSine'
    }, '-=1000');
}

// Animate button click effect with scale and glow
// Creates a satisfying bounce and particle burst when player clicks
function animateButtonClick(button) {
    // Create a unique ID for this button based on its position
    // This allows us to track animation state for each button separately
    const buttonId = JSON.stringify({x: button.x, y: button.y});
    
    // If this button hasn't been animated before, create its animation state object
    if (!buttonAnimationStates[buttonId]) {
        buttonAnimationStates[buttonId] = { scale: 1, shadowBlur: 8 };
    }
    
    // Get the animation state for this button
    const state = buttonAnimationStates[buttonId];
    
    // Reset animation state to starting values
    anime.set(state, { scale: 1, shadowBlur: 8 });
    
    // Animate the button: bounce it with scale and add glowing shadow
    // Sequence: 1 -> 0.95 (squeeze) -> 1.05 (expand) -> 1 (settle)
    anime({
        targets: state,
        scale: [1, 0.95, 1.05, 1], // Bounce sequence for tactile feel
        shadowBlur: [8, 25, 15, 8], // Shadow pulses with the bounce
        duration: ANIMATION_CONFIG.buttonClick.duration, // 600ms
        easing: ANIMATION_CONFIG.buttonClick.easing // Elastic bounce
    });
    
    // Create particle burst effect: 8 particles spray outward from button center
    for (let i = 0; i < 8; i++) {
        // Calculate angle for this particle (divide 360° into 8 directions)
        const angle = (Math.PI * 2 * i) / 8;
        // Calculate velocity (speed and direction) for this particle
        const velocity = {
            x: Math.cos(angle) * random(3, 8), // Horizontal component
            y: Math.sin(angle) * random(3, 8)  // Vertical component
        };
        
        // Add particle to animation queue
        particleAnimations.push({
            x: button.x + button.width / 2, // Start at button center
            y: button.y + button.height / 2,
            vx: velocity.x, // Horizontal velocity
            vy: velocity.y, // Vertical velocity
            life: 1, // 1 = fully visible, 0 = invisible
            color: [100, 255, 150], // Neon green color
            created: millis() // Track when particle was created
        });
    }
}

// Get button animation scale factor - used to draw button at correct size
// Returns the current scale value from the button's animation state
function getButtonAnimationScale(button) {
    // Create unique ID for this button
    const buttonId = JSON.stringify({x: button.x, y: button.y});
    // Return scale value if it exists, otherwise return 1 (no scaling)
    return buttonAnimationStates[buttonId]?.scale || 1;
}

// Get button animation shadow blur - used to draw button with animated glow
// Returns the current shadow blur from the button's animation state
function getButtonAnimationShadow(button) {
    // Create unique ID for this button
    const buttonId = JSON.stringify({x: button.x, y: button.y});
    // Return shadow blur value if it exists, otherwise return 8 (default blur)
    return buttonAnimationStates[buttonId]?.shadowBlur || 8;
}

// Animate money change with particle effect
// Shows visual feedback when player's money changes (gain or loss)
function animateMoneyChange(newMoney, oldMoney, x = width * 0.02, y = height * 0.1) {
    // Calculate the difference between new and old money
    const diff = newMoney - oldMoney;
    // Determine if this is a gain (positive) or loss (negative)
    const isGain = diff > 0;
    
    // Create larger particle burst effect: 10 particles spray outward
    for (let i = 0; i < 10; i++) {
        // Random angle for particle direction
        const angle = random(0, Math.PI * 2);
        // Random speed for particle (faster = further away)
        const speed = random(3, 10);
        // Calculate velocity components
        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        
        // Add particle to animation queue
        particleAnimations.push({
            x: x, // Start at money display position
            y: y,
            vx: velocity.x,
            vy: velocity.y,
            life: 1, // Start fully visible
            // Use green for gains, red for losses
            color: isGain ? [100, 255, 100] : [255, 100, 100],
            created: millis()
        });
    }
    
    // Animate the money text with a pulse effect
    anime({
        targets: { scale: 1 },
        scale: [1, 1.3, 1], // Pulse up to 1.3x size then back to normal
        duration: ANIMATION_CONFIG.moneyChange.duration, // 800ms
        easing: ANIMATION_CONFIG.moneyChange.easing // Elastic bounce
    });
}

// Screen transition fade in/out
// Makes new screens appear smoothly with a fade effect
function animateScreenEntry() {
    // Set starting opacity to 0 (invisible)
    anime.set({ screenAlpha: 0 }, { screenAlpha: 0 });
    // Animate from 0 to 1 (invisible to visible)
    anime({
        targets: { screenAlpha: 0 },
        screenAlpha: 1, // Fade to fully visible
        duration: ANIMATION_CONFIG.screenEntry.duration, // 700ms
        easing: ANIMATION_CONFIG.screenEntry.easing // Smooth cubic ease
    });
}

// Animate state transitions
// Called when switching between game screens
function animateStateTransition() {
    // Pause any existing transition animation
    if (transitionTimeline) transitionTimeline.pause();
    
    // Play the screen entry animation
    animateScreenEntry();
    
    // Create a transition timeline for general fade effect
    transitionTimeline = anime({
        targets: { opacity: 0.3 },
        opacity: 1, // Fade from 30% to 100% opacity
        duration: ANIMATION_CONFIG.transition.duration, // 600ms
        easing: ANIMATION_CONFIG.transition.easing // Smooth ease in/out
    });
}

// Draw particle effects
// Renders and updates all active particles, removing them when they fade out
function drawParticleEffects() {
    // Get current time in milliseconds
    const currentTime = millis();
    
    // Loop through all particles and draw them
    particleAnimations = particleAnimations.filter(p => {
        // Calculate how old this particle is
        const age = currentTime - p.created;
        // Calculate how visible this particle is (1 = fully visible, 0 = invisible)
        // Particles fade out over PARTICLE_BURST_DURATION milliseconds
        const life = 1 - (age / ANIMATION_CONFIG.particleBurst.duration);
        
        // If particle still has some visibility, draw it
        if (life > 0) {
            // Set particle color with current transparency
            fill(p.color[0], p.color[1], p.color[2], life * 255);
            noStroke(); // Don't draw outline
            // Draw small circle at particle's current position
            // Position is updated by velocity: moves based on vx and vy
            ellipse(p.x + p.vx * (1 - life), p.y + p.vy * (1 - life), 4);
            return true; // Keep this particle
        }
        return false; // Remove particle (it's fully faded out)
    });
}

// --- Animated Background Functions ---

// Draw animated background for subsections
// Creates a dynamic gradient with moving shapes
function drawAnimatedBackground(baseColor, accentColor) {
    // Animated gradient background
    // Loop through vertical slices of the screen
    for (let y = 0; y < height; y += 3) {
        // Calculate position as percentage (0 to 1) from top to bottom
        let inter = map(y, 0, height, 0, 1);
        // Animate color by adding sine wave oscillation to each color channel
        let r = red(baseColor) + (red(accentColor) - red(baseColor)) * sin(frameCount * 0.005 + y * 0.01) * 0.3;
        let g = green(baseColor) + (green(accentColor) - green(baseColor)) * sin(frameCount * 0.007 + y * 0.02) * 0.3;
        let b = blue(baseColor) + (blue(accentColor) - blue(baseColor)) * sin(frameCount * 0.006 + y * 0.015) * 0.3;
        // Draw horizontal line at this y position with animated color
        stroke(r, g, b, 20); // Semi-transparent
        line(0, y, width, y);
    }
    noStroke();
    
    // Draw floating geometric shapes on top
    drawFloatingShapes();
}

// Draw floating geometric shapes that move around the screen
// Creates rotating hexagons and orbiting dots for visual interest
function drawFloatingShapes() {
    // Get current time as a fraction (speeds up animation)
    const time = frameCount * 0.005;
    
    // Draw multiple rotating hexagons
    for (let i = 0; i < 5; i++) {
        // Position hexagons horizontally across screen, bobbing vertically
        const x = width * (0.2 + i * 0.15 + sin(time * (0.5 + i * 0.1)) * 0.05);
        const y = height * (0.3 + cos(time * (0.4 + i * 0.08) + i) * 0.15);
        // Size of hexagon, pulsing over time
        const size = 30 + sin(time + i) * 15;
        // Rotation angle (spins continuously)
        const rotation = time * (1 + i * 0.2);
        
        push(); // Save current drawing state
        translate(x, y); // Move origin to hexagon position
        rotate(rotation); // Rotate around the origin
        
        // Set up drawing: green outline, no fill
        stroke(100, 255, 150, 30);
        strokeWeight(1.5);
        noFill();
        
        // Draw hexagon (6-sided polygon)
        beginShape();
        for (let j = 0; j < 6; j++) {
            // Calculate angle for each vertex: 360° / 6 = 60°
            const angle = TWO_PI / 6 * j;
            // Convert polar coordinates to cartesian
            const vx = cos(angle) * size;
            const vy = sin(angle) * size;
            vertex(vx, vy); // Add vertex to hexagon
        }
        endShape(CLOSE); // Connect last vertex to first
        
        pop(); // Restore previous drawing state
    }
    
    // Draw animated orbiting dots
    for (let i = 0; i < 8; i++) {
        // Calculate angle for this dot: divide 360° into 8 positions
        const angle = TWO_PI / 8 * i + frameCount * 0.01;
        // Distance from center oscillates between 60 and 140 pixels
        const distance = 100 + sin(frameCount * 0.003 + i) * 40;
        // Screen center
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Convert polar coordinates to cartesian
        const x = centerX + cos(angle) * distance;
        const y = centerY + sin(angle) * distance;
        
        // Draw small circle with pulsing opacity
        fill(150, 200, 255, 40 + sin(frameCount * 0.01 + i) * 20);
        noStroke();
        ellipse(x, y, 8); // 8 pixel diameter circle
    }
}

// Draw animated grid overlay that pulses
// Creates a cyan grid that fades in and out
function drawAnimatedGridOverlay(gridColor) {
    // Size of each grid square in pixels
    const gridSize = 60;
    // Current time for animation
    const time = frameCount * 0.005;
    
    // Set grid line color with pulsing opacity
    stroke(gridColor[0], gridColor[1], gridColor[2], 10 + sin(time) * 5);
    strokeWeight(0.5);
    
    // Draw vertical lines
    for (let x = 0; x < width; x += gridSize) {
        line(x, 0, x, height);
    }
    // Draw horizontal lines
    for (let y = 0; y < height; y += gridSize) {
        line(0, y, width, y);
    }
    
    noStroke();
}

// Draw wave effect overlay
// Creates flowing wave patterns across the screen
function drawWaveOverlay(waveColor, waveHeight = 30) {
    // Current time for animation (faster than grid)
    const time = frameCount * 0.01;
    // Number of horizontal waves to draw
    const waveCount = 3;
    
    // Draw each wave
    for (let w = 0; w < waveCount; w++) {
        // Set wave line color
        stroke(waveColor[0], waveColor[1], waveColor[2], 15);
        strokeWeight(2);
        noFill();
        
        // Draw the wave line (top boundary)
        beginShape();
        // Create points along the wave
        for (let x = 0; x < width; x += 20) {
            // Calculate y position using sine wave
            // The wave oscillates up and down based on x position and time
            const y = height * (0.1 + w * 0.3) + sin(x * 0.02 + time + w * TWO_PI / waveCount) * waveHeight;
            vertex(x, y); // Add point to wave
        }
        // Close the shape by drawing to bottom right corner
        vertex(width, height);
        // And bottom left corner
        vertex(0, height);
        // Close shape back to start
        endShape(CLOSE);
        
        // Fill area under wave with semi-transparent color
        fill(waveColor[0], waveColor[1], waveColor[2], 5);
        // Connect the wave to the bottom corners
        vertex(width, height);
        vertex(0, height);
        vertex(0, 0);
        vertex(width, 0);
        endShape();
    }
    
    noStroke();
}

// --- Canvas Title Drawing ---

// Setup game title position and properties
function setupCanvasTitle() {
    gameCanvasTitle = {
        text: "Money Mastermind ", // Title text
        textSize: width * 0.05, // Responsive text size (5% of screen width)
        x: width / 2 * 1.05, // Centered horizontally (slight offset)
        y: height * 0.07, // Positioned near top of screen
        color: color(239, 68, 68), // Red color
        shadowColor: color(255, 0, 0), // Red for glow effect
        shadowStrength: 4 // Glow intensity (0-8)
    };
}

// Draw the game title with multiple glow layers
function drawCanvasTitle() {
    // Enhanced futuristic title with multiple shadow layers for depth effect
    // Reset shadow properties before drawing
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    
    // First layer - deep red glow (far back, most blurred)
    fill(255, 0, 100, 150); // Pink-red color
    textFont('Orbitron'); // Futuristic font
    textSize(gameCanvasTitle.textSize * 1.15); // Slightly larger
    textAlign(CENTER, CENTER); // Center align horizontally and vertically
    drawingContext.shadowBlur = 40; // Very blurry shadow
    drawingContext.shadowColor = 'rgba(255, 0, 100, 0.6)'; // Pink shadow
    text(gameCanvasTitle.text, gameCanvasTitle.x, gameCanvasTitle.y);
    
    // Second layer - bright cyan glow (middle)
    fill(100, 255, 200, 200); // Cyan color
    drawingContext.shadowBlur = 20; // Medium blur
    drawingContext.shadowColor = 'rgba(100, 255, 200, 0.8)'; // Cyan shadow
    text(gameCanvasTitle.text, gameCanvasTitle.x, gameCanvasTitle.y);
    
    // Final layer - bright white text (front, clearest)
    fill(255, 255, 255); // White
    drawingContext.shadowBlur = 8; // Subtle blur
    drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)'; // White shadow
    text(gameCanvasTitle.text, gameCanvasTitle.x, gameCanvasTitle.y);

    // Reset shadow properties to prevent affecting other drawn elements
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';
}


// --- Main Menu Drawing and Logic (p5.js handled) ---

// Calculate positions for main menu buttons on screen
function setupMainMenuButtons() {
    // Calculate the area where main menu buttons should be positioned
    // Place them below the title with some margin
    const topOffsetForTitle = gameCanvasTitle.y + gameCanvasTitle.textSize / 2 + height * 0.05;

    // Use 60% of screen height for menu area
    const usableHeightForMenu = height * 0.6;
    // Position menu area centered, then shift down slightly
    const menuAreaYStart = (height - usableHeightForMenu) / 2 + height * 0.1;

    // Button dimensions (responsive based on screen size)
    const buttonWidth = width * 0.45; // 45% of screen width
    const buttonHeight = usableHeightForMenu * 0.11; // 11% of menu height
    const gap = usableHeightForMenu * 0.03; // 3% gap between buttons

    // Calculate total height needed for all buttons
    // 4 buttons + 3 gaps between them
    const totalButtonsHeight = 4 * buttonHeight + 3 * gap;
    // Center the button group vertically
    const startY = menuAreaYStart + (usableHeightForMenu - totalButtonsHeight) / 2;
    const centerX = width / 2; // Horizontal center of screen

    // Create button object for Mafia Wars
    btnMafiaWars = {
        x: centerX - buttonWidth / 2, // Centered horizontally
        y: startY, // Top position
        width: buttonWidth,
        height: buttonHeight,
        text: '🔪 Mafia Wars', // Emoji + text label
        color: color(220, 50, 50) // Red theme
    };

    // Create button object for Stock Market
    btnStockMarket = {
        x: centerX - buttonWidth / 2,
        y: startY + buttonHeight + gap, // Below first button
        width: buttonWidth,
        height: buttonHeight,
        text: '📈 Stock Market',
        color: color(50, 180, 50) // Green theme
    };

    // Create button object for Lottery
    btnLottery = {
        x: centerX - buttonWidth / 2,
        y: startY + 2 * (buttonHeight + gap), // Below second button
        width: buttonWidth,
        height: buttonHeight,
        text: '🎰 Lottery',
        color: color(220, 150, 50) // Orange theme
    };

    // Create button object for New Game (smaller)
    btnNewGame = {
        x: centerX - (buttonWidth * 0.8) / 2, // Centered, but 80% width
        y: startY + 3 * (buttonHeight + gap) + gap * 2, // Below third button
        width: buttonWidth * 0.8, // 80% of normal button width
        height: buttonHeight * 0.7, // 70% of normal button height
        text: 'Start New Game', // Reset game
        color: color(80, 80, 80) // Gray theme
    };
}

// Draw the main menu screen
function drawMainMenu() {
    // --- ANIMATED BACKGROUND FOR MAIN MENU ---
    // Draw gradient background with animated colors
    drawAnimatedBackground(color(8, 15, 30), color(15, 25, 45));
    // Draw pulsing cyan grid overlay
    drawAnimatedGridOverlay([100, 200, 150]);
    // Draw flowing green waves
    drawWaveOverlay([0, 255, 120], 20);
    
    // Draw retro-style grid overlay with vertical and horizontal lines
    fill(0, 255, 120, 30); // Semi-transparent green
    // Draw vertical lines
    for (let x = 0; x < width; x += 40) {
        rect(x, 0, 2, height); // 2-pixel-wide vertical lines
    }
    // Draw horizontal lines
    for (let y = 0; y < height; y += 40) {
        rect(0, y, width, 2); // 2-pixel-wide horizontal lines
    }

    // Draw "Master Dashboard" text at top of menu
    textFont('Orbitron');
    textAlign(CENTER, CENTER);
    textSize(width * 0.048); // Large text
    
    // Multi-layered glow effect for text
    // First layer - pink/red glow
    fill(255, 50, 150, 200);
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'rgba(255, 50, 150, 0.6)';
    text("Master Dashboard", width / 2, height * 0.30);
    
    // Second layer - cyan glow
    fill(100, 255, 200);
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = 'rgba(100, 255, 200, 0.5)';
    text("Master Dashboard", width / 2, height * 0.30);
    
    // Reset shadow for subtitle
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // Draw subtitle text
    textAlign(CENTER, CENTER);
    textSize(width * 0.024); // Smaller text
    fill(100, 200, 255); // Cyan
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = 'rgba(100, 200, 255, 0.6)';
    text("Get Rich!", width / 2, height * 0.38);
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // Draw all four main menu buttons
    drawButton(btnMafiaWars); // Red Mafia Wars button
    drawButton(btnStockMarket); // Green Stock Market button
    drawButton(btnLottery); // Orange Lottery button
    drawButton(btnNewGame); // Gray New Game button
}

// Generic function to draw a button with enhanced styling
// This function handles all button drawing with animations and hover effects
function drawButton(button, themeOverride = null) {
    // --- ENHANCED FUTURISTIC BUTTON WITH ANIMATIONS ---
    
    // Set button color - use neon green as default
    let btnColor = color(0, 255, 120);
    // Use button's custom color if it has one
    if (button.color) btnColor = button.color;
    
    // Override button color if a theme is specified
    // This allows buttons to match their screen's color scheme
    if (themeOverride) {
        if (themeOverride === 'lottery') {
            // Orange/gold theme for lottery buttons
            if (!button.color || button === btnAdvanceDayGlobal) {
                btnColor = color(220, 150, 50);
            }
        } else if (themeOverride === 'mafia') {
            // Red/dark theme for mafia buttons
            if (!button.color || button === btnAdvanceDayGlobal) {
                btnColor = color(220, 50, 80);
            }
        } else if (themeOverride === 'stock') {
            // Green/cyan theme for stock market buttons
            if (!button.color || button === btnAdvanceDayGlobal) {
                btnColor = color(50, 200, 150);
            }
        }
    }

    let textColor = color(255, 255, 255); // Bright white for text
    let isHovered = isMouseOver(button); // Check if mouse is currently over button
    
    // Get animation values for this button from its animation state
    const scale = getButtonAnimationScale(button); // 1 = normal, 0.95 = squeeze, 1.05 = expand
    const shadowBlur = getButtonAnimationShadow(button); // Glow intensity

    // Disable strokes for initial rendering
    noStroke();
    
    // Calculate button center point (needed for scaling animation)
    const centerX = button.x + button.width / 2;
    const centerY = button.y + button.height / 2;
    // Calculate scaled dimensions (changes during click animation)
    const scaledWidth = button.width * scale;
    const scaledHeight = button.height * scale;
    // Calculate top-left position so button scales from center
    const scaledX = centerX - scaledWidth / 2;
    const scaledY = centerY - scaledHeight / 2;

    // Apply color changes based on hover state
    if (isHovered) {
        // When hovering: dim red/blue, boost green for a bright effect
        fill(
            red(btnColor) * 0.7, // Reduce red
            green(btnColor) * 0.95, // Keep green bright
            blue(btnColor) * 0.7 // Reduce blue
        );
        cursor(HAND); // Show hand cursor to indicate clickable
    } else {
        // Normal state: use button color as-is
        fill(btnColor);
        cursor(ARROW); // Show arrow cursor
    }

    // Create pill-shaped button with rounded corners
    const buttonRadius = (button.height / 2) * scale; // Scale corner radius with button
    
    // Add dynamic glow shadow that gets brighter when hovering
    drawingContext.shadowBlur = shadowBlur; // Blur amount (8-25px during animation)
    drawingContext.shadowColor = `rgba(${red(btnColor)}, ${green(btnColor)}, ${blue(btnColor)}, ${isHovered ? 0.9 : 0.5})`; // Color shadow
    
    // Draw the button shape (rounded rectangle)
    rect(scaledX, scaledY, scaledWidth, scaledHeight, buttonRadius);

    // Reset shadow for next drawing
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // Draw button border for futuristic look
    // Brighter color than fill, more opaque if hovering
    stroke(red(btnColor) * 1.2, green(btnColor) * 1.2, blue(btnColor) * 1.2, 150 + (isHovered ? 50 : 0));
    strokeWeight(2); // 2-pixel border
    noFill();
    rect(scaledX, scaledY, scaledWidth, scaledHeight, buttonRadius);
    
    // Draw extra glow border when hovering (outer ring effect)
    if (isHovered) {
        stroke(red(btnColor) * 1.5, green(btnColor) * 1.5, blue(btnColor) * 1.5, 100); // Brighter, more transparent
        strokeWeight(1);
        // Draw slightly larger rectangle outside the button
        rect(scaledX - 2, scaledY - 2, scaledWidth + 4, scaledHeight + 4, buttonRadius + 2);
    }
    noStroke();

    // Draw button text with neon glow
    textFont('Orbitron'); // Futuristic font
    fill(textColor); // White text
    textSize(button.height * 0.4 * scale); // Text size scales with button
    textAlign(CENTER, CENTER); // Center text both horizontally and vertically
    
    // Draw text if button has a label
    if (button.text !== null) {
        // Add glow to text when hovering
        if (isHovered) {
            drawingContext.shadowBlur = 15; // Text glow
            drawingContext.shadowColor = `rgba(255, 255, 255, 0.9)`; // White glow
            drawingContext.shadowOffsetX = 0;
            drawingContext.shadowOffsetY = 0;
        }
        text(button.text, centerX, centerY);
        drawingContext.shadowBlur = 0;
    }
}

// --- Global UI Buttons ---
function setupGlobalUIButtons() {
    // Position Next Day button in the top right, below messages, with more padding
    btnAdvanceDayGlobal = {
        x: width * 0.76, // To the left of message area
        y: height * 0.02 + (MESSAGE_MAX_DISPLAY_HEIGHT_FACTOR * height) + height * 0.02, // Below messages + increased padding
        width: width * 0.15,
        height: height * 0.06,
        text: 'Next Day',
        color: color(80, 100, 150) // Blue-gray color
    };
}


// --- Mafia Wars Game Logic and Drawing ---
function initializeMafiaWars() {
    // Start in Denver as requested
    const denverIndex = mafiaLocations.findIndex(loc => loc.name === 'Denver');
    currentMafiaLocationIndex = denverIndex !== -1 ? denverIndex : 0; // Default to first if Denver not found
    
    mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name);
    
    // Initialize player inventory for ALL possible contraband types to 0
    mafiaPlayerInventory = {};
    allContrabandTypes.forEach(type => {
        mafiaPlayerInventory[type] = 0; // Initialize all contraband to 0
    });
    
    selectedContraband = null;
    mafiaInputFocused = false; // Initialize the focus state, though now unused
    lastMafiaPriceUpdateTime = millis(); // Initialize timestamp for dynamic prices

    // NEW: Initialize daily transaction counts
    mafiaDailyBuys = 0;
    mafiaDailySells = 0;
}

// NEW FUNCTION: Setup Mafia Wars Layout Constants
function setupMafiaWarsLayoutConstants() {
    // Mafia Contraband Table Layout
    mafiaTableX = width * 0.17; // Further left
    mafiaTableY = height * 0.25; // Higher up
    mafiaColWidth = width * 0.16; // Wider columns
    mafiaActionColWidth = width * 0.19; // Wider action column
    mafiaRowHeight = height * 0.09; // Shorter rows
    mafiaBtnPadding = 20; // More padding inside cells

    // Removed specific input field constants as it's no longer used
}


function generateMafiaPrices(locationName) {
    const prices = {};
    const locationObj = mafiaLocations.find(loc => loc.name === locationName);
    const contrabandForLocation = locationObj ? locationObj.contraband : [];

    const minMafiaVolatility = 0.15; // Increased base volatility
    const maxMafiaVolatility = 0.60; // Increased max volatility

    // Calculate effective volatility based on location's travel cost
    const travelCost = locationObj.travelCost;
    const normalizedCost = map(travelCost, MIN_MAFIA_TRAVEL_COST, MAX_MAFIA_TRAVEL_COST, 0, 1);
    // Adjust the multiplier for volatility scale for Mafia. Can be up to $10,000 for high value items.
    // For 'Crimson Haze' (base 5000-15000), a max volatility of 0.5 means 50% change.
    // To get up to 10k fluctuations, the random factor and base price need to scale.
    // Let's make the fluctuation magnitude more aggressive.
    const effectiveVolatility = map(normalizedCost, 0, 1, minMafiaVolatility, maxMafiaVolatility);


    contrabandForLocation.forEach(item => { // Only generate prices for contraband in this location
        let basePrice;
        // Increased base price ranges for different contraband types (to fit $500k goal)
        switch (item) {
            case 'Bliss Dust': basePrice = random(50, 200); break;
            case 'Shadow Bloom': basePrice = random(3000, 10000); break;
            case 'Viper Venom': basePrice = random(500, 2000); break;
            case 'Crimson Haze': basePrice = random(10000, 30000); break;
            case 'Starlight Shard': basePrice = random(1500, 5000); break;
            case 'Iron Will Dust': basePrice = random(400, 1500); break;
            case 'Ocean Echo': basePrice = random(2000, 8000); break;
            default: basePrice = random(100, 500);
        }

        // Price change based on base price and effective volatility
        // The multiplier here scales the fluctuation. Max for high-value items could be ~15000 * 0.5 * random(0.8, 2.0) = 7500 * random.
        // To ensure up to 10k, we might need a higher overall multiplier for the fluctuation.
        // Let's refine the fluctuation magnitude formula.
        // For a 15000 base, 10000 fluctuation is ~66%. If effectiveVolatility max is 0.5, we need basePrice * 0.5 * X = 10000 => X = 1.33
        // So, let's make the random range for fluctuation wider, especially for high volatility areas.
        let fluctuationFactor = map(effectiveVolatility, minMafiaVolatility, maxMafiaVolatility, 0.7, 2.5); // Wider swings for high-cost cities
        let priceChange = basePrice * random(-effectiveVolatility * fluctuationFactor, effectiveVolatility * fluctuationFactor);

        let finalPrice = parseFloat((basePrice + priceChange).toFixed(2));
        prices[item] = Math.max(10, finalPrice); // Ensure price doesn't go too low
    });
    addGameMessage(`Contraband prices updated in ${locationName}.`, 'info');
    return prices;
}

function handleBuySellContraband(item, type, quantity) {
    // Convert quantity from string to integer (player types in a number, we need to use it as math)
    // For example: "5" becomes 5
    quantity = int(quantity);
    
    // Check if quantity is valid
    // If it's 0 or less, OR if it's not a number at all (NaN), show error and stop
    if (quantity <= 0 || isNaN(quantity)) {
        addGameMessage("Enter a valid quantity.", 'error');
        return; // Exit function early - don't do the transaction
    }

    // Daily transaction limit checks
    // The game only allows 3 buys per day (to make strategy matter)
    if (type === 'buy') {
        // Check if player already hit the buy limit today
        if (mafiaDailyBuys >= MAFIA_MAX_DAILY_TRANSACTIONS) {
            // Show error message telling them the limit
            addGameMessage(`Daily buy limit (${MAFIA_MAX_DAILY_TRANSACTIONS}) reached.`, 'error');
            return; // Stop - can't buy anymore today
        }
    } else { // type is 'sell'
        // Same check for selling
        if (mafiaDailySells >= MAFIA_MAX_DAILY_TRANSACTIONS) {
            addGameMessage(`Daily sell limit (${MAFIA_MAX_DAILY_TRANSACTIONS}) reached.`, 'error');
            return; // Stop - can't sell anymore today
        }
    }

    // Get the price of the item in the current location
    const price = mafiaContrabandPrices[item];
    
    // If the price doesn't exist, that means this item isn't available here
    if (!price) {
        addGameMessage(`You cannot trade ${item} in ${mafiaLocations[currentMafiaLocationIndex].name}.`, 'error');
        return; // Stop - item not available
    }

    // Calculate total cost (price × quantity)
    // Example: $100 per item × 5 items = $500 total
    const cost = price * quantity;
    
    // Get how many units player already owns (0 if they don't own any yet)
    const currentInventory = mafiaPlayerInventory[item] || 0;

    if (type === 'buy') {
        // BUYING: Player spends money, gains contraband
        
        // Check 1: Does player have enough money?
        if (gameMoney < cost) {
            addGameMessage("Not enough money for that acquisition!", 'error');
            return; // Stop - not enough cash
        }
        
        // Check 2: Would buying this exceed the inventory limit?
        // Example: owns 25, limit is 30, trying to buy 10 = 25+10=35 (TOO MUCH!)
        if (currentInventory + quantity > MAFIA_MAX_INVENTORY_PER_ITEM) {
            addGameMessage(`Cannot carry more than ${MAFIA_MAX_INVENTORY_PER_ITEM} units of ${item}.`, 'error');
            return; // Stop - inventory full
        }

        // All checks passed! Do the transaction:
        // 1. Take money from player
        gameMoney -= cost;
        // 2. Add contraband to player's inventory
        mafiaPlayerInventory[item] += quantity;
        // 3. Increment daily buy counter (used to enforce 3 buy limit)
        mafiaDailyBuys++;
        // 4. Show success message
        addGameMessage(`Acquired ${quantity} ${item} for $${cost.toFixed(2)}.`, 'success');
        // 5. Update money display on screen
        updateMoney(0);
    } else { // type is 'sell'
        // SELLING: Player loses contraband, gains money
        
        // Check: Does player own enough of this item to sell?
        // Example: owns 2, trying to sell 5 = CAN'T!
        if (currentInventory < quantity) {
            addGameMessage(`You don't have ${quantity} units of ${item} to offload!`, 'error');
            return; // Stop - not enough inventory
        }

        // All checks passed! Do the transaction:
        // 1. Calculate how much money player gets (price × quantity)
        const revenue = price * quantity;
        // 2. Add money to player's account
        gameMoney += revenue;
        // 3. Remove contraband from inventory
        mafiaPlayerInventory[item] -= quantity;
        // 4. Increment daily sell counter
        mafiaDailySells++;
        // 5. Show success message
        addGameMessage(`Offloaded ${quantity} ${item} for $${revenue.toFixed(2)}.`, 'success');
        // 6. Update money display
        updateMoney(0);
    }
}

function handleTravel(newLocationName) {
    // Find the location object that matches the name player clicked
    // Returns the object or undefined if not found
    // For example: "Denver" → { name: 'Denver', contraband: [...], travelCost: 200 }
    const newLocationObj = mafiaLocations.find(loc => loc.name === newLocationName);
    
    // If location not found, show error (shouldn't happen in normal play)
    if (!newLocationObj) {
        addGameMessage("Invalid location.", 'error');
        return; // Stop - location doesn't exist
    }

    // Find the index (position) of this location in the mafiaLocations array
    // Example: "Denver" is at index 5 (6th location in the list)
    const newLocationIndex = mafiaLocations.indexOf(newLocationObj);

    // Check if player is already at this location
    // If trying to go somewhere they're already at, waste of money!
    if (newLocationName === mafiaLocations[currentMafiaLocationIndex].name) {
        addGameMessage("You're already in this territory!", 'warning');
        return; // Stop - already here
    }

    // Get the cost to travel to this new location
    const travelCost = newLocationObj.travelCost;
    
    // Check if player has enough money to afford the trip
    if (gameMoney < travelCost) {
        addGameMessage(`Not enough money to travel to ${newLocationName}! Need $${travelCost}.`, 'error');
        return; // Stop - too poor
    }

    // All checks passed! Do the travel:
    // 1. Take money from player (pay for travel)
    gameMoney -= travelCost;
    
    // 2. Update current location to new location
    currentMafiaLocationIndex = newLocationIndex;
    
    // 3. Generate NEW prices for THIS location (prices differ per city)
    // The prices just changed because you're in a different place!
    mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name);
    
    // Note: We do NOT call advanceDay() here because traveling doesn't use up a full game day
    // Only clicking "Next Day" button moves time forward
    
    // 4. Show message about successful travel
    addGameMessage(`Traveled to ${newLocationName} territory for $${travelCost}.`, 'info');
    
    // 5. Trigger random events (might lose money, get good deals, etc)
    triggerMafiaRandomEvent();
}

function triggerMafiaRandomEvent() {
    // Generate a random number between 0 and 100 (like rolling dice)
    const eventChance = random(100);
    
    // 20% chance means: if eventChance is less than 20, something happens
    // 80% of the time, nothing happens (eventChance is 20-100)
    if (eventChance < 20) {
        // An event WILL happen! Pick which type (1, 2, or 3)
        // floor(random(1, 4)) gives us: 1, 2, or 3 (never 4)
        const eventType = floor(random(1, 4));
        
        switch (eventType) {
            case 1: // Rival Gang Ambush - BAD EVENT (lose money)
                // Lose between $100 and $500
                const loss = floor(random(100, 500));
                // Take money from player
                gameMoney -= loss;
                // Show dramatic message
                addGameMessage(`Rival gang ambush! You lost $${loss}.`, 'critical');
                
                // 50% chance the gang also steals some of your contraband
                if (random() < 0.5 && Object.values(mafiaPlayerInventory).some(q => q > 0)) {
                    // Get list of contraband available in current location
                    const currentContraband = mafiaLocations[currentMafiaLocationIndex].contraband;
                    // Filter to only items the player actually owns
                    const availableOwnedContraband = currentContraband.filter(type => mafiaPlayerInventory[type] > 0);
                    
                    // If player owns at least one item in this location
                    if (availableOwnedContraband.length > 0) {
                        // Pick a random item from what they own here
                        const randomItem = random(availableOwnedContraband);
                        // Steal between 1 and 5 units (or less if they don't have 5)
                        const confiscatedQty = floor(random(1, Math.min(mafiaPlayerInventory[randomItem], 5) + 1));
                        // Remove it from their inventory
                        mafiaPlayerInventory[randomItem] -= confiscatedQty;
                        // Tell player what was stolen
                        addGameMessage(`Rival gang seized ${confiscatedQty} ${randomItem}!`, 'critical');
                    }
                }
                break;
                
            case 2: // Inside Tip / Good Deal - GOOD EVENT (items on sale!)
                // Pick a random contraband from current location
                const goodDealItem = random(mafiaLocations[currentMafiaLocationIndex].contraband);
                // Get its current price
                const oldPrice = mafiaContrabandPrices[goodDealItem];
                // Calculate a much lower price (40-70% of normal)
                // Example: $1000 item becomes $400-700
                const newPrice = parseFloat((oldPrice * random(0.4, 0.7)).toFixed(2));
                // Update the price in the game
                mafiaContrabandPrices[goodDealItem] = Math.max(5, newPrice); // Never go below $5
                // Tell player about the deal
                addGameMessage(`Inside tip! ${goodDealItem} is cheap at $${mafiaContrabandPrices[goodDealItem].toFixed(2)}! (Originally $${oldPrice.toFixed(2)})`, 'success');
                break;
                
            case 3: // Unforeseen Expenses / Protection Racket - BAD EVENT (lose money)
                // Have to pay money for various reasons (protection money, fines, etc)
                const expenses = floor(random(50, 300)); // Lose $50-300
                // Take money from player
                gameMoney -= expenses;
                // Tell player why
                addGameMessage(`Unforeseen expenses incurred: $${expenses}!`, 'critical');
                break;
        }
    }
    // If eventChance >= 20, nothing happens (80% of the time)
}

function drawMafiaWarsScreen() {
    // --- ANIMATED BACKGROUND FOR MAFIA WARS ---
    background(12, 8, 24);
    
    // Draw animated background with red/dark theme
    drawAnimatedBackground(color(20, 8, 30), color(60, 10, 40));
    
    // Draw animated grid overlay
    drawAnimatedGridOverlay([150, 50, 100]);
    
    // Draw wave effects
    drawWaveOverlay([200, 50, 100], 20);

    // Retro title (muted)
    fill(210, 220, 180);
    textFont('Courier New');
    textSize(width * 0.045);
    textAlign(CENTER, TOP);
    text("MAFIA WARS", width / 2, height * 0.06);

    // Current Location Display (muted)
    fill(180, 200, 210);
    textFont('Courier New');
    textSize(width * 0.025);
    text(`Current Territory: ${mafiaLocations[currentMafiaLocationIndex].name}`, width / 2, height * 0.17);

    // Contraband Price and Inventory Table
    drawContrabandTable();

    // Buy/Sell Input and Buttons
    drawBuySellInput();

    // Location Travel Buttons
    drawLocationButtons();

    // Draw the global "Next Day" button
    drawButton(btnAdvanceDayGlobal, 'mafia');

    // Back button to main menu
    const btnBackToMainMafia = {
        x: width / 2 - (width * 0.2) / 2,
        y: height * 0.92,
        width: width * 0.2,
        height: height * 0.07,
        text: 'Main Menu',
        color: color(150, 50, 80)
    };
    drawButton(btnBackToMainMafia, 'mafia');

    // Mafia Prices update by minute (every MAFIA_PRICE_UPDATE_INTERVAL milliseconds)
    if (millis() - lastMafiaPriceUpdateTime > MAFIA_PRICE_UPDATE_INTERVAL) {
        mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name);
        lastMafiaPriceUpdateTime = millis();
    }
}

function drawContrabandTable() {
    // Now using the global Mafia Wars table layout constants
    const tableX = mafiaTableX;
    const tableY = mafiaTableY;
    const colWidth = mafiaColWidth;
    const actionColWidth = mafiaActionColWidth;
    const rowHeight = mafiaRowHeight;
    const padding = mafiaBtnPadding;

    const currentContrabandTypes = mafiaLocations[currentMafiaLocationIndex].contraband; // Get contraband for current location

    // Table Header
    fill(40, 40, 40, 200); // Dark header background
    noStroke();
    rect(tableX, tableY, colWidth * 3 + actionColWidth, rowHeight, 8, 8, 0, 0); // Adjusted total width for 3 data cols + 1 action col

    fill(255, 230, 0); // Gold text
    textSize(height * 0.03); // Increased text size
    textAlign(CENTER, CENTER);
    text("Contraband", tableX + colWidth * 0.5, tableY + rowHeight / 2);
    text("Price", tableX + colWidth * 1.5, tableY + rowHeight / 2);
    text("Owned", tableX + colWidth * 2.5, tableY + rowHeight / 2);
    text("Actions", tableX + colWidth * 2.5 + actionColWidth / 2, tableY + rowHeight / 2); // Center actions header

    // Table Rows
    for (let i = 0; i < currentContrabandTypes.length; i++) { // Loop through current location's contraband
        const item = currentContrabandTypes[i];
        const yPos = tableY + rowHeight * (i + 1);

        // Highlight selected row
        if (selectedContraband === item) {
            fill(60, 20, 20, 200); // Reddish highlight
        } else {
            fill(20, 20, 20, 180); // Dark row background
        }
        noStroke();
        rect(tableX, yPos, colWidth * 3 + actionColWidth, rowHeight); // Adjusted total width

        // Item Data
        fill(240); // White text
        textSize(height * 0.022); // Adjusted text size to prevent overlap
        textAlign(CENTER, CENTER);
        text(item, tableX + colWidth * 0.5, yPos + rowHeight / 2);
        text(`$${mafiaContrabandPrices[item].toFixed(2)}`, tableX + colWidth * 1.5, yPos + rowHeight / 2);
        
        // Adjust the X position for "Owned" to space it away from buy/sell
        text(mafiaPlayerInventory[item], tableX + colWidth * 2.3, yPos + rowHeight / 2);


        // Buy/Sell buttons for each row (quick buy/sell 1)
        const buyBtnWidth = actionColWidth * 0.45; // Adjusted size
        const buyBtnHeight = rowHeight * 0.4; // Adjusted size
        const btnXOffset = tableX + colWidth * 2.5 + (actionColWidth - (buyBtnWidth * 2 + padding / 2)) / 2; // Center buttons in action column
        
        // Buy button
        drawButton({
            x: btnXOffset,
            y: yPos + mafiaRowHeight / 2 - buyBtnHeight / 2,
            width: buyBtnWidth,
            height: buyBtnHeight,
            text: 'Buy',
            color: color(0),
            // Pass 'disabled' state based on daily limits
            disabled: mafiaDailyBuys >= MAFIA_MAX_DAILY_TRANSACTIONS
        });
        // Sell button
        drawButton({
            x: btnXOffset + buyBtnWidth + padding / 2,
            y: yPos + mafiaRowHeight / 2 - buyBtnHeight / 2,
            width: buyBtnWidth,
            height: buyBtnHeight,
            text: 'Sell',
            color: color(0),
            // Pass 'disabled' state based on daily limits
            disabled: mafiaDailySells >= MAFIA_MAX_DAILY_TRANSACTIONS
        });
    }

    // Border for the entire table
    noFill();
    stroke(100, 100, 100);
    strokeWeight(1);
    rect(tableX, tableY, colWidth * 3 + actionColWidth, rowHeight * (currentContrabandTypes.length + 1), 8); // Adjusted total width

    // Display daily limits
    const limitDisplayX = tableX + colWidth * 3 + actionColWidth + width * 0.02; // To the right of the table
    const limitDisplayY = tableY;
    
    fill(240, 245, 250);
    textSize(height * 0.022);
    textAlign(LEFT, TOP);
    text("Daily Limits:", limitDisplayX, limitDisplayY);
    
    // Change color based on limit
    fill(mafiaDailyBuys >= MAFIA_MAX_DAILY_TRANSACTIONS ? color(255, 100, 100) : color(100, 255, 100));
    text(`Buys: ${mafiaDailyBuys}/${MAFIA_MAX_DAILY_TRANSACTIONS}`, limitDisplayX, limitDisplayY + height * 0.03);
    
    fill(mafiaDailySells >= MAFIA_MAX_DAILY_TRANSACTIONS ? color(255, 100, 100) : color(100, 255, 100));
    text(`Sells: ${mafiaDailySells}/${MAFIA_MAX_DAILY_TRANSACTIONS}`, limitDisplayX, limitDisplayY + height * 0.06);

}


function drawBuySellInput() {
    // This function is now intentionally left blank as the explicit quantity input and buttons are removed.
}


function drawLocationButtons() {
    const locBtnWidth = width * 0.13; // Adjusted width for single line, was 0.12
    const locBtnHeight = height * 0.09; // Increased height to accommodate text better
    const locGapX = width * 0.015; // Increased horizontal gap
    const locStartY = height * 0.78; // Y position for the single line of buttons - moved up from 0.82

    fill(240, 245, 250);
    textSize(width * 0.018);
    textAlign(CENTER, BOTTOM);
    text("Travel to:", width / 2, locStartY - (locBtnHeight * 0.3)); // Position label above the single line of buttons

    // Calculate start X to center all 6 buttons on one line
    const totalLocButtonsWidth = mafiaLocations.length * locBtnWidth + (mafiaLocations.length - 1) * locGapX;
    const locStartX = width / 2 - totalLocButtonsWidth / 2;

    for (let i = 0; i < mafiaLocations.length; i++) {
        const loc = mafiaLocations[i];
        const btnX = locStartX + i * (locBtnWidth + locGapX);
        const btnY = locStartY; // All buttons on the same Y

        let locColor = color(80, 80, 150); // Default blueish
        if (i === currentMafiaLocationIndex) { // Check against index
            locColor = color(40, 120, 40); // Darker green for current location - less bright
        }

        // Draw the button rectangle itself (behind the text)
        drawButton({ x: btnX, y: btnY, width: locBtnWidth, height: locBtnHeight, text: null, color: locColor });

        // Draw the city name (higher up on the button)
        fill(255); // White for city name
        textSize(locBtnHeight * 0.35); // Responsive text size for city name
        textAlign(CENTER, CENTER);
        text(loc.name, btnX + locBtnWidth / 2, btnY + locBtnHeight * 0.3); // Adjusted Y for city name

        // Overlay the travel cost (lower down on the button)
        fill(255, 230, 0); // Yellow for cost
        textSize(locBtnHeight * 0.25); // Smaller text for cost to avoid overlap
        textAlign(CENTER, CENTER);
        text(`$${loc.travelCost}`, btnX + locBtnWidth / 2, btnY + locBtnHeight * 0.7); // Adjusted Y for cost
    }
}


// --- Lottery Functions ---

function initializeLottery() {
    currentLotteryLocationIndex = 0; // Default to Boardwalk
    lotteryBetAmount = "";
    lotteryLastResult = null;
    lotteryLastResultTime = 0;
}

function setupLotteryButtons() {
    // Location selection buttons - positioned far left, above back button, below HUD
    btnLotteryLocation = [];
    const locBtnWidth = width * 0.22;
    const locBtnHeight = height * 0.08;
    const locBtnStartX = width * 0.02;
    const locBtnStartY = height * 0.55; // Above back button at 0.92
    const locBtnGap = height * 0.02;

    lotteryLocations.forEach((location, index) => {
        btnLotteryLocation.push({
            x: locBtnStartX,
            y: locBtnStartY + index * (locBtnHeight + locBtnGap),
            width: locBtnWidth,
            height: locBtnHeight,
            text: location.name,
            color: currentLotteryLocationIndex === index ? color(255, 200, 100) : color(180, 120, 50),
            index: index
        });
    });

    // Bet placement button - moved up
    btnLotteryBet = {
        x: width * 0.35,
        y: height * 0.58,
        width: width * 0.3,
        height: height * 0.08,
        text: 'Place Bet',
        color: color(220, 150, 50)
    };

    // Back to main menu button
    btnLotteryBackToMain = {
        x: width * 0.02,
        y: height * 0.92,
        width: width * 0.18,
        height: height * 0.06,
        text: 'Back',
        color: color(100, 100, 100)
    };
}

// Play the lottery at current location
// Player bets money, wins based on location odds
function playLottery(betAmount) {
    // Convert bet amount from string to integer
    betAmount = int(betAmount);
    
    // Check 1: Is bet valid?
    // Must be > 0 and a real number
    if (betAmount <= 0 || isNaN(betAmount)) {
        addGameMessage("Invalid bet amount!", 'warning');
        return; // Stop - invalid bet
    }

    // Get the current lottery location's data
    const location = lotteryLocations[currentLotteryLocationIndex];

    // Check 2: Is bet too small?
    // Different locations have different minimum bets
    // Boardwalk: min $50, OldTown: min $100, Neon Strip: min $200
    if (betAmount < location.minBet) {
        addGameMessage(`Minimum bet is $${location.minBet}`, 'warning');
        return; // Stop - bet too low
    }

    // Check 3: Is bet too large?
    // Different locations have different maximum bets
    // Boardwalk: max $5,000, OldTown: max $10,000, Neon Strip: max $20,000
    if (betAmount > location.maxBet) {
        addGameMessage(`Maximum bet is $${location.maxBet}`, 'warning');
        return; // Stop - bet too high
    }

    // Check 4: Does player have enough money to bet?
    if (gameMoney < betAmount) {
        addGameMessage("Insufficient funds!", 'warning');
        return; // Stop - too poor
    }

    // All checks passed! Execute the bet:
    // 1. Take the bet money from the player
    gameMoney -= betAmount;

    // 2. Determine if player wins
    // Each location has different odds
    // Boardwalk: 30% chance, OldTown: 40% chance, Neon Strip: 50% chance
    const winChance = location.odds; // For example: 0.30 = 30%
    // Generate random number 0-100, check if it's less than odds
    // Example: odds are 30%, random is 25% → player wins!
    // Example: odds are 30%, random is 45% → player loses!
    const won = random(100) < (winChance * 100);

    if (won) {
        // PLAYER WINS! Calculate winnings
        // Different locations pay different amounts
        // Boardwalk: 3x payout, OldTown: 4x payout, Neon Strip: 5x payout
        // Higher-risk locations (higher travel cost) pay more!
        const multipliers = [3, 4, 5]; // One for each location
        const multiplier = multipliers[currentLotteryLocationIndex];
        // Calculate total payout
        // Example: bet $100 at Neon Strip = $100 × 5 = $500 winnings
        const winnings = betAmount * multiplier;
        // Give player the winnings
        gameMoney += winnings;
        
        // Store result to display on screen for 3 seconds
        lotteryLastResult = {
            won: true, // Player won
            amount: winnings, // How much they won
            message: `🎉 You won $${winnings.toLocaleString()}! (${multiplier}x)`
        };
        // Show success message
        addGameMessage(`Won $${winnings.toLocaleString()} at the lottery! (${multiplier}x)`, 'success');
    } else {
        // PLAYER LOSES! They get nothing
        // Store result to display on screen
        lotteryLastResult = {
            won: false, // Player lost
            amount: betAmount, // What they lost
            message: `😞 You lost $${betAmount.toLocaleString()}...`
        };
        // Show sad message
        addGameMessage(`Lost $${betAmount.toLocaleString()}...`, 'warning');
    }

    // Record when the result happened (used to fade it out after 3 seconds)
    lotteryLastResultTime = millis();
    // Clear the bet input for next round
    lotteryBetAmount = "";
}

function drawLotteryScreen() {
    // --- ANIMATED BACKGROUND FOR LOTTERY SCREEN ---
    background(12, 8, 24);
    
    // Draw animated background with orange/yellow theme
    drawAnimatedBackground(color(30, 20, 15), color(50, 35, 20));
    
    // Draw animated grid overlay
    drawAnimatedGridOverlay([255, 150, 100]);
    
    // Draw wave effects
    drawWaveOverlay([255, 200, 100], 30);

    // Title
    fill(220, 150, 50);
    textFont('Courier New');
    textSize(width * 0.045);
    textAlign(CENTER, TOP);
    text("LOTTERY GAMES", width / 2, height * 0.06);

    // Current location display
    fill(180, 200, 210);
    textFont('Courier New');
    textSize(width * 0.025);
    textAlign(CENTER, TOP);
    text(`Current Location: ${lotteryLocations[currentLotteryLocationIndex].name}`, width / 2, height * 0.15);

    // Location info
    const currentLocation = lotteryLocations[currentLotteryLocationIndex];
    fill(150, 200, 150);
    textSize(width * 0.02);
    text(`Min Bet: $${currentLocation.minBet} | Max Bet: $${currentLocation.maxBet} | Odds: ${(currentLocation.odds * 100).toFixed(0)}%`, width / 2, height * 0.20);

    // Draw location buttons (show move cost on other locations)
    for (let btn of btnLotteryLocation) {
        const loc = lotteryLocations[btn.index];
        if (btn.index === currentLotteryLocationIndex) {
            btn.text = `${loc.name} (Here)`;
        } else {
            const moveCost = loc.travelCost || 0;
            btn.text = `${loc.name} - $${moveCost.toLocaleString()}`;
        }
        btn.color = currentLotteryLocationIndex === btn.index ? color(255, 200, 100) : color(180, 120, 50);
        drawButton(btn, 'lottery');
    }

    // Bet input label
    fill(200, 200, 200);
    textFont('Courier New');
    textSize(width * 0.022);
    textAlign(CENTER, TOP);
    text("Enter Bet Amount:", width / 2, height * 0.68);

    // Bet input box
    fill(30, 30, 60);
    stroke(100, 200, 100);
    strokeWeight(2);
    const inputBoxWidth = width * 0.2;
    const inputBoxHeight = height * 0.06;
    rect(width / 2 - inputBoxWidth / 2, height * 0.73, inputBoxWidth, inputBoxHeight);

    // Display bet amount input
    fill(0, 255, 150);
    textFont('Courier New');
    textSize(width * 0.025);
    textAlign(CENTER, CENTER);
    text(lotteryBetAmount, width / 2, height * 0.73 + inputBoxHeight / 2);

    noStroke();

    // Draw bet button
    drawButton(btnLotteryBet, 'lottery');

    // Draw result if within display duration
    if (lotteryLastResult && (millis() - lotteryLastResultTime) < LOTTERY_RESULT_DISPLAY_DURATION) {
        fill(lotteryLastResult.won ? color(100, 255, 100) : color(255, 100, 100));
        textFont('Courier New');
        textSize(width * 0.035);
        textAlign(CENTER, CENTER);
        text(lotteryLastResult.message, width / 2, height * 0.87);
    }

    // Draw back button
    drawButton(btnLotteryBackToMain, 'lottery');

    // Draw the global "Next Day" button
    drawButton(btnAdvanceDayGlobal, 'lottery');
}


// --- Stock Market Functions ---

// Initialize all stocks with starting prices and properties
function initializeStocks() {
    // Loop through every region
    for (const region of regions) {
        // Loop through every stock symbol in that region
        for (const symbol of region.stocks) {
            // Generate a random starting price between $100 and $500
            // Example: "AURAX" starts at $345.67
            const initialPrice = parseFloat((random(100, 500)).toFixed(2));
            
            // Calculate dividend (extra money paid per share annually)
            // Dividend is 8% of the stock price
            // Example: $100 stock pays $8 per share per year
            const dividendValue = parseFloat((initialPrice * 0.08).toFixed(2));

            // Set volatility (how much the price can swing)
            // 0.12 = 12%, 0.35 = 35% (high volatility = big price swings)
            // Volatile stocks are risky but have big gains/losses
            const volatility = random(0.12, 0.35);

            // Create data object for this stock
            stocksData[symbol] = {
                price: initialPrice, // Current price
                prevPrice: 0, // What price was yesterday (will update later)
                volatility: volatility, // How much it swings
                history: [], // Could store past prices, not used yet
                dividend: dividendValue // Money per share paid out
            };
        }
    }
    // Start with empty portfolio (player owns no stocks yet)
    playerPortfolio = {};
}

// Update stock prices every day
// Prices swing up or down randomly based on volatility
function advanceStockPrices() {
    // Loop through every stock in the market
    for (const symbol in stocksData) {
        // Save the old price so we can show if stock went up or down
        stocksData[symbol].prevPrice = stocksData[symbol].price;
        
        // Calculate price change
        // Formula: current price × volatility × random swing (-1 to 1)
        // Example: $100 × 0.20 × 0.5 = $10 price increase
        // Example: $100 × 0.20 × (-0.8) = -$16 price decrease
        let change = stocksData[symbol].price * stocksData[symbol].volatility * random(-1, 1);
        
        // Apply the change to the stock price
        // Round to 2 decimal places (e.g., $102.34, not $102.3459)
        stocksData[symbol].price = parseFloat((stocksData[symbol].price + change).toFixed(2));
        
        // Safety check: make sure price never goes below $1
        // Without this, a stock could become worthless
        if (stocksData[symbol].price < 1) stocksData[symbol].price = 1;
    }
    // Tell player prices changed
    addGameMessage("Stock prices updated.", 'info');
}

function setupStockMarketButtons() {
    const buttonWidth = width * 0.2;
    const buttonHeight = height * 0.07;
    const gap = width * 0.01;

    // Position buttons at the bottom center
    const startX = width / 2 - (buttonWidth * 1.5 + gap); // Adjusted to center 3 buttons
    const btnY = height * 0.9;

    btnNextDay = {
        x: startX,
        y: btnY,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Next Day',
        color: color(80, 100, 150) // Blueish-gray
    };
    btnMoveRegion = {
        x: startX + buttonWidth + gap,
        y: btnY,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Move',
        color: color(90, 60, 150) // Purplish-gray
    };
    btnWallet = {
        x: startX + 2 * (buttonWidth + gap),
        y: btnY,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Wallet',
        color: color(60, 150, 90) // Greenish-gray
    };
    // Back to Stock Market button (used in wallet/move/buy-sell)
    btnBackToStockMarket = {
        x: width / 2 - (width * 0.2) / 2, // Centered
        y: height * 0.9, // Positioned at the bottom
        width: width * 0.2,
        height: height * 0.07,
        text: 'Back',
        color: color(100, 100, 100) // Neutral gray
    };

    // Main stock market back button (to main menu)
    btnBackToMain = {
        x: width / 2 - (width * 0.2) / 2, // Centered
        y: height * 0.8, // Slightly higher to not overlap with stock market specific buttons
        width: width * 0.2,
        height: height * 0.07,
        text: 'Main Menu',
        color: color(100, 100, 100) // Neutral gray
    };
}

function drawStockMarketScreen() {
    // --- ANIMATED BACKGROUND FOR STOCK MARKET ---
    background(10, 12, 24);
    
    // Draw animated background with green/blue theme
    drawAnimatedBackground(color(15, 25, 40), color(20, 50, 60));
    
    // Draw animated grid overlay
    drawAnimatedGridOverlay([100, 200, 150]);
    
    // Draw wave effects
    drawWaveOverlay([100, 255, 150], 25);

    // Retro region panel
    fill(30, 40, 60, 180);
    stroke(120, 255, 200, 80);
    strokeWeight(2);
    const regionPanelWidth = width * 0.6;
    const regionPanelHeight = height * 0.1;
    const regionPanelX = width / 2 - regionPanelWidth / 2;
    const regionPanelY = height * 0.15;
    rect(regionPanelX, regionPanelY, regionPanelWidth, regionPanelHeight, 16);
    noStroke();

    // Retro region name
    fill(210, 230, 200);
    textFont('Courier New');
    textSize(width * 0.03);
    textAlign(CENTER, CENTER);
    text(regions[currentRegionIndex].name, regionPanelX + regionPanelWidth / 2, regionPanelY + regionPanelHeight / 2);

    // Draw stock tiles (retro style)
    const stocksInRegion = regions[currentRegionIndex].stocks;
    const numStocks = stocksInRegion.length;
    const tileWidth = width * 0.17;
    const tileHeight = height * 0.18;
    const tileGapX = width * 0.015;
    const tileGapY = height * 0.02;

    const totalTilesWidth = numStocks * tileWidth + (numStocks - 1) * tileGapX;
    let startX = (width - totalTilesWidth) / 2;
    const startY = height * 0.3;

    stockTiles = [];

    for (let i = 0; i < numStocks; i++) {
        const symbol = stocksInRegion[i];
        const stock = stocksData[symbol];
        const tileX = startX + i * (tileWidth + tileGapX);
        const tileY = startY;

        stockTiles.push({ x: tileX, y: tileY, width: tileWidth, height: tileHeight, symbol: symbol });

        // Retro tile background
        fill(24, 32, 48, 220);
        stroke(120, 255, 200, 80);
        strokeWeight(2);
        rect(tileX, tileY, tileWidth, tileHeight, 10);
        noStroke();

        // Stock Info - Symbols (top center, retro)
        fill(210, 230, 200);
        textFont('Courier New');
        textSize(tileHeight * 0.18);
        textAlign(CENTER, TOP);
        text(symbol, tileX + tileWidth / 2, tileY + tileHeight * 0.1);

        // Current Price (middle center, retro)
        fill(255, 230, 120);
        textFont('Courier New');
        textSize(tileHeight * 0.22);
        text(`$${stock.price.toFixed(2)}`, tileX + tileWidth / 2, tileY + tileHeight * 0.45);

        // Price change indicator (bottom center, retro)
        if (stock.prevPrice !== 0) {
            const change = stock.price - stock.prevPrice;
            let changeColor;
            let arrow = '';

            if (change > 0) {
                changeColor = color(120, 255, 120);
                arrow = '▲ ';
            } else if (change < 0) {
                changeColor = color(255, 120, 120);
                arrow = '▼ ';
            } else {
                changeColor = color(180, 180, 180);
            }

            fill(changeColor);
            textFont('Courier New');
            textSize(tileHeight * 0.13);
            text(`${arrow}${abs(change).toFixed(2)}`, tileX + tileWidth / 2, tileY + tileHeight * 0.75);
        }
    }

    // Draw action buttons - using enhanced drawButton function
    drawButton(btnNextDay, 'stock');
    drawButton(btnMoveRegion, 'stock');
    drawButton(btnWallet, 'stock');
    drawButton(btnBackToMain, 'stock');
}

function drawWalletScreen() {
    // --- ANIMATED BACKGROUND FOR WALLET SCREEN ---
    background(45, 55, 70);
    
    // Draw animated background with blue theme
    drawAnimatedBackground(color(30, 45, 70), color(50, 70, 100));
    
    // Draw animated grid overlay
    drawAnimatedGridOverlay([100, 150, 200]);
    
    // Draw wave effects
    drawWaveOverlay([100, 200, 255], 25);

    fill(240, 245, 250);
    textSize(width * 0.03);
    textAlign(CENTER, TOP);
    text("Your Portfolio", width / 2, height * 0.15);

    // Table design
    // Adjusted colWidth for a new 'Dividend' column
    const colWidth = width * 0.12; // Adjusted width for each column to fit 6 columns
    const tableYStart = height * 0.25;
    const rowHeight = height * 0.05;
    // Adjusted startX to center 6 columns: Symbol, Quantity, Avg. Price, Current Value, P/L, Daily Dividend
    const totalTableWidth = colWidth * 6; // 6 columns
    const startX = width / 2 - (totalTableWidth / 2);

    // Table background container
    fill(35, 45, 60, 220); // Darker, more opaque background
    stroke(80, 95, 110);
    strokeWeight(1);
    // Adjusted width of background rectangle to fit new column
    rect(startX - 10, tableYStart - rowHeight * 0.8, totalTableWidth + 20, (Object.keys(playerPortfolio).length + 1) * rowHeight + rowHeight * 0.6, 8); // Slightly rounded

    // Table headers - Adjusted positions for 6 columns
    textSize(height * 0.023); // Slightly smaller header text
    fill(255, 230, 0); // Gold-yellow for headers
    textAlign(CENTER, CENTER);
    text("Symbol", startX + colWidth * 0.5, tableYStart);
    text("Quantity", startX + colWidth * 1.5, tableYStart);
    text("Avg. Price", startX + colWidth * 2.5, tableYStart);
    text("Current Value", startX + colWidth * 3.5, tableYStart);
    text("P/L", startX + colWidth * 4.5, tableYStart);
    text("Daily Dividend", startX + colWidth * 5.5, tableYStart); // New header

    let currentY = tableYStart + rowHeight;
    let rowNumber = 0;
    for (const symbol in playerPortfolio) {
        const item = playerPortfolio[symbol];
        const currentStock = stocksData[symbol];
        if (!currentStock) continue; // Skip if stock data not found

        const currentValue = item.quantity * currentStock.price;
        const profitLoss = currentValue - (item.quantity * item.avgPrice);
        const dailyDividend = item.quantity * currentStock.dividend; // Calculate daily dividend

        // Alternating row background
        if (rowNumber % 2 === 0) {
            fill(50, 60, 75, 180); // Slightly lighter blue-gray for even rows
        } else {
            fill(45, 55, 70, 180); // Darker blue-gray for odd rows
        }
        noStroke();
        // Adjusted width of row background to fit new column
        rect(startX - 10, currentY - rowHeight * 0.5, totalTableWidth + 20, rowHeight, 0); // Draw row background

        fill(240, 245, 250); // Off-white for data text
        textSize(height * 0.018); // Smaller data text
        textAlign(CENTER, CENTER);

        text(symbol, startX + colWidth * 0.5, currentY);
        text(item.quantity, startX + colWidth * 1.5, currentY);
        text(`$${item.avgPrice.toFixed(2)}`, startX + colWidth * 2.5, currentY);
        text(`$${currentValue.toFixed(2)}`, startX + colWidth * 3.5, currentY);

        let plColor;
        if (profitLoss > 0) plColor = color(50, 220, 100);
        else if (profitLoss < 0) plColor = color(220, 80, 80);
        else plColor = color(180); // Neutral gray
        fill(plColor);
        text(`$${profitLoss.toFixed(2)}`, startX + colWidth * 4.5, currentY);

        // Display Daily Dividend
        fill(100, 255, 255); // Cyan for dividends
        text(`$${dailyDividend.toFixed(2)}`, startX + colWidth * 5.5, currentY);

        currentY += rowHeight;
        rowNumber++;
    }

    drawButton(btnBackToStockMarket, 'stock'); // Reusing the back button style
}

function drawIllegalWalletScreen() {
    background(30, 10, 10);
    fill(255, 230, 0);
    textSize(width * 0.035);
    textAlign(CENTER, TOP);
    text("Illegal Wallet", width / 2, height * 0.12);

    // Calculate total contraband
    let totalContraband = 0;
    for (let i = 0; i < allContrabandTypes.length; i++) { // Loop through all contraband types
        totalContraband += mafiaPlayerInventory[allContrabandTypes[i]];
    }

    // Draw capacity bar
    const barX = width * 0.2;
    const barY = height * 0.2;
    const barW = width * 0.6;
    const barH = height * 0.04;
    fill(40, 40, 40);
    rect(barX, barY, barW, barH, barH / 2);
    fill(totalContraband > 30 ? color(220, 50, 50) : color(50, 180, 50));
    const fillW = map(totalContraband, 0, 30, 0, barW, true);
    rect(barX, barY, fillW, barH, barH / 2);

    fill(255);
    textSize(width * 0.018);
    textAlign(CENTER, CENTER);
    text(`${totalContraband} / ${MAFIA_MAX_INVENTORY_PER_ITEM} contraband`, width / 2, barY + barH / 2);

    // Draw inventory table
    const tableX = width * 0.25;
    const tableY = barY + barH + height * 0.04;
    const rowH = height * 0.05;
    fill(240, 245, 250);
    textSize(width * 0.018);
    textAlign(LEFT, CENTER);
    for (let i = 0; i < allContrabandTypes.length; i++) { // Loop through all contraband types
        const y = tableY + i * rowH;
        fill(200, 200, 200);
        rect(tableX, y, width * 0.5, rowH, rowH / 2);
        fill(40, 40, 40);
        text(allContrabandTypes[i], tableX + 20, y + rowH / 2);
        textAlign(RIGHT, CENTER);
        text(mafiaPlayerInventory[allContrabandTypes[i]], tableX + width * 0.5 - 20, y + rowH / 2);
        textAlign(LEFT, CENTER);
    }

    // Back button
    const btnBack = { x: width * 0.02, y: height * 0.92, width: width * 0.18, height: height * 0.06, text: 'Back', color: color(100, 100, 100) };
    drawButton(btnBack);
}

function drawMoveRegionScreen() {
    // --- ANIMATED BACKGROUND FOR MOVE REGION SCREEN ---
    background(45, 55, 70);
    
    // Draw animated background with green theme
    drawAnimatedBackground(color(30, 50, 35), color(50, 80, 60));
    
    // Draw animated grid overlay
    drawAnimatedGridOverlay([100, 200, 120]);
    
    // Draw wave effects
    drawWaveOverlay([80, 255, 150], 25);

    fill(240, 245, 250);
    textSize(width * 0.03);
    textAlign(CENTER, TOP);
    text("Choose a Region", width / 2, height * 0.15);

    // Draw region buttons
    const buttonWidth = width * 0.45;
    const buttonHeight = height * 0.08;
    const gap = height * 0.02; // Vertical gap

    let currentY = height * 0.25;
    for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        const btnX = width / 2 - buttonWidth / 2;
        const btnY = currentY;

        let regionColor = color(60, 70, 85); // Darker blue-gray for unselected
        let textColor = color(240, 245, 250);
        let currentStrokeWeight = 1.5;
        let borderColor = color(100, 115, 130); // Subtle border
        let currentShadowBlur = 0;
        let shadowColor = 'rgba(0,0,0,0)';

        if (i === currentRegionIndex) {
            regionColor = color(80, 130, 100); // Muted green for selected
            textColor = color(255); // Brighter text for selected
            currentStrokeWeight = 3;
            borderColor = color(255, 230, 0); // Yellow border for selected
            currentShadowBlur = 10;
            shadowColor = color(80, 130, 100, 150); // Greenish glow for selected
        }

        if (mouseX > btnX && mouseY > btnY && mouseX < btnX + buttonWidth && mouseY < btnY + buttonHeight) {
            regionColor = lerpColor(regionColor, color(100, 115, 130), 0.2); // Lighten on hover
            currentShadowBlur = 15; // Increased glow on hover
            shadowColor = regionColor; // Glow color matches button
            cursor(HAND);
        } else {
            cursor(ARROW);
        }

        // Apply shadow
        drawingContext.shadowOffsetX = 0;
        drawingContext.shadowOffsetY = 5;
        drawingContext.shadowBlur = currentShadowBlur;
        drawingContext.shadowColor = shadowColor;

        fill(regionColor);
        noStroke(); // Ensure no stroke for these buttons
        rect(btnX, btnY, buttonWidth, buttonHeight, buttonHeight / 2); // Rounded corners

        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'rgba(0,0,0,0)'; // Reset shadow

        fill(textColor);
        textSize(buttonHeight * 0.4);
        textAlign(CENTER, CENTER);
        text(region.name, btnX + buttonWidth / 2, btnY + buttonHeight / 2);

        currentY += buttonHeight + gap;
    }

    drawButton(btnBackToStockMarket, 'stock');
}

function drawBuySellStockScreen(symbol) {
    if (!symbol || !stocksData[symbol]) {
        background(0);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        textSize(32);
        text("Error: Stock not found!", width / 2, height / 2);
        drawButton(btnBackToStockMarket, 'stock');
        return;
    }

    // --- ANIMATED BACKGROUND FOR BUY/SELL STOCK SCREEN ---
    background(35, 45, 60);
    
    // Draw animated background with cyan theme
    drawAnimatedBackground(color(15, 30, 45), color(30, 50, 70));
    
    // Draw animated grid overlay
    drawAnimatedGridOverlay([100, 200, 150]);
    
    // Draw wave effects
    drawWaveOverlay([100, 255, 200], 25);

    const stock = stocksData[symbol];
    const ownedQuantity = playerPortfolio[symbol] ? playerPortfolio[symbol].quantity : 0;

    fill(240, 245, 250);
    textSize(width * 0.04);
    textAlign(CENTER, TOP);
    text(`${symbol} Stock Details`, width / 2, height * 0.15);

    // Display stock details prominently
    const detailTextSize = height * 0.035; // Larger text for details
    const detailLineSpacing = detailTextSize * 1.5;
    const detailX = width / 2;
    let detailY = height * 0.25;

    fill(255, 230, 0); // Gold-yellow for current price
    textSize(detailTextSize);
    text(`Current Price: $${stock.price.toFixed(2)}`, detailX, detailY);

    fill(200, 210, 220); // Light gray for owned quantity
    detailY += detailLineSpacing;
    text(`Owned: ${ownedQuantity}`, detailX, detailY);

    fill(255, 180, 180); // Softer red for money
    detailY += detailLineSpacing;
    text(`Your Money: $${gameMoney.toLocaleString()}`, detailX, detailY);

    // New: Display Daily Dividend of this stock
    fill(100, 255, 255); // Cyan for dividends
    detailY += detailLineSpacing;
    text(`Daily Dividend: $${stock.dividend.toFixed(2)} per share`, detailX, detailY);

    // Quantity input (simulated)
    const inputX = width / 2 - (width * 0.2) / 2;
    const inputY = height * 0.5;
    const inputWidth = width * 0.2;
    const inputHeight = height * 0.06;

    // Input field background
    fill(30, 40, 50); // Even darker grey
    stroke(100, 115, 130); // Lighter border
    strokeWeight(1);
    rect(inputX, inputY, inputWidth, inputHeight, 8); // Rounded corners

    fill(240, 245, 250);
    textSize(width * 0.02);
    textAlign(CENTER, CENTER);
    text(buySellQuantity || 'Enter Qty', inputX + inputWidth / 2, inputY + inputHeight / 2);

    // Buy / Sell / Max buttons
    const btnBuy = { x: width * 0.35, y: height * 0.7, width: width * 0.1, height: height * 0.06, text: 'Buy', color: color(50, 180, 50) };
    const btnSell = { x: width * 0.55, y: height * 0.7, width: width * 0.1, height: height * 0.06, text: 'Sell', color: color(220, 50, 50) };
    const btnMaxSell = { x: btnSell.x + btnSell.width + 10, y: height * 0.63, width: width * 0.07, height: height * 0.04, text: 'Max', color: color(100, 100, 100) };
    const btnMaxBuy = { x: btnBuy.x - (width * 0.07 + 10), y: height * 0.63, width: width * 0.07, height: height * 0.04, text: 'Max', color: color(100, 100, 100) };

    drawButton(btnBuy);
    drawButton(btnSell);
    drawButton(btnMaxSell);
    drawButton(btnMaxBuy);

    drawButton(btnBackToStockMarket, 'stock');
}

// Buy shares of a stock
// Takes player's money, adds stock to their portfolio
function buyStock(symbol, quantity) {
    // Convert quantity from string to integer
    quantity = int(quantity);
    
    // Validate: quantity must be > 0 and a real number
    if (quantity <= 0 || isNaN(quantity)) {
        addGameMessage("Enter a valid quantity.", 'error');
        return; // Stop transaction
    }

    // Get stock data for this symbol
    const stock = stocksData[symbol];
    // Calculate total cost (price per share × number of shares)
    // Example: $50/share × 10 shares = $500 total
    const cost = stock.price * quantity;
    
    // Check how many shares player currently owns (0 if they don't own any)
    const currentOwned = playerPortfolio[symbol] ? playerPortfolio[symbol].quantity : 0;

    // Check 1: Does player have enough money?
    if (gameMoney < cost) {
        addGameMessage("Not enough money to buy!", 'error');
        return; // Stop - too poor
    }

    // Check 2: Would this exceed the max shares allowed per stock?
    // Max is 30 shares per stock to prevent hoarding
    if (currentOwned + quantity > STOCK_MAX_INVENTORY) {
        addGameMessage(`Cannot hold more than ${STOCK_MAX_INVENTORY} shares of ${symbol}.`, 'error');
        return; // Stop - inventory full
    }

    // All checks passed! Execute the transaction:
    // 1. Take money from player
    gameMoney -= cost;
    
    // 2. Create portfolio entry if this is first time buying this stock
    if (!playerPortfolio[symbol]) {
        playerPortfolio[symbol] = { quantity: 0, avgPrice: 0 };
    }
    
    // 3. Calculate new average price
    // Why average price? So we can track profit/loss
    // Example: bought 5 shares at $100, now buying 5 at $110
    // Average = (5×100 + 5×110) / 10 = $105
    const totalOldCost = playerPortfolio[symbol].quantity * playerPortfolio[symbol].avgPrice;
    playerPortfolio[symbol].quantity += quantity; // Add new shares
    playerPortfolio[symbol].avgPrice = (totalOldCost + cost) / playerPortfolio[symbol].quantity; // New average

    // 4. Show success message
    addGameMessage(`Bought ${quantity} shares of ${symbol} for $${cost.toFixed(2)}.`, 'success');
    
    // 5. Update money display on screen
    updateMoney(0);
}

// Sell shares of a stock
// Takes stock from player, gives them money
function sellStock(symbol, quantity) {
    // Convert quantity from string to integer
    quantity = int(quantity);
    
    // Validate: quantity must be > 0 and a real number
    if (quantity <= 0 || isNaN(quantity)) {
        addGameMessage("Enter a valid quantity.", 'error');
        return; // Stop transaction
    }
    
    // Check: Does player own this stock? Do they have enough shares?
    // If portfolio[symbol] doesn't exist, OR quantity owned is less than quantity being sold
    if (!playerPortfolio[symbol] || playerPortfolio[symbol].quantity < quantity) {
        addGameMessage("Not enough shares to sell!", 'error');
        return; // Stop - not enough to sell
    }
    
    // Get stock data for this symbol
    const stock = stocksData[symbol];
    
    // Calculate how much money player gets (price per share × number of shares)
    // Example: Sell 10 shares at $150/share = $1500 revenue
    const revenue = stock.price * quantity;
    
    // Give money to player
    gameMoney += revenue;

    // Remove shares from player's portfolio
    playerPortfolio[symbol].quantity -= quantity;

    // If player now owns 0 shares, delete the stock from portfolio entirely
    // This keeps the portfolio clean (no entries with 0 shares)
    if (playerPortfolio[symbol].quantity === 0) {
        delete playerPortfolio[symbol];
    }
    
    // Show success message
    addGameMessage(`Sold ${quantity} shares of ${symbol} for $${revenue.toFixed(2)}.`, 'success');
    
    // Update money display on screen
    updateMoney(0);
}

function changeRegion(newIndex) {
    // A small cost to move regions to add more strategy
    const moveCost = 50; // Example cost

    if (gameMoney < moveCost) {
        addGameMessage(`Not enough money to move! Requires $${moveCost}.`, 'error');
        return;
    }
    
    if (gameDay <= 1) { // Prevent moving on Day 1 (or other logic if needed)
        addGameMessage("Cannot move on Day 1.", 'warning');
        return;
    }

    if (newIndex >= 0 && newIndex < regions.length) {
        gameMoney -= moveCost; // Deduct cost
        currentRegionIndex = newIndex;
        advanceDay(); // Moving takes a day
        addGameMessage(`Moved to ${regions[currentRegionIndex].name} for $${moveCost}.`, 'info');
        setGameState('stockMarket'); // Return to stock market view
    } else {
        addGameMessage("Invalid region selected.", 'error');
    }
}


// Function to draw game parameters (Money, Day, Location, and now Goal/Day Progress) on the canvas (positioned left)
function drawGameInfo() {
    const boxWidth = width * 0.22;
    const boxHeight = height * 0.24;
    const padding = width * 0.01;
    const cornerRadius = 8;

    const boxX = padding;
    const boxY = padding;

    // Draw enhanced futuristic background box
    noStroke();
    fill(20, 25, 40, 220);
    rect(boxX, boxY, boxWidth, boxHeight, cornerRadius);

    // Multi-layered border for futuristic look
    stroke(100, 200, 150, 200);
    strokeWeight(2);
    noFill();
    rect(boxX, boxY, boxWidth, boxHeight, cornerRadius);
    
    // Inner accent border
    stroke(100, 150, 200, 100);
    strokeWeight(1);
    const innerPadding = 4;
    rect(boxX + innerPadding, boxY + innerPadding, boxWidth - innerPadding * 2, boxHeight - innerPadding * 2, cornerRadius - 2);

    // Glow effect
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = 'rgba(100, 200, 150, 0.3)';
    rect(boxX, boxY, boxWidth, boxHeight, cornerRadius);
    drawingContext.shadowBlur = 0;

    // Text styling
    const iconSize = height * 0.025;
    const textBaseSize = height * 0.022;
    const lineSpacing = textBaseSize * 1.5;

    fill(200, 255, 200);
    textAlign(LEFT, CENTER);
    textFont('Orbitron');

    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 4;
    drawingContext.shadowColor = 'rgba(100, 200, 150, 0.5)';

    let currentTextY = boxY + padding + textBaseSize * 0.8;

    // Money - with highlight glow if recent transaction
    textSize(textBaseSize);
    fill(100, 255, 150);
    text('💰', boxX + padding, currentTextY);
    fill(255, 255, 150);
    text(`$${gameMoney.toLocaleString()}`, boxX + padding + iconSize + 5, currentTextY);

    currentTextY += lineSpacing;

    // Day
    textSize(textBaseSize);
    fill(100, 200, 255);
    text('📅', boxX + padding, currentTextY);
    fill(200, 220, 255);
    text(`Day ${gameDay}`, boxX + padding + iconSize + 5, currentTextY);

    currentTextY += lineSpacing;

    // Location
    textSize(textBaseSize);
    fill(255, 150, 200);
    text('📍', boxX + padding, currentTextY);
    fill(255, 180, 220);
    text(`${gameLocation}`, boxX + padding + iconSize + 5, currentTextY);

    currentTextY += lineSpacing * 1.2;

    // Goal Progress Bar - enhanced
    const barPaddingX = padding + 5;
    const barWidth = boxWidth - (barPaddingX * 2);
    const barHeight = height * 0.018;
    const barY = currentTextY + 5;
    const barCornerRadius = 3;

    textSize(textBaseSize * 0.85);
    textAlign(LEFT, BOTTOM);
    fill(150, 200, 255);
    text('GOAL:', boxX + barPaddingX, currentTextY + 3);

    // Bar background with glow
    fill(15, 20, 30);
    noStroke();
    rect(boxX + barPaddingX, barY, barWidth, barHeight, barCornerRadius);
    
    stroke(100, 150, 100, 100);
    strokeWeight(1);
    rect(boxX + barPaddingX, barY, barWidth, barHeight, barCornerRadius);

    // Progress bar with gradient effect
    let moneyProgress = map(gameMoney, 0, MONEY_GOAL, 0, barWidth, true);
    fill(100, 255, 100);
    rect(boxX + barPaddingX, barY, moneyProgress, barHeight, barCornerRadius);
    
    // Progress bar glow
    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = 'rgba(100, 255, 100, 0.6)';
    rect(boxX + barPaddingX, barY, moneyProgress, barHeight, barCornerRadius);
    drawingContext.shadowBlur = 0;

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(textBaseSize * 0.65);
    text(`$${gameMoney.toLocaleString()}/$${MONEY_GOAL.toLocaleString()}`, boxX + barPaddingX + barWidth / 2, barY + barHeight / 2);

    currentTextY += barHeight + lineSpacing * 1.2;

    // Day Progress Bar - enhanced
    textSize(textBaseSize * 0.85);
    textAlign(LEFT, BOTTOM);
    fill(255, 200, 100);
    text('DAYS:', boxX + barPaddingX, currentTextY + 3);

    // Bar background with glow
    fill(15, 20, 30);
    noStroke();
    rect(boxX + barPaddingX, currentTextY + 5, barWidth, barHeight, barCornerRadius);
    
    stroke(150, 120, 100, 100);
    strokeWeight(1);
    rect(boxX + barPaddingX, currentTextY + 5, barWidth, barHeight, barCornerRadius);

    // Day progress
    let dayProgress = map(gameDay, 0, DAY_LIMIT, 0, barWidth, true);
    fill(255, 200, 100);
    rect(boxX + barPaddingX, currentTextY + 5, dayProgress, barHeight, barCornerRadius);
    
    // Day progress glow
    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = 'rgba(255, 200, 100, 0.6)';
    rect(boxX + barPaddingX, currentTextY + 5, dayProgress, barHeight, barCornerRadius);
    drawingContext.shadowBlur = 0;

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(textBaseSize * 0.7);
    text(`${gameDay}/${DAY_LIMIT}`, boxX + barPaddingX + barWidth / 2, currentTextY + 5 + barHeight / 2);


    // Reset shadow
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';
}


// Function to draw game messages on the canvas (positioned right, smaller, sleek, fading)
function drawFadingMessages() {
    const messageAreaRightEdge = width * 0.98;
    const messageAreaTop = height * 0.02;
    const messageLineHeight = height * MESSAGE_LINE_HEIGHT_FACTOR;

    textFont('Orbitron');
    textSize(height * 0.018);
    textAlign(RIGHT, TOP);

    // Filter out messages that have completed their full fade cycle
    gameMessages = gameMessages.filter(msg => {
        const elapsedTime = millis() - msg.timestamp;
        return elapsedTime < MESSAGE_TOTAL_DURATION;
    });

    // Draw active messages, stacking upwards from the bottom of the message area
    let currentY = messageAreaTop + (MESSAGE_MAX_DISPLAY_HEIGHT_FACTOR * height) - messageLineHeight;

    // Enhanced shadow and glow
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 4;
    drawingContext.shadowColor = 'rgba(0,0,0,0.8)';

    for (let i = gameMessages.length - 1; i >= 0; i--) {
        const msg = gameMessages[i];
        const elapsedTime = millis() - msg.timestamp;
        let opacity;

        if (elapsedTime < MESSAGE_FADE_IN_DURATION) {
            opacity = map(elapsedTime, 0, MESSAGE_FADE_IN_DURATION, 0, 255);
        } else if (elapsedTime < MESSAGE_FADE_IN_DURATION + MESSAGE_HOLD_DURATION) {
            opacity = 255;
        } else {
            const fadeOutTime = elapsedTime - (MESSAGE_FADE_IN_DURATION + MESSAGE_HOLD_DURATION);
            opacity = map(fadeOutTime, 0, MESSAGE_FADE_OUT_DURATION, 255, 0);
        }

        let textColor, glowColor;
        // Enhanced colors for message types with glow
        if (msg.type === 'success') {
            textColor = color(100, 255, 150, opacity);
            glowColor = 'rgba(100, 255, 150, ' + (opacity / 255 * 0.6) + ')';
        } else if (msg.type === 'error') {
            textColor = color(255, 100, 100, opacity);
            glowColor = 'rgba(255, 100, 100, ' + (opacity / 255 * 0.6) + ')';
        } else if (msg.type === 'warning') {
            textColor = color(255, 200, 100, opacity);
            glowColor = 'rgba(255, 200, 100, ' + (opacity / 255 * 0.6) + ')';
        } else {
            textColor = color(150, 200, 255, opacity);
            glowColor = 'rgba(150, 200, 255, ' + (opacity / 255 * 0.4) + ')';
        }

        fill(textColor);
        drawingContext.shadowColor = glowColor;
        drawingContext.shadowBlur = 10;
        text(msg.text, messageAreaRightEdge, currentY);
        currentY -= messageLineHeight;

        if (currentY < messageAreaTop) {
            break;
        }
    }
    // Reset shadow
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';
}


// --- Utility Functions ---

// Add a message to the game message queue
// Messages appear on the right side of screen and fade out
function addGameMessage(message, type = 'info') {
    // Add message with current timestamp to the messages array
    // Later, drawFadingMessages() will use this timestamp to calculate opacity
    gameMessages.push({ 
        text: message, // The text to display
        type: type, // Type: 'info', 'success', 'error', 'warning', 'critical'
        timestamp: millis() // When the message was created
    });
    
    // Play subtle animation when message appears
    anime({
        targets: { opacity: 0 },
        opacity: 1, // Fade in
        duration: 300, // 300 milliseconds
        easing: 'easeOutQuad' // Smooth easing
    });
}

// Change which screen/state the game is in
// This controls what gets drawn to the screen
function setGameState(newState) {
    currentGameState = newState;
    
    // Based on which state we're switching to, update location and show message
    if (newState === 'mainMenu') {
        gameLocation = "Main Menu";
        addGameMessage("Returned to main menu.");
    } else if (newState === 'stockMarket') {
        // Update location to current region name
        gameLocation = regions[currentRegionIndex].name;
        addGameMessage(`Entering ${gameLocation}...`, 'info');
    } else if (newState === 'wallet') {
        addGameMessage("Viewing your portfolio.", 'info');
    } else if (newState === 'moveRegion') {
        addGameMessage("Choosing new market region.", 'info');
    } else if (newState === 'buySellStock') {
        addGameMessage(`Trading ${selectedStockSymbol}.`, 'info');
    } else if (newState === 'mafiaWars') {
        // Update location to current mafia location
        gameLocation = mafiaLocations[currentMafiaLocationIndex].name;
        addGameMessage("You've entered the Mafia underworld!", 'info');
        // Reset price update timer when entering mafia wars
        lastMafiaPriceUpdateTime = millis();
    } else if (newState === 'lottery') {
        // Update location to current lottery location
        gameLocation = lotteryLocations[currentLotteryLocationIndex].name;
        addGameMessage(`Welcome to ${gameLocation}!`, 'info');
    }
    else {
        // Fallback for any other states
        gameLocation = newState;
        addGameMessage(`Entering ${newState}...`, 'info');
    }
}

// Reset the entire game to starting conditions
// Called when player clicks "New Game"
function resetGame() {
    // Reset all core game variables
    gameMoney = 1000; // Back to starting money
    gameDay = 1; // Back to day 1
    gameLocation = "Main Menu"; // At main menu
    gameMessages = []; // Clear all messages immediately
    
    // Re-initialize all game systems
    initializeStocks(); // New stock prices, clear portfolio
    playerPortfolio = {}; // Empty portfolio
    initializeMafiaWars(); // Reset mafia (new prices, empty inventory, new daily limits)
    initializeLottery(); // Reset lottery (start at Boardwalk)

    // Show welcome messages again
    addGameMessage("Game reset. Welcome back!");
    addGameMessage(`Reach $${MONEY_GOAL.toLocaleString()} within ${DAY_LIMIT} days!`, 'info');
    
    // Go back to main menu
    setGameState('mainMenu');
}

// Move time forward by one day
// This is the heartbeat of the game - lots happens here!
function advanceDay() {
    // Increment the day counter
    gameDay++;
    
    // Reset daily transaction counters for Mafia Wars
    // Every new day, you get 3 new buys and 3 new sells
    mafiaDailyBuys = 0;
    mafiaDailySells = 0;

    // STEP 1: Collect stock dividends (passive income)
    // If you own stocks, they pay you money automatically each day
    let totalDividends = 0;
    
    // Loop through every stock in player's portfolio
    for (const symbol in playerPortfolio) {
        // Get data about the stock player owns
        const ownedStock = playerPortfolio[symbol];
        const stockData = stocksData[symbol];
        
        // If data exists, calculate dividend payment
        if (ownedStock && stockData) {
            // Formula: Number of shares × Dividend per share
            // Example: Own 5 shares × $8 dividend = $40 payment
            totalDividends += ownedStock.quantity * stockData.dividend;
        }
    }
    
    // If player received any dividends, give them the money
    if (totalDividends > 0) {
        gameMoney += totalDividends;
        // Show how much they earned passively
        addGameMessage(`Received $${totalDividends.toFixed(2)} in dividends!`, 'success');
    }

    // STEP 2: Update stock prices
    // Only change prices if player is in stock market (for immersion)
    if (currentGameState === 'stockMarket') {
        advanceStockPrices(); // All stocks go up or down randomly
    }
    
    // STEP 3: Update Mafia contraband prices
    // Prices change every day regardless of where you are
    // This keeps the mafia market realistic and volatile
    mafiaContrabandPrices = generateMafiaPrices(mafiaLocations[currentMafiaLocationIndex].name);

    // Show day advancement message
    addGameMessage(`Advanced to Day ${gameDay}.`);

    // STEP 4: Check if player won
    // Win condition: reach $500,000 before day 100
    if (gameMoney >= MONEY_GOAL) {
        addGameMessage(`Congratulations! You reached $${MONEY_GOAL.toLocaleString()} in ${gameDay} days! You win!`, 'success');
        setGameState('winScreen'); // Show win screen
        noLoop(); // Stop the game from running (freeze everything)
    } 
    // STEP 5: Check if player lost
    // Lose condition: day 100 arrives before reaching $500,000
    else if (gameDay >= DAY_LIMIT) {
        addGameMessage(`Time's up! You did not reach $${MONEY_GOAL.toLocaleString()} within ${DAY_LIMIT} days. Game Over!`, 'error');
        setGameState('loseScreen'); // Show lose screen
        noLoop(); // Stop the game from running (freeze everything)
    }
}

function updateMoney(amount) {
    const oldMoney = gameMoney;
    gameMoney += amount;
    addGameMessage(`Money changed by $${amount}. Current: $${gameMoney.toLocaleString()}`, amount >= 0 ? 'success' : 'error');
    // Trigger money change animation
    animateMoneyChange(gameMoney, oldMoney, width * 0.02, height * 0.1);
}


// --- NEW: Win/Lose Screens ---

function drawWinScreen() {
    // --- ANIMATED BACKGROUND FOR WIN SCREEN ---
    background(20, 50, 30);
    
    // Draw animated background with green success theme
    drawAnimatedBackground(color(15, 40, 25), color(30, 80, 50));
    
    // Draw animated grid overlay
    drawAnimatedGridOverlay([100, 255, 120]);
    
    // Draw wave effects
    drawWaveOverlay([100, 255, 150], 30);

    // "You Won!" title
    fill(100, 255, 100); // Bright green
    textFont('monospace');
    textSize(width * 0.08);
    textAlign(CENTER, CENTER);
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'lime';
    text("YOU WON!", width / 2, height * 0.3);
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // Win details
    fill(240, 245, 250);
    textSize(width * 0.025);
    text(`Congratulations! You reached $${MONEY_GOAL.toLocaleString()}!`, width / 2, height * 0.45);
    text(`Final Money: $${gameMoney.toLocaleString()}`, width / 2, height * 0.52);
    text(`Days Taken: ${gameDay}`, width / 2, height * 0.59);

    // Play Again button
    const playAgainBtn = {
        x: width / 2 - (width * 0.25) / 2,
        y: height * 0.75,
        width: width * 0.25,
        height: height * 0.08,
        text: 'Play Again',
        color: color(50, 180, 50)
    };
    drawButton(playAgainBtn);
}

function drawLoseScreen() {
    // --- ANIMATED BACKGROUND FOR LOSE SCREEN ---
    background(50, 20, 20);
    
    // Draw animated background with red failure theme
    drawAnimatedBackground(color(40, 15, 15), color(80, 20, 20));
    
    // Draw animated grid overlay
    drawAnimatedGridOverlay([255, 100, 100]);
    
    // Draw wave effects
    drawWaveOverlay([255, 50, 50], 30);

    // "Game Over" title
    fill(255, 100, 100); // Bright red
    textFont('monospace');
    textSize(width * 0.08);
    textAlign(CENTER, CENTER);
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'red';
    text("GAME OVER", width / 2, height * 0.3);
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // Lose details
    fill(240, 245, 250);
    textSize(width * 0.025);
    text(`You did not reach $${MONEY_GOAL.toLocaleString()} in ${DAY_LIMIT} days.`, width / 2, height * 0.45);
    text(`Final Money: $${gameMoney.toLocaleString()}`, width / 2, height * 0.52);
    text(`Days Played: ${gameDay}`, width / 2, height * 0.59);

    // Play Again button
    const playAgainBtn = {
        x: width / 2 - (width * 0.25) / 2,
        y: height * 0.75,
        width: width * 0.25,
        height: height * 0.08,
        text: 'Play Again',
        color: color(180, 50, 50) // Reddish button
    };
    drawButton(playAgainBtn);
}
