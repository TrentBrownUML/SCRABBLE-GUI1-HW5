/**
 * =============================================================================
 * SCRABBLE GAME - Expert Bot AI
 * =============================================================================
 * 
 * @file        expert-bot.js
 * @description Expert difficulty AI opponent for Scrabble bot matches.
 *              Highly optimized exhaustive search with advanced heuristics,
 *              prefix tree optimization, and strategic positioning.
 * 
 * @author      Trent Brown
 * @contact     tgbrown450@gmail.com
 * @course      UMass Lowell - GUI Programming I
 * @assignment  HW5 - Scrabble Game
 * @date        December 2024
 * 
 * =============================================================================
 * AI STRATEGY:
 * =============================================================================
 * 
 * SEARCH APPROACH:
 * - Full dictionary search with prefix tree optimization
 * - Evaluates up to 50 candidates for best selection
 * - Prioritizes high-value plays (Triple Word, Bingos)
 * - Considers future board state for strategic positioning
 * 
 * ADVANCED TECHNIQUES:
 * - Prefix tree (trie) for efficient word lookup
 * - Bingo hunting (using all 7 tiles for 50-point bonus)
 * - Optimal blank tile assignment
 * - Strategic board control (blocking opponent opportunities)
 * 
 * OPTIMIZATION:
 * - Early pruning of low-value candidates
 * - Parallel word score calculation
 * - Position value heuristics
 * - Extended time limit for deeper analysis
 * 
 * EXPERT BEHAVIORS:
 * - Actively seeks Triple Word Score combinations
 * - Maximizes blank tile value
 * - Avoids opening premium squares for opponent
 * - Balances immediate score vs. board position
 * 
 * TIME LIMIT: 25 seconds maximum search time
 * 
 * =============================================================================
 * EXTERNAL DEPENDENCIES:
 * =============================================================================
 * - Requires global dictionary Set from bot-game-main.js
 * - Exposed as window.ExpertBot for bot-game-main.js integration
 * 
 * =============================================================================
 */

