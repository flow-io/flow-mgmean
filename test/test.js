
// MODULES //

var chai = require('chai'),          // Expectation library
    utils = require('./utils'),      // Test utilities
    flowFactory = require('./../lib'); // Module to be tested

// VARIABLES //

var expect = chai.expect,
    assert = chai.assert;

// TESTS //

describe( 'flow-mgmean', function tests() {
    'use strict';

    // Test 1
    it('should export a factory function', function test() {
		expect( flowFactory ).to.be.a('function');
    });

    // Test 2
    it('should provide a method to set/get the window size', function test() {
		var tStream = flowFactory();
		expect( tStream.window ).to.be.a('function');
    });

    // Test 3
    it('should set the window size', function test() {
		var tStream = flowFactory();
		tStream.window( 42 );
		assert.strictEqual( tStream.window() , 42 );
    });

    // Test 4
    it('should not allow a non-numeric window size', function test() {
		var tStream = flowFactory();

		expect( badValue('5') ).to.throw(Error);
		expect( badValue([]) ).to.throw(Error);
		expect( badValue({}) ).to.throw(Error);
		expect( badValue(null) ).to.throw(Error);
		expect( badValue(undefined) ).to.throw(Error);
		expect( badValue(NaN) ).to.throw(Error);
		expect( badValue(false) ).to.throw(Error);
		expect( badValue(function(){}) ).to.throw(Error);

		function badValue(value) {
			return function() {
				tStream.window( value );
			};
		}
    }); //end non-numeric window

    // Test 5
    it('should calculate the geometric mean of piped data in the window (contains 0, neg, both)', function test(done) {
		var data, expected, tStream, WINDOW = 3;

		// Simulate some data
		data = [2,5,6,5,0,3,7,5,-3,7,5,8,-4,0,3,5];

		// Expected values of geomean in moving window
		expected = [3.91486,5.31329,0,0,0,4.71769,NaN,NaN,NaN,6.54213,NaN,NaN,NaN,0];

		// Create a new geomean stream
		tStream = flowFactory()
			.window(WINDOW)
			.stream();

		// Mock reading from the stream
		utils.readStream(tStream,onRead);

		// Mock piping to the stream
		utils.writeStream(data,tStream);

		return;

		/**
		 * FUNCTION: onRead(error, actual)
		 * Read event handler. Checks for errors. Compares streamed and expected data.
		 */
		function onRead(error,actual) {
			expect(error).to.not.exist;

			assert.lengthOf(actual,data.length-WINDOW+1);

			assert.closeTo( actual[0], expected[0], 0.001 );
			assert.closeTo( actual[1], expected[1], 0.001 );
			assert.strictEqual( actual[2], expected[2] );
			assert.strictEqual( actual[3], expected[3] );
			assert.strictEqual( actual[4], expected[4] );
			assert.closeTo( actual[5], expected[5], 0.001 );
			assert.notStrictEqual( actual[6], expected[6] );
			assert.notStrictEqual( actual[7], expected[7] );
			assert.notStrictEqual( actual[8], expected[8] );
			assert.closeTo( actual[9], expected[9], 0.001 );
			assert.notStrictEqual( actual[10], expected[10] );
			assert.notStrictEqual( actual[11], expected[11] );
			assert.notStrictEqual( actual[12], expected[12] );
			assert.strictEqual( actual[13], expected[13] );

			done();

		} // end FUNCTION onRead
    });

    // Test 6
    it('should calculate the geometric mean of piped data in initial buffer (contains 0)', function test(done) {
		var data, expected, tStream, WINDOW = 3;

		// Simulate some data
		data = [2,0,5,6,7];

		// Expected values of median in moving window
		expected = [0,0,5.94392];

		// Create a new median stream
		tStream = flowFactory()
			.window(WINDOW)
			.stream();

		// Mock reading from the stream
		utils.readStream(tStream,onRead);

		// Mock piping to the stream
		utils.writeStream(data,tStream);

		return;

		/**
		* FUNCTION: onRead(error, actual)
		* Read event handler. Check for errors. Compare streamed and expected data.
		*/
		function onRead(error,actual) {
			expect(error).to.not.exist;

			assert.lengthOf(actual,data.length-WINDOW+1);

			assert.strictEqual( actual[0], expected[0] );
			assert.strictEqual( actual[1], expected[1] );
			assert.closeTo( actual[2], expected[2], 0.001 );

			done();
		} // end FUNCTION onRead()
	});

	// Test 7
    it('should calculate the geometric mean of piped data in initial buffer (contains neg)', function test(done) {
		var data, expected, tStream, WINDOW = 3;

		// Simulate some data
		data = [2,5,-7,6,7];

		// Expected values of median in moving window
		expected = [NaN,NaN,NaN];

		// Create a new median stream
		tStream = flowFactory()
			.window(WINDOW)
			.stream();

		// Mock reading from the stream
		utils.readStream(tStream,onRead);

		// Mock piping to the stream
		utils.writeStream(data,tStream);

		return;

		/**
		* FUNCTION: onRead(error, actual)
		* Read event handler. Check for errors. Compare streamed and expected data.
		*/
		function onRead(error,actual) {
			expect(error).to.not.exist;

			assert.lengthOf(actual,data.length-WINDOW+1);

			assert.notStrictEqual( actual[0], expected[0] );
			assert.notStrictEqual( actual[1], expected[1] );
			assert.notStrictEqual( actual[2], expected[2] );

			done();
		} // end FUNCTION onRead()
	});

	// Test 8
    it('should calculate the geometric mean of piped data in initial buffer (contains neg and 0)', function test(done) {
		var data, expected, tStream, WINDOW = 3;

		// Simulate some data
		data = [0,5,-7,6,7];

		// Expected values of median in moving window
		expected = [0,NaN,NaN];

		// Create a new median stream
		tStream = flowFactory()
			.window(WINDOW)
			.stream();

		// Mock reading from the stream
		utils.readStream(tStream,onRead);

		// Mock piping to the stream
		utils.writeStream(data,tStream);

		return;

		/**
		* FUNCTION: onRead(error, actual)
		* Read event handler. Check for errors. Compare streamed and expected data.
		*/
		function onRead(error,actual) {
			expect(error).to.not.exist;

			assert.lengthOf(actual,data.length-WINDOW+1);

			assert.strictEqual( actual[0], expected[0] );
			assert.notStrictEqual( actual[1], expected[1] );
			assert.notStrictEqual( actual[2], expected[2] );

			done();
		} // end FUNCTION onRead()
	});

}); //end test descriptions

