(function () {
    'use strict';

    // Initialize draggable tile generation and logger hooks.
    $(function () {

        // Compute board/tile/holder sizes and expose as CSS variables.
        function computeSizes() {
            var $board = $('#board');
            if (!$board.length) return;

            var boardWidth = $board.width();
            if (!boardWidth) {
                // If width is zero (image not loaded yet), try again shortly
                setTimeout(computeSizes, 50);
                return;
            }

            // Read percentage variables from CSS (like "5.5%") and convert
            var rootStyle = getComputedStyle(document.documentElement);
            var tilePercentStr = rootStyle.getPropertyValue('--tile-percent') || '5.5%';
            var tileGapStr = rootStyle.getPropertyValue('--tile-gap') || '0.3%';
            var tilePercent = parseFloat(tilePercentStr);
            var tileGapPercent = parseFloat(tileGapStr);

            // Apply a scale factor on large boards so tiles and gaps grow
            // proportionally on high-resolution displays (e.g. 4K). The
            // scale is clamped to avoid excessively large tiles.
            var scale = Math.min(2.2, Math.max(1, boardWidth / 1200));
            var tilePx = boardWidth * (tilePercent / 100) * scale;
            var gapPx = boardWidth * (tileGapPercent / 100) * scale;

            var holderWidthPx = (7 * tilePx) + (6 * gapPx);
            // apply small extra scale to ensure holder comfortably fits 7 tiles
            var holderExtra = parseFloat(rootStyle.getPropertyValue('--holder-extra-scale')) || 1.06;
            holderWidthPx = Math.round(holderWidthPx * holderExtra);

            document.documentElement.style.setProperty('--tile-size-px', Math.round(tilePx) + 'px');
            document.documentElement.style.setProperty('--tile-gap-px', Math.round(gapPx) + 'px');
            document.documentElement.style.setProperty('--holder-width-px', Math.round(holderWidthPx) + 'px');
        }

        // Recompute on load and resize; also when board image finishes loading.
        $(window).on('resize', computeSizes);
        $('#board img.board').on('load', computeSizes);
        computeSizes();

        // list of available tile images (relative to this page)
        var tileFiles = [
            'Scrabble_Tile_A.jpg', 'Scrabble_Tile_B.jpg', 'Scrabble_Tile_C.jpg', 'Scrabble_Tile_D.jpg', 'Scrabble_Tile_E.jpg',
            'Scrabble_Tile_F.jpg', 'Scrabble_Tile_G.jpg', 'Scrabble_Tile_H.jpg', 'Scrabble_Tile_I.jpg', 'Scrabble_Tile_J.jpg',
            'Scrabble_Tile_K.jpg', 'Scrabble_Tile_L.jpg', 'Scrabble_Tile_M.jpg', 'Scrabble_Tile_N.jpg', 'Scrabble_Tile_O.jpg',
            'Scrabble_Tile_P.jpg', 'Scrabble_Tile_Q.jpg', 'Scrabble_Tile_R.jpg', 'Scrabble_Tile_S.jpg', 'Scrabble_Tile_T.jpg',
            'Scrabble_Tile_U.jpg', 'Scrabble_Tile_V.jpg', 'Scrabble_Tile_W.jpg', 'Scrabble_Tile_X.jpg', 'Scrabble_Tile_Y.jpg',
            'Scrabble_Tile_Z.jpg', 'Scrabble_Tile_Blank.jpg'
        ];

        var tilesBasePath = '../Assets/Images/Tiles/';

        // helper to create a tile element and append to #board
        function createTile(src) {
            var $tile = $('<div class="tile ui-widget-content"></div>');
            var $img = $('<img>').attr('src', src).addClass('piece');
            $tile.append($img);
            // initial position: place randomly within board bounds
            var $board = $('#board');
            var bw = $board.width() || 400;
            var bh = $board.height() || 200;
            // determine tile size from computed CSS variable so new tiles match
            var rootStyle = getComputedStyle(document.documentElement);
            var tileSizeStr = rootStyle.getPropertyValue('--tile-size-px') || '';
            var tileSize = parseInt(tileSizeStr, 10);
            if (!tileSize || isNaN(tileSize)) tileSize = Math.round(Math.min(70, bw * 0.06));
            // place near top-left of board but ensure tile fits within board bounds
            var left = Math.round((0.1 + Math.random() * 0.6) * (bw - tileSize));
            var top = Math.round((0.05 + Math.random() * 0.4) * (bh - tileSize));
            $tile.css({ width: tileSize + 'px' });
            $tile.css({ position: 'absolute', left: left + 'px', top: top + 'px' });
            $board.append($tile);
            $tile.data('inHolder', false);
            makeDraggable($tile);
            return $tile;
        }

        // make any tile element draggable with existing behavior
        function makeDraggable($element) {
            var opts = {
                containment: 'window',
                helper: 'clone',
                appendTo: 'body',
                start: function (event, ui) {
                    // record and log when drag starts
                    if (typeof startAction === 'function') {
                        this._dragStartTime = startAction('dragging tile');
                    } else {
                        this._dragStartTime = new Date();
                    }

                    var $orig = $(this);
                    $orig.data('__origParent', $orig.parent());
                    $orig.data('__origNext', $orig.next());

                    // Prefer the computed CSS tile size (set by computeSizes)
                    var rootStyle = getComputedStyle(document.documentElement);
                    var tileSizeStr = rootStyle.getPropertyValue('--tile-size-px') || '';
                    var tileSize = parseInt(tileSizeStr, 10);
                    if (!tileSize || isNaN(tileSize)) tileSize = $orig.outerWidth();

                    // Move original to body and size using tileSize
                    $orig.appendTo(document.body).css({
                        position: 'fixed',
                        width: tileSize + 'px',
                        height: 'auto',
                        margin: 0,
                        zIndex: 3000,
                        visibility: 'visible'
                    });

                    if (ui && ui.helper) ui.helper.css({ opacity: 0, width: tileSize + 'px', height: 'auto', 'z-index': 3000 });
                },
                drag: function (event, ui) {
                    try {
                        var $orig = $(this);
                        var helperOfs = (ui && ui.helper) ? ui.helper.offset() : $orig.offset();
                        var scrollTop = $(window).scrollTop() || 0;
                        var scrollLeft = $(window).scrollLeft() || 0;
                        var fixedTop = Math.round(helperOfs.top - scrollTop);
                        var fixedLeft = Math.round(helperOfs.left - scrollLeft);
                        $orig.css({ left: fixedLeft + 'px', top: fixedTop + 'px' });
                        // detect overlap with holder (in viewport coords)
                        var $holder = $('#tile_Holder');
                        if ($holder.length && ui && ui.helper) {
                            var helperW = ui.helper.outerWidth();
                            var helperH = ui.helper.outerHeight();
                            var hLeft = helperOfs.left - scrollLeft;
                            var hTop = helperOfs.top - scrollTop;
                            var hRight = hLeft + helperW;
                            var hBottom = hTop + helperH;
                            var holderRect = $holder[0].getBoundingClientRect();
                            var iLeft = Math.max(hLeft, holderRect.left);
                            var iTop = Math.max(hTop, holderRect.top);
                            var iRight = Math.min(hRight, holderRect.right);
                            var iBottom = Math.min(hBottom, holderRect.bottom);
                            var interArea = Math.max(0, iRight - iLeft) * Math.max(0, iBottom - iTop);
                            var helperArea = helperW * helperH || 1;
                            var over = interArea / helperArea > 0.25 || (hLeft + helperW / 2 >= holderRect.left && hLeft + helperW / 2 <= holderRect.right && hTop + helperH / 2 >= holderRect.top && hTop + helperH / 2 <= holderRect.bottom);
                            $orig.data('inHolder', !!over);
                            $orig.toggleClass('in-holder', !!over);
                        }
                        // detect overlap with board (so we can snap to grid)
                        var $board = $('#board');
                        if ($board.length && ui && ui.helper) {
                            try {
                                var helperW2 = ui.helper.outerWidth();
                                var helperH2 = ui.helper.outerHeight();
                                var hLeft2 = helperOfs.left - scrollLeft;
                                var hTop2 = helperOfs.top - scrollTop;
                                var hRight2 = hLeft2 + helperW2;
                                var hBottom2 = hTop2 + helperH2;
                                var boardRect = $board[0].getBoundingClientRect();
                                var iLeft2 = Math.max(hLeft2, boardRect.left);
                                var iTop2 = Math.max(hTop2, boardRect.top);
                                var iRight2 = Math.min(hRight2, boardRect.right);
                                var iBottom2 = Math.min(hBottom2, boardRect.bottom);
                                var interArea2 = Math.max(0, iRight2 - iLeft2) * Math.max(0, iBottom2 - iTop2);
                                var helperArea2 = helperW2 * helperH2 || 1;
                                var overBoard = interArea2 / helperArea2 > 0.15 || ((hLeft2 + helperW2 / 2) >= boardRect.left && (hLeft2 + helperW2 / 2) <= boardRect.right && (hTop2 + helperH2 / 2) >= boardRect.top && (hTop2 + helperH2 / 2) <= boardRect.bottom);
                                $orig.data('onBoard', !!overBoard);
                                $orig.toggleClass('on-board', !!overBoard);
                            } catch (e) { }
                        }
                    } catch (e) { }
                },
                stop: function (event, ui) {
                    if (typeof endAction === 'function') {
                        endAction('dragging tile', this._dragStartTime);
                    } else {
                        var t = new Date();
                        console.log('[END]   dragging tile — ' + t.toLocaleTimeString());
                    }

                    var $orig = $(this);
                    var helperOfs = (ui && ui.helper) ? ui.helper.offset() : $orig.offset();
                    var scrollTop = $(window).scrollTop() || 0;
                    var scrollLeft = $(window).scrollLeft() || 0;
                    var fixedTop = Math.round(helperOfs.top - scrollTop);
                    var fixedLeft = Math.round(helperOfs.left - scrollLeft);

                    $orig.css({ position: 'fixed', left: fixedLeft + 'px', top: fixedTop + 'px', visibility: 'visible', zIndex: 2000 });
                    // final holder intersection check (in case drag didn't update)
                    var $holder = $('#tile_Holder');
                    if ($holder.length && ui && ui.helper) {
                        var helperW = ui.helper.outerWidth();
                        var helperH = ui.helper.outerHeight();
                        var scrollTop = $(window).scrollTop() || 0;
                        var scrollLeft = $(window).scrollLeft() || 0;
                        var hLeft = helperOfs.left - scrollLeft;
                        var hTop = helperOfs.top - scrollTop;
                        var hRight = hLeft + helperW;
                        var hBottom = hTop + helperH;
                        var holderRect = $holder[0].getBoundingClientRect();
                        var iLeft = Math.max(hLeft, holderRect.left);
                        var iTop = Math.max(hTop, holderRect.top);
                        var iRight = Math.min(hRight, holderRect.right);
                        var iBottom = Math.min(hBottom, holderRect.bottom);
                        var interArea = Math.max(0, iRight - iLeft) * Math.max(0, iBottom - iTop);
                        var helperArea = helperW * helperH || 1;
                        var over = interArea / helperArea > 0.25 || (hLeft + helperW / 2 >= holderRect.left && hLeft + helperW / 2 <= holderRect.right && hTop + helperH / 2 >= holderRect.top && hTop + helperH / 2 <= holderRect.bottom);
                        $orig.data('inHolder', !!over);
                        $orig.toggleClass('in-holder', !!over);
                    }

                    // Snap to board grid if dropped on board area (1x15 horizontal assumed)
                    var $board = $('#board');
                    if ($board.length && ui && ui.helper) {
                        try {
                            var helperW3 = ui.helper.outerWidth();
                            var helperH3 = ui.helper.outerHeight();
                            var hLeft3 = helperOfs.left - scrollLeft;
                            var hTop3 = helperOfs.top - scrollTop;
                            var centerX = hLeft3 + (helperW3 / 2);
                            var centerY = hTop3 + (helperH3 / 2);
                            var boardRect3 = $board[0].getBoundingClientRect();
                            if (centerX >= boardRect3.left && centerX <= boardRect3.right && centerY >= boardRect3.top && centerY <= boardRect3.bottom) {
                                // grid parameters: 1 row, 15 columns
                                var cols = 15;
                                var slotWidth = boardRect3.width / cols;
                                var colIdx = Math.floor((centerX - boardRect3.left) / slotWidth);
                                if (colIdx < 0) colIdx = 0;
                                if (colIdx >= cols) colIdx = cols - 1;
                                var slotCenterX = boardRect3.left + (colIdx * slotWidth) + (slotWidth / 2);
                                var tileW = $orig.outerWidth();
                                var tileH = $orig.outerHeight();
                                var snapLeft = Math.round(slotCenterX - (tileW / 2));
                                var snapTop = Math.round(boardRect3.top + (boardRect3.height - tileH) / 2);
                                $orig.css({ left: snapLeft + 'px', top: snapTop + 'px' });
                                $orig.data('onBoard', true);
                                $orig.data('boardIndex', colIdx);
                                $orig.toggleClass('on-board', true);
                            } else {
                                $orig.data('onBoard', false);
                                $orig.removeData('boardIndex');
                                $orig.toggleClass('on-board', false);
                            }
                        } catch (e) { }
                    }

                    delete this._dragStartTime;
                    $orig.removeData('__origParent').removeData('__origNext');
                }
            };

            // If a handle element exists (either the draggable itself has class 'handle'
            // or it contains a child with class 'handle'), enable the handle option.
            if ($element.is('.handle') || $element.find('.handle').length > 0) {
                opts.handle = '.handle';
            }

            $element.draggable(opts);
        }

        // UI: add tiles button
        $('#addTilesBtn').on('click', function () {
            var count = parseInt($('#addCount').val(), 10) || 0;
            for (var i = 0; i < count; i++) {
                var fn = tileFiles[Math.floor(Math.random() * tileFiles.length)];
                createTile(tilesBasePath + fn);
            }
        });

        // clear tiles
        $('#clearTilesBtn').on('click', function () {
            // remove any tiles that are not currently in the holder
            $('.tile').filter(function () {
                return !$(this).data('inHolder');
            }).remove();
        });

        // initialize: create a default set if none present
        if ($('#board .tile').length === 0) {
            // create N based on default input value
            var defaultCount = parseInt($('#addCount').val(), 10) || 7;
            for (var j = 0; j < defaultCount; j++) {
                var fn2 = tileFiles[Math.floor(Math.random() * tileFiles.length)];
                createTile(tilesBasePath + fn2);
            }
        }

    });

})();
