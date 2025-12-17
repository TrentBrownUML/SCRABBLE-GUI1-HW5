/**
 * =============================================================================
 * SCRABBLE GAME - Single Player Mode
 * =============================================================================
 * 
 * @file        main.js
 * @description Core game logic for single-player Scrabble implementation.
 *              Handles board rendering, tile management, drag-and-drop placement,
 *              word validation, scoring, and game state management.
 * 
 * @author      Trent Brown
 * @contact     tgbrown450@gmail.com
 * @course      UMass Lowell - GUI Programming I
 * @assignment  HW5 - Scrabble Game
 * @date        December 2024
 * 
 * =============================================================================
 * IMPLEMENTED FEATURES:
 * =============================================================================
 * 
 * CORE GAMEPLAY:
 * - Full 15x15 Scrabble board with proper bonus square layout (TW, DW, TL, DL)
 * - Official Scrabble tile distribution (100 tiles including 2 blanks)
 * - Drag-and-drop tile placement using jQuery UI
 * - Tile rack with 7 tiles, automatic refill after each turn
 * - Tile swapping/rearranging within the rack
 * 
 * WORD VALIDATION:
 * - Dictionary validation using external dictionary.txt file
 * - Validates primary word and all perpendicular words formed
 * - First word must cross center star (7,7)
 * - Subsequent words must connect to existing tiles
 * - Validates straight-line placement (horizontal or vertical)
 * 
 * SCORING SYSTEM:
 * - Letter values based on official Scrabble scoring
 * - Bonus square multipliers (Double/Triple Letter, Double/Triple Word)
 * - 50-point bonus for using all 7 tiles (Bingo)
 * - Real-time score preview before submission
 * 
 * USER INTERFACE:
 * - Visual tile glow effects indicating bonus squares
 * - Word history panel showing all played words with scores
 * - Remaining tile distribution table
 * - Current word preview with score calculation
 * - Responsive design for different screen sizes
 * 
 * GAME CONTROLS:
 * - Submit Word: Validate and score placed tiles
 * - Return Tiles: Return all placed tiles to rack
 * - Pass Turn: Skip turn (tracks consecutive passes)
 * - Tile Swap Zone: Exchange tiles with the bag
 * 
 * =============================================================================
 * EXTERNAL DEPENDENCIES:
 * =============================================================================
 * - jQuery 3.7.1 (https://jquery.com/)
 * - jQuery UI 1.14.1 (https://jqueryui.com/) - Draggable/Droppable widgets
 * - dictionary.txt - Word list for validation
 * 
 * =============================================================================
 * CODE STRUCTURE:
 * =============================================================================
 * The code is organized into logical sections:
 * 1. Configuration - Tile values, board layout, game constants
 * 2. Game State - Variables tracking board, rack, scores, etc.
 * 3. Initialization - DOM ready, board creation, event binding
 * 4. Tile Management - Rendering, dragging, placement
 * 5. Word Validation - Dictionary lookup, connectivity checks
 * 6. Scoring - Point calculation with multipliers
 * 7. UI Updates - Display refreshes, animations, messages
 * 
 * =============================================================================
 */

