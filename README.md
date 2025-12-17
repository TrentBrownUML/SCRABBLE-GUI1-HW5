# 🎲 Scrabble GUI

A fully-featured browser-based Scrabble game with AI opponents of varying difficulty levels.

## 🎮 Features

- **Single Player Mode** - Classic drag-and-drop Scrabble gameplay
- **Bot Mode** - Play against 1-3 AI opponents with animated tile movements
- **4 Difficulty Levels**:
  - 🟢 **Easy** - Simple word selection, great for beginners
  - 🟡 **Medium** - Extended vocabulary, moderate challenge
  - 🔴 **Hard** - Full dictionary access, strategic play
  - ⚫ **Expert** - Advanced heuristics, premium tile targeting, optimal scoring

## 🌐 GitHub Pages Deployment

This project is configured for GitHub Pages deployment from the **root** directory.

### Deployment Steps:
1. Go to your repository **Settings** → **Pages**
2. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/ (root)`
3. Click **Save**
4. Your site will be live at: `https://<username>.github.io/SCRABBLE-GUI1-HW5/`

### Access URLs (after deployment):
| Page | URL |
|------|-----|
| Single Player | `https://<username>.github.io/SCRABBLE-GUI1-HW5/` |
| Bot Setup | `https://<username>.github.io/SCRABBLE-GUI1-HW5/bot-game.html` |
| Bot Game | `https://<username>.github.io/SCRABBLE-GUI1-HW5/bot-play.html` |

## 📁 Project Structure

```
/ (root)
├── index.html                # Single player entry point
├── bot-game.html             # Bot game setup/configuration
├── bot-play.html             # Bot game play area
├── README.md                 # This file
├── dictionary.txt            # Word dictionary (~178K valid words)
│
├── js/                       # Game JavaScript
│   ├── main.js               # Single player game logic
│   ├── bot-game-main.js      # Bot mode game engine
│   ├── bot-setup.js          # Bot configuration handler
│   ├── easy-bot.js           # Easy AI implementation
│   ├── medium-bot.js         # Medium AI implementation
│   ├── hard-bot.js           # Hard AI implementation
│   └── expert-bot.js         # Expert AI with advanced heuristics
│
├── Assets/
│   ├── Data/
│   │   └── pieces.json       # Tile distribution and values
│   └── Images/
│       ├── Board_Components/ # Board element graphics
│       ├── Boards/           # Full board images
│       └── Tiles/            # Individual tile images (A-Z + Blank)
│
└── Src/
    ├── Components/           # Reusable UI components
    ├── Lib/                  # External libraries
    ├── Scripts/
    │   └── logger.js         # Logging utilities
    └── Styles/
        ├── index.css         # Single player styles
        ├── bot-game.css      # Bot mode styles
        └── bot-setup.css     # Setup page styles
```

## 🖥️ Running Locally

Since the game loads external resources, you'll need a local server:

### Option 1: Python (Recommended)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open: `http://localhost:8000/`

### Option 2: Node.js
```bash
npx serve .
```

### Option 3: VS Code Live Server
1. Install the "Live Server" extension
2. Right-click on `index.html` → "Open with Live Server"

### Option 4: PHP
```bash
php -S localhost:8000
```

## 🎯 How to Play

| Action | Control |
|--------|---------|
| Place tile | Drag from rack to board |
| Return tile | Double-click tile on board |
| Use blank tile | Place, then enter desired letter |
| Submit word | Click "Submit Word" button |
| Pass turn | Click "Pass" button |
| Shuffle rack | Click "Shuffle" button |

## 📊 Scoring

- **Letter Values**: Standard Scrabble scoring (A=1, B=3, Q=10, etc.)
- **Premium Squares**:
  - 🔴 Triple Word (TW) - 3× word score
  - 🟠 Double Word (DW) - 2× word score
  - 🔵 Triple Letter (TL) - 3× letter score
  - 🟢 Double Letter (DL) - 2× letter score
- **Bingo Bonus**: +50 points for using all 7 tiles

## 🤖 Bot AI Details

| Level | Candidates | Time Limit | Strategy |
|-------|------------|------------|----------|
| Easy | 3 | 15s | Common words only |
| Medium | 8 | 15s | Extended vocabulary |
| Hard | 15 | 20s | Full dictionary search |
| Expert | 50 | 25s | Prefix optimization, premium targeting |

## 🛠️ Technical Stack

- **Frontend**: Vanilla JavaScript, jQuery 3.7.1, jQuery UI 1.14.1
- **Dictionary**: Set-based O(1) word lookups
- **Performance**: Adaptive calibration for different hardware
- **Animations**: CSS transitions + jQuery UI for tile movements

## 📝 Notes

- The Expert bot uses advanced heuristics but may still miss some optimal plays
- Performance calibration runs on first load to adjust bot time limits
- Blank tiles can represent any letter (0 points)