(function (window) {
    'use strict';

    // ========================================
    // EASY BOT AI
    // Strategy: Find up to 3 valid words, pick the best scoring one
    // This gives a slight quality preference while still being "easy"
    // ========================================

    const EasyBot = {
        name: 'Easy Bot',
        timeLimit: 15000, // 15 seconds in ms
        maxCandidates: 3, // Number of words to consider before picking best

        /**
         * Find a move for the bot
         * @param {Array} rack - Bot's tile rack (array of letters)
         * @param {Array} boardState - 15x15 board state
         * @param {Set} dictionary - Set of valid words
         * @param {boolean} isFirstWord - Whether this is the first word of the game
         * @returns {Object|null} - Move object or null if no move found
         */
        findMove: function (rack, boardState, dictionary, isFirstWord) {
            const startTime = Date.now();
            const BOARD_SIZE = 15;
            const candidates = []; // Store valid moves to pick best from

            // Get all anchor points (empty cells adjacent to existing tiles, or center for first word)
            const anchors = this.getAnchorPoints(boardState, isFirstWord);

            if (anchors.length === 0) {
                return null;
            }

            // Try to find valid words at each anchor
            for (const anchor of anchors) {
                // Check time limit
                if (Date.now() - startTime > this.timeLimit) {
                    console.log('Easy Bot: Time limit reached');
                    break;
                }

                // Stop if we have enough candidates
                if (candidates.length >= this.maxCandidates) {
                    break;
                }

                // Try horizontal placement
                const horizontalMove = this.tryPlaceWord(rack, boardState, dictionary, anchor.row, anchor.col, 'horizontal', isFirstWord);
                if (horizontalMove) {
                    // Calculate score for this move
                    horizontalMove.score = this.estimateMoveScore(horizontalMove, boardState);
                    candidates.push(horizontalMove);
                    if (candidates.length >= this.maxCandidates) break;
                }

                // Try vertical placement
                const verticalMove = this.tryPlaceWord(rack, boardState, dictionary, anchor.row, anchor.col, 'vertical', isFirstWord);
                if (verticalMove) {
                    verticalMove.score = this.estimateMoveScore(verticalMove, boardState);
                    candidates.push(verticalMove);
                    if (candidates.length >= this.maxCandidates) break;
                }
            }

            if (candidates.length === 0) {
                return null;
            }

            // Sort by score and pick the best one
            candidates.sort((a, b) => b.score - a.score);
            console.log(`Easy Bot: Found ${candidates.length} candidates, picking best with score ${candidates[0].score}`);
            return candidates[0];
        },

        /**
         * Estimate score for a move (simplified scoring)
         */
        estimateMoveScore: function (move, boardState) {
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

            const TILE_VALUES = {
                'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4,
                'I': 1, 'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3,
                'Q': 10, 'R': 1, 'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8,
                'Y': 4, 'Z': 10, '_': 0
            };

            let baseScore = 0;
            let wordMultiplier = 1;

            for (const tile of move.tiles) {
                const letter = tile.letter.toUpperCase();
                const letterValue = tile.isBlank ? 0 : (TILE_VALUES[letter] || 0);
                const bonus = BOARD_LAYOUT[tile.row][tile.col];
                let tileScore = letterValue;

                // Apply letter bonuses
                if (bonus === 'DL') tileScore *= 2;
                else if (bonus === 'TL') tileScore *= 3;

                // Track word multipliers
                if (bonus === 'DW' || bonus === 'ST') wordMultiplier *= 2;
                else if (bonus === 'TW') wordMultiplier *= 3;

                baseScore += tileScore;
            }

            return baseScore * wordMultiplier;
        },

        /**
         * Get anchor points where words can be placed
         */
        getAnchorPoints: function (boardState, isFirstWord) {
            const BOARD_SIZE = 15;
            const anchors = [];

            if (isFirstWord) {
                // First word must go through center (7,7)
                anchors.push({ row: 7, col: 7 });
                return anchors;
            }

            // Find all empty cells adjacent to filled cells
            for (let row = 0; row < BOARD_SIZE; row++) {
                for (let col = 0; col < BOARD_SIZE; col++) {
                    if (boardState[row][col] === null) {
                        // Check if adjacent to a filled cell
                        const hasAdjacent =
                            (row > 0 && boardState[row - 1][col] !== null) ||
                            (row < BOARD_SIZE - 1 && boardState[row + 1][col] !== null) ||
                            (col > 0 && boardState[row][col - 1] !== null) ||
                            (col < BOARD_SIZE - 1 && boardState[row][col + 1] !== null);

                        if (hasAdjacent) {
                            anchors.push({ row, col });
                        }
                    }
                }
            }

            // Shuffle anchors for variety
            this.shuffleArray(anchors);
            return anchors;
        },

        /**
         * Try to place a word starting at given position
         */
        tryPlaceWord: function (rack, boardState, dictionary, startRow, startCol, direction, isFirstWord) {
            const BOARD_SIZE = 15;
            const rackCopy = [...rack];

            // Generate possible words from rack (2-7 letters)
            const possibleWords = this.generateWordsFromRack(rackCopy, dictionary);

            for (const word of possibleWords) {
                // Try placing word at different offsets from the anchor
                for (let offset = 0; offset < word.length; offset++) {
                    let row = startRow;
                    let col = startCol;

                    // Adjust starting position based on offset
                    if (direction === 'horizontal') {
                        col = startCol - offset;
                    } else {
                        row = startRow - offset;
                    }

                    // Check if placement is valid
                    const placement = this.validatePlacement(word, row, col, direction, boardState, rackCopy, isFirstWord);

                    if (placement.valid) {
                        // Verify all formed words are valid
                        if (this.allFormedWordsValid(placement.tiles, boardState, dictionary, direction)) {
                            return {
                                word: word,
                                tiles: placement.tiles,
                                direction: direction,
                                startRow: row,
                                startCol: col
                            };
                        }
                    }
                }
            }

            return null;
        },

        /**
         * Generate valid words from rack tiles
         */
        generateWordsFromRack: function (rack, dictionary) {
            const words = [];
            const rackStr = rack.join('').toUpperCase();

            // Simple approach: check if dictionary words can be made from rack
            // For easy bot, we just try common short words first
            const commonWords = ['AT', 'TO', 'IT', 'IN', 'IS', 'ON', 'AN', 'AS', 'BE', 'BY',
                'DO', 'GO', 'HE', 'IF', 'ME', 'MY', 'NO', 'OF', 'OR', 'SO',
                'UP', 'US', 'WE', 'AM', 'AX', 'EM', 'EX', 'HI', 'LO', 'MA',
                'PA', 'PI', 'RE', 'TA', 'XI', 'YA', 'YE',
                'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER',
                'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW',
                'ITS', 'LET', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'WAY', 'WHO', 'BOY',
                'DID', 'OWN', 'SAY', 'SHE', 'TOO', 'USE', 'ACE', 'ACT', 'ADD', 'AGE',
                'AGO', 'AID', 'AIM', 'AIR', 'ART', 'ASK', 'ATE', 'BAD', 'BAG', 'BAT',
                'BED', 'BIG', 'BIT', 'BOX', 'BUS', 'BUY', 'CAR', 'CAT', 'CUT', 'DOG',
                'EAR', 'EAT', 'END', 'EYE', 'FAR', 'FEW', 'FIT', 'FLY', 'FUN', 'GOT',
                'GUN', 'GUY', 'HAD', 'HAT', 'HIT', 'HOT', 'ICE', 'JOB', 'JOY', 'KEY',
                'KID', 'LAY', 'LED', 'LEG', 'LIE', 'LOT', 'LOW', 'MAN', 'MAP', 'MEN',
                'MET', 'MIX', 'MOB', 'MOM', 'MUD', 'NET', 'NOR', 'NUT', 'ODD', 'OFF',
                'OIL', 'PAN', 'PAY', 'PEN', 'PET', 'PIE', 'PIN', 'PIT', 'POT', 'PUT',
                'RAN', 'RAT', 'RAW', 'RED', 'RID', 'ROW', 'RUB', 'RUN', 'SAD', 'SAT',
                'SET', 'SIT', 'SIX', 'SKY', 'SON', 'SUN', 'TAN', 'TAX', 'TEA', 'TEN',
                'TIE', 'TIP', 'TOP', 'TOY', 'TRY', 'TWO', 'VAN', 'WAR', 'WET', 'WIN',
                'WON', 'YES', 'YET', 'ZAP', 'ZEN', 'ZIP', 'ZOO'];

            // Check which words can be formed from rack
            for (const word of commonWords) {
                if (this.canFormWord(word, rack) && dictionary.has(word)) {
                    words.push(word);
                }
            }

            // Also try all 2-letter combinations
            for (let i = 0; i < rack.length; i++) {
                for (let j = 0; j < rack.length; j++) {
                    if (i !== j) {
                        const twoLetter = rack[i] + rack[j];
                        if (dictionary.has(twoLetter.toUpperCase()) && !words.includes(twoLetter.toUpperCase())) {
                            words.push(twoLetter.toUpperCase());
                        }
                    }
                }
            }

            // Shuffle for variety
            this.shuffleArray(words);
            return words;
        },

        /**
         * Check if word can be formed from rack
         */
        canFormWord: function (word, rack) {
            const rackCopy = [...rack].map(l => l.toUpperCase());
            const wordUpper = word.toUpperCase();

            for (const letter of wordUpper) {
                const idx = rackCopy.indexOf(letter);
                if (idx === -1) {
                    // Try blank tile
                    const blankIdx = rackCopy.indexOf('_');
                    if (blankIdx === -1) {
                        return false;
                    }
                    rackCopy.splice(blankIdx, 1);
                } else {
                    rackCopy.splice(idx, 1);
                }
            }
            return true;
        },

        /**
         * Validate word placement on board
         */
        validatePlacement: function (word, startRow, startCol, direction, boardState, rack, isFirstWord) {
            const BOARD_SIZE = 15;
            const tiles = [];
            const rackCopy = [...rack].map(l => l.toUpperCase());
            let touchesExisting = false;
            let coversCenter = false;

            for (let i = 0; i < word.length; i++) {
                const row = direction === 'horizontal' ? startRow : startRow + i;
                const col = direction === 'horizontal' ? startCol + i : startCol;

                // Check bounds
                if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
                    return { valid: false };
                }

                const letter = word[i].toUpperCase();
                const existingTile = boardState[row][col];

                if (existingTile !== null) {
                    // Cell has existing tile - must match
                    const existingLetter = typeof existingTile === 'object' ? existingTile.letter : existingTile;
                    if (existingLetter.toUpperCase() !== letter) {
                        return { valid: false };
                    }
                    touchesExisting = true;
                    // Don't add to tiles - it's already on the board
                } else {
                    // Need to place tile from rack
                    const rackIdx = rackCopy.indexOf(letter);
                    if (rackIdx !== -1) {
                        rackCopy.splice(rackIdx, 1);
                        tiles.push({ row, col, letter, isBlank: false });
                    } else {
                        // Try blank
                        const blankIdx = rackCopy.indexOf('_');
                        if (blankIdx !== -1) {
                            rackCopy.splice(blankIdx, 1);
                            tiles.push({ row, col, letter, isBlank: true });
                        } else {
                            return { valid: false };
                        }
                    }
                }

                // Check if covers center
                if (row === 7 && col === 7) {
                    coversCenter = true;
                }
            }

            // Must place at least one tile
            if (tiles.length === 0) {
                return { valid: false };
            }

            // First word must cover center and have at least 2 tiles
            if (isFirstWord) {
                if (!coversCenter || tiles.length < 2) {
                    return { valid: false };
                }
            } else {
                // Non-first words must connect to existing tiles
                if (!touchesExisting && !this.tilesAdjacentToExisting(tiles, boardState)) {
                    return { valid: false };
                }
            }

            return { valid: true, tiles };
        },

        /**
         * Check if any tile is adjacent to existing tiles
         */
        tilesAdjacentToExisting: function (tiles, boardState) {
            const BOARD_SIZE = 15;

            for (const tile of tiles) {
                const { row, col } = tile;
                if (
                    (row > 0 && boardState[row - 1][col] !== null) ||
                    (row < BOARD_SIZE - 1 && boardState[row + 1][col] !== null) ||
                    (col > 0 && boardState[row][col - 1] !== null) ||
                    (col < BOARD_SIZE - 1 && boardState[row][col + 1] !== null)
                ) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Check all words formed by placement are valid
         */
        allFormedWordsValid: function (tiles, boardState, dictionary, direction) {
            const BOARD_SIZE = 15;

            // Create temporary board with new tiles
            const tempBoard = boardState.map(row => [...row]);
            for (const tile of tiles) {
                tempBoard[tile.row][tile.col] = tile.letter;
            }

            // Check main word
            const mainWord = this.extractWord(tiles[0].row, tiles[0].col, direction, tempBoard);
            if (mainWord.length > 1 && !dictionary.has(mainWord)) {
                return false;
            }

            // Check perpendicular words formed
            const perpDirection = direction === 'horizontal' ? 'vertical' : 'horizontal';
            for (const tile of tiles) {
                const perpWord = this.extractWord(tile.row, tile.col, perpDirection, tempBoard);
                if (perpWord.length > 1 && !dictionary.has(perpWord)) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Extract complete word at position in given direction
         */
        extractWord: function (row, col, direction, boardState) {
            const BOARD_SIZE = 15;
            let startRow = row, startCol = col;

            // Find start of word
            if (direction === 'horizontal') {
                while (startCol > 0 && boardState[row][startCol - 1] !== null) {
                    startCol--;
                }
            } else {
                while (startRow > 0 && boardState[startRow - 1][col] !== null) {
                    startRow--;
                }
            }

            // Build word
            let word = '';
            let r = startRow, c = startCol;

            while (r < BOARD_SIZE && c < BOARD_SIZE && boardState[r][c] !== null) {
                const cell = boardState[r][c];
                const letter = typeof cell === 'object' ? cell.letter : cell;
                word += letter.toUpperCase();

                if (direction === 'horizontal') {
                    c++;
                } else {
                    r++;
                }
            }

            return word;
        },

        /**
         * Shuffle array in place
         */
        shuffleArray: function (array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    };

    // Export to window
    window.EasyBot = EasyBot;

})(window);
