(function () {
    'use strict';

    // ========================================
    // SCRABBLE GAME CONFIGURATION
    // ========================================

    // Centralized color scheme - matches CSS custom properties in bot-game.css
    const PLAYER_COLORS = {
        human: '#2ecc71',      // Green - same as --color-human
        bot1: '#e74c3c',       // Red - same as --color-bot-1  
        bot2: '#9b59b6',       // Purple - same as --color-bot-2
        bot3: '#f39c12'        // Orange - same as --color-bot-3
    };

    // Get bot color by index (0-based)
    function getBotColor(index) {
        const colors = [PLAYER_COLORS.bot1, PLAYER_COLORS.bot2, PLAYER_COLORS.bot3];
        return colors[index % colors.length];
    }

    const ScrabbleTiles = {
        'A': { value: 1, count: 9 }, 'B': { value: 3, count: 2 }, 'C': { value: 3, count: 2 },
        'D': { value: 2, count: 4 }, 'E': { value: 1, count: 12 }, 'F': { value: 4, count: 2 },
        'G': { value: 2, count: 3 }, 'H': { value: 4, count: 2 }, 'I': { value: 1, count: 9 },
        'J': { value: 8, count: 1 }, 'K': { value: 5, count: 1 }, 'L': { value: 1, count: 4 },
        'M': { value: 3, count: 2 }, 'N': { value: 1, count: 6 }, 'O': { value: 1, count: 8 },
        'P': { value: 3, count: 2 }, 'Q': { value: 10, count: 1 }, 'R': { value: 1, count: 6 },
        'S': { value: 1, count: 4 }, 'T': { value: 1, count: 6 }, 'U': { value: 1, count: 4 },
        'V': { value: 4, count: 2 }, 'W': { value: 4, count: 2 }, 'X': { value: 8, count: 1 },
        'Y': { value: 4, count: 2 }, 'Z': { value: 10, count: 1 }, '_': { value: 0, count: 2 }
    };

    const BOARD_SIZE = 15;
    const BONUS = {
        TW: 'triple-word', DW: 'double-word', TL: 'triple-letter',
        DL: 'double-letter', ST: 'start', NO: 'normal'
    };

    const BOARD_LAYOUT = [
        ['TW', 'NO', 'NO', 'DL', 'NO', 'NO', 'NO', 'TW', 'NO', 'NO', 'NO', 'DL', 'NO', 'NO', 'TW'],
        ['NO', 'DW', 'NO', 'NO', 'NO', 'TL', 'NO', 'NO', 'NO', 'TL', 'NO', 'NO', 'NO', 'DW', 'NO'],
        ['NO', 'NO', 'DW', 'NO', 'NO', 'NO', 'DL', 'NO', 'DL', 'NO', 'NO', 'NO', 'DW', 'NO', 'NO'],
        ['DL', 'NO', 'NO', 'DW', 'NO', 'NO', 'NO', 'DL', 'NO', 'NO', 'NO', 'DW', 'NO', 'NO', 'DL'],
        ['NO', 'NO', 'NO', 'NO', 'DW', 'NO', 'NO', 'NO', 'NO', 'NO', 'DW', 'NO', 'NO', 'NO', 'NO'],
        ['NO', 'TL', 'NO', 'NO', 'NO', 'TL', 'NO', 'NO', 'NO', 'TL', 'NO', 'NO', 'NO', 'TL', 'NO'],
        ['NO', 'NO', 'DL', 'NO', 'NO', 'NO', 'DL', 'NO', 'DL', 'NO', 'NO', 'NO', 'DL', 'NO', 'NO'],
        ['TW', 'NO', 'NO', 'DL', 'NO', 'NO', 'NO', 'ST', 'NO', 'NO', 'NO', 'DL', 'NO', 'NO', 'TW'],
        ['NO', 'NO', 'DL', 'NO', 'NO', 'NO', 'DL', 'NO', 'DL', 'NO', 'NO', 'NO', 'DL', 'NO', 'NO'],
        ['NO', 'TL', 'NO', 'NO', 'NO', 'TL', 'NO', 'NO', 'NO', 'TL', 'NO', 'NO', 'NO', 'TL', 'NO'],
        ['NO', 'NO', 'NO', 'NO', 'DW', 'NO', 'NO', 'NO', 'NO', 'NO', 'DW', 'NO', 'NO', 'NO', 'NO'],
        ['DL', 'NO', 'NO', 'DW', 'NO', 'NO', 'NO', 'DL', 'NO', 'NO', 'NO', 'DW', 'NO', 'NO', 'DL'],
        ['NO', 'NO', 'DW', 'NO', 'NO', 'NO', 'DL', 'NO', 'DL', 'NO', 'NO', 'NO', 'DW', 'NO', 'NO'],
        ['NO', 'DW', 'NO', 'NO', 'NO', 'TL', 'NO', 'NO', 'NO', 'TL', 'NO', 'NO', 'NO', 'DW', 'NO'],
        ['TW', 'NO', 'NO', 'DL', 'NO', 'NO', 'NO', 'TW', 'NO', 'NO', 'NO', 'DL', 'NO', 'NO', 'TW']
    ];

    // ========================================
    // GAME STATE
    // ========================================

    let tileBag = [];
    let boardState = [];
    let firstWordPlayed = false;
    let dictionary = new Set();
    let dictionaryLoaded = false;
    let turnNumber = 0;
    let wordHistory = [];
    let gameOver = false;
    let consecutivePasses = 0;

    // Multi-player state
    let players = [];           // Array of player objects
    let currentPlayerIndex = 0; // Whose turn it is
    let currentTurnTiles = [];  // Tiles placed this turn
    let gameConfig = null;      // Bot configuration from setup page

    // ========================================
    // PERFORMANCE DETECTION & ADAPTATION
    // ========================================

    // Performance profile - populated by calibration
    let performanceProfile = {
        cpuCores: navigator.hardwareConcurrency || 2,
        performanceScore: 1.0,  // 1.0 = baseline, <1 = slower, >1 = faster
        timeMultiplier: 1.0,    // Applied to bot time limits
        isLowEnd: false,
        calibrated: false
    };

    /**
     * Run calibration using actual dictionary operations
     * This measures exactly what bots do: Set lookups and string manipulation
     * @param {Set} dict - The loaded dictionary Set
     */
    function calibrateWithDictionary(dict) {
        const iterations = 5000;

        // Test words that simulate bot word-finding
        const testRacks = [
            ['S', 'C', 'R', 'A', 'B', 'L', 'E'],
            ['T', 'E', 'S', 'T', 'I', 'N', 'G'],
            ['W', 'O', 'R', 'D', 'S', 'A', 'E'],
            ['Q', 'U', 'I', 'Z', 'X', 'J', 'K']
        ];

        const testWords = ['THE', 'AND', 'SCRABBLE', 'TESTING', 'WORD', 'QUIZ',
            'ABLE', 'BEST', 'CARE', 'DONE', 'EACH', 'FAST'];

        const start = performance.now();

        // Simulate what bots actually do
        for (let i = 0; i < iterations; i++) {
            const rack = testRacks[i % testRacks.length];
            const word = testWords[i % testWords.length];

            // Dictionary lookup (primary bot operation)
            dict.has(word);
            dict.has(word.toLowerCase());

            // Rack manipulation (canFormWord check)
            const rackCopy = [...rack];
            for (const letter of word) {
                const idx = rackCopy.indexOf(letter);
                if (idx !== -1) rackCopy.splice(idx, 1);
            }

            // String operations
            word.toUpperCase();
            rack.join('').split('').sort().join('');
        }

        const elapsed = performance.now() - start;

        // Baseline: ~50ms on a decent machine for 5k dictionary iterations
        const baselineMs = 50;
        performanceProfile.performanceScore = baselineMs / elapsed;

        // Determine device tier and time multiplier
        if (performanceProfile.performanceScore < 0.25) {
            performanceProfile.timeMultiplier = 3.0;  // Very slow device
            performanceProfile.isLowEnd = true;
        } else if (performanceProfile.performanceScore < 0.5) {
            performanceProfile.timeMultiplier = 2.0;  // Slow device
            performanceProfile.isLowEnd = true;
        } else if (performanceProfile.performanceScore < 0.75) {
            performanceProfile.timeMultiplier = 1.5;  // Below average
            performanceProfile.isLowEnd = false;
        } else if (performanceProfile.performanceScore < 1.0) {
            performanceProfile.timeMultiplier = 1.2;  // Slightly below baseline
            performanceProfile.isLowEnd = false;
        } else {
            performanceProfile.timeMultiplier = 1.0;  // Good performance
            performanceProfile.isLowEnd = false;
        }

        performanceProfile.calibrated = true;

        console.log('🎮 Performance Profile:', {
            cpuCores: performanceProfile.cpuCores,
            score: performanceProfile.performanceScore.toFixed(2),
            tier: performanceProfile.performanceScore >= 1.0 ? 'Fast' :
                performanceProfile.performanceScore >= 0.75 ? 'Good' :
                    performanceProfile.performanceScore >= 0.5 ? 'Average' :
                        performanceProfile.performanceScore >= 0.25 ? 'Slow' : 'Very Slow',
            timeMultiplier: performanceProfile.timeMultiplier + 'x',
            benchmarkTime: elapsed.toFixed(1) + 'ms'
        });

        return performanceProfile;
    }

    /**
     * Get adjusted time limit for a bot based on device performance
     */
    function getAdjustedTimeLimit(baseTimeLimit) {
        if (!performanceProfile.calibrated) {
            return baseTimeLimit;
        }
        return Math.round(baseTimeLimit * performanceProfile.timeMultiplier);
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    $(function () {
        initGame();
    });

    async function initGame() {
        startAction('Bot Game Initialization');

        // Load game configuration
        gameConfig = JSON.parse(sessionStorage.getItem('botGameConfig'));
        if (!gameConfig || !gameConfig.bots || gameConfig.bots.length === 0) {
            alert('No game configuration found! Redirecting to setup...');
            window.location.href = 'bot-game.html';
            return;
        }

        // Load dictionary
        await loadDictionary();

        // Initialize game
        initTileBag();
        initBoardState();
        initPlayers();
        generateBoard();

        // Deal tiles to all players
        players.forEach(player => {
            dealTilesToPlayer(player, 7);
        });

        // Update displays
        updateAllDisplays();

        // Bind events
        bindButtonEvents();
        setupTileSwapZone();

        // Start game - player always goes first
        updateTurnIndicator();
        showMessage('Your turn! Drag tiles to form a word.', 'info');

        endAction('Bot Game Initialization');
    }

    function initPlayers() {
        // Human player always first
        players = [{
            id: 0,
            name: 'You',
            icon: '👤',
            isBot: false,
            rack: [],
            score: 0,
            color: gameConfig.playerColor || PLAYER_COLORS.human
        }];

        // Add bots from config
        gameConfig.bots.forEach((bot, idx) => {
            players.push({
                id: idx + 1,
                name: bot.name,
                icon: bot.icon,
                isBot: true,
                difficulty: bot.difficulty,
                timeLimit: bot.timeLimit,
                rack: [],
                score: 0,
                color: bot.color || getBotColor(idx)
            });
        });

        currentPlayerIndex = 0;
        renderPlayerScores();
    }

    // ========================================
    // TILE BAG & DEALING
    // ========================================

    function initTileBag() {
        tileBag = [];
        for (let letter in ScrabbleTiles) {
            for (let i = 0; i < ScrabbleTiles[letter].count; i++) {
                tileBag.push(letter);
            }
        }
        shuffleArray(tileBag);
    }

    function initBoardState() {
        boardState = [];
        for (let row = 0; row < BOARD_SIZE; row++) {
            boardState[row] = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                boardState[row][col] = null;
            }
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function dealTilesToPlayer(player, count) {
        const needed = Math.min(count, 7 - player.rack.length, tileBag.length);
        for (let i = 0; i < needed; i++) {
            const letter = tileBag.pop();
            if (letter) player.rack.push(letter);
        }
    }

    // ========================================
    // DICTIONARY
    // ========================================

    async function loadDictionary() {
        try {
            showMessage('Loading dictionary...', 'info');

            const response = await fetch('./dictionary.txt');
            if (!response.ok) throw new Error('Failed to load dictionary');
            const text = await response.text();
            const words = text.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length > 0);
            dictionary = new Set(words);
            dictionaryLoaded = true;
            console.log(`Dictionary loaded: ${dictionary.size} words`);

            // Run performance calibration with the actual dictionary
            calibrateWithDictionary(dictionary);

            // Show performance info if low-end device detected
            if (performanceProfile.isLowEnd) {
                console.log('⚠️ Low-end device detected. Bot time limits adjusted for better performance.');
            }
        } catch (error) {
            console.error('Error loading dictionary:', error);
            showMessage('Warning: Dictionary failed to load.', 'error');
            dictionaryLoaded = false;
        }
    }

    function isValidWord(word) {
        if (!dictionaryLoaded) return true;
        return dictionary.has(word.toUpperCase());
    }

    // ========================================
    // BOARD GENERATION
    // ========================================

    function generateBoard() {
        const $board = $('#scrabble-board');
        $board.empty();

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const bonusType = BOARD_LAYOUT[row][col];
                const bonusClass = BONUS[bonusType];

                const $cell = $('<div>')
                    .addClass('board-cell')
                    .addClass(bonusClass)
                    .attr('data-row', row)
                    .attr('data-col', col);

                let labelText = '';
                switch (bonusType) {
                    case 'TW': labelText = 'TW'; break;
                    case 'DW': labelText = 'DW'; break;
                    case 'TL': labelText = 'TL'; break;
                    case 'DL': labelText = 'DL'; break;
                    case 'ST': labelText = '★'; break;
                }
                if (labelText) {
                    $cell.append($('<span>').addClass('bonus-label').text(labelText));
                }

                $cell.droppable({
                    accept: '.tile',
                    hoverClass: 'cell-hover',
                    drop: function (event, ui) {
                        handleTileDrop(event, ui, $(this));
                    }
                });

                $board.append($cell);
            }
        }
    }

    // ========================================
    // PLAYER RACK (Human only)
    // ========================================

    function renderRack() {
        const $rack = $('#tile-rack');
        if ($rack.hasClass('ui-sortable')) {
            $rack.sortable('destroy');
        }
        $rack.empty();

        const humanPlayer = players[0];

        // Safety guard: Ensure rack never exceeds 7 tiles
        if (humanPlayer.rack.length > 7) {
            console.warn(`Rack overflow detected: ${humanPlayer.rack.length} tiles. Trimming to 7.`);
            humanPlayer.rack = humanPlayer.rack.slice(0, 7);
        }

        humanPlayer.rack.forEach((letter, index) => {
            const $tile = createTileElement(letter, index);
            $rack.append($tile);
        });

        // Make rack tiles swappable
        setupRackSwapping();

        // Make rack droppable to receive tiles from board
        setupRackAsDropzone();
    }

    function setupRackSwapping() {
        const $rack = $('#tile-rack');

        // Make each tile in rack droppable for swapping
        $rack.find('.tile').each(function () {
            const $targetTile = $(this);

            $targetTile.droppable({
                accept: '#tile-rack .tile',
                tolerance: 'pointer',
                over: function (event, ui) {
                    if (ui.draggable[0] !== this) {
                        $(this).addClass('swap-target');
                    }
                },
                out: function () {
                    $(this).removeClass('swap-target');
                },
                drop: function (event, ui) {
                    $(this).removeClass('swap-target');

                    const $draggedTile = ui.draggable;
                    const draggedIndex = parseInt($draggedTile.attr('data-rack-index'));
                    const targetIndex = parseInt($targetTile.attr('data-rack-index'));

                    if (draggedIndex === targetIndex) return;

                    // Swap in the player's rack array
                    const temp = players[0].rack[draggedIndex];
                    players[0].rack[draggedIndex] = players[0].rack[targetIndex];
                    players[0].rack[targetIndex] = temp;

                    renderRackWithAnimation();
                }
            });
        });
    }

    function setupRackAsDropzone() {
        const $rack = $('#tile-rack');

        // Make the rack itself droppable for tiles from the board
        if ($rack.hasClass('ui-droppable')) {
            $rack.droppable('destroy');
        }

        $rack.droppable({
            accept: '.tile.placed.current-turn-tile',
            tolerance: 'pointer',
            over: function () {
                $(this).addClass('rack-hover');
            },
            out: function () {
                $(this).removeClass('rack-hover');
            },
            drop: function (event, ui) {
                $(this).removeClass('rack-hover');
                const $tile = ui.draggable;
                returnTileToRack($tile);
            }
        });
    }

    function returnTileToRack($tile) {
        const row = parseInt($tile.data('board-row'));
        const col = parseInt($tile.data('board-col'));
        const letter = $tile.data('original-letter') || $tile.data('letter');

        // Guard: Validate data
        if (isNaN(row) || isNaN(col)) {
            console.warn('Invalid tile data for return to rack');
            return;
        }

        // Guard: Check if tile is actually on board
        if (boardState[row][col] === null) {
            console.warn('Tile position already empty');
            return;
        }

        // Guard: Prevent rack overflow (max 7 tiles)
        if (players[0].rack.length >= 7) {
            console.warn('Rack full, cannot return tile');
            showMessage('Rack is full!', 'error');
            return;
        }

        // Remove from board state
        boardState[row][col] = null;

        // Remove from currentTurnTiles
        const idx = currentTurnTiles.findIndex(t => t.row === row && t.col === col);
        if (idx !== -1) {
            currentTurnTiles.splice(idx, 1);
        }

        // Clear the cell
        const $cell = $(`.board-cell[data-row="${row}"][data-col="${col}"]`);
        $cell.find('.tile').remove();
        $cell.removeClass('has-tile');

        // Return letter to rack (with guard)
        if (players[0].rack.length < 7) {
            players[0].rack.push(letter);
        }

        // Re-render
        renderRack();
        calculateAndDisplayScore();
        showMessage('Tile returned to rack.', 'info');
    }

    function renderRackWithAnimation() {
        const $rack = $('#tile-rack');
        $rack.find('.tile').addClass('swapping');
        setTimeout(() => {
            renderRack();
        }, 50);
    }

    function createTileElement(letter, index) {
        if (!letter) letter = '?';
        const displayLetter = letter === '_' ? 'Blank' : letter;
        const imagePath = `./Assets/Images/Tiles/Scrabble_Tile_${displayLetter}.jpg`;

        const $tile = $('<div>')
            .addClass('tile')
            .attr('data-letter', letter)
            .attr('data-original-letter', letter)  // Keep track of original letter for blanks
            .attr('data-rack-index', index)
            .append($('<img>').attr('src', imagePath).attr('alt', letter));

        $tile.draggable({
            revert: 'invalid',
            revertDuration: 200,
            cursor: 'grabbing',
            zIndex: 1000,
            start: function () {
                $(this).addClass('dragging');
                $('body').addClass('dragging-active');
            },
            stop: function () {
                $(this).removeClass('dragging');
                $('body').removeClass('dragging-active');
            }
        });

        return $tile;
    }

    // ========================================
    // TILE PLACEMENT
    // ========================================

    function handleTileDrop(event, ui, $cell) {
        if (currentPlayerIndex !== 0) return; // Not human's turn

        const $tile = ui.draggable;
        const letter = $tile.data('letter');
        const originalLetter = $tile.data('original-letter') || letter;
        const row = parseInt($cell.data('row'));
        const col = parseInt($cell.data('col'));

        // Check if this tile is coming from the board (a move, not new placement)
        const isFromBoard = $tile.hasClass('current-turn-tile');
        const oldRow = parseInt($tile.data('board-row'));
        const oldCol = parseInt($tile.data('board-col'));

        if (boardState[row][col] !== null) {
            showMessage('Cell already has a tile!', 'error');
            return;
        }

        if (isFromBoard) {
            // Moving a tile from one board position to another
            moveTileOnBoard($tile, oldRow, oldCol, row, col, originalLetter, letter);
        } else if (originalLetter === '_') {
            const chosenLetter = promptForBlankLetter();
            if (!chosenLetter) return;
            placeBlankTile($tile, $cell, row, col, chosenLetter);
        } else {
            placeTile($tile, $cell, row, col, letter);
        }
    }

    function moveTileOnBoard($tile, oldRow, oldCol, newRow, newCol, originalLetter, displayLetter) {
        // Clear old position
        boardState[oldRow][oldCol] = null;
        const $oldCell = $(`.board-cell[data-row="${oldRow}"][data-col="${oldCol}"]`);
        $oldCell.removeClass('has-tile');

        // Update currentTurnTiles
        const idx = currentTurnTiles.findIndex(t => t.row === oldRow && t.col === oldCol);
        if (idx !== -1) {
            currentTurnTiles[idx].row = newRow;
            currentTurnTiles[idx].col = newCol;
        }

        // Set new position in board state
        if (originalLetter === '_') {
            boardState[newRow][newCol] = { isBlank: true, letter: displayLetter };
        } else {
            boardState[newRow][newCol] = displayLetter;
        }

        // Position tile in new cell
        const $newCell = $(`.board-cell[data-row="${newRow}"][data-col="${newCol}"]`);
        $tile.detach().css({ position: 'absolute', top: 0, left: 0 });
        $tile.attr('data-board-row', newRow).attr('data-board-col', newCol);
        $newCell.append($tile).addClass('has-tile');

        calculateAndDisplayScore();
        showMessage('Tile moved!', 'success');
    }

    function promptForBlankLetter() {
        let letter = null;
        while (!letter) {
            const input = prompt('Enter a letter for the blank tile (A-Z):');
            if (input === null) return null;
            const l = input.trim().toUpperCase();
            if (l.length === 1 && l >= 'A' && l <= 'Z') letter = l;
        }
        return letter;
    }

    function placeTile($tile, $cell, row, col, letter) {
        const rackIndex = $tile.data('rack-index');
        const originalLetter = $tile.data('original-letter') || letter;

        // Remove from rack by finding the letter (more reliable than index)
        if (rackIndex !== undefined) {
            const letterIdx = players[0].rack.indexOf(originalLetter);
            if (letterIdx !== -1) {
                players[0].rack.splice(letterIdx, 1);
            } else {
                // Fallback to index-based removal
                if (rackIndex < players[0].rack.length) {
                    players[0].rack.splice(rackIndex, 1);
                }
            }
        }

        boardState[row][col] = letter;
        currentTurnTiles.push({ row, col, letter, representedLetter: letter });

        $tile.detach().css({ position: 'absolute', top: 0, left: 0 });
        $tile.addClass('placed current-turn-tile');
        $tile.attr('data-board-row', row).attr('data-board-col', col);
        $tile.removeAttr('data-rack-index');
        // Keep draggable enabled so tiles can be moved during current turn
        $cell.append($tile).addClass('has-tile');

        renderRack();
        calculateAndDisplayScore();
    }

    function placeBlankTile($tile, $cell, row, col, representedLetter) {
        const rackIndex = $tile.data('rack-index');

        // Remove blank from rack by finding it (more reliable)
        if (rackIndex !== undefined) {
            const blankIdx = players[0].rack.indexOf('_');
            if (blankIdx !== -1) {
                players[0].rack.splice(blankIdx, 1);
            } else if (rackIndex < players[0].rack.length) {
                players[0].rack.splice(rackIndex, 1);
            }
        }

        boardState[row][col] = { isBlank: true, letter: representedLetter };
        currentTurnTiles.push({ row, col, letter: '_', representedLetter });

        $tile.detach().css({ position: 'absolute', top: 0, left: 0 });
        $tile.addClass('placed current-turn-tile');
        $tile.attr('data-board-row', row).attr('data-board-col', col);
        $tile.attr('data-letter', representedLetter);  // Update displayed letter
        $tile.removeAttr('data-rack-index');
        // Keep original-letter as '_' for returning to rack
        $tile.append($('<span>').addClass('blank-letter-overlay').text(representedLetter));
        // Keep draggable enabled so tiles can be moved during current turn
        $cell.append($tile).addClass('has-tile');

        renderRack();
        calculateAndDisplayScore();
    }

    // ========================================
    // SCORING
    // ========================================

    function calculateAndDisplayScore() {
        const wordsData = findAllWordsFormed();
        updateWordsDisplay(wordsData);
    }

    function findAllWordsFormed() {
        const words = [];
        if (currentTurnTiles.length === 0) return words;

        const positions = currentTurnTiles.map(t => ({ row: t.row, col: t.col }));
        const rows = [...new Set(positions.map(p => p.row))];
        const cols = [...new Set(positions.map(p => p.col))];

        if (rows.length === 1) {
            const mainWord = getWordAt(rows[0], positions[0].col, 'horizontal');
            if (mainWord && mainWord.word.length > 1) words.push(mainWord);
            for (const tile of currentTurnTiles) {
                const perpWord = getWordAt(tile.row, tile.col, 'vertical');
                if (perpWord && perpWord.word.length > 1) words.push(perpWord);
            }
        } else if (cols.length === 1) {
            const mainWord = getWordAt(positions[0].row, cols[0], 'vertical');
            if (mainWord && mainWord.word.length > 1) words.push(mainWord);
            for (const tile of currentTurnTiles) {
                const perpWord = getWordAt(tile.row, tile.col, 'horizontal');
                if (perpWord && perpWord.word.length > 1) words.push(perpWord);
            }
        } else {
            for (const tile of currentTurnTiles) {
                const hWord = getWordAt(tile.row, tile.col, 'horizontal');
                if (hWord && hWord.word.length > 1) words.push(hWord);
                const vWord = getWordAt(tile.row, tile.col, 'vertical');
                if (vWord && vWord.word.length > 1) words.push(vWord);
            }
        }

        return words;
    }

    function getWordAt(row, col, direction) {
        let startRow = row, startCol = col, endRow = row, endCol = col;

        if (direction === 'horizontal') {
            while (startCol > 0 && boardState[row][startCol - 1] !== null) startCol--;
            while (endCol < BOARD_SIZE - 1 && boardState[row][endCol + 1] !== null) endCol++;
            if (startCol === endCol) return null;

            let word = '', baseScore = 0, wordMultiplier = 1;
            let hasDoubleWord = false, hasTripleWord = false;
            const letters = [];

            for (let c = startCol; c <= endCol; c++) {
                const cellValue = boardState[row][c];
                const letter = getLetter(cellValue);
                const displayLetter = getDisplayLetter(cellValue);
                word += displayLetter;

                const isNewTile = currentTurnTiles.some(t => t.row === row && t.col === c);
                const letterBaseValue = getTileValue(letter);
                const bonus = BOARD_LAYOUT[row][c];
                let letterScore = letterBaseValue;

                if (isNewTile) {
                    if (bonus === 'DL') letterScore *= 2;
                    else if (bonus === 'TL') letterScore *= 3;
                    if (bonus === 'DW' || bonus === 'ST') {
                        wordMultiplier *= 2;
                        hasDoubleWord = true;
                    } else if (bonus === 'TW') {
                        wordMultiplier *= 3;
                        hasTripleWord = true;
                    }
                }

                baseScore += letterScore;
                letters.push({ letter: displayLetter, baseValue: letterBaseValue, score: letterScore });
            }

            return { word, score: baseScore * wordMultiplier, wordMultiplier, hasDoubleWord, hasTripleWord, letters, startRow: row, startCol, direction };
        } else {
            while (startRow > 0 && boardState[startRow - 1][col] !== null) startRow--;
            while (endRow < BOARD_SIZE - 1 && boardState[endRow + 1][col] !== null) endRow++;
            if (startRow === endRow) return null;

            let word = '', baseScore = 0, wordMultiplier = 1;
            let hasDoubleWord = false, hasTripleWord = false;
            const letters = [];

            for (let r = startRow; r <= endRow; r++) {
                const cellValue = boardState[r][col];
                const letter = getLetter(cellValue);
                const displayLetter = getDisplayLetter(cellValue);
                word += displayLetter;

                const isNewTile = currentTurnTiles.some(t => t.row === r && t.col === col);
                const letterBaseValue = getTileValue(letter);
                const bonus = BOARD_LAYOUT[r][col];
                let letterScore = letterBaseValue;

                if (isNewTile) {
                    if (bonus === 'DL') letterScore *= 2;
                    else if (bonus === 'TL') letterScore *= 3;
                    if (bonus === 'DW' || bonus === 'ST') {
                        wordMultiplier *= 2;
                        hasDoubleWord = true;
                    } else if (bonus === 'TW') {
                        wordMultiplier *= 3;
                        hasTripleWord = true;
                    }
                }

                baseScore += letterScore;
                letters.push({ letter: displayLetter, baseValue: letterBaseValue, score: letterScore });
            }

            return { word, score: baseScore * wordMultiplier, wordMultiplier, hasDoubleWord, hasTripleWord, letters, startRow, startCol: col, direction };
        }
    }

    function getLetter(cellValue) {
        if (cellValue === null) return '';
        if (typeof cellValue === 'object' && cellValue.isBlank) return '_';
        return typeof cellValue === 'object' ? cellValue.letter : cellValue;
    }

    function getDisplayLetter(cellValue) {
        if (cellValue === null) return '';
        if (typeof cellValue === 'object') return cellValue.letter;
        return cellValue;
    }

    function getTileValue(letter) {
        if (letter === '_') return 0;
        return ScrabbleTiles[letter] ? ScrabbleTiles[letter].value : 0;
    }

    // ========================================
    // WORD VALIDATION
    // ========================================

    function tilesFormContinuousWord() {
        if (currentTurnTiles.length === 0) return false;
        if (currentTurnTiles.length === 1) return true; // Single tile is always valid

        // Get all placed tile positions
        const positions = currentTurnTiles.map(t => ({ row: t.row, col: t.col }));

        // Check if all tiles are in the same row (horizontal word)
        const rows = [...new Set(positions.map(p => p.row))];
        const cols = [...new Set(positions.map(p => p.col))];

        if (rows.length === 1) {
            // Horizontal - check for gaps in columns
            const row = rows[0];
            const sortedCols = cols.sort((a, b) => a - b);
            const minCol = sortedCols[0];
            const maxCol = sortedCols[sortedCols.length - 1];

            // Check that every cell between min and max has a tile (either new or existing)
            for (let col = minCol; col <= maxCol; col++) {
                if (boardState[row][col] === null) {
                    return false; // Gap found
                }
            }
            return true;
        } else if (cols.length === 1) {
            // Vertical - check for gaps in rows
            const col = cols[0];
            const sortedRows = rows.sort((a, b) => a - b);
            const minRow = sortedRows[0];
            const maxRow = sortedRows[sortedRows.length - 1];

            // Check that every cell between min and max has a tile (either new or existing)
            for (let row = minRow; row <= maxRow; row++) {
                if (boardState[row][col] === null) {
                    return false; // Gap found
                }
            }
            return true;
        } else {
            // Tiles are neither in a single row nor a single column - invalid
            return false;
        }
    }

    function newTilesConnectToExisting() {
        // Check if any of the newly placed tiles are adjacent to (or use) existing tiles
        // A tile connects if it's next to an existing tile OR if the word includes existing tiles

        for (const tile of currentTurnTiles) {
            const row = tile.row;
            const col = tile.col;

            // Check all 4 adjacent cells
            const adjacentPositions = [
                { r: row - 1, c: col }, // above
                { r: row + 1, c: col }, // below
                { r: row, c: col - 1 }, // left
                { r: row, c: col + 1 }  // right
            ];

            for (const pos of adjacentPositions) {
                // Check bounds
                if (pos.r >= 0 && pos.r < BOARD_SIZE && pos.c >= 0 && pos.c < BOARD_SIZE) {
                    const adjacentCell = boardState[pos.r][pos.c];
                    // If adjacent cell has a tile that's NOT from current turn, we're connected
                    if (adjacentCell !== null) {
                        const isCurrentTurnTile = currentTurnTiles.some(t => t.row === pos.r && t.col === pos.c);
                        if (!isCurrentTurnTile) {
                            return true; // Found connection to existing tile
                        }
                    }
                }
            }
        }

        return false; // No connection found
    }

    function updateWordsDisplay(wordsData) {
        const $tbody = $('#words-list');
        $tbody.empty();

        if (wordsData.length === 0) {
            $tbody.append('<tr><td colspan="3" class="no-words">-</td></tr>');
            $('#turn-total-score').text('0');
            return;
        }

        let totalScore = 0;
        wordsData.forEach(wordInfo => {
            const $wordCell = $('<td>').addClass('word-text').text(wordInfo.word);
            const $multCell = $('<td>').addClass('word-multiplier').text(wordInfo.wordMultiplier + '×');
            const $scoreCell = $('<td>').addClass('word-score').text(wordInfo.score);
            $tbody.append($('<tr>').append($wordCell, $multCell, $scoreCell));
            totalScore += wordInfo.score;
        });

        $('#turn-total-score').text(totalScore);
    }

    // ========================================
    // TURN MANAGEMENT
    // ========================================

    function getCurrentPlayer() {
        return players[currentPlayerIndex];
    }

    function nextTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        currentTurnTiles = [];
        updateTurnIndicator();
        clearWordsDisplay();

        if (checkGameOver()) {
            endGame();
            return;
        }

        const player = getCurrentPlayer();
        if (player.isBot) {
            // Clear old bot highlights when a new bot starts playing
            clearBotHighlights();
            executeBotTurn(player);
        } else {
            // Keep bot highlights visible during player's turn so they can see what was played
            enablePlayerControls();
            renderRack();
            showMessage('Your turn!', 'info');
        }
    }

    function clearBotHighlights() {
        // Remove animation class from cells
        $('.board-cell').removeClass('bot-placed');
        // Remove bot styling from tiles - both class and inline styles
        $('.tile.bot-tile').removeClass('bot-tile').css({
            'border': '',
            'box-shadow': ''
        });
    }

    function updateTurnIndicator() {
        const player = getCurrentPlayer();
        const $indicator = $('#turn-indicator');
        const $name = $('#current-player');
        const $thinking = $('#bot-thinking');

        $name.text(player.name);
        $indicator.removeClass('your-turn bot-turn');
        $indicator.addClass(player.isBot ? 'bot-turn' : 'your-turn');
        $thinking.hide();

        // Update score table highlighting
        $('#player-scores-list tr').removeClass('current-turn');
        $(`#player-scores-list tr[data-player-id="${player.id}"]`).addClass('current-turn');
    }

    function enablePlayerControls() {
        $('#controls').removeClass('disabled');
        $('#tile-rack').removeClass('disabled');
    }

    function disablePlayerControls() {
        $('#controls').addClass('disabled');
        $('#tile-rack').addClass('disabled');
    }

    // ========================================
    // BOT TURN EXECUTION
    // ========================================

    const BASE_MIN_TURN_TIME = 7500; // 7.5 seconds minimum per turn for pacing

    // Get minimum turn time, adjusted for device performance
    function getMinTurnTime() {
        // On low-end devices, reduce min turn time since computation takes longer
        if (performanceProfile.isLowEnd) {
            return Math.round(BASE_MIN_TURN_TIME * 0.5); // 3.75s on slow devices
        }
        return BASE_MIN_TURN_TIME;
    }

    async function executeBotTurn(bot) {
        const turnStartTime = Date.now();
        const minTurnTime = getMinTurnTime();

        disablePlayerControls();
        $('#bot-thinking').show();
        showBotThinkingIndicator(bot);
        showMessage(`${bot.name} is thinking...`, 'info');

        // Small delay for UI
        await sleep(500);

        let move = null;

        // Get adjusted time limit for this device
        const adjustedTimeLimit = getAdjustedTimeLimit(bot.timeLimit * 1000);

        if (bot.difficulty === 'easy') {
            // Pass adjusted time limit to bot
            const originalTimeLimit = window.EasyBot.timeLimit;
            window.EasyBot.timeLimit = adjustedTimeLimit;
            move = window.EasyBot.findMove(bot.rack, boardState, dictionary, !firstWordPlayed);
            window.EasyBot.timeLimit = originalTimeLimit; // Restore
        } else if (bot.difficulty === 'medium') {
            const originalTimeLimit = window.MediumBot.timeLimit;
            window.MediumBot.timeLimit = adjustedTimeLimit;
            move = window.MediumBot.findMove(bot.rack, boardState, dictionary, !firstWordPlayed);
            window.MediumBot.timeLimit = originalTimeLimit; // Restore
        } else if (bot.difficulty === 'hard') {
            const originalTimeLimit = window.HardBot.timeLimit;
            window.HardBot.timeLimit = adjustedTimeLimit;
            move = window.HardBot.findMove(bot.rack, boardState, dictionary, !firstWordPlayed);
            window.HardBot.timeLimit = originalTimeLimit; // Restore
        } else if (bot.difficulty === 'expert') {
            const originalTimeLimit = window.ExpertBot.timeLimit;
            window.ExpertBot.timeLimit = adjustedTimeLimit;
            move = window.ExpertBot.findMove(bot.rack, boardState, dictionary, !firstWordPlayed);
            window.ExpertBot.timeLimit = originalTimeLimit; // Restore
        }

        // Ensure minimum turn time for game pacing
        const elapsed = Date.now() - turnStartTime;
        if (elapsed < minTurnTime) {
            await sleep(minTurnTime - elapsed);
        }

        hideBotThinkingIndicator();

        if (move && move.tiles && move.tiles.length > 0) {
            await executeBotMove(bot, move);
        } else {
            // Bot passes
            await botPass(bot);
        }
    }

    function showBotThinkingIndicator(bot) {
        // Add thinking dots next to bot's name in the score table
        const $botRow = $(`#player-scores-list tr[data-player-id="${bot.id}"]`);
        const $nameCell = $botRow.find('td:first');
        if (!$nameCell.find('.bot-thinking-inline').length) {
            $nameCell.append(
                $('<span>').addClass('bot-thinking-inline').css('color', bot.color).html(
                    '<span>.</span><span>.</span><span>.</span>'
                )
            );
        }
    }

    function hideBotThinkingIndicator() {
        $('.bot-thinking-inline').remove();
    }

    async function executeBotMove(bot, move) {
        console.log(`${bot.name} plays: ${move.word}`, move);

        // Animate placing tiles with flying animation
        for (const tile of move.tiles) {
            await placeBotTile(bot, tile);
            await sleep(100); // Small gap between tiles
        }

        await sleep(300);

        // Calculate score
        currentTurnTiles = move.tiles.map(t => ({
            row: t.row,
            col: t.col,
            letter: t.isBlank ? '_' : t.letter,
            representedLetter: t.letter
        }));

        const wordsFormed = findAllWordsFormed();
        let turnScore = wordsFormed.reduce((sum, w) => sum + w.score, 0);

        // Remove tiles from bot's rack
        for (const tile of move.tiles) {
            const letter = tile.isBlank ? '_' : tile.letter;
            const idx = bot.rack.indexOf(letter);
            if (idx !== -1) bot.rack.splice(idx, 1);
        }

        // Add score
        bot.score += turnScore;
        turnNumber++;
        firstWordPlayed = true;
        consecutivePasses = 0;

        // Add to word history
        wordsFormed.forEach(wordInfo => {
            wordHistory.push({
                turn: turnNumber,
                player: bot.name,
                word: wordInfo.word,
                score: wordInfo.score,
                letters: wordInfo.letters,
                hasDoubleWord: wordInfo.hasDoubleWord,
                hasTripleWord: wordInfo.hasTripleWord
            });
        });

        // Refill bot's rack
        dealTilesToPlayer(bot, 7 - bot.rack.length);

        showMessage(`${bot.name} played "${move.word}" for ${turnScore} points!`, 'success');

        updateAllDisplays();
        currentTurnTiles = [];

        await sleep(1000);
        nextTurn();
    }

    async function placeBotTile(bot, tile) {
        const { row, col, letter, isBlank } = tile;
        const displayLetter = letter;
        // For blanks, use the Blank tile image; otherwise use the letter's image
        const imagePath = isBlank
            ? `./Assets/Images/Tiles/Scrabble_Tile_Blank.jpg`
            : `./Assets/Images/Tiles/Scrabble_Tile_${displayLetter}.jpg`;
        const botColor = bot.color || PLAYER_COLORS.bot1;

        // Get source position (bot's row in scoreboard)
        const $botRow = $(`#player-scores-list tr[data-player-id="${bot.id}"]`);
        const $targetCell = $(`.board-cell[data-row="${row}"][data-col="${col}"]`);

        // Create flying tile with bot's color
        const $flyingTile = $('<div>')
            .addClass('tile flying-tile')
            .css({
                'border-color': botColor,
                'box-shadow': `0 8px 20px rgba(0, 0, 0, 0.5), 0 0 15px ${botColor}80`
            })
            .append($('<img>').attr('src', imagePath).attr('alt', letter));

        if (isBlank) {
            $flyingTile.append($('<span>').addClass('blank-letter-overlay').text(letter));
        }

        // Calculate positions
        const sourceOffset = $botRow.offset();
        const targetOffset = $targetCell.offset();

        // Append to body for animation
        $flyingTile.css({
            position: 'fixed',
            left: sourceOffset.left + 'px',
            top: sourceOffset.top + 'px',
            zIndex: 10000,
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        $('body').append($flyingTile);

        // Trigger reflow then animate
        $flyingTile[0].offsetHeight;
        $flyingTile.css({
            left: targetOffset.left + 'px',
            top: targetOffset.top + 'px'
        });

        // Wait for animation
        await sleep(400);

        // Remove flying tile and place real tile
        $flyingTile.remove();

        boardState[row][col] = isBlank ? { isBlank: true, letter } : letter;

        const $placedTile = $('<div>')
            .addClass('tile bot-tile placed')
            .css({
                'border': `2px solid ${botColor}`,
                'box-shadow': `0 0 8px ${botColor}80`
            })
            .append($('<img>').attr('src', imagePath).attr('alt', letter));

        if (isBlank) {
            $placedTile.append($('<span>').addClass('blank-letter-overlay').text(letter));
        }

        $targetCell.append($placedTile).addClass('has-tile bot-placed');
    }

    async function botPass(bot) {
        consecutivePasses++;
        turnNumber++;
        showMessage(`${bot.name} passed.`, 'info');

        wordHistory.push({
            turn: turnNumber,
            player: bot.name,
            word: '(pass)',
            score: 0
        });

        updateWordHistoryDisplay();

        await sleep(1000);
        nextTurn();
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========================================
    // BUTTON HANDLERS
    // ========================================

    function bindButtonEvents() {
        $('#submit-word').on('click', submitWord);
        $('#clear-board').on('click', clearCurrentTurn);
        $('#pass-turn').on('click', passTurn);
        $('#end-game').on('click', confirmEndGame);
    }

    function submitWord() {
        if (currentPlayerIndex !== 0) return;
        if (currentTurnTiles.length === 0) {
            showMessage('Place some tiles first!', 'error');
            return;
        }

        // Check if tiles form a continuous word (no gaps)
        if (!tilesFormContinuousWord()) {
            showMessage('Tiles must form ONE continuous word. No gaps or diagonal placements!', 'error');
            return;
        }

        // Validate first word on center
        if (!firstWordPlayed) {
            const onCenter = currentTurnTiles.some(t => t.row === 7 && t.col === 7);
            if (!onCenter) {
                showMessage('First word must cover the center star!', 'error');
                return;
            }
            if (currentTurnTiles.length < 2) {
                showMessage('First word must be at least 2 letters!', 'error');
                return;
            }
        } else {
            // After first word, new tiles must connect to existing tiles on the board
            if (!newTilesConnectToExisting()) {
                showMessage('Your word must connect to existing tiles on the board!', 'error');
                return;
            }
        }

        const wordsFormed = findAllWordsFormed();
        if (wordsFormed.length === 0) {
            showMessage('No valid word formed!', 'error');
            return;
        }

        // Validate all words
        for (const wordInfo of wordsFormed) {
            if (!isValidWord(wordInfo.word)) {
                showMessage(`"${wordInfo.word}" is not in the dictionary!`, 'error');
                return;
            }
        }

        // Calculate score
        const turnScore = wordsFormed.reduce((sum, w) => sum + w.score, 0);
        players[0].score += turnScore;
        turnNumber++;
        firstWordPlayed = true;
        consecutivePasses = 0;

        // Finalize placed tiles - disable dragging and remove current-turn markers
        $('.tile.current-turn-tile').each(function () {
            $(this).removeClass('current-turn-tile');
            $(this).draggable('disable');
        });

        // Add to history
        wordsFormed.forEach(wordInfo => {
            wordHistory.push({
                turn: turnNumber,
                player: 'You',
                word: wordInfo.word,
                score: wordInfo.score,
                letters: wordInfo.letters,
                hasDoubleWord: wordInfo.hasDoubleWord,
                hasTripleWord: wordInfo.hasTripleWord
            });
        });

        // Refill rack
        dealTilesToPlayer(players[0], 7 - players[0].rack.length);

        showMessage(`+${turnScore} points!`, 'success');
        updateAllDisplays();

        nextTurn();
    }

    function clearCurrentTurn() {
        currentTurnTiles.forEach(tile => {
            boardState[tile.row][tile.col] = null;
            // Return the original letter (important for blanks) - with guard
            if (players[0].rack.length < 7) {
                players[0].rack.push(tile.letter);
            }
            const $cell = $(`.board-cell[data-row="${tile.row}"][data-col="${tile.col}"]`);
            $cell.find('.tile').remove();
            $cell.removeClass('has-tile');
        });
        currentTurnTiles = [];

        // Safety: Trim rack to max 7 if somehow exceeded
        if (players[0].rack.length > 7) {
            console.warn('Rack overflow detected, trimming to 7');
            players[0].rack = players[0].rack.slice(0, 7);
        }

        renderRack();
        clearWordsDisplay();
        showMessage('Tiles returned to rack.', 'info');
    }

    function passTurn() {
        if (currentPlayerIndex !== 0) return;
        if (currentTurnTiles.length > 0) {
            clearCurrentTurn();
        }
        consecutivePasses++;
        turnNumber++;

        wordHistory.push({
            turn: turnNumber,
            player: 'You',
            word: '(pass)',
            score: 0
        });

        showMessage('You passed.', 'info');
        updateWordHistoryDisplay();
        nextTurn();
    }

    function confirmEndGame() {
        if (confirm('End the game now? Final scores will be calculated.')) {
            endGame();
        }
    }

    // ========================================
    // GAME END
    // ========================================

    function checkGameOver() {
        // Game over if: tile bag empty and any player has no tiles, or too many passes
        if (tileBag.length === 0) {
            for (const player of players) {
                if (player.rack.length === 0) return true;
            }
        }
        if (consecutivePasses >= players.length * 2) return true;
        return false;
    }

    function endGame() {
        gameOver = true;
        disablePlayerControls();

        // Subtract remaining tiles from each player
        players.forEach(player => {
            const penalty = player.rack.reduce((sum, letter) => sum + getTileValue(letter), 0);
            player.score -= penalty;
        });

        showGameOverScreen();
    }

    function showGameOverScreen() {
        const winner = players.reduce((a, b) => a.score > b.score ? a : b);
        const isPlayerWinner = winner.id === 0;

        const $overlay = $('<div>').attr('id', 'game-over-overlay');
        const $content = $('<div>').attr('id', 'game-over-content');

        $content.append($('<h2>').text('🏆 Game Over!'));
        $content.append($('<p>')
            .addClass('winner-text' + (isPlayerWinner ? '' : ' lost'))
            .text(isPlayerWinner ? 'You Won!' : `${winner.name} Wins!`));

        const $scores = $('<div>').attr('id', 'final-scores');
        const $table = $('<table>').append($('<tr>').append($('<th>').text('Player'), $('<th>').text('Score')));

        players.sort((a, b) => b.score - a.score).forEach(player => {
            const $row = $('<tr>').addClass(player === winner ? 'winner-row' : '');
            $row.append($('<td>').text(player.icon + ' ' + player.name));
            $row.append($('<td>').text(player.score));
            $table.append($row);
        });

        $scores.append($table);
        $content.append($scores);

        const $buttons = $('<div>').attr('id', 'game-over-buttons');
        $buttons.append($('<a>').addClass('btn btn-start').attr('href', 'bot-game.html').text('Play Again'));
        $buttons.append($('<a>').addClass('btn btn-back').attr('href', 'index.html').text('Single Player'));
        $content.append($buttons);

        $overlay.append($content);
        $('body').append($overlay);
    }

    // ========================================
    // UI UPDATES
    // ========================================

    function updateAllDisplays() {
        renderPlayerScores();
        updateWordHistoryDisplay();
        updateTileDistributionTable();
        if (currentPlayerIndex === 0) renderRack();
    }

    function renderPlayerScores() {
        const $tbody = $('#player-scores-list');
        $tbody.empty();

        players.forEach(player => {
            const $row = $('<tr>')
                .addClass('player-row')
                .addClass(player.isBot ? 'bot-player' : 'human-player')
                .attr('data-player-id', player.id);

            const $nameCell = $('<td>')
                .text(player.icon + ' ' + player.name)
                .css('color', player.color);

            const $scoreCell = $('<td>')
                .text(player.score)
                .css('color', player.color);

            $row.append($nameCell, $scoreCell);
            $tbody.append($row);
        });
    }

    function updateWordHistoryDisplay() {
        const $tbody = $('#word-history-list');
        $tbody.empty();

        if (wordHistory.length === 0) {
            $tbody.append('<tr><td colspan="4" class="no-history">No words yet</td></tr>');
            return;
        }

        [...wordHistory].reverse().forEach(entry => {
            // Find player color
            const player = players.find(p => p.name === entry.player);
            const playerColor = player ? player.color : '#ffffff';

            // Build rich word display with letter subscripts
            const $wordCell = $('<td>').addClass('history-word');

            if (entry.letters && entry.letters.length > 0) {
                // Rich display with subscripts
                entry.letters.forEach(letterInfo => {
                    const $letterSpan = $('<span>').addClass('word-letter');
                    $letterSpan.append($('<span>').addClass('letter-char').text(letterInfo.letter));
                    $letterSpan.append($('<sub>').addClass('letter-value').text(letterInfo.baseValue));
                    $wordCell.append($letterSpan);
                });
            } else {
                // Fallback to plain text (for passes/swaps)
                $wordCell.text(entry.word);
            }

            // Determine score color based on word multiplier
            const $scoreCell = $('<td>').addClass('history-score').text(entry.score);
            if (entry.hasTripleWord) {
                $scoreCell.addClass('score-triple-word');
            } else if (entry.hasDoubleWord) {
                $scoreCell.addClass('score-double-word');
            }

            // Player cell with their color
            const $playerCell = $('<td>')
                .addClass('history-player')
                .text(entry.player)
                .css('color', playerColor);

            const $row = $('<tr>')
                .append($('<td>').addClass('history-turn').text(entry.turn))
                .append($playerCell)
                .append($wordCell)
                .append($scoreCell);
            $tbody.append($row);
        });
    }

    function updateTileDistributionTable() {
        const $tbody = $('#remaining-tile-distribution-table tbody');
        $tbody.empty();

        const remaining = {};
        for (let letter in ScrabbleTiles) remaining[letter] = 0;
        tileBag.forEach(letter => remaining[letter]++);

        const letters = Object.keys(remaining).filter(l => l !== '_');
        letters.push('_');
        const half = Math.ceil(letters.length / 2);

        for (let i = 0; i < half; i++) {
            const $row = $('<tr>');
            const left = letters[i];
            const right = letters[i + half];

            $row.append($('<td>').text(left === '_' ? 'Blank' : left));
            $row.append($('<td>').text(remaining[left]));

            if (right) {
                $row.append($('<td>').text(right === '_' ? 'Blank' : right));
                $row.append($('<td>').text(remaining[right]));
            } else {
                $row.append($('<td>').text('◻️ Bag:'));
                $row.append($('<td>').text(tileBag.length));
            }

            $tbody.append($row);
        }
    }

    function clearWordsDisplay() {
        $('#words-list').html('<tr><td colspan="3" class="no-words">-</td></tr>');
        $('#turn-total-score').text('0');
    }

    function showMessage(message, type) {
        const $msg = $('#game-message');
        $msg.text(message).removeClass('success error info');
        if (type) $msg.addClass(type);
    }

    function setupTileSwapZone() {
        $('#swap-drop-area').droppable({
            accept: '#tile-rack .tile',
            hoverClass: 'swap-zone-hover',
            drop: function (event, ui) {
                if (currentPlayerIndex !== 0) return;
                const $tile = ui.draggable;
                const letter = $tile.data('letter');
                const idx = $tile.data('rack-index');

                if (confirm(`Swap "${letter === '_' ? 'Blank' : letter}" and pass your turn?`)) {
                    players[0].rack.splice(idx, 1);
                    tileBag.push(letter);
                    shuffleArray(tileBag);
                    dealTilesToPlayer(players[0], 1);
                    consecutivePasses++;
                    turnNumber++;
                    wordHistory.push({ turn: turnNumber, player: 'You', word: '(swap)', score: 0 });
                    showMessage('Tile swapped.', 'info');
                    updateAllDisplays();
                    nextTurn();
                } else {
                    renderRack();
                }
            }
        });
    }

})();
