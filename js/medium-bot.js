/**
 * =============================================================================
 * SCRABBLE GAME - Medium Bot AI
 * =============================================================================
 * 
 * @file        medium-bot.js
 * @description Medium difficulty AI opponent for Scrabble bot matches.
 *              Uses an improved strategy that considers more word candidates
 *              and shows preference for longer words and bonus squares.
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
 * - Finds up to 8 valid word candidates (more than Easy)
 * - Evaluates words with bonus multipliers in scoring
 * - Prefers longer words when scores are similar
 * 
 * MOVE GENERATION:
 * - Broader anchor point analysis than Easy bot
 * - Considers horizontal and vertical placements
 * - Basic bonus square awareness in selection
 * - Uses larger portion of vocabulary
 * 
 * IMPROVEMENTS OVER EASY:
 * - More candidates = better chance of finding good moves
 * - Length preference leads to more strategic plays
 * - Better utilization of rack tiles
 * 
 * TIME LIMIT: 15 seconds maximum search time
 * 
 * =============================================================================
 * EXTERNAL DEPENDENCIES:
 * =============================================================================
 * - Requires global dictionary Set from bot-game-main.js
 * - Exposed as window.MediumBot for bot-game-main.js integration
 * 
 * =============================================================================
 */

(function (window) {
    'use strict';

    // ========================================
    // MEDIUM BOT AI
    // Strategy: Find up to 8 valid words, prefer longer words and bonus squares
    // Uses a larger vocabulary than Easy Bot
    // ========================================

    const MediumBot = {
        name: 'Medium Bot',
        timeLimit: 15000, // 15 seconds in ms
        maxCandidates: 8, // Number of words to consider before picking best

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
            const candidates = [];

            // Get all anchor points (empty cells adjacent to existing tiles, or center for first word)
            const anchors = this.getAnchorPoints(boardState, isFirstWord);

            if (anchors.length === 0) {
                return null;
            }

            // Try to find valid words at each anchor
            for (const anchor of anchors) {
                // Check time limit
                if (Date.now() - startTime > this.timeLimit) {
                    console.log('Medium Bot: Time limit reached');
                    break;
                }

                // Stop if we have enough candidates
                if (candidates.length >= this.maxCandidates) {
                    break;
                }

                // Try horizontal placement
                const horizontalMove = this.tryPlaceWord(rack, boardState, dictionary, anchor.row, anchor.col, 'horizontal', isFirstWord);
                if (horizontalMove) {
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
            console.log(`Medium Bot: Found ${candidates.length} candidates, picking best with score ${candidates[0].score} (word: ${candidates[0].word})`);
            return candidates[0];
        },

        /**
         * Estimate score for a move with bonus square awareness
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

            let finalScore = baseScore * wordMultiplier;

            // Bonus for using more tiles (longer words)
            finalScore += move.tiles.length * 2;

            // Bonus for using 7 tiles (bingo potential awareness)
            if (move.tiles.length === 7) {
                finalScore += 50;
            }

            return finalScore;
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

            // Generate possible words from rack - Medium Bot uses extended vocabulary
            const possibleWords = this.generateWordsFromRack(rackCopy, dictionary);

            for (const word of possibleWords) {
                // Try placing word at different offsets from the anchor
                for (let offset = 0; offset < word.length; offset++) {
                    let row = startRow;
                    let col = startCol;

                    if (direction === 'horizontal') {
                        col = startCol - offset;
                    } else {
                        row = startRow - offset;
                    }

                    const placement = this.validatePlacement(word, row, col, direction, boardState, rackCopy, isFirstWord);

                    if (placement.valid) {
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
         * Generate valid words from rack tiles - Extended vocabulary for Medium Bot
         */
        generateWordsFromRack: function (rack, dictionary) {
            const words = [];

            // Extended word list including 4-7 letter words
            const extendedWords = [
                // 2-letter words
                'AT', 'TO', 'IT', 'IN', 'IS', 'ON', 'AN', 'AS', 'BE', 'BY',
                'DO', 'GO', 'HE', 'IF', 'ME', 'MY', 'NO', 'OF', 'OR', 'SO',
                'UP', 'US', 'WE', 'AM', 'AX', 'EM', 'EX', 'HI', 'LO', 'MA',
                'PA', 'PI', 'RE', 'TA', 'XI', 'YA', 'YE', 'OX', 'AH', 'EH',
                'OH', 'UH', 'UM', 'MM', 'SH', 'OW', 'AW', 'OO',
                // 3-letter words
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
                'WON', 'YES', 'YET', 'ZAP', 'ZEN', 'ZIP', 'ZOO', 'JAM', 'JAR', 'JAW',
                'JET', 'JIG', 'JOG', 'JOT', 'JUG', 'QUA',
                // 4-letter words (higher value)
                'ABLE', 'ACID', 'AGED', 'ALSO', 'AREA', 'ARMY', 'AWAY', 'BABY', 'BACK',
                'BALL', 'BAND', 'BANK', 'BASE', 'BEAR', 'BEAT', 'BEEN', 'BEST', 'BIRD',
                'BLUE', 'BOAT', 'BODY', 'BOOK', 'BORN', 'BOTH', 'BOYS', 'BUSY', 'CALL',
                'CAME', 'CAMP', 'CARD', 'CARE', 'CASE', 'CASH', 'CAST', 'CELL', 'CITY',
                'CLUB', 'COAT', 'CODE', 'COLD', 'COME', 'COOL', 'COPY', 'COST', 'DARK',
                'DATA', 'DATE', 'DAYS', 'DEAD', 'DEAL', 'DEEP', 'DOES', 'DONE', 'DOOR',
                'DOWN', 'DRAW', 'DROP', 'DRUG', 'EACH', 'EAST', 'EASY', 'EDGE', 'ELSE',
                'EVEN', 'EVER', 'EYES', 'FACE', 'FACT', 'FAIL', 'FAIR', 'FALL', 'FARM',
                'FAST', 'FEAR', 'FEEL', 'FEET', 'FELL', 'FELT', 'FILE', 'FILL', 'FILM',
                'FIND', 'FINE', 'FIRE', 'FIRM', 'FISH', 'FIVE', 'FLAT', 'FLOW', 'FOOD',
                'FOOT', 'FORM', 'FOUR', 'FREE', 'FROM', 'FULL', 'FUND', 'GAIN', 'GAME',
                'GAVE', 'GIRL', 'GIVE', 'GLAD', 'GOAL', 'GOES', 'GOLD', 'GONE', 'GOOD',
                'GREW', 'GROW', 'HAIR', 'HALF', 'HALL', 'HAND', 'HANG', 'HARD', 'HATE',
                'HAVE', 'HEAD', 'HEAR', 'HEAT', 'HELD', 'HELP', 'HERE', 'HIGH', 'HOLD',
                'HOME', 'HOPE', 'HOST', 'HOUR', 'HUGE', 'IDEA', 'INTO', 'IRON', 'ITEM',
                'JACK', 'JAIL', 'JAZZ', 'JEAN', 'JEEP', 'JOIN', 'JOKE', 'JUDY', 'JUMP',
                'JUNE', 'JURY', 'JUST', 'KEEP', 'KEPT', 'KICK', 'KIDS', 'KILL', 'KIND',
                'KING', 'KNEW', 'KNOW', 'LACK', 'LADY', 'LAID', 'LAKE', 'LAND', 'LANE',
                'LAST', 'LATE', 'LEAD', 'LEFT', 'LESS', 'LIFE', 'LIFT', 'LIKE', 'LINE',
                'LINK', 'LIST', 'LIVE', 'LOAD', 'LOAN', 'LOCK', 'LONG', 'LOOK', 'LORD',
                'LOSE', 'LOSS', 'LOST', 'LOTS', 'LOVE', 'LUCK', 'MADE', 'MAIL', 'MAIN',
                'MAKE', 'MALE', 'MANY', 'MARK', 'MASS', 'MEAN', 'MEET', 'MILE', 'MILK',
                'MIND', 'MINE', 'MISS', 'MODE', 'MOON', 'MORE', 'MOST', 'MOVE', 'MUCH',
                'MUST', 'NAME', 'NEAR', 'NECK', 'NEED', 'NEWS', 'NEXT', 'NICE', 'NINE',
                'NONE', 'NOTE', 'OKAY', 'ONCE', 'ONES', 'ONLY', 'ONTO', 'OPEN', 'OVER',
                'PACE', 'PACK', 'PAGE', 'PAID', 'PAIN', 'PAIR', 'PARK', 'PART', 'PASS',
                'PAST', 'PATH', 'PEAK', 'PICK', 'PLAN', 'PLAY', 'PLUS', 'POEM', 'POET',
                'POLL', 'POOL', 'POOR', 'PORT', 'POST', 'PULL', 'PURE', 'PUSH', 'QUIT',
                'QUIZ', 'RACE', 'RAIN', 'RANK', 'RARE', 'RATE', 'READ', 'REAL', 'REST',
                'RICE', 'RICH', 'RIDE', 'RING', 'RISE', 'RISK', 'ROAD', 'ROCK', 'ROLE',
                'ROLL', 'ROOF', 'ROOM', 'ROOT', 'ROSE', 'RULE', 'SAFE', 'SAID', 'SAKE',
                'SALE', 'SALT', 'SAME', 'SAND', 'SAVE', 'SEAT', 'SEEK', 'SEEM', 'SEEN',
                'SELF', 'SELL', 'SEND', 'SENT', 'SHIP', 'SHOP', 'SHOT', 'SHOW', 'SHUT',
                'SICK', 'SIDE', 'SIGN', 'SITE', 'SIZE', 'SKIN', 'SLOW', 'SNOW', 'SOFT',
                'SOIL', 'SOLD', 'SOLE', 'SOME', 'SONG', 'SOON', 'SORT', 'SOUL', 'SPOT',
                'STAR', 'STAY', 'STEP', 'STOP', 'SUCH', 'SUIT', 'SURE', 'TAKE', 'TALE',
                'TALK', 'TALL', 'TANK', 'TAPE', 'TASK', 'TEAM', 'TELL', 'TEND', 'TERM',
                'TEST', 'TEXT', 'THAN', 'THAT', 'THEM', 'THEN', 'THEY', 'THIN', 'THIS',
                'THUS', 'TIED', 'TILL', 'TIME', 'TINY', 'TOLD', 'TONE', 'TOOK', 'TOOL',
                'TOUR', 'TOWN', 'TREE', 'TRIM', 'TRIP', 'TRUE', 'TUBE', 'TURN', 'TYPE',
                'UNIT', 'UPON', 'USED', 'USER', 'VAST', 'VERY', 'VIEW', 'VOTE', 'WAIT',
                'WAKE', 'WALK', 'WALL', 'WANT', 'WARM', 'WASH', 'WAVE', 'WAYS', 'WEAK',
                'WEAR', 'WEEK', 'WELL', 'WENT', 'WERE', 'WEST', 'WHAT', 'WHEN', 'WHOM',
                'WIDE', 'WIFE', 'WILD', 'WILL', 'WIND', 'WINE', 'WING', 'WIRE', 'WISE',
                'WISH', 'WITH', 'WOKE', 'WOOD', 'WORD', 'WORE', 'WORK', 'YARD', 'YEAR',
                'YOUR', 'ZERO', 'ZONE', 'ZOOM',
                // 5-letter words (strategic picks with high-value letters)
                'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ADAPT', 'ADMIT', 'ADOPT', 'ADULT',
                'AFTER', 'AGAIN', 'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT',
                'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE', 'ALLOW', 'ALONE', 'ALONG', 'ALTER',
                'AMONG', 'ANGEL', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE', 'APPLY',
                'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AUDIO', 'AUDIT',
                'AVOID', 'AWARD', 'AWARE', 'BADLY', 'BAKER', 'BASES', 'BASIC', 'BASIS',
                'BEACH', 'BEAST', 'BEGAN', 'BEGIN', 'BEING', 'BELOW', 'BENCH', 'BILLY',
                'BIRTH', 'BLACK', 'BLADE', 'BLAME', 'BLANK', 'BLAST', 'BLEND', 'BLESS',
                'BLIND', 'BLOCK', 'BLOOD', 'BLOOM', 'BLOWN', 'BOARD', 'BONUS', 'BOOTH',
                'BRAIN', 'BRAND', 'BRAVE', 'BREAD', 'BREAK', 'BREED', 'BRICK', 'BRIDE',
                'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BUILT', 'BURST',
                'BUYER', 'CABIN', 'CABLE', 'CARRY', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR',
                'CHAOS', 'CHARM', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF',
                'CHILD', 'CHINA', 'CHOSE', 'CHUNK', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN',
                'CLEAR', 'CLERK', 'CLICK', 'CLIMB', 'CLOCK', 'CLOSE', 'CLOTH', 'CLOUD',
                'COACH', 'COAST', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRACK', 'CRAFT',
                'CRASH', 'CRAZY', 'CREAM', 'CRIME', 'CROWN', 'CRUDE', 'CURVE', 'CYCLE',
                'DAILY', 'DANCE', 'DATED', 'DEALT', 'DEATH', 'DEBUT', 'DELAY', 'DELTA',
                'DENSE', 'DEPTH', 'DIRTY', 'DOUBT', 'DRAFT', 'DRAIN', 'DRAMA', 'DRANK',
                'DRAWN', 'DREAM', 'DRESS', 'DRIED', 'DRINK', 'DRIVE', 'DROIT', 'DROVE',
                'DYING', 'EAGER', 'EARLY', 'EARTH', 'EIGHT', 'ELECT', 'ELITE', 'EMPTY',
                'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR', 'EVENT', 'EVERY',
                'EXACT', 'EXIST', 'EXTRA', 'FAITH', 'FALSE', 'FAULT', 'FAVOR', 'FEAST',
                'FIBER', 'FIELD', 'FIFTH', 'FIFTY', 'FIGHT', 'FINAL', 'FIRST', 'FIXED',
                'FLAME', 'FLASH', 'FLEET', 'FLESH', 'FLOAT', 'FLOOR', 'FLUID', 'FOCUS',
                'FORCE', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD',
                'FRESH', 'FRONT', 'FRUIT', 'FULLY', 'FUNNY', 'GIANT', 'GIVEN', 'GLASS',
                'GLOBE', 'GLORY', 'GONNA', 'GOODS', 'GRADE', 'GRAIN', 'GRAND', 'GRANT',
                'GRAPE', 'GRASP', 'GRASS', 'GRAVE', 'GREAT', 'GREEN', 'GRIND', 'GROSS',
                'GROUP', 'GROWN', 'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'GUILT', 'HAPPY',
                'HARRY', 'HARSH', 'HAVEN', 'HEART', 'HEAVY', 'HENCE', 'HENRY', 'HORSE',
                'HOTEL', 'HOUSE', 'HUMAN', 'IDEAL', 'IMAGE', 'IMPLY', 'INDEX', 'INNER',
                'INPUT', 'ISSUE', 'JAPAN', 'JIMMY', 'JOINT', 'JONES', 'JUDGE', 'JUICE',
                'KNOWN', 'LABEL', 'LABOR', 'LARGE', 'LASER', 'LATER', 'LAUGH', 'LAYER',
                'LEARN', 'LEASE', 'LEAST', 'LEAVE', 'LEGAL', 'LEVEL', 'LEWIS', 'LIGHT',
                'LIMIT', 'LINKS', 'LIVES', 'LOCAL', 'LOGIC', 'LOOSE', 'LOWER', 'LUCKY',
                'LUNCH', 'LYING', 'MAGIC', 'MAJOR', 'MAKER', 'MARCH', 'MARIA', 'MARRY',
                'MATCH', 'MAYOR', 'MEANT', 'MEDIA', 'MEDAL', 'MERCY', 'MERGE', 'MERIT',
                'METAL', 'MIGHT', 'MINOR', 'MINUS', 'MIXED', 'MODEL', 'MONEY', 'MONTH',
                'MORAL', 'MOTOR', 'MOUNT', 'MOUSE', 'MOUTH', 'MOVED', 'MOVIE', 'MUSIC',
                'NAKED', 'NERVE', 'NEVER', 'NEWLY', 'NIGHT', 'NOISE', 'NORTH', 'NOTED',
                'NOVEL', 'NURSE', 'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'ORDER', 'OTHER',
                'OUGHT', 'OUTER', 'OWNED', 'OWNER', 'OXIDE', 'OZONE', 'PAINT', 'PANEL',
                'PAPER', 'PARTY', 'PASTA', 'PATCH', 'PAUSE', 'PEACE', 'PENNY', 'PETER',
                'PHASE', 'PHONE', 'PHOTO', 'PIANO', 'PIECE', 'PILOT', 'PITCH', 'PIZZA',
                'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'PLAZA', 'PLEAD', 'PLEAS',
                'POINT', 'POLAR', 'POUND', 'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME',
                'PRINT', 'PRIOR', 'PRIZE', 'PROOF', 'PROUD', 'PROVE', 'PROXY', 'QUEEN',
                'QUEST', 'QUICK', 'QUIET', 'QUITE', 'QUOTA', 'QUOTE', 'RADAR', 'RADIO',
                'RAISE', 'RALLY', 'RANCH', 'RANGE', 'RAPID', 'RATIO', 'REACH', 'REACT',
                'READY', 'REALM', 'REBEL', 'REFER', 'REIGN', 'RELAX', 'REPLY', 'RIDER',
                'RIDGE', 'RIGHT', 'RISKY', 'RIVAL', 'RIVER', 'ROBIN', 'ROCKY', 'ROMAN',
                'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RULED', 'RULER', 'RURAL', 'SAINT',
                'SALAD', 'SALLY', 'SALON', 'SANTA', 'SARAH', 'SAUCE', 'SAVED', 'SCALE',
                'SCENE', 'SCOPE', 'SCORE', 'SCOUT', 'SCRAP', 'SCREW', 'SENSE', 'SERVE',
                'SEVEN', 'SHALL', 'SHAME', 'SHAPE', 'SHARE', 'SHARP', 'SHEEP', 'SHEER',
                'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIRT', 'SHOCK', 'SHOES',
                'SHOOT', 'SHORE', 'SHORT', 'SHOUT', 'SHOWN', 'SIDED', 'SIGHT', 'SIGMA',
                'SILLY', 'SIMON', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SKILL', 'SLAVE',
                'SLEEP', 'SLIDE', 'SLOPE', 'SMALL', 'SMART', 'SMELL', 'SMILE', 'SMITH',
                'SMOKE', 'SNAKE', 'SOLAR', 'SOLID', 'SOLVE', 'SORRY', 'SOUND', 'SOUTH',
                'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT', 'SPILL', 'SPINE',
                'SPLIT', 'SPOKE', 'SPORT', 'SPRAY', 'SQUAD', 'STACK', 'STAFF', 'STAGE',
                'STAKE', 'STAMP', 'STAND', 'START', 'STATE', 'STAYS', 'STEAL', 'STEAM',
                'STEEL', 'STEEP', 'STERN', 'STICK', 'STILL', 'STOCK', 'STONE', 'STOOD',
                'STORE', 'STORM', 'STORY', 'STRIP', 'STUCK', 'STUDY', 'STUFF', 'STYLE',
                'SUGAR', 'SUITE', 'SUNNY', 'SUPER', 'SURGE', 'SWEPT', 'SWEET', 'SWING',
                'SWORD', 'TABLE', 'TAKEN', 'TASTE', 'TAXES', 'TEACH', 'TEETH', 'TEMPO',
                'TENDS', 'TERMS', 'TEXAS', 'THANK', 'THEFT', 'THEIR', 'THEME', 'THERE',
                'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THIRTY', 'THOSE', 'THREE',
                'THREW', 'THROW', 'TIGHT', 'TIMER', 'TIMES', 'TIRED', 'TITLE', 'TODAY',
                'TOKEN', 'TOMMY', 'TONER', 'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH', 'TOWER',
                'TOXIC', 'TRACE', 'TRACK', 'TRADE', 'TRAIL', 'TRAIN', 'TRAIT', 'TRASH',
                'TRAVEL', 'TREAT', 'TREND', 'TRIAL', 'TRIBE', 'TRICK', 'TRIED', 'TRIES',
                'TROOP', 'TRUCK', 'TRULY', 'TRUST', 'TRUTH', 'TWICE', 'TWIST', 'ULTRA',
                'UNCLE', 'UNDER', 'UNION', 'UNIQUE', 'UNITE', 'UNITY', 'UNTIL', 'UPPER',
                'UPSET', 'URBAN', 'USAGE', 'USUAL', 'VALID', 'VALUE', 'VIDEO', 'VIRUS',
                'VISIT', 'VITAL', 'VOCAL', 'VOICE', 'VOTER', 'WAGON', 'WASTE', 'WATCH',
                'WATER', 'WHEAT', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE',
                'WHOSE', 'WIDER', 'WOMAN', 'WOMEN', 'WORLD', 'WORRY', 'WORSE', 'WORST',
                'WORTH', 'WOULD', 'WOUND', 'WRIST', 'WRITE', 'WRONG', 'WROTE', 'YIELD',
                'YOUNG', 'YOUTH', 'ZEBRA', 'ZONES'
            ];

            // Check which words can be formed from rack
            // Prioritize longer words for higher scores
            const shortWords = [];
            const mediumWords = [];
            const longWords = [];

            for (const word of extendedWords) {
                if (this.canFormWord(word, rack) && dictionary.has(word)) {
                    if (word.length <= 3) {
                        shortWords.push(word);
                    } else if (word.length <= 5) {
                        mediumWords.push(word);
                    } else {
                        longWords.push(word);
                    }
                }
            }

            // Also try all 2-letter combinations
            for (let i = 0; i < rack.length; i++) {
                for (let j = 0; j < rack.length; j++) {
                    if (i !== j) {
                        const twoLetter = (rack[i] + rack[j]).toUpperCase();
                        if (dictionary.has(twoLetter) && !shortWords.includes(twoLetter)) {
                            shortWords.push(twoLetter);
                        }
                    }
                }
            }

            // Shuffle each category then combine (longer words first)
            this.shuffleArray(longWords);
            this.shuffleArray(mediumWords);
            this.shuffleArray(shortWords);

            // Return longer words first to prefer higher-scoring plays
            return [...longWords, ...mediumWords, ...shortWords];
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
    window.MediumBot = MediumBot;

})(window);
