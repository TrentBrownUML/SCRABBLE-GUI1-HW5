(function () {
    'use strict';

    // Initialize draggable tile and wire logger hooks.
    $(function () {

        var $element = $('#draggable');
        if (!$element.length) return;

        var opts = {
            containment: 'window',
            start: function () {
                // record and log when drag starts
                if (typeof startAction === 'function') {
                    this._dragStartTime = startAction('dragging tile');
                } else {
                    this._dragStartTime = new Date();
                }
            },
            stop: function () {
                // log when drag ends and compute duration
                if (typeof endAction === 'function') {
                    endAction('dragging tile', this._dragStartTime);
                } else {
                    var t = new Date();
                    console.log('[END]   dragging tile — ' + t.toLocaleTimeString());
                }
                delete this._dragStartTime;
            }
        };

        // If a handle element exists (either the draggable itself has class 'handle'
        // or it contains a child with class 'handle'), enable the handle option.
        if ($element.is('.handle') || $element.find('.handle').length > 0) {
            opts.handle = '.handle';
        }

        $element.draggable(opts);
    });

})();
