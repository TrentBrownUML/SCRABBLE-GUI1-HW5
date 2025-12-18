# 🎲 Little Word Game

A fully-featured browser-based word game with AI opponents and local multiplayer.

**Future Domain**: littlewordgame.com

## 👤 Author Information

| Field | Value |
|-------|-------|
| **Name** | Trent Brown |
| **Email** | tgbrown450@gmail.com |
| **Course** | UMass Lowell - GUI Programming I |
| **Assignment** | HW5 - Scrabble Game |
| **Date** | December 2024 |

## 🎮 Game Modes

- **📚 Training Mode** - Practice your word-building skills solo
- **🤖 Bot Challenge** - Play against 1-3 AI opponents
- **👥 Pass & Play** - Local multiplayer on one device (2-4 players)

### Bot Difficulty Levels
  - 🟢 **Easy** - Simple word selection, great for beginners
  - 🟡 **Medium** - Extended vocabulary, moderate challenge
  - 🔴 **Hard** - Full dictionary access, strategic play
  - ⚫ **Expert** - Advanced heuristics, premium tile targeting

### Pass & Play Features
  - 2-4 players on the same device
  - Custom player names (up to 12 characters)
  - Color wheel picker for player colors
  - Privacy handoff screen between turns
  - Player tiles highlighted with their color on the board

## 🌐 GitHub Pages Deployment

This project is configured for GitHub Pages deployment from the **root** directory.

## 📁 Project Structure

```
/ (root)
├── index.html                # Main splash page / game mode selection
├── training.html             # Training mode (single player)
├── bot-game.html             # Bot challenge setup
├── bot-play.html             # Bot match play area
├── passplay-lobby.html       # Pass & Play setup (names/colors)
├── passplay-game.html        # Pass & Play game
├── README.md                 # This file
├── dictionary.txt            # Word dictionary (~178K valid words)
│
├── js/                       # Game JavaScript
│   ├── main.js               # Training mode game logic
│   ├── bot-game-main.js      # Bot mode game engine
│   ├── bot-setup.js          # Bot configuration handler
│   ├── passplay-lobby.js     # Pass & Play lobby logic
│   ├── passplay-game.js      # Pass & Play game logic
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
        ├── index.css         # Base game styles
        ├── splash.css        # Splash page styles
        ├── bot-game.css      # Bot match styles
        ├── bot-setup.css     # Bot setup page styles
        ├── passplay-lobby.css # Pass & Play lobby styles
        └── passplay-game.css  # Pass & Play game styles
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

## Planned Features

- Word detection pre submit so player can know if their word is valid before locking in.
- More distinct "personality" of each bot, and maybe the potential to submit new bot ideas
