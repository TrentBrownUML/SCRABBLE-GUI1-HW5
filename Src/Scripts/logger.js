(function (window) {
    'use strict';

    function _fmt(date) {
        return date.toLocaleTimeString();
    }

    // Logs when an action starts. Returns the Date object for optional duration tracking.
    function startAction(actionName) {
        var t = new Date();
        console.log('[START] ' + actionName + ' — ' + _fmt(t));
        return t;
    }

    // Logs when an action ends. If a startTime (Date) is provided, logs duration in seconds.
    function endAction(actionName, startTime) {
        var t = new Date();
        var msg = '[END]   ' + actionName + ' — ' + _fmt(t);
        if (startTime instanceof Date) {
            var dur = ((t - startTime) / 1000).toFixed(2);
            msg += ' (duration: ' + dur + 's)';
        }
        console.log(msg);
        return t;
    }

    // Expose to global scope for easy calling from inline scripts
    window.startAction = startAction;
    window.endAction = endAction;

})(window);
