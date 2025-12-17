(function (window) {
    'use strict';

    // ========================================
    // HARD BOT AI
    // Strategy: Exhaustive search of dictionary for best scoring words
    // Considers bonus square positioning, parallel word formation
    // Much more aggressive than Easy/Medium - searches actual dictionary
    // ========================================

    const HardBot = {
        name: 'Hard Bot',
        timeLimit: 20000, // 20 seconds in ms
        maxCandidates: 15, // Consider more candidates for better selection

        // Shared constants
        BOARD_SIZE: 15,
        BOARD_LAYOUT: [
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
        ],
        TILE_VALUES: {
            'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4,
            'I': 1, 'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3,
            'Q': 10, 'R': 1, 'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8,
            'Y': 4, 'Z': 10, '_': 0
        },

        /**
         * Find a move for the bot - exhaustive dictionary search
         */
        findMove: function (rack, boardState, dictionary, isFirstWord) {
            const startTime = Date.now();
            const candidates = [];

            // Get all anchor points
            const anchors = this.getAnchorPoints(boardState, isFirstWord);
            if (anchors.length === 0) return null;

            // Get all words that can be formed from rack (searches actual dictionary)
            const formableWords = this.getFormableWords(rack, dictionary, startTime);
            console.log(`Hard Bot: Found ${formableWords.length} formable words from rack`);

            // Try each formable word at each anchor
            for (const word of formableWords) {
                if (Date.now() - startTime > this.timeLimit) {
                    console.log('Hard Bot: Time limit reached during placement search');
                    break;
                }

                for (const anchor of anchors) {
                    if (candidates.length >= this.maxCandidates * 2) break; // Collect more, filter later

                    // Try horizontal
                    const hMove = this.tryPlaceWordAt(word, rack, boardState, dictionary, anchor.row, anchor.col, 'horizontal', isFirstWord);
                    if (hMove) {
                        hMove.score = this.calculateFullScore(hMove, boardState);
                        candidates.push(hMove);
                    }

                    // Try vertical
                    const vMove = this.tryPlaceWordAt(word, rack, boardState, dictionary, anchor.row, anchor.col, 'vertical', isFirstWord);
                    if (vMove) {
                        vMove.score = this.calculateFullScore(vMove, boardState);
                        candidates.push(vMove);
                    }
                }
            }

            if (candidates.length === 0) {
                // Fallback: try using existing board letters
                return this.findMoveUsingBoardLetters(rack, boardState, dictionary, isFirstWord, startTime);
            }

            // Sort by score and pick the best
            candidates.sort((a, b) => b.score - a.score);
            const best = candidates[0];
            console.log(`Hard Bot: Found ${candidates.length} candidates, picking "${best.word}" for ${best.score} points`);
            return best;
        },

        /**
         * Get all dictionary words that can be formed from the rack
         * This is the key difference from Easy/Medium - we search the actual dictionary
         */
        getFormableWords: function (rack, dictionary, startTime) {
            const formable = [];
            const rackUpper = rack.map(l => l.toUpperCase());
            const hasBlank = rackUpper.includes('_');

            // Create a frequency map of the rack
            const rackFreq = {};
            for (const letter of rackUpper) {
                rackFreq[letter] = (rackFreq[letter] || 0) + 1;
            }

            // Check each dictionary word
            for (const word of dictionary) {
                // Time check every 1000 words
                if (formable.length % 1000 === 0 && Date.now() - startTime > this.timeLimit * 0.4) {
                    break; // Use 40% of time for word finding, 60% for placement
                }

                // Skip words longer than rack + reasonable board extension
                if (word.length > 7 && word.length > rack.length + 2) continue;

                // Skip very short words unless we need them
                if (word.length < 2) continue;

                if (this.canFormWord(word, rackUpper, hasBlank)) {
                    formable.push(word);
                }
            }

            // Sort by length (prefer longer words) and potential score
            formable.sort((a, b) => {
                // Prefer words with high-value letters
                const scoreA = this.estimateWordValue(a);
                const scoreB = this.estimateWordValue(b);
                return scoreB - scoreA;
            });

            // Return top candidates to avoid too many placement attempts
            return formable.slice(0, 100);
        },

        /**
         * Estimate the base value of a word (without position bonuses)
         */
        estimateWordValue: function (word) {
            let value = 0;
            for (const letter of word) {
                value += this.TILE_VALUES[letter] || 0;
            }
            // Bonus for length
            value += word.length * 2;
            // Big bonus for 7-letter words (bingo potential)
            if (word.length === 7) value += 50;
            return value;
        },

        /**
         * Check if a word can be formed from the rack
         */
        canFormWord: function (word, rackUpper, hasBlank) {
            const rackCopy = [...rackUpper];
            let blanksUsed = 0;
            const maxBlanks = hasBlank ? rackCopy.filter(l => l === '_').length : 0;

            for (const letter of word.toUpperCase()) {
                const idx = rackCopy.indexOf(letter);
                if (idx !== -1) {
                    rackCopy.splice(idx, 1);
                } else if (blanksUsed < maxBlanks) {
                    // Use a blank
                    const blankIdx = rackCopy.indexOf('_');
                    if (blankIdx !== -1) {
                        rackCopy.splice(blankIdx, 1);
                        blanksUsed++;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return true;
        },

        /**
         * Try to place a specific word at a position
         */
        tryPlaceWordAt: function (word, rack, boardState, dictionary, anchorRow, anchorCol, direction, isFirstWord) {
            const rackCopy = [...rack].map(l => l.toUpperCase());

            // Try different offsets so the word crosses the anchor
            for (let offset = 0; offset < word.length; offset++) {
                let startRow = anchorRow;
                let startCol = anchorCol;

                if (direction === 'horizontal') {
                    startCol = anchorCol - offset;
                } else {
                    startRow = anchorRow - offset;
                }

                const placement = this.validatePlacement(word, startRow, startCol, direction, boardState, rackCopy, isFirstWord);
                if (placement.valid) {
                    // Verify all perpendicular words are valid
                    if (this.allFormedWordsValid(placement.tiles, boardState, dictionary, direction)) {
                        return {
                            word: word,
                            tiles: placement.tiles,
                            direction: direction,
                            startRow: startRow,
                            startCol: startCol
                        };
                    }
                }
            }
            return null;
        },

        /**
         * Fallback: find moves by extending existing words on the board
         */
        findMoveUsingBoardLetters: function (rack, boardState, dictionary, isFirstWord, startTime) {
            const candidates = [];
            const anchors = this.getAnchorPoints(boardState, isFirstWord);

            // For each anchor, look at adjacent letters and try to form words
            for (const anchor of anchors) {
                if (Date.now() - startTime > this.timeLimit) break;
                if (candidates.length >= this.maxCandidates) break;

                for (const dir of ['horizontal', 'vertical']) {
                    // Get letters already on the board in this direction
                    const existingLetters = this.getExistingLettersInDirection(anchor.row, anchor.col, dir, boardState);

                    // Try to form words using rack + existing letters
                    const combinedRack = [...rack, ...existingLetters];
                    const words = this.getFormableWords(combinedRack, dictionary, startTime);

                    for (const word of words.slice(0, 20)) {
                        const move = this.tryPlaceWordAt(word, rack, boardState, dictionary, anchor.row, anchor.col, dir, isFirstWord);
                        if (move) {
                            move.score = this.calculateFullScore(move, boardState);
                            candidates.push(move);
                            if (candidates.length >= this.maxCandidates) break;
                        }
                    }
                }
            }

            if (candidates.length === 0) return null;

            candidates.sort((a, b) => b.score - a.score);
            return candidates[0];
        },

        /**
         * Get existing letters adjacent to a position in a direction
         */
        getExistingLettersInDirection: function (row, col, direction, boardState) {
            const letters = [];
            const dr = direction === 'vertical' ? 1 : 0;
            const dc = direction === 'horizontal' ? 1 : 0;

            // Look backwards
            let r = row - dr, c = col - dc;
            while (r >= 0 && c >= 0 && boardState[r][c] !== null) {
                const cell = boardState[r][c];
                const letter = typeof cell === 'object' ? cell.letter : cell;
                letters.unshift(letter.toUpperCase());
                r -= dr;
                c -= dc;
            }

            // Look forwards
            r = row + dr;
            c = col + dc;
            while (r < this.BOARD_SIZE && c < this.BOARD_SIZE && boardState[r][c] !== null) {
                const cell = boardState[r][c];
                const letter = typeof cell === 'object' ? cell.letter : cell;
                letters.push(letter.toUpperCase());
                r += dr;
                c += dc;
            }

            return letters;
        },

        /**
         * Get anchor points where words can be placed
         */
        getAnchorPoints: function (boardState, isFirstWord) {
            const anchors = [];

            if (isFirstWord) {
                anchors.push({ row: 7, col: 7 });
                return anchors;
            }

            // Find all empty cells adjacent to filled cells
            for (let row = 0; row < this.BOARD_SIZE; row++) {
                for (let col = 0; col < this.BOARD_SIZE; col++) {
                    if (boardState[row][col] === null) {
                        const hasAdjacent =
                            (row > 0 && boardState[row - 1][col] !== null) ||
                            (row < this.BOARD_SIZE - 1 && boardState[row + 1][col] !== null) ||
                            (col > 0 && boardState[row][col - 1] !== null) ||
                            (col < this.BOARD_SIZE - 1 && boardState[row][col + 1] !== null);

                        if (hasAdjacent) {
                            anchors.push({ row, col });
                        }
                    }
                }
            }

            // Prioritize anchors near bonus squares
            anchors.sort((a, b) => {
                const bonusA = this.getBonusValue(a.row, a.col);
                const bonusB = this.getBonusValue(b.row, b.col);
                return bonusB - bonusA;
            });

            return anchors;
        },

        /**
         * Get bonus value for prioritizing anchor points
         */
        getBonusValue: function (row, col) {
            const bonus = this.BOARD_LAYOUT[row][col];
            switch (bonus) {
                case 'TW': return 10;
                case 'DW': return 6;
                case 'TL': return 4;
                case 'DL': return 2;
                default: return 0;
            }
        },

        /**
         * Validate word placement on board
         */
        validatePlacement: function (word, startRow, startCol, direction, boardState, rack, isFirstWord) {
            const tiles = [];
            const rackCopy = [...rack].map(l => l.toUpperCase());
            let touchesExisting = false;
            let coversCenter = false;

            for (let i = 0; i < word.length; i++) {
                const row = direction === 'horizontal' ? startRow : startRow + i;
                const col = direction === 'horizontal' ? startCol + i : startCol;

                // Check bounds
                if (row < 0 || row >= this.BOARD_SIZE || col < 0 || col >= this.BOARD_SIZE) {
                    return { valid: false };
                }

                const letter = word[i].toUpperCase();
                const existingTile = boardState[row][col];

                if (existingTile !== null) {
                    const existingLetter = typeof existingTile === 'object' ? existingTile.letter : existingTile;
                    if (existingLetter.toUpperCase() !== letter) {
                        return { valid: false };
                    }
                    touchesExisting = true;
                } else {
                    const rackIdx = rackCopy.indexOf(letter);
                    if (rackIdx !== -1) {
                        rackCopy.splice(rackIdx, 1);
                        tiles.push({ row, col, letter, isBlank: false });
                    } else {
                        const blankIdx = rackCopy.indexOf('_');
                        if (blankIdx !== -1) {
                            rackCopy.splice(blankIdx, 1);
                            tiles.push({ row, col, letter, isBlank: true });
                        } else {
                            return { valid: false };
                        }
                    }
                }

                if (row === 7 && col === 7) {
                    coversCenter = true;
                }
            }

            if (tiles.length === 0) {
                return { valid: false };
            }

            if (isFirstWord) {
                if (!coversCenter || tiles.length < 2) {
                    return { valid: false };
                }
            } else {
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
            for (const tile of tiles) {
                const { row, col } = tile;
                if (
                    (row > 0 && boardState[row - 1][col] !== null) ||
                    (row < this.BOARD_SIZE - 1 && boardState[row + 1][col] !== null) ||
                    (col > 0 && boardState[row][col - 1] !== null) ||
                    (col < this.BOARD_SIZE - 1 && boardState[row][col + 1] !== null)
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
            const tempBoard = boardState.map(row => [...row]);
            for (const tile of tiles) {
                tempBoard[tile.row][tile.col] = tile.letter;
            }

            // Check main word
            const mainWord = this.extractWord(tiles[0].row, tiles[0].col, direction, tempBoard);
            if (mainWord.length > 1 && !dictionary.has(mainWord)) {
                return false;
            }

            // Check perpendicular words
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
            let startRow = row, startCol = col;

            if (direction === 'horizontal') {
                while (startCol > 0 && boardState[row][startCol - 1] !== null) startCol--;
            } else {
                while (startRow > 0 && boardState[startRow - 1][col] !== null) startRow--;
            }

            let word = '';
            let r = startRow, c = startCol;

            while (r < this.BOARD_SIZE && c < this.BOARD_SIZE && boardState[r][c] !== null) {
                const cell = boardState[r][c];
                const letter = typeof cell === 'object' ? cell.letter : cell;
                word += letter.toUpperCase();
                if (direction === 'horizontal') c++;
                else r++;
            }

            return word;
        },

        /**
         * Calculate full score including all bonuses and perpendicular words
         */
        calculateFullScore: function (move, boardState) {
            const tempBoard = boardState.map(row => [...row]);
            for (const tile of move.tiles) {
                tempBoard[tile.row][tile.col] = tile.letter;
            }

            let totalScore = 0;

            // Score main word
            totalScore += this.scoreWord(move.tiles[0].row, move.tiles[0].col, move.direction, tempBoard, move.tiles);

            // Score perpendicular words
            const perpDirection = move.direction === 'horizontal' ? 'vertical' : 'horizontal';
            for (const tile of move.tiles) {
                const perpWord = this.extractWord(tile.row, tile.col, perpDirection, tempBoard);
                if (perpWord.length > 1) {
                    totalScore += this.scoreWord(tile.row, tile.col, perpDirection, tempBoard, [tile]);
                }
            }

            // Bingo bonus for using all 7 tiles
            if (move.tiles.length === 7) {
                totalScore += 50;
            }

            return totalScore;
        },

        /**
         * Score a word with bonuses
         */
        scoreWord: function (row, col, direction, boardState, newTiles) {
            let startRow = row, startCol = col;

            if (direction === 'horizontal') {
                while (startCol > 0 && boardState[row][startCol - 1] !== null) startCol--;
            } else {
                while (startRow > 0 && boardState[startRow - 1][col] !== null) startRow--;
            }

            let wordScore = 0;
            let wordMultiplier = 1;
            let r = startRow, c = startCol;

            while (r < this.BOARD_SIZE && c < this.BOARD_SIZE && boardState[r][c] !== null) {
                const cell = boardState[r][c];
                const letter = (typeof cell === 'object' ? cell.letter : cell).toUpperCase();
                let letterValue = this.TILE_VALUES[letter] || 0;

                // Check if this is a newly placed tile (bonuses only apply to new tiles)
                const isNewTile = newTiles.some(t => t.row === r && t.col === c);
                if (isNewTile) {
                    const bonus = this.BOARD_LAYOUT[r][c];
                    if (bonus === 'DL') letterValue *= 2;
                    else if (bonus === 'TL') letterValue *= 3;
                    else if (bonus === 'DW' || bonus === 'ST') wordMultiplier *= 2;
                    else if (bonus === 'TW') wordMultiplier *= 3;

                    // Blank tiles are worth 0
                    const tileData = newTiles.find(t => t.row === r && t.col === c);
                    if (tileData && tileData.isBlank) letterValue = 0;
                }

                wordScore += letterValue;

                if (direction === 'horizontal') c++;
                else r++;
            }

            return wordScore * wordMultiplier;
        }
    };

    // Export to window
    window.HardBot = HardBot;

})(window);
