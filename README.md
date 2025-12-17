# 🎲 Scrabble GUI
little word game
A fully-featured browser-based Scrabble game with AI opponents of varying difficulty levels.

## 👤 Author Information

| Field | Value |
|-------|-------|
| **Name** | Trent Brown |
| **Email** | tgbrown450@gmail.com |
| **Course** | UMass Lowell - GUI Programming I |
| **Assignment** | HW5 - Scrabble Game |
| **Date** | December 2024 |

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