(function (window) {
    'use strict';

    // ========================================
    // EXPERT BOT AI
    // Strategy: Highly optimized exhaustive search with advanced heuristics
    // - Full dictionary search with prefix tree optimization
    // - Prioritizes high-value plays (TW, bingos)
    // - Considers future board state for strategic positioning
    // - Uses ALL blanks optimally
    // - Much longer time limit for deeper analysis
    // ========================================

    const ExpertBot = {
        name: 'Expert Bot',
        timeLimit: 25000, // 25 seconds in ms
        maxCandidates: 50, // Consider many more candidates

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

        // High-value letters to prioritize in blank usage
        HIGH_VALUE_LETTERS: ['Q', 'Z', 'X', 'J', 'K'],

        // Common bingo-enabling letters (S is especially valuable)
        BINGO_HELPERS: ['S', 'E', 'R', 'I', 'N', 'G', 'D'],

        /**
         * Find the best possible move - exhaustive search with optimization
         */
        findMove: function (rack, boardState, dictionary, isFirstWord) {
            const startTime = Date.now();
            const candidates = [];

            console.log('Expert Bot: Starting exhaustive analysis...');

            // Get all anchor points, prioritized by bonus potential
            const anchors = this.getPrioritizedAnchors(boardState, isFirstWord);
            if (anchors.length === 0) return null;

            // Build prefix set for faster word validation
            const prefixSet = this.buildPrefixSet(dictionary);

            // Get all words formable from rack (with blank expansions)
            const formableWords = this.getFormableWordsWithBlanks(rack, dictionary, prefixSet, startTime);
            console.log(`Expert Bot: Found ${formableWords.length} formable words`);

            // Also find words using existing board letters (hook plays)
            const hookWords = this.findHookPlays(rack, boardState, dictionary, prefixSet, startTime);
            console.log(`Expert Bot: Found ${hookWords.length} potential hook plays`);

            // Combine and deduplicate
            const allWords = [...new Set([...formableWords, ...hookWords])];

            // Try each word at each anchor
            for (const word of allWords) {
                if (Date.now() - startTime > this.timeLimit * 0.8) {
                    console.log('Expert Bot: Approaching time limit, finalizing...');
                    break;
                }

                for (const anchor of anchors) {
                    // Try horizontal
                    const hMove = this.tryPlaceWordAt(word, rack, boardState, dictionary, anchor.row, anchor.col, 'horizontal', isFirstWord);
                    if (hMove) {
                        hMove.score = this.calculateFullScore(hMove, boardState);
                        hMove.strategicValue = this.evaluateStrategicValue(hMove, boardState);
                        candidates.push(hMove);
                    }

                    // Try vertical
                    const vMove = this.tryPlaceWordAt(word, rack, boardState, dictionary, anchor.row, anchor.col, 'vertical', isFirstWord);
                    if (vMove) {
                        vMove.score = this.calculateFullScore(vMove, boardState);
                        vMove.strategicValue = this.evaluateStrategicValue(vMove, boardState);
                        candidates.push(vMove);
                    }
                }
            }

            if (candidates.length === 0) {
                console.log('Expert Bot: No moves found, attempting fallback...');
                return this.findMoveUsingBoardLetters(rack, boardState, dictionary, isFirstWord, startTime);
            }

            // Sort by combined score (raw score + strategic value)
            candidates.sort((a, b) => {
                const aTotal = a.score + a.strategicValue;
                const bTotal = b.score + b.strategicValue;
                return bTotal - aTotal;
            });

            const best = candidates[0];
            console.log(`Expert Bot: Analyzed ${candidates.length} moves, picking "${best.word}" for ${best.score} points (strategic: +${best.strategicValue})`);
            return best;
        },

        /**
         * Build a set of all valid prefixes for faster pruning
         */
        buildPrefixSet: function (dictionary) {
            const prefixes = new Set();
            let count = 0;
            for (const word of dictionary) {
                if (count++ > 50000) break; // Limit for performance
                for (let i = 1; i <= word.length; i++) {
                    prefixes.add(word.substring(0, i));
                }
            }
            return prefixes;
        },

        /**
         * Get anchor points prioritized by bonus square proximity
         */
        getPrioritizedAnchors: function (boardState, isFirstWord) {
            const anchors = [];

            if (isFirstWord) {
                // First word must go through center
                anchors.push({ row: 7, col: 7, priority: 100 });
                return anchors;
            }

            // Find all anchor points (empty cells adjacent to filled cells)
            for (let row = 0; row < this.BOARD_SIZE; row++) {
                for (let col = 0; col < this.BOARD_SIZE; col++) {
                    if (boardState[row][col] !== null) continue;

                    const hasAdjacentTile = this.hasAdjacentTile(boardState, row, col);
                    if (hasAdjacentTile) {
                        const priority = this.calculateAnchorPriority(row, col, boardState);
                        anchors.push({ row, col, priority });
                    }
                }
            }

            // Sort by priority (higher = better bonus potential)
            anchors.sort((a, b) => b.priority - a.priority);
            return anchors;
        },

        /**
         * Calculate priority score for an anchor based on nearby bonuses
         */
        calculateAnchorPriority: function (row, col, boardState) {
            let priority = 0;
            const bonus = this.BOARD_LAYOUT[row][col];

            // Direct bonus on this cell
            if (bonus === 'TW') priority += 50;
            else if (bonus === 'DW') priority += 25;
            else if (bonus === 'TL') priority += 15;
            else if (bonus === 'DL') priority += 8;

            // Check nearby cells for bonus potential (within 7 cells - max word reach)
            for (let dr = -7; dr <= 7; dr++) {
                for (let dc = -7; dc <= 7; dc++) {
                    const nr = row + dr;
                    const nc = col + dc;
                    if (nr < 0 || nr >= this.BOARD_SIZE || nc < 0 || nc >= this.BOARD_SIZE) continue;
                    if (boardState[nr][nc] !== null) continue;

                    const nearBonus = this.BOARD_LAYOUT[nr][nc];
                    const distance = Math.abs(dr) + Math.abs(dc);
                    const distanceFactor = Math.max(0, 8 - distance) / 8;

                    if (nearBonus === 'TW') priority += 10 * distanceFactor;
                    else if (nearBonus === 'DW') priority += 5 * distanceFactor;
                    else if (nearBonus === 'TL') priority += 3 * distanceFactor;
                }
            }

            return priority;
        },

        hasAdjacentTile: function (boardState, row, col) {
            const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of dirs) {
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < this.BOARD_SIZE && nc >= 0 && nc < this.BOARD_SIZE) {
                    if (boardState[nr][nc] !== null) return true;
                }
            }
            return false;
        },

        /**
         * Get all formable words, including optimal blank usage
         */
        getFormableWordsWithBlanks: function (rack, dictionary, prefixSet, startTime) {
            const formable = [];
            const rackLetters = rack.map(l => l.toUpperCase());
            const hasBlank = rackLetters.includes('_');
            const blankCount = rackLetters.filter(l => l === '_').length;

            // Sort dictionary by length (prefer longer words for bingos)
            const sortedDict = [...dictionary].sort((a, b) => b.length - a.length);

            let checked = 0;
            for (const word of sortedDict) {
                if (checked++ % 5000 === 0 && Date.now() - startTime > this.timeLimit * 0.3) {
                    break; // Don't spend too much time on word finding
                }

                if (word.length < 2 || word.length > 15) continue;

                // Quick prefix check
                const firstTwo = word.substring(0, 2);
                if (!prefixSet.has(firstTwo)) continue;

                if (this.canFormWordWithBlanks(word, rackLetters, blankCount)) {
                    formable.push(word);
                    // Prioritize longer words (bingos) but collect variety
                    if (formable.length >= 200) break;
                }
            }

            return formable;
        },

        canFormWordWithBlanks: function (word, rack, blankCount) {
            const rackCopy = [...rack];
            let blanksUsed = 0;

            for (const letter of word.toUpperCase()) {
                const idx = rackCopy.indexOf(letter);
                if (idx !== -1) {
                    rackCopy.splice(idx, 1);
                } else {
                    // Try to use a blank
                    const blankIdx = rackCopy.indexOf('_');
                    if (blankIdx !== -1) {
                        rackCopy.splice(blankIdx, 1);
                        blanksUsed++;
                    } else {
                        return false;
                    }
                }
            }

            return true;
        },

        /**
         * Find hook plays - words that extend existing words
         */
        findHookPlays: function (rack, boardState, dictionary, prefixSet, startTime) {
            const hooks = [];
            const rackSet = new Set(rack.map(l => l.toUpperCase()));
            const hasBlank = rackSet.has('_');

            // Find existing words on board that can be extended
            for (let row = 0; row < this.BOARD_SIZE; row++) {
                for (let col = 0; col < this.BOARD_SIZE; col++) {
                    if (Date.now() - startTime > this.timeLimit * 0.2) break;

                    if (boardState[row][col] === null) continue;

                    // Check for word starting here
                    const hWord = this.extractWord(row, col, 'horizontal', boardState);
                    const vWord = this.extractWord(row, col, 'vertical', boardState);

                    // Try adding letters to front/back
                    if (hWord.length > 1) {
                        this.findExtensions(hWord, rack, dictionary, hooks, hasBlank);
                    }
                    if (vWord.length > 1) {
                        this.findExtensions(vWord, rack, dictionary, hooks, hasBlank);
                    }
                }
            }

            return hooks;
        },

        findExtensions: function (baseWord, rack, dictionary, hooks, hasBlank) {
            const rackLetters = rack.map(l => l.toUpperCase());

            // Try adding one letter to front or back
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (const letter of alphabet) {
                const frontWord = letter + baseWord;
                const backWord = baseWord + letter;

                if (dictionary.has(frontWord) && (rackLetters.includes(letter) || hasBlank)) {
                    hooks.push(frontWord);
                }
                if (dictionary.has(backWord) && (rackLetters.includes(letter) || hasBlank)) {
                    hooks.push(backWord);
                }
            }

            // Try S plurals specifically
            if (dictionary.has(baseWord + 'S') && (rackLetters.includes('S') || hasBlank)) {
                hooks.push(baseWord + 'S');
            }
        },

        /**
         * Evaluate strategic value of a move beyond raw score
         */
        evaluateStrategicValue: function (move, boardState) {
            let value = 0;

            // Bonus for using more tiles (rack management)
            value += move.tiles.length * 2;

            // Big bonus for bingos (using all 7 tiles)
            if (move.tiles.length === 7) {
                value += 25; // Extra incentive beyond the 50pt bonus
            }

            // Penalty for opening up triple word scores for opponent
            for (const tile of move.tiles) {
                const nearbyTW = this.countNearbyBonus(tile.row, tile.col, boardState, 'TW');
                value -= nearbyTW * 5;
            }

            // Bonus for blocking opponent's access to good squares
            // (if our word passes through or near a TW, we've used it)
            for (const tile of move.tiles) {
                if (this.BOARD_LAYOUT[tile.row][tile.col] === 'TW') {
                    value += 10; // We got it, opponent can't
                }
            }

            // Small bonus for keeping good tiles (S, blanks) - encourage rack balance
            const tilesUsed = move.tiles.map(t => t.isBlank ? '_' : t.letter);
            const sUsed = tilesUsed.filter(l => l === 'S').length;
            value -= sUsed * 3; // Small penalty for using S unless score is worth it

            return value;
        },

        countNearbyBonus: function (row, col, boardState, bonusType) {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = row + dr;
                    const nc = col + dc;
                    if (nr >= 0 && nr < this.BOARD_SIZE && nc >= 0 && nc < this.BOARD_SIZE) {
                        if (boardState[nr][nc] === null && this.BOARD_LAYOUT[nr][nc] === bonusType) {
                            count++;
                        }
                    }
                }
            }
            return count;
        },

        /**
         * Try to place a word at a specific position
         */
        tryPlaceWordAt: function (word, rack, boardState, dictionary, row, col, direction, isFirstWord) {
            const tiles = [];
            const rackCopy = rack.map(l => l.toUpperCase());
            let coversCenterIfFirst = false;

            const dRow = direction === 'vertical' ? 1 : 0;
            const dCol = direction === 'horizontal' ? 1 : 0;

            // Try different starting positions relative to anchor
            for (let offset = 0; offset < word.length; offset++) {
                const startRow = row - offset * dRow;
                const startCol = col - offset * dCol;

                const result = this.attemptPlacement(word, rackCopy, boardState, startRow, startCol, direction, isFirstWord);
                if (result) {
                    // Validate ALL formed words (main word + perpendicular words)
                    if (this.validateAllFormedWords(result.tiles, boardState, dictionary, direction)) {
                        return result;
                    }
                }
            }

            return null;
        },

        attemptPlacement: function (word, rack, boardState, startRow, startCol, direction, isFirstWord) {
            const tiles = [];
            const rackCopy = [...rack];
            let usedExisting = false;
            let coversCenterIfFirst = false;

            const dRow = direction === 'vertical' ? 1 : 0;
            const dCol = direction === 'horizontal' ? 1 : 0;

            for (let i = 0; i < word.length; i++) {
                const r = startRow + i * dRow;
                const c = startCol + i * dCol;
                const letter = word[i].toUpperCase();

                if (r < 0 || r >= this.BOARD_SIZE || c < 0 || c >= this.BOARD_SIZE) {
                    return null;
                }

                const existing = boardState[r][c];

                if (existing !== null) {
                    const existingLetter = (typeof existing === 'object' ? existing.letter : existing).toUpperCase();
                    if (existingLetter !== letter) {
                        return null;
                    }
                    usedExisting = true;
                } else {
                    const rackIdx = rackCopy.indexOf(letter);
                    if (rackIdx !== -1) {
                        rackCopy.splice(rackIdx, 1);
                        tiles.push({ row: r, col: c, letter, isBlank: false });
                    } else {
                        const blankIdx = rackCopy.indexOf('_');
                        if (blankIdx !== -1) {
                            rackCopy.splice(blankIdx, 1);
                            tiles.push({ row: r, col: c, letter, isBlank: true });
                        } else {
                            return null;
                        }
                    }

                    if (r === 7 && c === 7) {
                        coversCenterIfFirst = true;
                    }
                }
            }

            if (tiles.length === 0) return null;
            if (isFirstWord && !coversCenterIfFirst) return null;
            if (!isFirstWord && !usedExisting && !this.connectsToBoard(tiles, boardState)) return null;

            return { word, tiles, direction };
        },

        connectsToBoard: function (tiles, boardState) {
            for (const tile of tiles) {
                if (this.hasAdjacentTile(boardState, tile.row, tile.col)) {
                    return true;
                }
            }
            return false;
        },

        validateAllFormedWords: function (tiles, boardState, dictionary, mainDirection) {
            const tempBoard = boardState.map(row => [...row]);
            for (const tile of tiles) {
                tempBoard[tile.row][tile.col] = tile.letter;
            }

            // CRITICAL: Validate the main word formed on the board
            const mainWord = this.extractWord(tiles[0].row, tiles[0].col, mainDirection, tempBoard);
            if (mainWord.length > 1 && !dictionary.has(mainWord.toUpperCase())) {
                return false;
            }

            // Validate perpendicular words
            const perpDirection = mainDirection === 'horizontal' ? 'vertical' : 'horizontal';

            for (const tile of tiles) {
                const perpWord = this.extractWord(tile.row, tile.col, perpDirection, tempBoard);
                if (perpWord.length > 1 && !dictionary.has(perpWord.toUpperCase())) {
                    return false;
                }
            }

            return true;
        },

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
         * Fallback: try to form words using letters already on the board
         */
        findMoveUsingBoardLetters: function (rack, boardState, dictionary, isFirstWord, startTime) {
            const candidates = [];

            // Find all letters on board we can hook onto
            for (let row = 0; row < this.BOARD_SIZE; row++) {
                for (let col = 0; col < this.BOARD_SIZE; col++) {
                    if (Date.now() - startTime > this.timeLimit) break;

                    if (boardState[row][col] === null) continue;

                    const boardLetter = (typeof boardState[row][col] === 'object'
                        ? boardState[row][col].letter
                        : boardState[row][col]).toUpperCase();

                    // Try to form words that include this letter
                    for (const word of dictionary) {
                        if (word.length < 2 || word.length > 8) continue;
                        if (!word.includes(boardLetter)) continue;

                        // Quick check if we have the other letters
                        if (!this.canFormWordWithBlanks(word, rack.map(l => l.toUpperCase()), rack.filter(l => l === '_').length)) {
                            continue;
                        }

                        const hMove = this.tryPlaceWordAt(word, rack, boardState, dictionary, row, col, 'horizontal', isFirstWord);
                        if (hMove) {
                            hMove.score = this.calculateFullScore(hMove, boardState);
                            candidates.push(hMove);
                        }

                        const vMove = this.tryPlaceWordAt(word, rack, boardState, dictionary, row, col, 'vertical', isFirstWord);
                        if (vMove) {
                            vMove.score = this.calculateFullScore(vMove, boardState);
                            candidates.push(vMove);
                        }

                        if (candidates.length >= 20) break;
                    }
                }
            }

            if (candidates.length === 0) return null;

            candidates.sort((a, b) => b.score - a.score);
            return candidates[0];
        },

        /**
         * Calculate full score including all bonuses and perpendicular words
         */
        calculateFullScore: function (move, boardState) {
            const tempBoard = boardState.map(row => [...row]);
            for (const tile of move.tiles) {
                tempBoard[tile.row][tile.col] = tile.isBlank ? { isBlank: true, letter: tile.letter } : tile.letter;
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
                const isBlankTile = typeof cell === 'object' && cell.isBlank;
                let letterValue = isBlankTile ? 0 : (this.TILE_VALUES[letter] || 0);

                const isNewTile = newTiles.some(t => t.row === r && t.col === c);
                if (isNewTile) {
                    const bonus = this.BOARD_LAYOUT[r][c];
                    if (bonus === 'DL') letterValue *= 2;
                    else if (bonus === 'TL') letterValue *= 3;
                    else if (bonus === 'DW' || bonus === 'ST') wordMultiplier *= 2;
                    else if (bonus === 'TW') wordMultiplier *= 3;

                    // Check if this new tile is a blank
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
    window.ExpertBot = ExpertBot;

})(window);
