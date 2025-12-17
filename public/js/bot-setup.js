(function () {
    'use strict';

    // ========================================
    // BOT NAME GENERATORS
    // ========================================

    // Easy Bot names - adolescent/goofy but clean
    const EASY_BOT_NAMES = {
        adjectives: [
            'Derpy', 'Goofy', 'Sleepy', 'Lazy', 'Clueless', 'Dopey', 'Silly',
            'Confused', 'Dizzy', 'Clumsy', 'Forgetful', 'Snoozy', 'Dazed',
            'Wonky', 'Loopy', 'Groggy', 'Spacey', 'Zoned', 'Bored', 'Yawning'
        ],
        nouns: [
            'Potato', 'Noodle', 'Nugget', 'Muffin', 'Dumpling', 'Pickle',
            'Waffle', 'Burrito', 'Tater', 'Cupcake', 'Pretzel', 'Turnip',
            'Donut', 'Biscuit', 'Pancake', 'Noobert', 'Goober', 'Dingus',
            'Cabbage', 'Walnut', 'Spud', 'Bean', 'Pudding', 'Crouton'
        ]
    };

    // Medium Bot names - slightly more competent sounding
    const MEDIUM_BOT_NAMES = {
        adjectives: [
            'Crafty', 'Sneaky', 'Clever', 'Tricky', 'Scheming', 'Cunning',
            'Plotting', 'Sly', 'Wily', 'Shrewd', 'Calculating', 'Devious'
        ],
        nouns: [
            'Fox', 'Raccoon', 'Weasel', 'Crow', 'Raven', 'Badger',
            'Ferret', 'Mongoose', 'Coyote', 'Jackal', 'Hyena', 'Magpie'
        ]
    };

    // Hard Bot names - intimidating
    const HARD_BOT_NAMES = {
        adjectives: [
            'Ruthless', 'Merciless', 'Fierce', 'Savage', 'Brutal', 'Vicious',
            'Relentless', 'Unstoppable', 'Fearsome', 'Dreadful', 'Grim', 'Dark'
        ],
        nouns: [
            'Crusher', 'Destroyer', 'Dominator', 'Annihilator', 'Obliterator',
            'Terminator', 'Ravager', 'Slayer', 'Vanquisher', 'Conqueror', 'Reaper', 'Doom'
        ]
    };

    // Expert Bot names - legendary/mythic
    const EXPERT_BOT_NAMES = {
        titles: [
            'The Omniscient', 'The Undefeated', 'The Legendary', 'The Almighty',
            'The Supreme', 'The Absolute', 'The Eternal', 'The Infinite',
            'Lord of Letters', 'Master of Words', 'The Lexicon', 'The Oracle'
        ],
        names: [
            'Wordsworth', 'Lexicus', 'Verbatim', 'Scrabylon', 'Alphabeticus',
            'Vocabulon', 'Syntaxis', 'Grammarix', 'Dictionus', 'Thesaurus Rex'
        ]
    };

    function generateBotName(difficulty) {
        switch (difficulty) {
            case 'easy': {
                const adj = EASY_BOT_NAMES.adjectives[Math.floor(Math.random() * EASY_BOT_NAMES.adjectives.length)];
                const noun = EASY_BOT_NAMES.nouns[Math.floor(Math.random() * EASY_BOT_NAMES.nouns.length)];
                return `${adj} ${noun}`;
            }
            case 'medium': {
                const adj = MEDIUM_BOT_NAMES.adjectives[Math.floor(Math.random() * MEDIUM_BOT_NAMES.adjectives.length)];
                const noun = MEDIUM_BOT_NAMES.nouns[Math.floor(Math.random() * MEDIUM_BOT_NAMES.nouns.length)];
                return `${adj} ${noun}`;
            }
            case 'hard': {
                const adj = HARD_BOT_NAMES.adjectives[Math.floor(Math.random() * HARD_BOT_NAMES.adjectives.length)];
                const noun = HARD_BOT_NAMES.nouns[Math.floor(Math.random() * HARD_BOT_NAMES.nouns.length)];
                return `${adj} ${noun}`;
            }
            case 'expert': {
                // 50% chance of title + name, 50% just a cool title
                if (Math.random() > 0.5) {
                    const name = EXPERT_BOT_NAMES.names[Math.floor(Math.random() * EXPERT_BOT_NAMES.names.length)];
                    const title = EXPERT_BOT_NAMES.titles[Math.floor(Math.random() * EXPERT_BOT_NAMES.titles.length)];
                    return `${name} ${title}`;
                } else {
                    return EXPERT_BOT_NAMES.titles[Math.floor(Math.random() * EXPERT_BOT_NAMES.titles.length)];
                }
            }
            default:
                return 'Bot';
        }
    }

    // ========================================
    // PLAYER COLORS
    // Centralized color scheme - MUST match:
    //   1. CSS custom properties in bot-game.css (:root)
    //   2. PLAYER_COLORS in bot-game-main.js
    // ========================================

    const PLAYER_COLORS = {
        human: '#2ecc71',  // Green - same as --color-human
        bot1: '#e74c3c',   // Red - same as --color-bot-1  
        bot2: '#9b59b6',   // Purple - same as --color-bot-2
        bot3: '#f39c12'    // Orange - same as --color-bot-3
    };

    // Get bot color by index (0-based)
    function getBotColor(index) {
        const colors = [PLAYER_COLORS.bot1, PLAYER_COLORS.bot2, PLAYER_COLORS.bot3];
        return colors[index % colors.length];
    }

    // ========================================
    // BOT CONFIGURATION
    // ========================================

    // Minimum turn time for game pacing (applies to all bots)
    const MIN_TURN_TIME = 7.5; // seconds

    // Animation buffer: ~0.5s per tile placed + delays
    // Average word is ~4-5 tiles = ~2-2.5s animation time, plus overhead
    const ANIMATION_BUFFER = 4; // seconds added per bot turn for animations

    const BOT_CONFIG = {
        easy: {
            name: 'Easy Bot',
            icon: '🟢',
            timeLimit: 15,       // seconds max computation
            typicalThinkMin: 1,  // typical min thinking seconds
            typicalThinkMax: 3,  // typical max thinking seconds
            avgThinkTime: 2      // average thinking time
        },
        medium: {
            name: 'Medium Bot',
            icon: '🟡',
            timeLimit: 15,
            typicalThinkMin: 2,
            typicalThinkMax: 6,
            avgThinkTime: 4
        },
        hard: {
            name: 'Hard Bot',
            icon: '🟠',
            timeLimit: 20,
            typicalThinkMin: 5,
            typicalThinkMax: 12,
            avgThinkTime: 8.5
        },
        expert: {
            name: 'Expert Bot',
            icon: '🔴',
            timeLimit: 25,
            typicalThinkMin: 10,
            typicalThinkMax: 20,
            avgThinkTime: 15
        }
    };

    const MAX_BOTS = 3;

    // ========================================
    // STATE
    // ========================================

    let addedBots = [];  // Array of difficulty strings: ['easy', 'medium', etc.]

    // ========================================
    // INITIALIZATION
    // ========================================

    $(function () {
        bindEvents();
        updateUI();
    });

    function bindEvents() {
        // Add bot buttons
        $('.add-bot-btn').on('click', function () {
            const difficulty = $(this).data('difficulty');
            addBot(difficulty);
        });

        // Start game button
        $('#start-bot-game').on('click', function () {
            if (addedBots.length > 0) {
                startBotGame();
            }
        });
    }

    // ========================================
    // BOT MANAGEMENT
    // ========================================

    function addBot(difficulty) {
        if (addedBots.length >= MAX_BOTS) {
            return;
        }

        addedBots.push(difficulty);
        updateUI();
    }

    function removeBot(index) {
        addedBots.splice(index, 1);
        updateUI();
    }

    // ========================================
    // UI UPDATES
    // ========================================

    function updateUI() {
        updateBotRoster();
        updateAddButtons();
        updateWaitTimes();
        updateStartButton();
    }

    function updateBotRoster() {
        const $roster = $('#bot-roster');
        $roster.empty();

        addedBots.forEach((difficulty, index) => {
            const config = BOT_CONFIG[difficulty];
            const $bot = $('<div>')
                .addClass('roster-bot')
                .addClass(difficulty)
                .append($('<span>').addClass('bot-difficulty-icon').text(config.icon))
                .append($('<span>').addClass('bot-label').text(config.name))
                .append(
                    $('<button>')
                        .addClass('remove-bot-btn')
                        .text('×')
                        .on('click', () => removeBot(index))
                );
            $roster.append($bot);
        });
    }

    function updateAddButtons() {
        const canAdd = addedBots.length < MAX_BOTS;
        $('.add-bot-btn').prop('disabled', !canAdd);
    }

    function updateWaitTimes() {
        if (addedBots.length === 0) {
            $('#wait-min').text('--');
            $('#wait-avg').text('--');
            $('#wait-max').text('--');
            return;
        }

        let minTime = 0;
        let avgTime = 0;
        let maxTime = 0;

        addedBots.forEach(difficulty => {
            const config = BOT_CONFIG[difficulty];
            // Each bot turn = thinking time + animation buffer + min turn time pacing
            minTime += config.typicalThinkMin + ANIMATION_BUFFER + MIN_TURN_TIME;
            avgTime += config.avgThinkTime + ANIMATION_BUFFER + MIN_TURN_TIME;
            maxTime += config.timeLimit + ANIMATION_BUFFER + MIN_TURN_TIME;
        });

        $('#wait-min').text(formatTime(minTime));
        $('#wait-avg').text(formatTime(avgTime));
        $('#wait-max').text(formatTime(maxTime));
    }

    function formatTime(seconds) {
        if (seconds < 60) {
            return `~${Math.round(seconds)}s`;
        }
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `~${mins}m ${secs}s`;
    }

    function updateStartButton() {
        const $btn = $('#start-bot-game');
        if (addedBots.length === 0) {
            $btn.prop('disabled', true);
            $btn.text('Add at least one bot to start!');
        } else {
            $btn.prop('disabled', false);
            const botWord = addedBots.length === 1 ? 'bot' : 'bots';
            $btn.text(`⚔️ Start Game vs ${addedBots.length} ${botWord}!`);
        }
    }

    // ========================================
    // GAME START
    // ========================================

    function startBotGame() {
        // Store bot configuration in sessionStorage for the game page to read
        const gameConfig = {
            playerColor: PLAYER_COLORS.human,
            bots: addedBots.map((difficulty, index) => ({
                id: index + 1,
                difficulty: difficulty,
                name: generateBotName(difficulty),  // Generate unique fun name!
                icon: BOT_CONFIG[difficulty].icon,
                timeLimit: BOT_CONFIG[difficulty].timeLimit,
                color: getBotColor(index)
            })),
            playerGoesFirst: true
        };

        sessionStorage.setItem('botGameConfig', JSON.stringify(gameConfig));

        // Navigate to the bot game
        window.location.href = 'bot-play.html';
    }

})();