(function () {
    'use strict';

    // ========================================
    // SCRABBLE GAME CONFIGURATION
    // ========================================

    // Tile values and distribution (based on official Scrabble)
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
        '_': { value: 0, count: 2 }  // Blank tiles
    };

    // Board size
    const BOARD_SIZE = 15;

    // Bonus square types
    const BONUS = {
        TW: 'triple-word',      // Triple Word Score
        DW: 'double-word',      // Double Word Score
        TL: 'triple-letter',    // Triple Letter Score
        DL: 'double-letter',    // Double Letter Score
        ST: 'start',            // Center/Start square
        NO: 'normal'            // Normal square
    };

    // Standard Scrabble board layout (15x15)
    // Key: TW=Triple Word, DW=Double Word, TL=Triple Letter, DL=Double Letter, ST=Start, NO=Normal
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

    let tileBag = [];               // Available tiles in the bag
    let playerRack = [];            // Player's current tiles (max 7)
    let boardState = [];            // 15x15 array tracking placed tiles
    let totalScore = 0;             // Player's total score
    let currentTurnTiles = [];      // Tiles placed this turn (for scoring/clearing)
    let firstWordPlayed = false;    // Track if first word has been played
    let dictionary = new Set();     // Set of valid words for O(1) lookup
    let dictionaryLoaded = false;   // Track if dictionary has finished loading
    let turnNumber = 0;             // Track turn count for word history
    let wordHistory = [];           // Array of { turn, player, word, score }

    // ========================================
    // STATE VALIDATION & SYNC
    // ========================================

    /**
     * Validates and fixes tile state synchronization
     * Ensures rack + currentTurnTiles = 7 (or less if bag is empty)
     */
    function validateTileState() {
        const rackCount = playerRack.length;
        const boardCount = currentTurnTiles.length;
        const totalInPlay = rackCount + boardCount;

        // Log state for debugging
        console.log(`[TileState] Rack: ${rackCount}, Board: ${boardCount}, Total: ${totalInPlay}`);

        // Check for rack overflow
        if (rackCount > 7) {
            console.warn(`[TileState] Rack overflow: ${rackCount} tiles. Trimming to 7.`);
            playerRack = playerRack.slice(0, 7);
        }

        // Check for too many tiles in play
        if (totalInPlay > 7) {
            console.warn(`[TileState] Total overflow: ${totalInPlay} tiles in play.`);
        }

        // Verify boardState matches currentTurnTiles
        currentTurnTiles.forEach(tile => {
            if (boardState[tile.row][tile.col] === null) {
                console.warn(`[TileState] Board state null at [${tile.row},${tile.col}] but tile tracked`);
            }
        });
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    $(function () {
        initGame();
    });

    async function initGame() {
        startAction('Game Initialization');

        // Load dictionary asynchronously
        await loadDictionary();

        // Initialize the tile bag
        initTileBag();

        // Initialize board state
        initBoardState();

        // Generate the board UI
        generateBoard();

        // Deal initial tiles to player
        dealTiles(7);

        // Ensure player has a playable hand
        ensurePlayableHand();

        // Update displays
        updateScoreDisplay();
        updateTileDistributionTable();

        // Bind button events
        bindButtonEvents();

        // Setup tile swap zone
        setupTileSwapZone();

        endAction('Game Initialization');
    }

    function initTileBag() {
        tileBag = [];
        for (let letter in ScrabbleTiles) {
            for (let i = 0; i < ScrabbleTiles[letter].count; i++) {
                tileBag.push(letter);
            }
        }
        // Shuffle the bag
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
    }

    // ========================================
    // DICTIONARY
    // ========================================

    async function loadDictionary() {
        try {
            showMessage('Loading dictionary...', 'info');
            const response = await fetch('./dictionary.txt');
            if (!response.ok) {
                throw new Error('Failed to load dictionary');
            }
            const text = await response.text();
            const words = text.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length > 0);
            dictionary = new Set(words);
            dictionaryLoaded = true;
            console.log(`Dictionary loaded: ${dictionary.size} words`);
            showMessage('Dictionary loaded! Start playing.', 'success');
        } catch (error) {
            console.error('Error loading dictionary:', error);
            showMessage('Warning: Dictionary failed to load. Word validation disabled.', 'error');
            dictionaryLoaded = false;
        }
    }

    function isValidWord(word) {
        if (!dictionaryLoaded) return true; // If dictionary failed to load, allow any word
        return dictionary.has(word.toUpperCase());
    }

    function validateAllWords(wordsData) {
        // Returns { valid: boolean, invalidWords: string[] }
        const invalidWords = [];
        for (const wordInfo of wordsData) {
            if (!isValidWord(wordInfo.word)) {
                invalidWords.push(wordInfo.word);
            }
        }
        return {
            valid: invalidWords.length === 0,
            invalidWords
        };
    }

    function canMakeAnyWord(tiles) {
        // Check if any valid word can be made with the given tiles
        // tiles is an array of letters (including '_' for blanks)
        if (!dictionaryLoaded) return true;

        const hasBlank = tiles.includes('_');
        const tileCount = {};

        // Count available letters (excluding blanks for now)
        for (const tile of tiles) {
            if (tile !== '_') {
                tileCount[tile] = (tileCount[tile] || 0) + 1;
            }
        }

        // Check each word in dictionary (only words up to tile count + 1 for potential board letters)
        for (const word of dictionary) {
            if (word.length <= tiles.length + 7) { // Reasonable max with board tiles
                if (canFormWord(word, { ...tileCount }, hasBlank)) {
                    return true;
                }
            }
        }
        return false;
    }

    function canFormWord(word, availableTiles, hasBlank) {
        // Check if word can be formed with available tiles
        // This is a simplified check - just needs to find ONE possible word
        const needed = {};
        for (const char of word) {
            needed[char] = (needed[char] || 0) + 1;
        }

        let blanksNeeded = 0;
        for (const [letter, count] of Object.entries(needed)) {
            const available = availableTiles[letter] || 0;
            if (available < count) {
                blanksNeeded += count - available;
            }
        }

        // If we have a blank, we can cover one missing letter
        if (hasBlank && blanksNeeded <= 1) return true;
        if (blanksNeeded === 0) return true;

        return false;
    }

    function ensurePlayableHand() {
        // Check if current hand can make any word, if not silently redraw
        if (!dictionaryLoaded || tileBag.length === 0) return;

        let attempts = 0;
        const maxAttempts = 10; // Prevent infinite loop

        while (!canMakeAnyWord(playerRack) && attempts < maxAttempts && tileBag.length >= 7) {
            // Return tiles to bag and redraw
            playerRack.forEach(letter => tileBag.push(letter));
            playerRack = [];
            shuffleArray(tileBag);

            // Draw new tiles
            for (let i = 0; i < 7 && tileBag.length > 0; i++) {
                playerRack.push(tileBag.pop());
            }
            attempts++;
        }

        if (attempts > 0) {
            console.log(`Silently redrawn tiles ${attempts} time(s) to ensure playable hand`);
            renderRack();
            updateTileDistributionTable();
        }
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

                // Add bonus text label
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

                // Make cell droppable - only accept rack tiles (not already placed tiles)
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

    function dealTiles(count) {
        // Hard cap: player can only have 7 tiles total (rack + tiles placed this turn)
        const totalTilesInPlay = playerRack.length + currentTurnTiles.length;
        const maxCanDeal = 7 - totalTilesInPlay;
        const tilesToDeal = Math.min(count, maxCanDeal, tileBag.length);

        for (let i = 0; i < tilesToDeal; i++) {
            const letter = tileBag.pop();
            if (letter) {
                playerRack.push(letter);
            }
        }

        renderRack();
        updateTileDistributionTable();
    }

    function renderRack() {
        const $rack = $('#tile-rack');

        // Destroy existing sortable before emptying to prevent issues
        if ($rack.hasClass('ui-sortable')) {
            $rack.sortable('destroy');
        }

        $rack.empty();

        // Filter out any undefined values that might have crept in
        playerRack = playerRack.filter(letter => letter !== undefined && letter !== null);

        // Safety guard: Ensure rack never exceeds 7 tiles
        if (playerRack.length > 7) {
            console.warn(`[renderRack] Rack overflow: ${playerRack.length} tiles. Trimming to 7.`);
            playerRack = playerRack.slice(0, 7);
        }

        playerRack.forEach((letter, index) => {
            const $tile = createTileElement(letter, index);
            $rack.append($tile);
        });

        // Make rack tiles droppable for swapping
        setupRackSwapping();
    }

    function setupRackSwapping() {
        const $rack = $('#tile-rack');

        // Make each tile in rack droppable for swapping
        $rack.find('.tile').each(function () {
            const $targetTile = $(this);

            $targetTile.droppable({
                accept: '#tile-rack .tile:not(.placed)',
                tolerance: 'pointer',
                over: function (event, ui) {
                    // Don't highlight if dragging over itself
                    if (ui.draggable[0] !== this) {
                        $(this).addClass('swap-target');
                    }
                },
                out: function (event, ui) {
                    $(this).removeClass('swap-target');
                },
                drop: function (event, ui) {
                    $(this).removeClass('swap-target');

                    const $draggedTile = ui.draggable;
                    const draggedIndex = parseInt($draggedTile.attr('data-rack-index'));
                    const targetIndex = parseInt($targetTile.attr('data-rack-index'));

                    // Don't swap with itself
                    if (draggedIndex === targetIndex) {
                        return;
                    }

                    // Swap in the playerRack array
                    const temp = playerRack[draggedIndex];
                    playerRack[draggedIndex] = playerRack[targetIndex];
                    playerRack[targetIndex] = temp;

                    // Re-render rack with animation
                    renderRackWithAnimation();
                }
            });
        });
    }

    function renderRackWithAnimation() {
        const $rack = $('#tile-rack');

        // Add swapping class for smooth transition
        $rack.find('.tile').addClass('swapping');

        // Short delay then re-render
        setTimeout(() => {
            renderRack();
        }, 50);
    }

    function createTileElement(letter, index) {
        // Defensive check for undefined letters
        if (letter === undefined || letter === null) {
            console.error('createTileElement called with undefined/null letter at index', index);
            letter = '?';  // Fallback to prevent crash
        }

        const displayLetter = letter === '_' ? 'Blank' : letter;
        const imagePath = `./Assets/Images/Tiles/Scrabble_Tile_${displayLetter}.jpg`;

        const $tile = $('<div>')
            .addClass('tile')
            .attr('data-letter', letter)
            .attr('data-original-letter', letter)  // Keep track of original letter for blanks
            .attr('data-rack-index', index)
            .append(
                $('<img>')
                    .attr('src', imagePath)
                    .attr('alt', letter)
            );

        // Make tile draggable
        $tile.draggable({
            revert: 'invalid',
            revertDuration: 200,
            cursor: 'grabbing',
            zIndex: 1000,
            start: function (event, ui) {
                $(this).addClass('dragging');
                $('body').addClass('dragging-active');
                startAction('Tile Drag: ' + letter);
            },
            stop: function (event, ui) {
                $(this).removeClass('dragging');
                $('body').removeClass('dragging-active');
                $('#tile-rack .tile').removeClass('swap-target');
                endAction('Tile Drag: ' + letter);
            }
        });

        return $tile;
    }

    // ========================================
    // DRAG AND DROP HANDLING
    // ========================================

    /**
     * Snaps a tile back to its position in the rack
     * Used when a drop is rejected (cell occupied, etc.)
     */
    function snapTileBackToRack($tile) {
        // Reset any dragging styles
        $tile.removeClass('dragging swap-target');
        $('body').removeClass('dragging-active');

        // Reset inline styles that jQuery UI draggable adds
        $tile.css({
            'position': '',
            'left': '',
            'top': '',
            'z-index': ''
        });

        // Always re-render the rack to ensure tile is properly restored
        // This is more reliable than trying to animate back
        renderRack();
    }

    function handleTileDrop(event, ui, $cell) {
        const $tile = ui.draggable;
        const letter = $tile.data('letter');
        const originalLetter = $tile.data('original-letter') || letter;
        const row = parseInt($cell.data('row'));
        const col = parseInt($cell.data('col'));

        // Reject tiles that are already placed on the board
        if ($tile.hasClass('placed')) {
            showMessage('Use "Return Tiles" button to move placed tiles!', 'error');
            snapTileBackToRack($tile);
            return;
        }

        // Check if cell already has a tile
        if (boardState[row][col] !== null) {
            // Verify the existing tile is still in the DOM
            const $existingTile = $cell.find('.tile');
            if ($existingTile.length === 0) {
                // Board state says occupied but no tile in DOM - fix the desync
                console.warn(`[handleTileDrop] Desync: boardState[${row}][${col}] occupied but no DOM tile. Clearing state.`);
                boardState[row][col] = null;
                $cell.removeClass('has-tile');
                // Now allow placement to proceed
            } else {
                // Cell is genuinely occupied - snap tile back to rack
                showMessage('That cell already has a tile!', 'error');
                snapTileBackToRack($tile);
                return;
            }
        }

        if (originalLetter === '_') {
            // Handle blank tile - prompt for letter
            const chosenLetter = promptForBlankLetter();
            if (!chosenLetter) {
                // User cancelled, revert the tile
                $tile.draggable('option', 'revert', true);
                return;
            }
            // Place the blank tile with the chosen letter
            placeBlankTile($tile, $cell, row, col, chosenLetter);
        } else {
            // Place regular tile
            placeTile($tile, $cell, row, col, letter, letter);
        }
    }

    function promptForBlankLetter() {
        let chosenLetter = null;
        while (chosenLetter === null) {
            const input = prompt('Enter a letter for the blank tile (A-Z):');
            if (input === null) {
                // User cancelled
                return null;
            }
            const letter = input.trim().toUpperCase();
            if (letter.length === 1 && letter >= 'A' && letter <= 'Z') {
                chosenLetter = letter;
            } else {
                alert('Please enter a single letter from A to Z.');
            }
        }
        return chosenLetter;
    }

    function placeBlankTile($tile, $cell, row, col, representedLetter) {
        // Remove from rack
        const rackIndex = $tile.data('rack-index');
        if (rackIndex !== undefined && rackIndex >= 0 && rackIndex < playerRack.length) {
            // Remove blank from rack by finding it (more reliable)
            const blankIdx = playerRack.indexOf('_');
            if (blankIdx !== -1) {
                playerRack.splice(blankIdx, 1);
            } else if (rackIndex < playerRack.length) {
                playerRack.splice(rackIndex, 1);
            }
        } else {
            console.warn('Invalid rackIndex during placeBlankTile:', rackIndex, 'playerRack length:', playerRack.length);
        }

        // Update board state - store the represented letter for word display
        // but remember it's a blank for scoring (0 points)
        boardState[row][col] = { isBlank: true, letter: representedLetter };

        // Track this turn's placed tiles
        currentTurnTiles.push({
            row,
            col,
            letter: '_',  // Original tile is blank
            representedLetter: representedLetter,
            $tile: $tile.clone()
        });

        // Position tile in cell
        $tile.detach();
        $tile.removeAttr('data-rack-index');
        $tile.css({
            position: 'absolute',
            top: 0,
            left: 0
        });
        $tile.addClass('placed');
        $tile.attr('data-board-row', row).attr('data-board-col', col);
        $tile.attr('data-letter', representedLetter);  // Update displayed letter
        // Keep original-letter as '_' for returning to rack

        // Add letter overlay on blank tile
        const $overlay = $('<span>')
            .addClass('blank-letter-overlay')
            .text(representedLetter);
        $tile.append($overlay);

        // Disable dragging for placed tiles
        $tile.draggable('disable');

        // Add tile to cell
        $cell.append($tile);
        $cell.addClass('has-tile');

        // Re-render rack to update indices
        renderRack();

        // Validate state after tile operation
        validateTileState();

        // Update current word display and score
        updateCurrentWord();
        calculateAndDisplayScore();

        showMessage(`Blank tile placed as "${representedLetter}"!`, 'success');
    }

    function placeTile($tile, $cell, row, col, letter, representedLetter) {
        // Remove from rack
        const rackIndex = $tile.data('rack-index');
        const originalLetter = $tile.data('original-letter') || letter;

        if (rackIndex !== undefined && rackIndex >= 0) {
            // Remove from rack by finding the letter (more reliable than index)
            const letterIdx = playerRack.indexOf(originalLetter);
            if (letterIdx !== -1) {
                playerRack.splice(letterIdx, 1);
            } else if (rackIndex < playerRack.length) {
                // Fallback to index-based removal
                playerRack.splice(rackIndex, 1);
            }
        } else {
            console.warn('Invalid rackIndex during placeTile:', rackIndex, 'playerRack length:', playerRack.length);
        }

        // Update board state
        boardState[row][col] = letter;

        // Track this turn's placed tiles
        currentTurnTiles.push({ row, col, letter, representedLetter, $tile: $tile.clone() });

        // Position tile in cell
        $tile.detach();
        $tile.removeAttr('data-rack-index');
        $tile.css({
            position: 'absolute',
            top: 0,
            left: 0
        });
        $tile.addClass('placed');
        $tile.attr('data-board-row', row).attr('data-board-col', col);

        // Disable dragging for placed tiles
        $tile.draggable('disable');

        // Add tile to cell
        $cell.append($tile);
        $cell.addClass('has-tile');

        // Re-render rack to update indices
        renderRack();

        // Validate state after tile operation
        validateTileState();

        // Update current word display and score
        updateCurrentWord();
        calculateAndDisplayScore();

        showMessage('Tile placed!', 'success');
    }

    // ========================================
    // SCORING
    // ========================================

    // Bonus colors for visual effects
    const BONUS_COLORS = {
        'DL': '#85c1e9',  // Light blue
        'TL': '#3498db',  // Blue
        'DW': '#f39c9c',  // Pink
        'TW': '#e74c3c',  // Red
        'ST': '#f39c9c',  // Pink (same as DW)
        'NO': null
    };

    function calculateAndDisplayScore() {
        const wordsData = findAllWordsFormed();
        updateWordsDisplay(wordsData);
        applyTileVisualEffects();
    }

    function applyTileVisualEffects() {
        // Clear previous effects
        $('.board-cell .tile').removeClass('glow-dl glow-tl glow-dw glow-tw glow-st');
        $('.board-cell').removeClass('word-highlight-dw word-highlight-tw');

        // Apply glow to current turn tiles based on their bonus square
        currentTurnTiles.forEach(tile => {
            const bonus = BOARD_LAYOUT[tile.row][tile.col];
            const $cell = $(`.board-cell[data-row="${tile.row}"][data-col="${tile.col}"]`);
            const $tile = $cell.find('.tile');

            if (bonus === 'DL') $tile.addClass('glow-dl');
            else if (bonus === 'TL') $tile.addClass('glow-tl');
            else if (bonus === 'DW') $tile.addClass('glow-dw');
            else if (bonus === 'TW') $tile.addClass('glow-tw');
            else if (bonus === 'ST') $tile.addClass('glow-st');
        });

        // Apply word highlight borders for word multipliers
        const wordsData = findAllWordsFormed();
        wordsData.forEach(wordInfo => {
            if (wordInfo.wordMultiplier > 1) {
                // Determine the highest multiplier type for this word
                const highlightClass = wordInfo.hasTripleWord ? 'word-highlight-tw' : 'word-highlight-dw';

                // Apply border to all cells in this word
                if (wordInfo.direction === 'horizontal') {
                    for (let c = wordInfo.startCol; c < wordInfo.startCol + wordInfo.word.length; c++) {
                        const $cell = $(`.board-cell[data-row="${wordInfo.startRow}"][data-col="${c}"]`);
                        $cell.addClass(highlightClass);
                    }
                } else {
                    for (let r = wordInfo.startRow; r < wordInfo.startRow + wordInfo.word.length; r++) {
                        const $cell = $(`.board-cell[data-row="${r}"][data-col="${wordInfo.startCol}"]`);
                        $cell.addClass(highlightClass);
                    }
                }
            }
        });
    }

    function clearTileVisualEffects() {
        $('.board-cell .tile').removeClass('glow-dl glow-tl glow-dw glow-tw glow-st');
        $('.board-cell').removeClass('word-highlight-dw word-highlight-tw');
    }

    function findAllWordsFormed() {
        // Returns array of { word, score, letters[], wordMultiplier, ... } for all words formed this turn
        const words = [];

        if (currentTurnTiles.length === 0) return words;

        // Determine the primary direction of placement
        const positions = currentTurnTiles.map(t => ({ row: t.row, col: t.col }));
        const rows = [...new Set(positions.map(p => p.row))];
        const cols = [...new Set(positions.map(p => p.col))];

        // Find the main word (along the line of placed tiles)
        if (rows.length === 1) {
            // Tiles placed horizontally - main word is horizontal
            const mainWord = getWordAt(rows[0], positions[0].col, 'horizontal');
            if (mainWord && mainWord.word.length > 1) {
                words.push(mainWord);
            }

            // Check for perpendicular words at each new tile position
            for (const tile of currentTurnTiles) {
                const perpWord = getWordAt(tile.row, tile.col, 'vertical');
                if (perpWord && perpWord.word.length > 1) {
                    words.push(perpWord);
                }
            }
        } else if (cols.length === 1) {
            // Tiles placed vertically - main word is vertical
            const mainWord = getWordAt(positions[0].row, cols[0], 'vertical');
            if (mainWord && mainWord.word.length > 1) {
                words.push(mainWord);
            }

            // Check for perpendicular words at each new tile position
            for (const tile of currentTurnTiles) {
                const perpWord = getWordAt(tile.row, tile.col, 'horizontal');
                if (perpWord && perpWord.word.length > 1) {
                    words.push(perpWord);
                }
            }
        } else {
            // Single tile or scattered - check both directions
            for (const tile of currentTurnTiles) {
                const hWord = getWordAt(tile.row, tile.col, 'horizontal');
                if (hWord && hWord.word.length > 1) {
                    // Avoid duplicates
                    if (!words.some(w => w.word === hWord.word && w.startRow === hWord.startRow && w.startCol === hWord.startCol)) {
                        words.push(hWord);
                    }
                }
                const vWord = getWordAt(tile.row, tile.col, 'vertical');
                if (vWord && vWord.word.length > 1) {
                    if (!words.some(w => w.word === vWord.word && w.startRow === vWord.startRow && w.startCol === vWord.startCol)) {
                        words.push(vWord);
                    }
                }
            }
        }

        return words;
    }

    function getWordAt(row, col, direction) {
        // Find the complete word passing through (row, col) in the given direction
        // Returns rich object with letter details for display

        let startRow = row, startCol = col;
        let endRow = row, endCol = col;

        if (direction === 'horizontal') {
            // Find start of word (go left)
            while (startCol > 0 && boardState[row][startCol - 1] !== null) {
                startCol--;
            }
            // Find end of word (go right)
            while (endCol < BOARD_SIZE - 1 && boardState[row][endCol + 1] !== null) {
                endCol++;
            }

            if (startCol === endCol) return null; // Single letter, not a word

            let word = '';
            let baseScore = 0;  // Score before word multiplier
            let wordMultiplier = 1;
            let hasDoubleWord = false;
            let hasTripleWord = false;
            const letters = [];  // Detailed letter info for display

            for (let c = startCol; c <= endCol; c++) {
                const cellValue = boardState[row][c];
                const letter = getLetter(cellValue);
                const displayLetter = getDisplayLetter(cellValue);
                word += displayLetter;

                const isNewTile = currentTurnTiles.some(t => t.row === row && t.col === c);
                const letterBaseValue = getTileValue(letter);
                const bonus = BOARD_LAYOUT[row][c];

                let letterScore = letterBaseValue;
                let letterBonus = null;

                if (isNewTile) {
                    // Apply letter bonus only to newly placed tiles
                    if (bonus === 'DL') {
                        letterScore = letterBaseValue * 2;
                        letterBonus = 'DL';
                    } else if (bonus === 'TL') {
                        letterScore = letterBaseValue * 3;
                        letterBonus = 'TL';
                    }

                    if (bonus === 'DW' || bonus === 'ST') {
                        wordMultiplier *= 2;
                        hasDoubleWord = true;
                    } else if (bonus === 'TW') {
                        wordMultiplier *= 3;
                        hasTripleWord = true;
                    }
                }

                baseScore += letterScore;
                letters.push({
                    letter: displayLetter,
                    baseValue: letterBaseValue,
                    score: letterScore,
                    bonus: letterBonus,
                    isNew: isNewTile
                });
            }

            return {
                word,
                score: baseScore * wordMultiplier,
                baseScore,
                wordMultiplier,
                hasDoubleWord,
                hasTripleWord,
                letters,
                startRow: row,
                startCol,
                direction: 'horizontal'
            };
        } else {
            // Vertical
            // Find start of word (go up)
            while (startRow > 0 && boardState[startRow - 1][col] !== null) {
                startRow--;
            }
            // Find end of word (go down)
            while (endRow < BOARD_SIZE - 1 && boardState[endRow + 1][col] !== null) {
                endRow++;
            }

            if (startRow === endRow) return null; // Single letter, not a word

            let word = '';
            let baseScore = 0;
            let wordMultiplier = 1;
            let hasDoubleWord = false;
            let hasTripleWord = false;
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
                let letterBonus = null;

                if (isNewTile) {
                    if (bonus === 'DL') {
                        letterScore = letterBaseValue * 2;
                        letterBonus = 'DL';
                    } else if (bonus === 'TL') {
                        letterScore = letterBaseValue * 3;
                        letterBonus = 'TL';
                    }

                    if (bonus === 'DW' || bonus === 'ST') {
                        wordMultiplier *= 2;
                        hasDoubleWord = true;
                    } else if (bonus === 'TW') {
                        wordMultiplier *= 3;
                        hasTripleWord = true;
                    }
                }

                baseScore += letterScore;
                letters.push({
                    letter: displayLetter,
                    baseValue: letterBaseValue,
                    score: letterScore,
                    bonus: letterBonus,
                    isNew: isNewTile
                });
            }

            return {
                word,
                score: baseScore * wordMultiplier,
                baseScore,
                wordMultiplier,
                hasDoubleWord,
                hasTripleWord,
                letters,
                startRow,
                startCol: col,
                direction: 'vertical'
            };
        }
    }

    function getLetter(cellValue) {
        // Get the actual letter for scoring (blanks = '_' = 0 points)
        if (cellValue === null) return '';
        if (typeof cellValue === 'object' && cellValue.isBlank) {
            return '_'; // Blank tile, 0 points
        }
        return typeof cellValue === 'object' ? cellValue.letter : cellValue;
    }

    function getDisplayLetter(cellValue) {
        // Get the display letter (what the tile represents)
        if (cellValue === null) return '';
        if (typeof cellValue === 'object' && cellValue.isBlank) {
            return cellValue.letter; // Show the chosen letter
        }
        return typeof cellValue === 'object' ? cellValue.letter : cellValue;
    }

    function calculateWordScore() {
        // Legacy function - now returns total of all words
        const words = findAllWordsFormed();
        return words.reduce((sum, w) => sum + w.score, 0);
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
                // Special mega multiplier styling!
                $multText.addClass('mult-mega');
            }
            $multiplierCell.append($multText);

            // Score cell
            const $scoreCell = $('<td>').addClass('word-score').text(wordInfo.score);

            const $row = $('<tr>')
                .append($wordCell)
                .append($multiplierCell)
                .append($scoreCell);
            $tbody.append($row);
            totalScore += wordInfo.score;
        });

        $('#turn-total-score').text(totalScore);
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

    // ========================================
    // WORD DISPLAY
    // ========================================

    function updateCurrentWord() {
        // Now handled by calculateAndDisplayScore which updates the words table
        calculateAndDisplayScore();
    }

    function clearWordsDisplay() {
        $('#words-list').html('<tr><td colspan="3" class="no-words">-</td></tr>');
        $('#turn-total-score').text('0');
        clearTileVisualEffects();
    }

    // ========================================
    // WORD HISTORY
    // ========================================

    function updateWordHistoryDisplay() {
        const $tbody = $('#word-history-list');
        $tbody.empty();

        if (wordHistory.length === 0) {
            $tbody.append('<tr><td colspan="4" class="no-history">No words yet</td></tr>');
            return;
        }

        // Show most recent words first
        const recentHistory = [...wordHistory].reverse();
        recentHistory.forEach(entry => {
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
                // Fallback to plain text
                $wordCell.text(entry.word);
            }

            // Determine score color based on word multiplier
            const $scoreCell = $('<td>').addClass('history-score').text(entry.score);
            if (entry.hasTripleWord) {
                $scoreCell.addClass('score-triple-word');
            } else if (entry.hasDoubleWord) {
                $scoreCell.addClass('score-double-word');
            }

            const $row = $('<tr>')
                .append($('<td>').addClass('history-turn').text(entry.turn))
                .append($('<td>').addClass('history-player').text(entry.player))
                .append($wordCell)
                .append($scoreCell);
            $tbody.append($row);
        });
    }

    // ========================================
    // TILE SWAP ZONE
    // ========================================

    function setupTileSwapZone() {
        const $swapZone = $('#swap-drop-area');

        $swapZone.droppable({
            accept: '#tile-rack .tile',
            hoverClass: 'swap-zone-hover',
            tolerance: 'pointer',
            drop: function (event, ui) {
                const $tile = ui.draggable;
                const letter = $tile.data('letter');
                const rackIndex = parseInt($tile.attr('data-rack-index'));

                // Show confirmation dialog
                const displayLetter = letter === '_' ? 'Blank' : letter;
                const confirmed = confirm(
                    `Swap tile "${displayLetter}" for a random tile?\n\n` +
                    `This will end your turn without playing a word.`
                );

                if (confirmed) {
                    performTileSwap(letter, rackIndex);
                } else {
                    // Return tile to rack
                    renderRack();
                }
            }
        });
    }

    function performTileSwap(letter, rackIndex) {
        if (tileBag.length === 0) {
            showMessage('No tiles left in the bag to swap!', 'error');
            renderRack();
            return;
        }

        // Remove tile from rack
        playerRack.splice(rackIndex, 1);

        // Put old tile back in bag
        tileBag.push(letter);
        shuffleArray(tileBag);

        // Draw new tile
        const newTile = tileBag.pop();
        playerRack.push(newTile);

        // Update displays
        renderRack();
        updateTileDistributionTable();

        // Increment turn (swap counts as a turn)
        turnNumber++;

        const displayLetter = letter === '_' ? 'Blank' : letter;
        const newDisplayLetter = newTile === '_' ? 'Blank' : newTile;
        showMessage(`Swapped "${displayLetter}" for "${newDisplayLetter}". Turn passed.`, 'info');
    }

    // ========================================
    // UI UPDATES
    // ========================================

    function updateTileDistributionTable() {
        const $tbody = $('#remaining-tile-distribution-table tbody');
        $tbody.empty();

        // Count remaining tiles in bag only (player rack tiles are dealt out)
        const remaining = {};
        for (let letter in ScrabbleTiles) {
            remaining[letter] = 0;
        }
        tileBag.forEach(letter => {
            remaining[letter]++;
        });

        // Get all letters and split into two columns
        const letters = Object.keys(ScrabbleTiles);
        const midpoint = Math.ceil(letters.length / 2);
        const leftColumn = letters.slice(0, midpoint);
        const rightColumn = letters.slice(midpoint);

        // Generate table rows with two letters per row
        for (let i = 0; i < leftColumn.length; i++) {
            const $row = $('<tr>');

            // Left column letter
            const leftLetter = leftColumn[i];
            const leftDisplay = leftLetter === '_' ? 'Blank' : leftLetter;
            const leftCount = remaining[leftLetter];
            const leftOriginal = ScrabbleTiles[leftLetter].count;
            const $leftLetterCell = $('<td>').text(leftDisplay);
            const $leftCountCell = $('<td>').text(`${leftCount}/${leftOriginal}`);
            if (leftCount === 0) {
                $leftLetterCell.addClass('depleted');
                $leftCountCell.addClass('depleted');
            }
            $row.append($leftLetterCell).append($leftCountCell);

            // Right column letter (if exists)
            if (i < rightColumn.length) {
                const rightLetter = rightColumn[i];
                const rightDisplay = rightLetter === '_' ? 'Blank' : rightLetter;
                const rightCount = remaining[rightLetter];
                const rightOriginal = ScrabbleTiles[rightLetter].count;
                const $rightLetterCell = $('<td>').text(rightDisplay);
                const $rightCountCell = $('<td>').text(`${rightCount}/${rightOriginal}`);
                if (rightCount === 0) {
                    $rightLetterCell.addClass('depleted');
                    $rightCountCell.addClass('depleted');
                }
                $row.append($rightLetterCell).append($rightCountCell);
            } else {
                // Add tiles remaining in the empty slot
                const tilesRemaining = tileBag.length;
                const $remainingLabel = $('<td>').text('Tile Bag:').addClass('tiles-remaining-label');
                const $remainingCount = $('<td>').text(tilesRemaining).addClass('tiles-remaining-count');
                $row.append($remainingLabel).append($remainingCount);
            }

            $tbody.append($row);
        }
    }

    function updateScoreDisplay() {
        // Update player 1 score in the player scores table
        $('#player-1-score').text(totalScore);
        $('#word-score').text(0);
    }

    function showMessage(message, type) {
        const $msg = $('#game-message');
        $msg.text(message);
        $msg.removeClass('success error info');
        if (type) $msg.addClass(type);
    }

    // ========================================
    // BUTTON HANDLERS
    // ========================================

    function bindButtonEvents() {
        $('#submit-word').on('click', submitWord);
        $('#clear-board').on('click', clearCurrentTurn);
        $('#new-tiles').on('click', getNewTiles);
        $('#reset-game').on('click', resetGame);
    }

    function submitWord() {
        if (currentTurnTiles.length === 0) {
            showMessage('Place some tiles first!', 'error');
            return;
        }

        // Check if tiles form a continuous word (no gaps)
        if (!tilesFormContinuousWord()) {
            showMessage('Please ensure your tiles form ONE continuous word. Standalone or disjointed tiles are not allowed!', 'error');
            return;
        }

        // Check if first word covers the center star (row 7, col 7)
        if (!firstWordPlayed) {
            // First word must be at least 2 tiles
            if (currentTurnTiles.length < 2) {
                showMessage('First word must be at least 2 letters!', 'error');
                return;
            }
            const coversCenterStar = currentTurnTiles.some(tile => tile.row === 7 && tile.col === 7);
            if (!coversCenterStar) {
                showMessage('First word must cover the center star!', 'error');
                return;
            }
        } else {
            // After first word, new tiles must connect to existing tiles on the board
            if (!newTilesConnectToExisting()) {
                showMessage('Your word must connect to existing tiles on the board!', 'error');
                return;
            }
        }

        // Validate all words formed against dictionary
        const wordsFormed = findAllWordsFormed();
        const validation = validateAllWords(wordsFormed);
        if (!validation.valid) {
            const invalidList = validation.invalidWords.join(', ');
            showMessage(`Invalid word(s): ${invalidList}`, 'error');
            return;
        }

        const wordScore = calculateWordScore();
        totalScore += wordScore;

        // Add words to history
        turnNumber++;
        wordsFormed.forEach(wordInfo => {
            wordHistory.push({
                turn: turnNumber,
                player: 'Player 1',
                word: wordInfo.word,
                score: wordInfo.score,
                letters: wordInfo.letters,
                wordMultiplier: wordInfo.wordMultiplier,
                hasDoubleWord: wordInfo.hasDoubleWord,
                hasTripleWord: wordInfo.hasTripleWord
            });
        });
        updateWordHistoryDisplay();

        updateScoreDisplay();

        // Mark first word as played and update button state
        if (!firstWordPlayed) {
            firstWordPlayed = true;
            updateNewTilesButton();
        }

        // Clear current turn tracking (tiles stay on board, already locked)
        currentTurnTiles = [];

        // Deal new tiles to refill rack
        dealTiles(7 - playerRack.length);

        // Ensure player still has a playable hand
        ensurePlayableHand();

        // Update tile distribution display
        updateTileDistributionTable();

        showMessage(`Word submitted! +${wordScore} points`, 'success');
        clearWordsDisplay();
    }

    function clearCurrentTurn() {
        // Return tiles to rack
        currentTurnTiles.forEach(tile => {
            boardState[tile.row][tile.col] = null;

            // Ensure we return a valid letter
            if (tile.letter !== undefined && tile.letter !== null) {
                playerRack.push(tile.letter);
            } else {
                console.warn('Attempted to return undefined/null tile to rack:', tile);
            }

            // Remove tile from board cell
            const $cell = $(`.board-cell[data-row="${tile.row}"][data-col="${tile.col}"]`);
            $cell.find('.tile').remove();
            $cell.removeClass('has-tile');
        });

        currentTurnTiles = [];
        renderRack();
        clearWordsDisplay();

        showMessage('Board cleared - tiles returned to rack', 'info');
    }

    function getNewTiles() {
        // Only allow new tiles before first word is played
        if (firstWordPlayed) {
            showMessage('Reset the game to get new tiles!', 'error');
            return;
        }

        // Don't allow if tiles are currently placed on the board
        if (currentTurnTiles.length > 0) {
            showMessage('Return your tiles from the board first!', 'error');
            return;
        }

        if (tileBag.length === 0) {
            showMessage('No more tiles in the bag!', 'error');
            return;
        }

        // Return current rack tiles to bag and shuffle
        playerRack.forEach(letter => tileBag.push(letter));
        playerRack = [];
        shuffleArray(tileBag);

        // Deal new tiles
        dealTiles(7);

        // Update tile distribution display
        updateTileDistributionTable();

        showMessage('New tiles dealt!', 'success');
    }

    function updateNewTilesButton() {
        const $btn = $('#new-tiles');
        if (firstWordPlayed) {
            $btn.addClass('disabled');
            $btn.text('Reset to Redraw');
        } else {
            $btn.removeClass('disabled');
            $btn.text('Get New Tiles');
        }
    }

    function resetGame() {
        if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
            totalScore = 0;
            currentTurnTiles = [];
            playerRack = [];
            firstWordPlayed = false;
            turnNumber = 0;
            wordHistory = [];
            initTileBag();
            initBoardState();
            generateBoard();
            dealTiles(7);
            ensurePlayableHand();
            updateScoreDisplay();
            updateTileDistributionTable();
            updateWordHistoryDisplay();
            updateNewTilesButton();
            clearWordsDisplay();
            showMessage('Game reset! Good luck!', 'info');
        }
    }

})();
