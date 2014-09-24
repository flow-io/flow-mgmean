/**
*
*	STREAM: mgmean
*
*
*	DESCRIPTION:
*		- Transform stream factory to find sliding-window geometric mean values (moving geometric mean) over a numeric data stream.
*
*
*	NOTES:
*		[1] 
*
*
*	TODO:
*		[1] Add behaviour for 0 and negative values
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Rebekah Smith.
*
*
*	AUTHOR:
*		Rebekah Smith. rebekahjs17@gmail.com. 2014.
*
*/

(function() {
	'use strict';

	// MODULES //

	var through2 = require( 'through2' );


	// FUNCTIONS //

	/**
	* FUNCTION: getBuffer(W)
	*   Returns a buffer array pre-initialized to 0.
	* 
	* @private
	* @param {Number} W - buffer size
	* @returns {Array} buffer
	*/
	function getBuffer(W) {
		var buffer = new Array(W);
		for (var i = 0; i < W; i++) {
			buffer[i] = 0;
		}
		return buffer;
	} // end FUNCTION getBuffer()


    /**
    * FUNCTION: onData(W)
    *   Returns a callback which calculates a moving geometric mean.
    *
    * @private
    * @param {Number} W - window size
    * @returns {Function} callback
    */
    function onData(W) {
        var buffer = getBuffer(W),
            full = false,
            dropVal,
            N = 0,
            wSumLogs = 0;

        /**
        * FUNCTION: onData(newVal, encoding, clbk)
        *   Data event handler. Calculates the moving geomean.
        *
        * @private
        * @param {Number} newVal - streamed data value
        * @param {String} encoding
        * @param {Function} clbk - callback to invoke. Function accepts two arguments: [ error, chunk ].
        */
        return function onData(newVal,  encoding, clbk) {
            // Fill buffer of size W and find initial geomean:
            if (!full) {
                buffer[N] = newVal;
                wSumLog += Math.log(newVal);
                N++;

                if (N===W) {
                    full = true;
                    pow = wSumLog / W;
                    gmean = Math.pow(Math.E, pow);
                    this.push(gmean);
                }
                clbk();
                return;
            }

            // Update buffer: (drop old value, add new)
            dropVal = buffer.shift();
            buffer.push(newVal);

			// Update geomean
			wSumLog = wSumLog - Math.pow(dropVal) + Math.pow(newVal);
			pow = wSumLog / W;
			gmean = Math.pow(Math.E, pow); 

            clbk(null, gmean);
        }; // end FUNCTION onData()
    } // end FUNCTION onData()


	// STREAM //

	/**
	* FUNCTION: Stream()
	*	Stream constructor.
	*
	* @constructor
	* @returns {Stream} Stream instance
	*/
	function Stream() {
		this._window = 5; //default window size
		return this;
	} // end FUNCTION Stream()

    /**
    * METHOD: window(value)
    *   Window size setter/getter. If a value is provided, sets the window size. If no value is provided, returns the window size.
    *
    * @param {Number} value - window size
    * @returns {Stream|Number} stream instance or window size
    */
    Stream.prototype.window = function(value) {
        if (!arguments.length) {
            return this._window;
        }
        if(typeof value !== 'number' || value !== value) {
            throw new Error('window()::invalid input argument. Window must be numeric.');
        }
            this._window = value;
        return this;
    }; // end METHOD window()


	/**
	* METHOD: stream()
	*	Returns a through stream which finds the sliding window geometric mean
	*
	* @returns {object} through stream
	*/
	Stream.prototype.stream = function() {
		return through2({'objectMode': true}, onData(this._window));
	}; // end METHOD stream()


	// EXPORTS //

	module.exports = function createStream() {
		return new Stream();
	};

})();