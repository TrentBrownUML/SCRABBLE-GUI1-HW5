/**
 * =============================================================================
 * LITTLE WORD GAME - Pass & Play Lobby
 * =============================================================================
 * 
 * @file        passplay-lobby.js
 * @description Handles the Pass & Play lobby page where players configure
 *              their names and colors before starting a local multiplayer game.
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
    // CONFIGURATION
    // ========================================

    const MIN_PLAYERS = 2;
    const MAX_PLAYERS = 4;
    const MAX_NAME_LENGTH = 12;
    const DEFAULT_PLAYER_COUNT = 3;

    // Default colors for each player slot (spread across spectrum)
    const DEFAULT_COLORS = [
        '#e74c3c', // Red
        '#3498db', // Blue
        '#2ecc71', // Green
        '#9b59b6'  // Purple
    ];

    // ========================================
    // STATE
    // ========================================

    let playerCount = DEFAULT_PLAYER_COUNT;
    let players = [];
    let currentEditingPlayer = null;
    let selectedColor = '#ff0000';

    // ========================================
    // INITIALIZATION
    // ========================================

    $(document).ready(function () {
        initializePlayers();
        renderPlayerCards();
        bindEvents();
        drawColorWheel();
    });

    function initializePlayers() {
        players = [];
        for (let i = 0; i < MAX_PLAYERS; i++) {
            players.push({
                name: `Player ${i + 1}`,
                color: DEFAULT_COLORS[i]
            });
        }
    }

    // ========================================
    // PLAYER CARDS RENDERING
    // ========================================

    function renderPlayerCards() {
        const container = $('#player-cards');
        container.empty();

        for (let i = 0; i < playerCount; i++) {
            const player = players[i];
            const card = $(`
                <div class="player-card" data-player-index="${i}">
                    <div class="player-number">Player ${i + 1}</div>
                    <input 
                        type="text" 
                        class="player-name-input" 
                        value="${escapeHtml(player.name)}"
                        maxlength="${MAX_NAME_LENGTH}"
                        data-player-index="${i}"
                        placeholder="Enter name..."
                    >
                    <button class="color-picker-btn" data-player-index="${i}">
                        <span class="color-swatch" style="background: ${player.color}"></span>
                        <span class="color-picker-text">Choose Color</span>
                    </button>
                </div>
            `);
            container.append(card);
        }
    }

    // ========================================
    // EVENT BINDINGS
    // ========================================

    function bindEvents() {
        // Player count buttons
        $(document).on('click', '.count-btn', function () {
            $('.count-btn').removeClass('active');
            $(this).addClass('active');
            playerCount = parseInt($(this).data('count'));
            renderPlayerCards();
        });

        // Player name input
        $(document).on('input', '.player-name-input', function () {
            const index = parseInt($(this).data('player-index'));
            let name = $(this).val();

            // Sanitize: only allow standard ASCII printable characters
            name = name.replace(/[^\x20-\x7E]/g, '');

            // Limit length
            if (name.length > MAX_NAME_LENGTH) {
                name = name.substring(0, MAX_NAME_LENGTH);
            }

            $(this).val(name);
            players[index].name = name || `Player ${index + 1}`;
        });

        // Color picker button
        $(document).on('click', '.color-picker-btn', function () {
            currentEditingPlayer = parseInt($(this).data('player-index'));
            selectedColor = players[currentEditingPlayer].color;
            updateColorPreview(selectedColor);
            positionHandleFromColor(selectedColor);
            $('#color-picker-modal').removeClass('hidden');
        });

        // Color wheel interaction
        const colorWheel = document.getElementById('color-wheel');
        let isDragging = false;

        colorWheel.addEventListener('mousedown', startColorDrag);
        colorWheel.addEventListener('touchstart', startColorDrag, { passive: false });

        document.addEventListener('mousemove', dragColor);
        document.addEventListener('touchmove', dragColor, { passive: false });

        document.addEventListener('mouseup', stopColorDrag);
        document.addEventListener('touchend', stopColorDrag);

        function startColorDrag(e) {
            e.preventDefault();
            isDragging = true;
            updateColorFromEvent(e);
        }

        function dragColor(e) {
            if (!isDragging) return;
            e.preventDefault();
            updateColorFromEvent(e);
        }

        function stopColorDrag() {
            isDragging = false;
        }

        // Confirm color
        $('#confirm-color').on('click', function () {
            if (currentEditingPlayer !== null) {
                players[currentEditingPlayer].color = selectedColor;
                renderPlayerCards();
            }
            closeColorModal();
        });

        // Cancel color
        $('#cancel-color').on('click', closeColorModal);

        // Close modal on background click
        $('#color-picker-modal').on('click', function (e) {
            if (e.target === this) {
                closeColorModal();
            }
        });

        // Start game button
        $('#start-game').on('click', function () {
            startGame();
        });

        // Timer toggle
        $('#timer-enabled').on('change', function () {
            if ($(this).is(':checked')) {
                $('#timer-config').removeClass('hidden');
            } else {
                $('#timer-config').addClass('hidden');
            }
        });

        // Timer input validation
        $('#timer-minutes, #timer-seconds').on('input', function () {
            let val = parseInt($(this).val()) || 0;
            if (val < 0) val = 0;
            if (val > 59) val = 59;
            $(this).val(val);
        });
    }

    // ========================================
    // COLOR WHEEL FUNCTIONS
    // ========================================

    function drawColorWheel() {
        const canvas = document.getElementById('color-wheel');
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY);

        // Draw color wheel
        for (let angle = 0; angle < 360; angle++) {
            const startAngle = (angle - 1) * Math.PI / 180;
            const endAngle = (angle + 1) * Math.PI / 180;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            // Create gradient from white center to full color at edge
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            const hue = angle;
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.5, `hsl(${hue}, 100%, 50%)`);
            gradient.addColorStop(1, `hsl(${hue}, 100%, 25%)`);

            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    function updateColorFromEvent(e) {
        const canvas = document.getElementById('color-wheel');
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY);

        // Calculate distance from center
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Clamp to wheel radius
        const clampedDistance = Math.min(distance, radius - 2);
        const angle = Math.atan2(dy, dx);

        // Calculate clamped position
        const clampedX = centerX + Math.cos(angle) * clampedDistance;
        const clampedY = centerY + Math.sin(angle) * clampedDistance;

        // Update handle position
        const handle = document.getElementById('color-wheel-handle');
        handle.style.left = clampedX + 'px';
        handle.style.top = clampedY + 'px';

        // Get color from canvas at clamped position
        const ctx = canvas.getContext('2d');
        const pixel = ctx.getImageData(Math.floor(clampedX), Math.floor(clampedY), 1, 1).data;

        selectedColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
        updateColorPreview(selectedColor);

        // Update handle border color
        handle.style.backgroundColor = selectedColor;
    }

    function positionHandleFromColor(hexColor) {
        // Default to center-right position for now
        const canvas = document.getElementById('color-wheel');
        const handle = document.getElementById('color-wheel-handle');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = (Math.min(centerX, centerY)) * 0.6;

        // Convert hex to HSL to get approximate position
        const rgb = hexToRgb(hexColor);
        if (rgb) {
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            const angle = hsl.h * Math.PI / 180;
            const dist = radius * (1 - hsl.l + 0.2);

            handle.style.left = (centerX + Math.cos(angle) * dist) + 'px';
            handle.style.top = (centerY + Math.sin(angle) * dist) + 'px';
        } else {
            handle.style.left = (centerX + radius) + 'px';
            handle.style.top = centerY + 'px';
        }

        handle.style.backgroundColor = hexColor;
    }

    function updateColorPreview(color) {
        $('#selected-color-swatch').css('background', color);
        $('#selected-color-hex').text(color.toUpperCase());
    }

    function closeColorModal() {
        $('#color-picker-modal').addClass('hidden');
        currentEditingPlayer = null;
    }

    // ========================================
    // GAME START
    // ========================================

    function startGame() {
        // Validate all players have names
        const gamePlayers = [];
        for (let i = 0; i < playerCount; i++) {
            const name = players[i].name.trim() || `Player ${i + 1}`;
            gamePlayers.push({
                id: i,
                name: name,
                color: players[i].color,
                score: 0
            });
        }

        // Get timer configuration
        const timerEnabled = $('#timer-enabled').is(':checked');
        let turnTimeLimit = 0;

        if (timerEnabled) {
            const minutes = parseInt($('#timer-minutes').val()) || 0;
            const seconds = parseInt($('#timer-seconds').val()) || 0;
            turnTimeLimit = (minutes * 60) + seconds;

            // Enforce minimum of 10 seconds
            if (turnTimeLimit < 10) {
                alert('Turn timer must be at least 10 seconds!');
                return;
            }
        }

        // Store in sessionStorage
        sessionStorage.setItem('passplay_players', JSON.stringify(gamePlayers));
        sessionStorage.setItem('passplay_count', playerCount.toString());
        sessionStorage.setItem('passplay_timer_enabled', timerEnabled.toString());
        sessionStorage.setItem('passplay_turn_time', turnTimeLimit.toString());

        // Navigate to game page
        window.location.href = 'passplay-game.html';
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
            h *= 360;
        }

        return { h, s, l };
    }

})();
