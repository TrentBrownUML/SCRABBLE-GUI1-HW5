/**
 * =============================================================================
 * LITTLE WORD GAME - Pass & Play Game Logic
 * =============================================================================
 * 
 * @file        passplay-game.js
 * @description Core game logic for Pass & Play multiplayer mode. Handles
 *              board rendering, tile management, turn rotation with handoff
 *              screens, word validation, scoring, and player color highlighting.
 * 
 * @author      Trent Brown
 * @contact     tgbrown450@gmail.com
 * @course      UMass Lowell - GUI Programming I
 * @assignment  HW5 - Scrabble Game
 * @date        December 2024
 * 
 * =============================================================================
 */

(function () {
    'use strict';

    // ========================================
    // SCRABBLE GAME CONFIGURATION
    // ========================================

    const ScrabbleTiles = {
        'A': { value: 1, count: 9 },
        'B': { value: 3, count: 2 },
        'C': { value: 3, count: 2 },
        'D': { value: 2, count: 4 },
        'E': { value: 1, count: 12 },
        'F': { value: 4, count: 2 },
        'G': { value: 2, count: 3 },
        'H': { value: 4, count: 2 },
        'I': { value: 1, count: 9 },
        'J': { value: 8, count: 1 },
        'K': { value: 5, count: 1 },
        'L': { value: 1, count: 4 },
        'M': { value: 3, count: 2 },
        'N': { value: 1, count: 6 },
        'O': { value: 1, count: 8 },
        'P': { value: 3, count: 2 },
        'Q': { value: 10, count: 1 },
        'R': { value: 1, count: 6 },
        'S': { value: 1, count: 4 },
        'T': { value: 1, count: 6 },
        'U': { value: 1, count: 4 },
        'V': { value: 4, count: 2 },
        'W': { value: 4, count: 2 },
        'X': { value: 8, count: 1 },
        'Y': { value: 4, count: 2 },
        'Z': { value: 10, count: 1 },
        '_': { value: 0, count: 2 }
    };

    const BOARD_SIZE = 15;

    const BONUS = {
        TW: 'triple-word',
        DW: 'double-word',
        TL: 'triple-letter',
        DL: 'double-letter',
        ST: 'start',
        NO: 'normal'
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

    let players = [];
    let currentPlayerIndex = 0;
    let tileBag = [];
    let playerRacks = {};           // { playerId: [letters] }
    let boardState = [];
    let boardOwnership = [];        // Track who placed each tile { playerId, color }
    let currentTurnTiles = [];
    let firstWordPlayed = false;
    let dictionary = new Set();
    let dictionaryLoaded = false;
    let roundNumber = 1;            // Tracks full rounds (increments after all players have played)
    let playsThisRound = 0;         // Count plays in current round
    let wordHistory = [];
    let consecutivePasses = 0;
    let gameOver = false;

    // Timer state
    let timerEnabled = false;
    let turnTimeLimit = 0;          // Seconds allowed per turn
    let turnStartTime = 0;          // When current turn started
    let turnTimerInterval = null;   // Interval for turn countdown
    let gameStartTime = 0;          // When game started
    let gameTimerInterval = null;   // Interval for game duration

    // ========================================
    // INITIALIZATION
    // ========================================

    $(function () {
        loadPlayersFromSession();
        if (players.length === 0) {
            window.location.href = 'passplay-lobby.html';
            return;
        }
        initGame();
    });

    function loadPlayersFromSession() {
        const stored = sessionStorage.getItem('passplay_players');
        if (stored) {
            players = JSON.parse(stored);
        }

        // Load timer configuration
        timerEnabled = sessionStorage.getItem('passplay_timer_enabled') === 'true';
        turnTimeLimit = parseInt(sessionStorage.getItem('passplay_turn_time')) || 0;
    }

    async function initGame() {
        await loadDictionary();
        initTileBag();
        initBoardState();
        generateBoard();

        // Deal tiles to all players
        players.forEach(player => {
            playerRacks[player.id] = [];
            dealTilesToPlayer(player.id, 7);
        });

        // Pick random starting player
        currentPlayerIndex = Math.floor(Math.random() * players.length);

        // Initialize timer display
        initTimerDisplay();

        updateScoreDisplay();
        updateTileDistributionTable();
        bindButtonEvents();
        setupTileSwapZone();

        // Start game timer
        gameStartTime = Date.now();
        startGameTimer();

        // Show initial handoff
        showHandoffScreen();
    }

    function initTimerDisplay() {
        // Show/hide turn timer based on configuration
        if (timerEnabled && turnTimeLimit > 0) {
            $('#turn-timer').removeClass('hidden');
        } else {
            $('#turn-timer').addClass('hidden');
        }
    }

    function startGameTimer() {
        gameTimerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            $('#game-duration').text(
                String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
            );
        }, 1000);
    }

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
        boardOwnership = [];
        for (let row = 0; row < BOARD_SIZE; row++) {
            boardState[row] = [];
            boardOwnership[row] = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                boardState[row][col] = null;
                boardOwnership[row][col] = null;
            }
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
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
            showMessage('Ready to play!', 'success');
        } catch (error) {
            console.error('Error loading dictionary:', error);
            dictionaryLoaded = false;
        }
    }

    function isValidWord(word) {
        if (!dictionaryLoaded) return true;
        return dictionary.has(word.toUpperCase());
    }

    // ========================================
    // HANDOFF SCREEN
    // ========================================

    function showHandoffScreen() {
        const player = players[currentPlayerIndex];
        const isFirstTurn = (roundNumber === 1 && playsThisRound === 0);

        $('#handoff-title').text(isFirstTurn ? 'First Player!' : 'Your Turn!');
        $('#handoff-player-name').text(player.name);
        $('#handoff-player-color-bar').css('background', player.color);

        if (isFirstTurn) {
            $('#handoff-message').text(`${player.name} has been randomly selected to go first! Make sure no one else is looking.`);
        } else {
            $('#handoff-message').text("It's your turn! Make sure no one else is looking at the screen.");
        }

        $('#handoff-overlay').removeClass('hidden');

        // Disable game controls while handoff is shown
        $('#controls button').prop('disabled', true);
    }

    function hideHandoffScreen() {
        $('#handoff-overlay').addClass('hidden');

        // Enable game controls
        $('#controls button').prop('disabled', false);

        // Render current player's rack
        renderRack();
        updateTurnIndicator();

        // Start turn timer if enabled
        startTurnTimer();
    }

    // ========================================
    // TURN TIMER FUNCTIONS
    // ========================================

    function startTurnTimer() {
        turnStartTime = Date.now();

        if (!timerEnabled || turnTimeLimit <= 0) return;

        // Reset countdown display
        updateTurnCountdown(turnTimeLimit);

        // Clear any existing interval
        if (turnTimerInterval) {
            clearInterval(turnTimerInterval);
        }

        turnTimerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - turnStartTime) / 1000);
            const remaining = Math.max(0, turnTimeLimit - elapsed);

            updateTurnCountdown(remaining);

            if (remaining <= 0) {
                clearInterval(turnTimerInterval);
                turnTimerInterval = null;
                autoPassTurn();
            }
        }, 100); // Update frequently for smooth countdown
    }

    function stopTurnTimer() {
        if (turnTimerInterval) {
            clearInterval(turnTimerInterval);
            turnTimerInterval = null;
        }
    }

    function getTurnDuration() {
        // Returns turn duration in seconds with one decimal
        return ((Date.now() - turnStartTime) / 1000).toFixed(1);
    }

    function updateTurnCountdown(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const $countdown = $('#turn-countdown');

        $countdown.text(
            String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0')
        );

        // Add warning class when low on time
        if (seconds <= 10) {
            $countdown.addClass('warning');
        } else if (seconds <= 30) {
            $countdown.addClass('low');
            $countdown.removeClass('warning');
        } else {
            $countdown.removeClass('low warning');
        }
    }

    function autoPassTurn() {
        showMessage('⏰ Time\'s up! Turn passed.', 'error');
        clearBoard();

        // Record pass in history with time
        const duration = getTurnDuration();
        consecutivePasses++;

        // Track plays in this round
        playsThisRound++;
        if (playsThisRound >= players.length) {
            roundNumber++;
            playsThisRound = 0;
        }

        if (consecutivePasses >= players.length * 2) {
            endGame();
            return;
        }

        nextTurn();
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
                    accept: '.tile:not(.placed)',
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
    // TILE MANAGEMENT
    // ========================================

    function getCurrentPlayerRack() {
        const player = players[currentPlayerIndex];
        return playerRacks[player.id] || [];
    }

    function setCurrentPlayerRack(rack) {
        const player = players[currentPlayerIndex];
        playerRacks[player.id] = rack;
    }

    function dealTilesToPlayer(playerId, count) {
        const rack = playerRacks[playerId] || [];
        const tilesToDeal = Math.min(count, 7 - rack.length, tileBag.length);

        for (let i = 0; i < tilesToDeal; i++) {
            const letter = tileBag.pop();
            if (letter) {
                rack.push(letter);
            }
        }

        playerRacks[playerId] = rack;
    }

    function renderRack() {
        const $rack = $('#tile-rack');

        if ($rack.hasClass('ui-sortable')) {
            $rack.sortable('destroy');
        }
        $rack.empty();

        let rack = getCurrentPlayerRack();
        rack = rack.filter(letter => letter !== undefined && letter !== null);

        if (rack.length > 7) {
            rack = rack.slice(0, 7);
        }
        setCurrentPlayerRack(rack);

        rack.forEach((letter, index) => {
            const $tile = createTileElement(letter, index);
            $rack.append($tile);
        });

        setupRackSwapping();
    }

    function setupRackSwapping() {
        const $rack = $('#tile-rack');

        $rack.find('.tile').each(function () {
            const $targetTile = $(this);

            $targetTile.droppable({
                accept: '#tile-rack .tile:not(.placed)',
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

                    const rack = getCurrentPlayerRack();
                    const temp = rack[draggedIndex];
                    rack[draggedIndex] = rack[targetIndex];
                    rack[targetIndex] = temp;
                    setCurrentPlayerRack(rack);

                    setTimeout(() => renderRack(), 50);
                }
            });
        });
    }

    function createTileElement(letter, index) {
        if (letter === undefined || letter === null) {
            letter = '?';
        }

        const displayLetter = letter === '_' ? 'Blank' : letter;
        const imagePath = `./Assets/Images/Tiles/Scrabble_Tile_${displayLetter}.jpg`;

        const $tile = $('<div>')
            .addClass('tile')
            .attr('data-letter', letter)
            .attr('data-original-letter', letter)
            .attr('data-rack-index', index)
            .append(
                $('<img>')
                    .attr('src', imagePath)
                    .attr('alt', letter)
            );

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
                $('#tile-rack .tile').removeClass('swap-target');
            }
        });

        return $tile;
    }

    // ========================================
    // DROP HANDLING
    // ========================================

    function handleTileDrop(event, ui, $cell) {
        const $tile = ui.draggable;
        const row = parseInt($cell.attr('data-row'));
        const col = parseInt($cell.attr('data-col'));

        // Check if cell is occupied
        if (boardState[row][col] !== null) {
            snapTileBackToRack($tile);
            showMessage('That cell is already occupied!', 'error');
            return;
        }

        // Check DOM for existing tile
        if ($cell.find('.tile').length > 0) {
            snapTileBackToRack($tile);
            showMessage('That cell is already occupied!', 'error');
            return;
        }

        let letter = $tile.attr('data-letter');
        const rackIndex = parseInt($tile.attr('data-rack-index'));

        // Handle blank tile
        if (letter === '_') {
            const chosenLetter = prompt('Enter a letter for the blank tile (A-Z):');
            if (!chosenLetter || !/^[A-Za-z]$/.test(chosenLetter)) {
                snapTileBackToRack($tile);
                showMessage('Invalid letter. Blank tile returned to rack.', 'error');
                return;
            }
            letter = chosenLetter.toUpperCase();
            $tile.attr('data-letter', letter);
            $tile.addClass('blank-used');

            const $letterOverlay = $('<span>').addClass('blank-letter-overlay').text(letter);
            $tile.append($letterOverlay);
        }

        // Remove from rack
        const rack = getCurrentPlayerRack();
        rack.splice(rackIndex, 1);
        setCurrentPlayerRack(rack);

        // Place on board
        boardState[row][col] = letter;

        $tile.removeClass('dragging');
        $tile.addClass('placed');
        $tile.draggable('disable');

        $tile.css({
            position: 'absolute',
            left: '0',
            top: '0',
            margin: '0'
        });

        $cell.append($tile);

        currentTurnTiles.push({
            row: row,
            col: col,
            letter: letter,
            originalLetter: $tile.attr('data-original-letter'),
            $tile: $tile
        });

        renderRack();
        updateWordPreview();
    }

    function snapTileBackToRack($tile) {
        $tile.removeClass('dragging swap-target');
        $('body').removeClass('dragging-active');
        $tile.css({
            'position': '',
            'left': '',
            'top': '',
            'z-index': ''
        });
        renderRack();
    }

    // ========================================
    // WORD VALIDATION & SCORING
    // ========================================

    function getPlacedTilesPositions() {
        return currentTurnTiles.map(t => ({ row: t.row, col: t.col, letter: t.letter }));
    }

    function validatePlacement() {
        const positions = getPlacedTilesPositions();

        if (positions.length === 0) {
            return { valid: false, message: 'No tiles placed!' };
        }

        // Check all in same row or column
        const rows = [...new Set(positions.map(p => p.row))];
        const cols = [...new Set(positions.map(p => p.col))];

        if (rows.length > 1 && cols.length > 1) {
            return { valid: false, message: 'Tiles must be in a straight line!' };
        }

        // Check for gaps
        const isHorizontal = rows.length === 1;
        if (isHorizontal) {
            const row = rows[0];
            const sortedCols = cols.sort((a, b) => a - b);
            for (let c = sortedCols[0]; c <= sortedCols[sortedCols.length - 1]; c++) {
                if (boardState[row][c] === null) {
                    return { valid: false, message: 'Tiles must be contiguous (no gaps)!' };
                }
            }
        } else {
            const col = cols[0];
            const sortedRows = rows.sort((a, b) => a - b);
            for (let r = sortedRows[0]; r <= sortedRows[sortedRows.length - 1]; r++) {
                if (boardState[r][col] === null) {
                    return { valid: false, message: 'Tiles must be contiguous (no gaps)!' };
                }
            }
        }

        // First word must cross center
        if (!firstWordPlayed) {
            const crossesCenter = positions.some(p => p.row === 7 && p.col === 7);
            if (!crossesCenter) {
                return { valid: false, message: 'First word must cross the center star!' };
            }
        } else {
            // Must connect to existing tiles
            let connects = false;
            for (const pos of positions) {
                const neighbors = [
                    [pos.row - 1, pos.col],
                    [pos.row + 1, pos.col],
                    [pos.row, pos.col - 1],
                    [pos.row, pos.col + 1]
                ];
                for (const [r, c] of neighbors) {
                    if (r >= 0 && r < 15 && c >= 0 && c < 15) {
                        if (boardState[r][c] !== null && !positions.some(p => p.row === r && p.col === c)) {
                            connects = true;
                            break;
                        }
                    }
                }
                if (connects) break;
            }
            if (!connects) {
                return { valid: false, message: 'Word must connect to existing tiles!' };
            }
        }

        return { valid: true };
    }

    function getAllFormedWords() {
        const positions = getPlacedTilesPositions();
        const words = [];
        const processed = new Set();

        for (const pos of positions) {
            // Horizontal word
            let startCol = pos.col;
            while (startCol > 0 && boardState[pos.row][startCol - 1] !== null) startCol--;
            let endCol = pos.col;
            while (endCol < 14 && boardState[pos.row][endCol + 1] !== null) endCol++;

            if (endCol > startCol) {
                const key = `H${pos.row}-${startCol}-${endCol}`;
                if (!processed.has(key)) {
                    processed.add(key);
                    let word = '';
                    const tiles = [];
                    for (let c = startCol; c <= endCol; c++) {
                        word += boardState[pos.row][c];
                        tiles.push({ row: pos.row, col: c, letter: boardState[pos.row][c] });
                    }
                    words.push({ word, tiles, direction: 'horizontal' });
                }
            }

            // Vertical word
            let startRow = pos.row;
            while (startRow > 0 && boardState[startRow - 1][pos.col] !== null) startRow--;
            let endRow = pos.row;
            while (endRow < 14 && boardState[endRow + 1][pos.col] !== null) endRow++;

            if (endRow > startRow) {
                const key = `V${pos.col}-${startRow}-${endRow}`;
                if (!processed.has(key)) {
                    processed.add(key);
                    let word = '';
                    const tiles = [];
                    for (let r = startRow; r <= endRow; r++) {
                        word += boardState[r][pos.col];
                        tiles.push({ row: r, col: pos.col, letter: boardState[r][pos.col] });
                    }
                    words.push({ word, tiles, direction: 'vertical' });
                }
            }
        }

        return words;
    }

    function calculateWordScore(wordInfo) {
        // Returns rich word data with letter details for display
        let baseScore = 0;
        let wordMultiplier = 1;
        let hasDoubleWord = false;
        let hasTripleWord = false;
        const letters = [];

        for (const tile of wordInfo.tiles) {
            const bonus = BOARD_LAYOUT[tile.row][tile.col];
            const isNewTile = currentTurnTiles.some(t => t.row === tile.row && t.col === tile.col);

            // Find original letter to get value
            const turnTile = currentTurnTiles.find(t => t.row === tile.row && t.col === tile.col);
            const originalLetter = turnTile ? turnTile.originalLetter : tile.letter;
            const letterBaseValue = ScrabbleTiles[originalLetter]?.value || 0;

            let letterScore = letterBaseValue;
            let letterBonus = null;

            if (isNewTile) {
                if (bonus === 'TL') {
                    letterScore = letterBaseValue * 3;
                    letterBonus = 'TL';
                } else if (bonus === 'DL') {
                    letterScore = letterBaseValue * 2;
                    letterBonus = 'DL';
                }
                if (bonus === 'TW') {
                    wordMultiplier *= 3;
                    hasTripleWord = true;
                } else if (bonus === 'DW' || bonus === 'ST') {
                    wordMultiplier *= 2;
                    hasDoubleWord = true;
                }
            }

            baseScore += letterScore;
            letters.push({
                letter: tile.letter,
                baseValue: letterBaseValue,
                score: letterScore,
                bonus: letterBonus,
                isNew: isNewTile
            });
        }

        return {
            word: wordInfo.word,
            score: baseScore * wordMultiplier,
            baseScore,
            wordMultiplier,
            hasDoubleWord,
            hasTripleWord,
            letters,
            direction: wordInfo.direction
        };
    }

    function updateWordPreview() {
        const $wordsList = $('#words-list');
        $wordsList.empty();

        if (currentTurnTiles.length === 0) {
            $wordsList.html('<tr><td colspan="3" class="no-words">-</td></tr>');
            $('#turn-total-score').text('0');
            return;
        }

        const rawWords = getAllFormedWords();
        let total = 0;

        if (rawWords.length === 0) {
            $wordsList.html('<tr><td colspan="3" class="no-words">-</td></tr>');
        } else {
            rawWords.forEach(rawWord => {
                const wordInfo = calculateWordScore(rawWord);
                total += wordInfo.score;
                const valid = isValidWord(wordInfo.word);

                // Build rich word display with letter subscripts
                const $wordCell = $('<td>').addClass('word-text');
                wordInfo.letters.forEach(letterInfo => {
                    const $letterSpan = $('<span>').addClass('letter-with-score');
                    $letterSpan.append($('<span>').addClass('letter-char').text(letterInfo.letter));

                    const $subscript = $('<sub>').addClass('letter-value').text(letterInfo.score);
                    if (letterInfo.bonus === 'DL') {
                        $subscript.addClass('bonus-dl');
                    } else if (letterInfo.bonus === 'TL') {
                        $subscript.addClass('bonus-tl');
                    }
                    $letterSpan.append($subscript);
                    $wordCell.append($letterSpan);
                });

                // Word multiplier cell
                const $multiplierCell = $('<td>').addClass('word-multiplier');
                const mult = wordInfo.wordMultiplier;
                const $multText = $('<span>').text(mult + '×');

                if (mult === 1) {
                    $multText.addClass('mult-default');
                } else if (mult === 2) {
                    $multText.addClass('mult-double');
                } else if (mult === 3) {
                    $multText.addClass('mult-triple');
                } else if (mult >= 4) {
                    $multText.addClass('mult-mega');
                }
                $multiplierCell.append($multText);

                // Score cell
                const $scoreCell = $('<td>').addClass('word-score').text(wordInfo.score);

                const $row = $('<tr>')
                    .addClass(valid ? '' : 'invalid-word')
                    .append($wordCell)
                    .append($multiplierCell)
                    .append($scoreCell);
                $wordsList.append($row);
            });
        }

        // Bingo bonus
        if (currentTurnTiles.length === 7) {
            total += 50;
            $wordsList.append('<tr class="bingo-row"><td colspan="2">🎉 BINGO!</td><td class="word-score">+50</td></tr>');
        }

        $('#turn-total-score').text(total);
    }

    // ========================================
    // BUTTON HANDLERS
    // ========================================

    function bindButtonEvents() {
        $('#handoff-confirm').on('click', hideHandoffScreen);

        $('#submit-word').on('click', submitWord);
        $('#clear-board').on('click', clearBoard);
        $('#pass-turn').on('click', passTurn);
        $('#end-game').on('click', endGame);
        $('#play-again').on('click', () => window.location.href = 'passplay-lobby.html');
    }

    function submitWord() {
        const validation = validatePlacement();
        if (!validation.valid) {
            showMessage(validation.message, 'error');
            return;
        }

        const words = getAllFormedWords();
        const invalidWords = words.filter(w => !isValidWord(w.word));

        if (invalidWords.length > 0) {
            showMessage(`Invalid word(s): ${invalidWords.map(w => w.word).join(', ')}`, 'error');
            return;
        }

        // Stop turn timer and get duration
        stopTurnTimer();
        const turnDuration = getTurnDuration();

        // Calculate score
        let turnScore = 0;
        words.forEach(w => turnScore += calculateWordScore(w).score);
        if (currentTurnTiles.length === 7) turnScore += 50;

        // Update player score
        const player = players[currentPlayerIndex];
        player.score += turnScore;

        // Mark tiles with player color
        currentTurnTiles.forEach(tile => {
            boardOwnership[tile.row][tile.col] = { playerId: player.id, color: player.color };
            tile.$tile.addClass('placed-by-player');
            tile.$tile.css('--player-color', player.color);
        });

        // Add to word history (use current round number, include duration)
        words.forEach(w => {
            const wordData = calculateWordScore(w);
            wordHistory.push({
                turn: roundNumber,
                player: player.name,
                word: w.word,
                score: wordData.score,
                wordData: wordData,
                color: player.color,
                duration: turnDuration
            });
        });

        // Track plays in this round
        playsThisRound++;
        if (playsThisRound >= players.length) {
            roundNumber++;
            playsThisRound = 0;
        }

        firstWordPlayed = true;
        consecutivePasses = 0;

        // Deal new tiles
        dealTilesToPlayer(player.id, currentTurnTiles.length);
        currentTurnTiles = [];

        showMessage(`${player.name} scored ${turnScore} points!`, 'success');
        updateScoreDisplay();
        updateWordHistoryDisplay();
        updateTileDistributionTable();

        // Check end condition
        if (checkGameEnd()) {
            endGame();
            return;
        }

        // Next player
        nextTurn();
    }

    function clearBoard() {
        currentTurnTiles.forEach(tile => {
            const rack = getCurrentPlayerRack();
            rack.push(tile.originalLetter);
            setCurrentPlayerRack(rack);

            boardState[tile.row][tile.col] = null;
            tile.$tile.remove();
        });

        currentTurnTiles = [];
        renderRack();
        updateWordPreview();
        showMessage('Tiles returned to rack.', 'info');
    }

    function passTurn() {
        // Stop turn timer and get duration
        stopTurnTimer();
        const turnDuration = getTurnDuration();

        clearBoard();
        consecutivePasses++;

        const player = players[currentPlayerIndex];
        showMessage(`${player.name} passed.`, 'info');

        // Add pass to word history with duration
        wordHistory.push({
            turn: roundNumber,
            player: player.name,
            word: '(pass)',
            score: 0,
            wordData: null,
            color: player.color,
            duration: turnDuration
        });
        updateWordHistoryDisplay();

        // Track plays in this round (passes count too)
        playsThisRound++;
        if (playsThisRound >= players.length) {
            roundNumber++;
            playsThisRound = 0;
        }

        if (consecutivePasses >= players.length * 2) {
            endGame();
            return;
        }

        nextTurn();
    }

    function nextTurn() {
        // Stop any running turn timer
        stopTurnTimer();

        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        currentTurnTiles = [];
        updateScoreDisplay();  // Update score display to highlight new current player
        showHandoffScreen();
    }

    function checkGameEnd() {
        // Game ends if current player empties rack and bag is empty
        const player = players[currentPlayerIndex];
        const rack = playerRacks[player.id];
        return tileBag.length === 0 && rack.length === 0;
    }

    function endGame() {
        gameOver = true;

        // Stop all timers
        stopTurnTimer();
        if (gameTimerInterval) {
            clearInterval(gameTimerInterval);
            gameTimerInterval = null;
        }

        // Subtract remaining tile values from each player
        players.forEach(player => {
            const rack = playerRacks[player.id] || [];
            rack.forEach(letter => {
                player.score -= ScrabbleTiles[letter]?.value || 0;
            });
            if (player.score < 0) player.score = 0;
        });

        // Sort by score
        const sorted = [...players].sort((a, b) => b.score - a.score);

        // Show game over screen
        const $standings = $('#final-standings');
        $standings.empty();

        sorted.forEach((player, index) => {
            const isWinner = index === 0;
            $standings.append(`
                <div class="standing-row ${isWinner ? 'winner' : ''}" style="border-left-color: ${player.color}">
                    <span class="standing-rank">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}</span>
                    <span class="standing-name">${player.name}</span>
                    <span class="standing-score">${player.score}</span>
                </div>
            `);
        });

        $('#handoff-overlay').addClass('hidden');
        $('#game-over-overlay').removeClass('hidden');
    }

    // ========================================
    // UI UPDATES
    // ========================================

    function updateTurnIndicator() {
        const player = players[currentPlayerIndex];
        $('#current-player').text(player.name);
        $('#turn-indicator').css('--current-player-color', player.color);
    }

    function updateScoreDisplay() {
        const $list = $('#player-scores-list');
        $list.empty();

        players.forEach((player, index) => {
            const isCurrent = index === currentPlayerIndex;
            $list.append(`
                <tr class="score-row ${isCurrent ? 'current-player' : ''}">
                    <td>
                        <span class="player-color-dot" style="background: ${player.color}"></span>
                        ${player.name}
                    </td>
                    <td>${player.score}</td>
                </tr>
            `);
        });
    }

    function updateWordHistoryDisplay() {
        const $list = $('#word-history-list');
        $list.empty();

        if (wordHistory.length === 0) {
            $list.html('<tr><td colspan="5" class="no-history">No words yet</td></tr>');
            return;
        }

        wordHistory.slice(-10).reverse().forEach(entry => {
            const $row = $('<tr>');

            // Turn number
            $row.append($('<td>').text(entry.turn));

            // Player name with color
            $row.append($('<td>').css('color', entry.color).text(entry.player));

            // Word with rich formatting if available
            const $wordCell = $('<td>').addClass('word-text');
            if (entry.wordData && entry.wordData.letters) {
                entry.wordData.letters.forEach(letterInfo => {
                    const $letterSpan = $('<span>').addClass('letter-with-score');
                    $letterSpan.append($('<span>').addClass('letter-char').text(letterInfo.letter));

                    const $subscript = $('<sub>').addClass('letter-value').text(letterInfo.score);
                    if (letterInfo.bonus === 'DL') {
                        $subscript.addClass('bonus-dl');
                    } else if (letterInfo.bonus === 'TL') {
                        $subscript.addClass('bonus-tl');
                    }
                    $letterSpan.append($subscript);
                    $wordCell.append($letterSpan);
                });
            } else {
                $wordCell.text(entry.word);
            }
            $row.append($wordCell);

            // Score with multiplier color based on word multiplier flags
            const $scoreCell = $('<td>').addClass('word-score');
            if (entry.wordData) {
                if (entry.wordData.hasTripleWord) {
                    $scoreCell.addClass('mult-triple');
                } else if (entry.wordData.hasDoubleWord) {
                    $scoreCell.addClass('mult-double');
                }
                // Check for mega multiplier (multiple word bonuses)
                if (entry.wordData.wordMultiplier >= 4) {
                    $scoreCell.addClass('mult-mega');
                }
            }
            $scoreCell.text(entry.score);
            $row.append($scoreCell);

            // Duration column
            const $durationCell = $('<td>').addClass('history-duration');
            if (entry.duration !== undefined) {
                $durationCell.text(entry.duration + 's');
            } else {
                $durationCell.text('-');
            }
            $row.append($durationCell);

            $list.append($row);
        });
    }

    function updateTileDistributionTable() {
        const $tbody = $('#remaining-tile-distribution-table tbody');
        $tbody.empty();

        const counts = {};
        tileBag.forEach(letter => {
            counts[letter] = (counts[letter] || 0) + 1;
        });

        const letters = Object.keys(ScrabbleTiles).filter(l => l !== '_');
        letters.push('_');

        for (let i = 0; i < letters.length; i += 2) {
            const l1 = letters[i];
            const l2 = letters[i + 1];

            const row = $('<tr>');
            row.append(`<td>${l1 === '_' ? 'Blank' : l1}</td>`);
            row.append(`<td>${counts[l1] || 0}</td>`);

            if (l2) {
                row.append(`<td>${l2 === '_' ? 'Blank' : l2}</td>`);
                row.append(`<td>${counts[l2] || 0}</td>`);
            } else {
                row.append('<td></td><td></td>');
            }

            $tbody.append(row);
        }
    }

    function showMessage(text, type) {
        const $msg = $('#game-message');
        $msg.text(text);
        $msg.removeClass('success error info').addClass(type);
    }

    // ========================================
    // TILE SWAP ZONE
    // ========================================

    function setupTileSwapZone() {
        $('#swap-drop-area').droppable({
            accept: '#tile-rack .tile:not(.placed)',
            hoverClass: 'swap-hover',
            drop: function (event, ui) {
                const $tile = ui.draggable;
                const letter = $tile.attr('data-original-letter');
                const rackIndex = parseInt($tile.attr('data-rack-index'));

                if (tileBag.length === 0) {
                    showMessage('No tiles left in the bag to swap!', 'error');
                    snapTileBackToRack($tile);
                    return;
                }

                // Remove from rack
                const rack = getCurrentPlayerRack();
                rack.splice(rackIndex, 1);

                // Add old tile back to bag
                tileBag.push(letter);
                shuffleArray(tileBag);

                // Draw new tile
                rack.push(tileBag.pop());
                setCurrentPlayerRack(rack);

                $tile.remove();
                renderRack();
                updateTileDistributionTable();
                showMessage('Tile swapped!', 'success');
            }
        });
    }

})();
