/**
 * =============================================================================
 * SCRABBLE GAME - Action Logger Utility
 * =============================================================================
 * 
 * @file        logger.js
 * @description Simple logging utility for tracking action timing during
 *              development and debugging. Provides start/end timestamps
 *              and duration calculation for performance monitoring.
 * 
 * @author      Trent Brown
 * @contact     tgbrown450@gmail.com
 * @course      UMass Lowell - GUI Programming I
 * @assignment  HW5 - Scrabble Game
 * @date        December 2024
 * 
 * =============================================================================
 * USAGE:
 * =============================================================================
 * 
 *   // Start timing an action
 *   var startTime = startAction('Loading dictionary');
 *   
 *   // ... perform the action ...
 *   
 *   // End timing and log duration
 *   endAction('Loading dictionary', startTime);
 * 
 * =============================================================================
 * OUTPUT FORMAT:
 * =============================================================================
 * 
 *   [START] Loading dictionary — 12:34:56 PM
 *   [END]   Loading dictionary — 12:34:57 PM (duration: 1.23s)
 * 
 * =============================================================================
 */

(function (window) {
    'use strict';

    /**
     * Formats a Date object to a readable time string
     * @param {Date} date - The date to format
     * @returns {string} Formatted time string (e.g., "12:34:56 PM")
     */
    function _fmt(date) {
        return date.toLocaleTimeString();
    }

    /**
     * Logs when an action starts and returns the start time for duration tracking
     * @param {string} actionName - Description of the action being started
     * @returns {Date} The start time for passing to endAction()
     */
    function startAction(actionName) {
        var t = new Date();
        console.log('[START] ' + actionName + ' — ' + _fmt(t));
        return t;
    }

    /**
     * Logs when an action ends, optionally calculating duration from start time
     * @param {string} actionName - Description of the action that completed
     * @param {Date} [startTime] - Optional start time for duration calculation
     * @returns {Date} The end time
     */
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
